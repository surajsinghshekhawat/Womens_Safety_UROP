"""
Risk Scoring Engine
Calculates risk scores (0-5) for locations based on incident data
"""

import math
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional
from app.config import settings
from app.db.storage import get_incidents


def calculate_recency_weight(days_ago: float) -> float:
    """
    Calculate recency weight using exponential decay
    
    Args:
        days_ago: Number of days since incident
        
    Returns:
        Weight between 0 and 1
    """
    # Exponential decay: weight = e^(-days_ago / 7)
    # Recent incidents (< 7 days) get high weight
    # Older incidents (> 30 days) get low weight
    return math.exp(-days_ago / 7.0)


def calculate_time_of_day_factor(local_hour: int) -> float:
    """
    Calculate time-of-day risk factor based on LOCAL hour (0-23)
    Higher risk at night (9PM-4AM), lower during day (10AM-6PM)
    
    Args:
        local_hour: LOCAL hour (0-23) from user's timezone, not UTC
        
    Returns:
        Time factor between 0.0 (safe hours) and 1.0 (risky hours)
    """
    hour = local_hour
    
    # High risk: 9 PM - 4 AM (21:00 - 04:00)
    if 21 <= hour or hour < 4:
        return 0.9  # High risk at night
    
    # Medium-high risk: 6 PM - 9 PM (18:00 - 21:00)
    elif 18 <= hour < 21:
        return 0.7  # Evening risk
    
    # Medium risk: 4 AM - 8 AM (04:00 - 08:00)
    elif 4 <= hour < 8:
        return 0.6  # Early morning
    
    # Lower risk: 8 AM - 6 PM (08:00 - 18:00)
    else:
        return 0.3  # Daytime is safer


