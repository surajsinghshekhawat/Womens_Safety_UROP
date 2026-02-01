"""
Land / city boundary masking utilities.

Goal: prevent rendering heatmap cells in sea/irrelevant areas by enforcing
polygon containment checks (research-grade masking).

Important implementation detail:
- We intentionally do NOT depend on Shapely operations like unary_union here,
  because the current environment has a Shapely↔NumPy incompatibility that
  breaks set-operations (union) at runtime.
- Instead, we load a GeoJSON FeatureCollection (e.g., ward polygons) and treat
  the union implicitly by checking: point ∈ ANY polygon.

This is robust and fast enough for heatmap cell counts (hundreds–thousands),
especially with per-polygon bounding-box prefilters.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx

from app.config import settings


# Cached polygons for point-in-polygon checks
# Each polygon entry: (minx, miny, maxx, maxy, rings)
# rings: List[List[Tuple[lng, lat]]] where rings[0] is outer, rings[1:] are holes
_polygons: Optional[List[Tuple[float, float, float, float, List[List[Tuple[float, float]]]]]] = None


def _resolve_path(p: str) -> Path:
    path = Path(p)
    if path.is_absolute():
        return path
    return (Path(__file__).resolve().parent.parent / path).resolve()


def _download_json(url: str, timeout_s: float = 30.0) -> dict:
    with httpx.Client(timeout=timeout_s, follow_redirects=True) as client:
        r = client.get(url)
        r.raise_for_status()
        return r.json()


def _ensure_mask_file(path: Path) -> dict:
    """
    Ensures a GeoJSON file exists locally; downloads from configured source URL if missing.
    Returns parsed GeoJSON dict.
    """
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))

    source_url = str(getattr(settings, "land_mask_source_url", "")).strip()
    if not source_url:
        raise RuntimeError("LAND_MASK_SOURCE_URL is not configured and mask file is missing")

    data = _download_json(source_url)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return data


def _ring_bbox(ring: List[Tuple[float, float]]) -> Tuple[float, float, float, float]:
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    return (min(xs), min(ys), max(xs), max(ys))


def _point_in_ring(lng: float, lat: float, ring: List[Tuple[float, float]]) -> bool:
    """
    Ray casting algorithm for point-in-polygon ring.
    ring is list of (lng, lat) points.
    """
    inside = False
    n = len(ring)
    if n < 3:
        return False

    j = n - 1
    for i in range(n):
        xi, yi = ring[i]
        xj, yj = ring[j]

        # Check if edge intersects horizontal ray to the right of point.
        intersects = (yi > lat) != (yj > lat)
        if intersects:
            denom = (yj - yi)
            if denom == 0:
                x_intersect = xi
            else:
                x_intersect = (xj - xi) * (lat - yi) / denom + xi
            if lng < x_intersect:
                inside = not inside
        j = i

    return inside


def _point_in_polygon(lng: float, lat: float, rings: List[List[Tuple[float, float]]]) -> bool:
    if not rings:
        return False
    if not _point_in_ring(lng, lat, rings[0]):
        return False
    # Holes
    for hole in rings[1:]:
        if _point_in_ring(lng, lat, hole):
            return False
    return True


def _extract_polygons_from_geojson(geo: Dict[str, Any]) -> List[List[List[Tuple[float, float]]]]:
    """
    Returns a list of polygons, where each polygon is rings (outer + holes),
    and each ring is list of (lng, lat) tuples.
    """
    polys: List[List[List[Tuple[float, float]]]] = []

    def _as_rings(coords: Any) -> List[List[Tuple[float, float]]]:
        rings: List[List[Tuple[float, float]]] = []
        for ring in coords:
            r: List[Tuple[float, float]] = []
            for pt in ring:
                if not isinstance(pt, (list, tuple)) or len(pt) < 2:
                    continue
                r.append((float(pt[0]), float(pt[1])))
            if r:
                rings.append(r)
        return rings

    t = geo.get("type")
    features = geo.get("features") if t == "FeatureCollection" else None
    if features is None:
        # Accept a single Feature or Geometry object
        features = [{"type": "Feature", "geometry": geo.get("geometry", geo)}]

    for f in features:
        g = (f or {}).get("geometry") if isinstance(f, dict) else None
        if not g or not isinstance(g, dict):
            continue
        gt = g.get("type")
        coords = g.get("coordinates")
        if gt == "Polygon" and coords:
            rings = _as_rings(coords)
            if rings:
                polys.append(rings)
        elif gt == "MultiPolygon" and coords:
            for poly_coords in coords:
                rings = _as_rings(poly_coords)
                if rings:
                    polys.append(rings)

    return polys


def _load_mask_polygons() -> List[Tuple[float, float, float, float, List[List[Tuple[float, float]]]]]:
    geo_path_str = str(getattr(settings, "land_mask_geojson_path", "")).strip()
    if not geo_path_str:
        return []

    path = _resolve_path(geo_path_str)
    geo = _ensure_mask_file(path)

    polygons = _extract_polygons_from_geojson(geo)
    out: List[Tuple[float, float, float, float, List[List[Tuple[float, float]]]]] = []

    for rings in polygons:
        minx, miny, maxx, maxy = _ring_bbox(rings[0])
        out.append((minx, miny, maxx, maxy, rings))

    return out


def is_point_allowed(lat: float, lng: float) -> bool:
    """
    Returns True if point is within the configured land/city polygon mask.
    If masking is disabled/unconfigured, returns True.
    """
    global _polygons

    if not bool(getattr(settings, "land_mask_enabled", True)):
        return True

    if _polygons is None:
        try:
            _polygons = _load_mask_polygons()
        except Exception:
            # Fail open: do not break heatmap generation if mask cannot load.
            _polygons = []

    if not _polygons:
        return True

    x = float(lng)
    y = float(lat)
    for minx, miny, maxx, maxy, rings in _polygons:
        if x < minx or x > maxx or y < miny or y > maxy:
            continue
        if _point_in_polygon(x, y, rings):
            return True

    return False

