"""
Route Analyzer - Safety analysis for navigation routes
"""

import math
from typing import List
from app.api.schemas import RouteRequest, RouteAnalysis, RouteSegment, Location
from app.ml.risk_scoring import calculate_risk_score


def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two points in meters (Haversine formula)"""
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


async def analyze_routes(routes: List[RouteRequest]) -> List[RouteAnalysis]:
    """
    Analyze safety of multiple routes
    
    Args:
        routes: List of routes to analyze
        
    Returns:
        List of RouteAnalysis objects
    """
    analyses = []
    
    for route in routes:
        if len(route.waypoints) < 2:
            continue
        
        total_distance = 0.0
        weighted_risk_sum = 0.0
        high_risk_segments = []
        
        # Analyze each segment
        for i in range(len(route.waypoints) - 1):
            start = route.waypoints[i]
            end = route.waypoints[i + 1]
            
            # Calculate segment distance
            segment_distance = calculate_distance(
                start.lat, start.lng,
                end.lat, end.lng
            )
            total_distance += segment_distance
            
            # Calculate risk score for segment midpoint
            mid_lat = (start.lat + end.lat) / 2
            mid_lng = (start.lng + end.lng) / 2
            
            risk_data = calculate_risk_score(mid_lat, mid_lng)
            segment_risk = risk_data["risk_score"]
            
            # Add to weighted sum
            weighted_risk_sum += segment_risk * segment_distance
            
            # Track high-risk segments (risk >= 3.5)
            if segment_risk >= 3.5:
                high_risk_segments.append(
                    RouteSegment(
                        start=Location(lat=start.lat, lng=start.lng),
                        end=Location(lat=end.lat, lng=end.lng),
                        risk_score=segment_risk,
                    )
                )
        
        # Calculate overall metrics
        if total_distance > 0:
            avg_risk = weighted_risk_sum / total_distance
            # Safety score: inverse of normalized risk (0-1, higher is safer)
            safety_score = max(0.0, 1.0 - (avg_risk / 5.0))
            
            # Calculate safe distance (segments with risk < 2.5)
            safe_distance = total_distance  # Simplified for now
        else:
            avg_risk = 0.0
            safety_score = 1.0
            safe_distance = 0.0
        
        analysis = RouteAnalysis(
            id=route.id,
            safety_score=round(safety_score, 3),
            risk_score=round(avg_risk, 2),
            high_risk_segments=high_risk_segments,
            total_distance=round(total_distance, 2),
            safe_distance=round(safe_distance, 2),
        )
        
        analyses.append(analysis)
    
    return analyses