def calculate_risk_score(lat: float, lng: float, query_timestamp: Optional[datetime] = None, local_hour: Optional[int] = None) -> Dict:
    """
    Calculate risk score for a specific location
    NOW SUPPORTS TIME-BASED RISK CALCULATION
    
    Args:
        lat: Latitude
        lng: Longitude
        query_timestamp: Current time for time-based risk (default: now)
        
    Returns:
        Dictionary with risk_score, risk_level, factors, etc.
    """
    # Use provided timestamp or current time for logging/other purposes
    now = query_timestamp if query_timestamp else datetime.now(timezone.utc)
    
    # Use LOCAL hour if provided (user's local time), otherwise fallback to server hour
    # This ensures time-based risk uses user's actual local time (9PM local = high risk)
    query_local_hour = local_hour if local_hour is not None else now.hour
    
    # Calculate current time-of-day risk factor using LOCAL hour
    # Location A might be risky at 9PM local but safe at 10AM local
    current_time_factor = calculate_time_of_day_factor(query_local_hour)
    
    # Get all incidents within a reasonable radius (~1km) using PostGIS
    # Approximate: 1 degree ≈ 111 km
    radius_meters = 1000  # ~1km
    
    # Use PostGIS radius query for better performance
    from app.db.storage import get_incidents_in_radius
    incidents = get_incidents_in_radius(lat, lng, radius_meters)
    
    if not incidents:
        # Even with no incidents, apply time-of-day risk
        # Night time (9PM) is still riskier than daytime (10AM)
        base_risk = current_time_factor * 1.5  # Low base risk amplified by time
        
        return {
            "risk_score": round(base_risk, 2),
            "risk_level": "safe" if base_risk < 2.0 else "medium",
            "factors": {
                "incident_density": 0.0,
                "recency": 0.0,
                "severity": 0.0,
                "time_pattern": round(current_time_factor, 3),
                "current_time_factor": round(current_time_factor, 3),  # Current time risk
            },
        }
    weighted_severity = 0.0
    recency_sum = 0.0
    total_weight = 0.0
    
    for incident in incidents:
        # Calculate distance (simple Euclidean in degrees)
        dist_lat = incident["latitude"] - lat
        dist_lng = incident["longitude"] - lng
        distance = math.sqrt(dist_lat**2 + dist_lng**2)
        
        # Distance weight (closer incidents matter more)
        distance_weight = math.exp(-distance / 0.001)  # Decay over ~100m
        
        # Time since incident - ensure both are timezone-aware
        incident_timestamp = incident["timestamp"]
        if isinstance(incident_timestamp, datetime):
            # If naive datetime, assume UTC
            if incident_timestamp.tzinfo is None:
                incident_timestamp = incident_timestamp.replace(tzinfo=timezone.utc)
        else:
            # If string, parse it
            if isinstance(incident_timestamp, str):
                incident_timestamp = datetime.fromisoformat(incident_timestamp.replace('Z', '+00:00'))
            else:
                # Skip if can't parse
                continue
        
        days_ago = (now - incident_timestamp).total_seconds() / 86400
        recency_weight = calculate_recency_weight(days_ago)
        
        # Combined weight
        weight = distance_weight * recency_weight
        
        weighted_severity += incident["severity"] * weight
        recency_sum += recency_weight
        total_weight += weight
    
    # Normalize factors with better scaling
    
    # Incident density: Use logarithmic scaling for better variation
    # With 5000 incidents, areas can have 0-100+ incidents in 1km radius
    # Use log scale: log(incidents + 1) / log(max_expected + 1)
    max_expected_incidents = 50  # Reasonable max for 1km radius with dense data
    if len(incidents) == 0:
        incident_density = 0.0
    else:
        # Logarithmic scaling for better distribution
        incident_density = math.log(len(incidents) + 1) / math.log(max_expected_incidents + 1)
        incident_density = min(incident_density, 1.0)
    
    avg_recency = recency_sum / len(incidents) if incidents else 0.0
    
    avg_severity = weighted_severity / total_weight if total_weight > 0 else 0.0
    avg_severity = avg_severity / 5.0  # Normalize to 0-1
    
    # LOCATION-SPECIFIC TIME WINDOW MATCHING (Option A)
    # Analyze WHEN incidents happened at THIS specific location
    # Match current time with historical incident times
    
    # Define time windows
    night_window = [21, 22, 23, 0, 1, 2, 3, 4]  # 9PM-4AM
    evening_window = [18, 19, 20]  # 6PM-9PM
    afternoon_window = [12, 13, 14, 15, 16, 17]  # 12PM-6PM
    morning_window = [6, 7, 8, 9, 10, 11]  # 6AM-12PM
    
    # Count incidents in each time window for THIS location
    night_incidents = 0
    evening_incidents = 0
    afternoon_incidents = 0
    morning_incidents = 0
    
    for incident in incidents:
        timestamp = incident["timestamp"]
        if hasattr(timestamp, 'hour'):
            incident_hour = timestamp.hour
        else:
            continue
        
        # Count incidents by time window
        if incident_hour in night_window:
            night_incidents += 1
        elif incident_hour in evening_window:
            evening_incidents += 1
        elif incident_hour in afternoon_window:
            afternoon_incidents += 1
        elif incident_hour in morning_window:
            morning_incidents += 1
    
    # Find dominant time pattern for THIS location
    # Location A might be risky at night, Location B might be risky at afternoon
    pattern_counts = {
        'night': night_incidents,
        'evening': evening_incidents,
        'afternoon': afternoon_incidents,
        'morning': morning_incidents,
    }
    total_incidents_by_time = sum(pattern_counts.values())
    
    if total_incidents_by_time > 0:
        # Calculate pattern ratios
        night_ratio = night_incidents / total_incidents_by_time
        evening_ratio = evening_incidents / total_incidents_by_time
        afternoon_ratio = afternoon_incidents / total_incidents_by_time
        morning_ratio = morning_incidents / total_incidents_by_time
        
        # Determine dominant pattern (when most incidents happened at this location)
        dominant_pattern = max(pattern_counts, key=pattern_counts.get)
        dominant_ratio = pattern_counts[dominant_pattern] / total_incidents_by_time
        
        # LOCATION-SPECIFIC TIME MATCHING
        # Check if current local hour matches the dominant historical pattern
        current_hour_matches_pattern = False
        match_strength = 0.0
        
        if query_local_hour in night_window and dominant_pattern == 'night':
            current_hour_matches_pattern = True
            match_strength = night_ratio
        elif query_local_hour in evening_window and dominant_pattern == 'evening':
            current_hour_matches_pattern = True
            match_strength = evening_ratio
        elif query_local_hour in afternoon_window and dominant_pattern == 'afternoon':
            current_hour_matches_pattern = True
            match_strength = afternoon_ratio
        elif query_local_hour in morning_window and dominant_pattern == 'morning':
            current_hour_matches_pattern = True
            match_strength = morning_ratio
        
        # Calculate location-specific time pattern
        location_time_pattern = current_time_factor  # Default to general time factor
        
        if current_hour_matches_pattern and match_strength > 0.5:
            # Current time MATCHES historical pattern → HIGH RISK
            # Example: Location A has night incidents, current time is 9PM → HIGH RISK
            location_time_pattern = 0.9 + (match_strength * 0.1)  # 0.9-1.0 (high risk)
        elif current_hour_matches_pattern and match_strength > 0.3:
            # Partial match → MEDIUM-HIGH RISK
            location_time_pattern = 0.7 + (match_strength * 0.2)  # 0.7-0.9
        elif current_hour_matches_pattern:
            # Weak match → MEDIUM RISK
            location_time_pattern = 0.5 + (match_strength * 0.2)  # 0.5-0.7
        else:
            # Current time DOESN'T MATCH historical pattern → LOW RISK
            # Example: Location A has night incidents, current time is 12PM → LOW RISK
            # Only apply base time factor, not historical pattern
            location_time_pattern = current_time_factor * 0.6  # Reduce risk if doesn't match
        
        # Combine with general time factor for fallback
        # If no strong pattern match, use general time-of-day risk
        time_pattern = (location_time_pattern * 0.7) + (current_time_factor * 0.3)
    else:
        # No historical incidents at this location
        # Use general time-of-day risk only
        time_pattern = current_time_factor
    
    # Calculate weighted risk score
    risk_score = (
        settings.weight_incident_density * incident_density +
        settings.weight_recency * avg_recency +
        settings.weight_severity * avg_severity +
        settings.weight_time_pattern * time_pattern
    ) * 5.0  # Scale to 0-5
    
    risk_score = max(0.0, min(5.0, risk_score))  # Clamp to 0-5
    
    # Determine risk level
    if risk_score <= 1.0:
        risk_level = "very_safe"
    elif risk_score <= 2.0:
        risk_level = "safe"
    elif risk_score <= 3.0:
        risk_level = "medium"
    elif risk_score <= 4.0:
        risk_level = "high"
    else:
        risk_level = "very_high"
    
    return {
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "factors": {
            "incident_density": round(incident_density, 3),
            "recency": round(avg_recency, 3),
            "severity": round(avg_severity, 3),
            "time_pattern": round(time_pattern, 3),
            "current_time_factor": round(current_time_factor, 3),  # Current time-of-day risk
        },
        "calculated_at": now.isoformat(),  # When this risk was calculated
    }

