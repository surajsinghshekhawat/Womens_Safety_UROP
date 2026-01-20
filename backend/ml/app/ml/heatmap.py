"""
Heatmap Generator - Grid-based risk visualization
NOW SUPPORTS TIME-BASED RISK CALCULATION
"""

import math
from typing import Dict, Optional
from datetime import datetime, timezone
from app.ml.risk_scoring import calculate_risk_score
from app.ml.clustering import get_clusters


def meters_to_degrees(meters: float) -> float:
    """Convert meters to degrees (approximate)"""
    return meters / 111000.0


def generate_heatmap(
    center_lat: float,
    center_lng: float,
    radius_meters: int,
    grid_size_meters: int,
    query_timestamp: Optional[datetime] = None,  # UTC timestamp for logging
    local_hour: Optional[int] = None,  # LOCAL hour (0-23) for time-based risk
) -> Dict:
    """
    Generate heatmap data for an area
    
    Args:
        center_lat: Center latitude
        center_lng: Center longitude
        radius_meters: Radius in meters
        grid_size_meters: Size of each grid cell in meters
        
    Returns:
        Dictionary with heatmap data
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        # Convert to degrees
        radius_degrees = meters_to_degrees(radius_meters)
        grid_size_degrees = meters_to_degrees(grid_size_meters)
        
        # Calculate grid bounds
        lat_min = center_lat - radius_degrees
        lat_max = center_lat + radius_degrees
        lng_min = center_lng - radius_degrees
        lng_max = center_lng + radius_degrees
        
        # Chennai land-only bounds (exclude sea area to the east)
        # Bay of Bengal coastline is approximately at longitude 80.27-80.30
        # Only clip bounds if center is within Chennai, otherwise allow full area
        CHENNAI_LAND_BOUNDS = {
            "north": 13.25,  # Slightly north of city
            "south": 12.80,  # Slightly south of city
            "east": 80.30,   # Bay of Bengal coastline (exclude sea east of this)
            "west": 80.05,   # Slightly west of city
        }
        
        # Only apply Chennai bounds if the center is within Chennai area
        # This prevents restricting areas outside Chennai while still filtering sea areas
        center_in_chennai = (
            CHENNAI_LAND_BOUNDS["south"] <= center_lat <= CHENNAI_LAND_BOUNDS["north"] and
            CHENNAI_LAND_BOUNDS["west"] <= center_lng <= CHENNAI_LAND_BOUNDS["east"]
        )
        
        if center_in_chennai:
            # Clip bounds to Chennai area to prevent sea cells
            if lat_min < CHENNAI_LAND_BOUNDS["south"]:
                lat_min = CHENNAI_LAND_BOUNDS["south"]
            if lat_max > CHENNAI_LAND_BOUNDS["north"]:
                lat_max = CHENNAI_LAND_BOUNDS["north"]
            if lng_min < CHENNAI_LAND_BOUNDS["west"]:
                lng_min = CHENNAI_LAND_BOUNDS["west"]
            if lng_max > CHENNAI_LAND_BOUNDS["east"]:
                lng_max = CHENNAI_LAND_BOUNDS["east"]
        
        # Limit grid size to prevent excessive computation and timeout
        # For large radii, use a maximum number of cells to prevent timeout
        # Reduced from 10000 to 3000 to prevent timeout issues
        max_cells = 3000  # Maximum cells to generate (prevents timeout)
        estimated_cells = int((2 * radius_degrees / grid_size_degrees) ** 2)
        
        if estimated_cells > max_cells:
            # Adjust grid size to stay within limit
            # Increase grid size (larger cells) to reduce total cell count
            adjusted_grid_size = math.sqrt((2 * radius_degrees) ** 2 / max_cells)
            grid_size_degrees = max(grid_size_degrees, adjusted_grid_size)
            logger.warning(f"Grid too large ({estimated_cells} cells), adjusting grid_size to {grid_size_degrees:.6f} degrees (was {meters_to_degrees(grid_size_meters):.6f}) to prevent timeout")
        
        # Generate grid cells
        cells = []
        lat = lat_min
        cell_count = 0
        skipped_sea_cells = 0
        
        logger.info(f"Starting grid generation: lat_range=[{lat_min:.6f}, {lat_max:.6f}], lng_range=[{lng_min:.6f}, {lng_max:.6f}], grid_size={grid_size_degrees:.6f}")
        
        # Safety check: ensure bounds are valid
        if lat_min >= lat_max or lng_min >= lng_max:
            logger.error(f"Invalid bounds after clipping: lat [{lat_min:.6f}, {lat_max:.6f}], lng [{lng_min:.6f}, {lng_max:.6f}]")
            # Use original bounds if clipping resulted in invalid bounds
            lat_min = center_lat - radius_degrees
            lat_max = center_lat + radius_degrees
            lng_min = center_lng - radius_degrees
            lng_max = center_lng + radius_degrees
            logger.warning(f"Using original bounds: lat [{lat_min:.6f}, {lat_max:.6f}], lng [{lng_min:.6f}, {lng_max:.6f}]")
        
        # Safety check: ensure grid_size is smaller than bounds range
        lat_range = lat_max - lat_min
        lng_range = lng_max - lng_min
        if grid_size_degrees >= lat_range or grid_size_degrees >= lng_range:
            logger.warning(f"Grid size ({grid_size_degrees:.6f}) is too large for bounds range (lat: {lat_range:.6f}, lng: {lng_range:.6f}). Using smaller grid size.")
            grid_size_degrees = min(lat_range, lng_range) / 10  # Use 10% of smallest range
            logger.info(f"Adjusted grid_size to {grid_size_degrees:.6f} degrees")
        
        while lat < lat_max and cell_count < max_cells:
            lng = lng_min
            while lng < lng_max and cell_count < max_cells:
                # Filter out sea cells only if they're clearly in the Bay of Bengal
                # Marina Beach coastline is at ~80.28, but allow some margin for coastal areas
                # Only filter if the cell is significantly east of the coastline
                if lng > 80.30:  # More lenient - only exclude clearly sea areas
                    skipped_sea_cells += 1
                    lng += grid_size_degrees
                    continue
                
                try:
                    # Calculate risk score for this cell center with time-based risk
                    # Pass local_hour for accurate time-of-day risk (user's local time, not UTC)
                    risk_data = calculate_risk_score(lat, lng, query_timestamp, local_hour)
                    
                    # Always include cell, even if risk_score is 0
                    cells.append({
                        "lat": lat,
                        "lng": lng,
                        "risk_score": risk_data.get("risk_score", 0.0),
                        "risk_level": risk_data.get("risk_level", "very_safe"),
                        "incident_count": 0,  # TODO: Count actual incidents in cell
                        "last_incident": None,  # TODO: Get actual last incident
                    })
                    cell_count += 1
                except Exception as e:
                    logger.error(f"Error calculating risk for cell ({lat}, {lng}): {e}")
                    # Still add cell with 0 risk if calculation fails
                    cells.append({
                        "lat": lat,
                        "lng": lng,
                        "risk_score": 0.0,
                        "risk_level": "very_safe",
                        "incident_count": 0,
                        "last_incident": None,
                    })
                    cell_count += 1
                
                lng += grid_size_degrees
            lat += grid_size_degrees
        
        logger.info(f"Generated {len(cells)} heatmap cells for area centered at ({center_lat}, {center_lng})")
        logger.info(f"Grid bounds: lat [{lat_min:.6f}, {lat_max:.6f}], lng [{lng_min:.6f}, {lng_max:.6f}]")
        logger.info(f"Grid size: {grid_size_degrees:.6f} degrees ({grid_size_meters}m), radius: {radius_degrees:.6f} degrees ({radius_meters}m)")
        logger.info(f"Skipped {skipped_sea_cells} sea cells, generated {cell_count} total cells")
        
        # Safety: Always include at least the center cell if no cells were generated
        if len(cells) == 0:
            logger.warning(f"No cells generated! This should not happen. Adding center cell as fallback.")
            logger.warning(f"Debug info: lat_range=[{lat_min:.6f}, {lat_max:.6f}], lng_range=[{lng_min:.6f}, {lng_max:.6f}], grid_size={grid_size_degrees:.6f}, cell_count={cell_count}")
            try:
                risk_data = calculate_risk_score(center_lat, center_lng, query_timestamp, local_hour)
                cells.append({
                    "lat": center_lat,
                    "lng": center_lng,
                    "risk_score": risk_data.get("risk_score", 0.0),
                    "risk_level": risk_data.get("risk_level", "very_safe"),
                    "incident_count": 0,
                    "last_incident": None,
                })
                logger.info(f"Added fallback center cell with risk_score={risk_data.get('risk_score', 0.0)}")
            except Exception as e:
                logger.error(f"Error generating fallback center cell: {e}", exc_info=True)
                cells.append({
                    "lat": center_lat,
                    "lng": center_lng,
                    "risk_score": 0.0,
                    "risk_level": "very_safe",
                    "incident_count": 0,
                    "last_incident": None,
                })
                logger.info("Added fallback center cell with risk_score=0.0")
        
    except Exception as e:
        logger.error(f"Error generating heatmap: {e}", exc_info=True)
        # Return at least a minimal heatmap with center cell on error
        cells = [{
            "lat": center_lat,
            "lng": center_lng,
            "risk_score": 0.0,
            "risk_level": "very_safe",
            "incident_count": 0,
            "last_incident": None,
        }]
        logger.warning("Returning minimal heatmap due to error")
    
    # Get ALL clusters (not filtered by radius) so they persist across viewport changes
    # This allows users to see all reported clusters even when panning the map
    try:
        clusters = get_clusters()
        # Convert all clusters to response format (no filtering by radius)
        # Frontend will render them as persistent markers
        all_clusters = []
        for cluster in clusters:
            all_clusters.append({
                "id": cluster["id"],
                "center": cluster["center"],
                "radius": cluster["radius"],
                "risk_score": cluster["risk_score"],
                "incident_count": cluster["incident_count"],
            })
        filtered_clusters = all_clusters  # Return all clusters, not filtered
    except Exception as e:
        logger.error(f"Error getting clusters: {e}", exc_info=True)
        filtered_clusters = []
    
    return {
        "center": {
            "lat": center_lat,
            "lng": center_lng,
        },
        "radius": radius_meters,
        "grid_size": grid_size_meters,
        "cells": cells,
        "clusters": filtered_clusters,
    }


