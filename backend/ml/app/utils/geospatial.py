"""
Geospatial utility functions
"""

import math


def meters_to_degrees(meters: float) -> float:
    """
    Convert meters to degrees (approximate)
    
    Args:
        meters: Distance in meters
        
    Returns:
        Distance in degrees
    """
    return meters / 111000.0


def degrees_to_meters(degrees: float) -> float:
    """
    Convert degrees to meters (approximate)
    
    Args:
        degrees: Distance in degrees
        
    Returns:
        Distance in meters
    """
    return degrees * 111000.0


def calculate_distance_haversine(
    lat1: float, lng1: float, lat2: float, lng2: float
) -> float:
    """
    Calculate distance between two points using Haversine formula
    
    Args:
        lat1, lng1: First point coordinates
        lat2, lng2: Second point coordinates
        
    Returns:
        Distance in meters
    """
    R = 6371000  # Earth radius in meters
    
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
        math.sin(dlng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c



