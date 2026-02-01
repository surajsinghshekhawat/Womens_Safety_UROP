# Women Safety Analytics — Implementation TODO (Detailed, Ordered)

This is the “no loose ends” implementation plan to make the system research‑grade and technically consistent.

**Rule:** A feature can be claimed as “implemented” only when its acceptance criteria are met.

---

## Phase 0 — Baseline safety (already started)

### 0.1 Secrets & configuration hygiene
**Goal:** No secrets in git; reproducible configuration.

**Acceptance criteria**
- No API keys / passwords committed anywhere in the repository.
- Mobile maps keys are injected via local config or secure build secrets and restricted in Google Cloud.
- DB credentials live only in `.env` (already ignored).

---

## Phase 1 — Research‑grade risk scoring (highest impact)

### 1.1 Make density recency‑aware (stop “1 year old reports” inflating risk)
**Current problem:** recency reduces severity/recency contributions, but density uses raw incident count; very old incidents can still inflate the density factor.

**Implementation options (pick one)**
- Option A: **recency‑weighted density** (smooth decay; recommended)
- Option B: **time-window filter** (hard cutoff, e.g., last 180 days)
- Option C: both (window + weighting)

**Acceptance criteria**
- Old incidents (e.g., ~365 days ago) contribute ~0 to density or are filtered out.
- `factors` output includes enough transparency to justify the score (e.g., raw_count vs effective_count).

### 1.2 Use meter‑based distance weighting
**Current problem:** distance weighting uses Euclidean distance in degrees; this is not geographically correct.

**Acceptance criteria**
- Distance weighting uses haversine distance (meters) or PostGIS distance.
- Decay length scale is documented and roughly matches the prior behavior (≈100m scale).

### 1.3 Timezone correctness for time‑pattern logic
**Current problem:** system uses “local hour now” for current time, but incident timestamps/hours may not be in the same timezone.

**Implementation plan**
- Add `timezone_offset_minutes` parameter from mobile → backend → ML.
- Convert incident timestamps to local time before using `.hour` for historical pattern counts.

**Acceptance criteria**
- For a user in Chennai timezone, “night incidents” are counted as night in Chennai local time.
- The API clearly documents what timezone it uses.

---

## Phase 2 — Heatmap correctness (truthful + geographically valid)

### 2.1 Heatmap cell fields must be truthful
**Current problem:** heatmap cells include fields like `incident_count`/`last_incident` but they may not be computed per cell.

**Acceptance criteria**
- Either:
  - those fields are computed correctly, OR
  - they are removed from responses/docs/UI and not claimed.

### 2.2 Replace sea cutoff heuristic with polygon masking
**Current problem:** longitude cutoff is not a true coastline/land mask.

**Implementation plan**
- Use a city/land boundary polygon (GeoJSON) and point‑in‑polygon checks, OR PostGIS polygon containment.

**Acceptance criteria**
- Cells are filtered by polygon containment (not longitude).
- Masking works for any city polygon (not Chennai-hardcoded).

---

## Phase 3 — “Real-time” semantics (make it honest and correct)

### 3.1 Decide what “real-time” means and implement that exactly
Two valid definitions:
- **A)** Real-time = “new incident event triggers refresh” (simple, robust)
- **B)** Real-time = “server pushes heatmap updates/deltas” (harder)

**Acceptance criteria**
- If A: docs and UI claim “near real-time updates via notifications + refresh”.
- If B: server emits correct `heatmap:update` to the right subscribers and client applies it.

### 3.2 Location room targeting
**Current problem:** broadcasts are simplified.

**Acceptance criteria**
- Server targets rooms based on real spatial membership OR intentionally uses broadcast with honest docs.

---

## Phase 4 — Safe route end‑to‑end (feature completeness)

### 4.1 Integrate a real routing provider
**Acceptance criteria**
- Backend returns real road polylines and multiple route alternatives.
- Keys are not exposed in mobile app.

### 4.2 Efficient route scoring (corridor/batch)
**Acceptance criteria**
- Route scoring avoids many DB queries per route at scale (batch incident fetch / corridor query).

### 4.3 Mobile UI for routes
**Acceptance criteria**
- Destination picking, route list, route selection, polyline rendering, high‑risk segment highlighting.

---

## Phase 5 — Product completeness (auth/admin/media)

### 5.1 Authentication (remove stubs)
**Acceptance criteria**
- No hardcoded `user123`; real auth identity is used.
- Protected endpoints enforce auth.

### 5.2 Admin analytics (remove mock or implement real)
**Acceptance criteria**
- Admin dashboards/analytics reflect DB data and are authorized.

### 5.3 Media upload end‑to‑end (only if you want to claim it)
**Acceptance criteria**
- Upload endpoint exists, validates type/size, stores media, links it to incidents.

---

## Phase 6 — Measured evaluation (publishable results without fabrication)

### 6.1 Performance measurement
**Acceptance criteria**
- Benchmarks exist (CSV outputs + plots) for:
  - heatmap latency vs radius/grid size
  - DB query times
  - route scoring latency

### 6.2 Model evaluation protocol
**Acceptance criteria**
- If no ground truth exists: document limitations + evaluation plan only.
- If ground truth exists: compute and report metrics with reproducible scripts.

