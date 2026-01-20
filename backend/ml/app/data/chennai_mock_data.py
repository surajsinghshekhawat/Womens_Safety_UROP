"""
Chennai-Specific Mock Data Generator
Creates realistic APP USER incident data for Chennai city area

IMPORTANT: This simulates incidents reported by APP USERS, not police data.
- panic_alert: User pressed SOS button in our app
- community_report: User reported incident through our app

The model will train on this app user data to learn patterns.
"""

import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict
from app.api.schemas import IncidentRequest


# Chennai city center (Marina Beach area)
CHENNAI_CENTER = {
    "lat": 13.0475,
    "lng": 80.2825,
}

# Chennai city bounds (approximate)
CHENNAI_BOUNDS = {
    "north": 13.20,
    "south": 12.85,
    "east": 80.35,
    "west": 80.10,
}

# High-risk areas in Chennai (for mock data generation only)
# NOTE: These are assumptions for generating realistic test data
# The ML model does NOT know about these areas - it learns from incident data only
HIGH_RISK_AREAS = [
    {
        "name": "Central Railway Station",
        "lat": 13.0827,
        "lng": 80.2707,
        "radius_km": 0.5,
        "base_severity": 4,  # Higher base severity
    },
    {
        "name": "Egmore Railway Station",
        "lat": 13.0790,
        "lng": 80.2606,
        "radius_km": 0.4,
        "base_severity": 4,
    },
    {
        "name": "Marina Beach (Night Area)",
        "lat": 13.0475,
        "lng": 80.2825,
        "radius_km": 1.0,
        "base_severity": 4,
    },
    {
        "name": "Koyambedu Bus Stand",
        "lat": 13.0710,
        "lng": 80.1980,
        "radius_km": 0.6,
        "base_severity": 4,
    },
    {
        "name": "T. Nagar Market Area",
        "lat": 13.0418,
        "lng": 80.2341,
        "radius_km": 0.8,
        "base_severity": 3,
    },
]

# Medium-risk areas
MEDIUM_RISK_AREAS = [
    {
        "name": "Anna Nagar",
        "lat": 13.0850,
        "lng": 80.2100,
        "radius_km": 1.2,
        "base_severity": 3,
    },
    {
        "name": "OMR IT Corridor",
        "lat": 12.9716,
        "lng": 80.2200,
        "radius_km": 2.0,
        "base_severity": 2,
    },
    {
        "name": "Guindy Area",
        "lat": 12.9716,
        "lng": 80.2206,
        "radius_km": 1.5,
        "base_severity": 2,
    },
]

# Low-risk areas (residential)
LOW_RISK_AREAS = [
    {
        "name": "Adyar Residential",
        "lat": 13.0067,
        "lng": 80.2206,
        "radius_km": 2.0,
        "base_severity": 1,
    },
    {
        "name": "Besant Nagar",
        "lat": 12.9990,
        "lng": 80.2640,
        "radius_km": 1.5,
        "base_severity": 1,
    },
]

# Time patterns
HIGH_RISK_HOURS = [22, 23, 0, 1, 2, 3]  # 10 PM - 3 AM
MEDIUM_RISK_HOURS = [18, 19, 20, 21]  # 6 PM - 9 PM
LOW_RISK_HOURS = list(range(6, 18))  # 6 AM - 5 PM

HIGH_RISK_DAYS = [4, 5]  # Friday (4), Saturday (5)


def generate_chennai_incidents(
    count: int = 1000,
    start_date_days_ago: int = 90,  # Generate incidents over last 90 days
) -> List[IncidentRequest]:
    """
    Generate realistic Chennai APP USER incident data
    
    This simulates incidents that APP USERS would report through our app:
    - panic_alert: User pressed SOS button
    - community_report: User reported an incident
    
    NOTE: Uses area assumptions for realistic data generation.
    The ML model does NOT see these assumptions - it learns purely from incident data.
    
    Args:
        count: Number of incidents to generate
        start_date_days_ago: How many days back to start generating incidents
        
    Returns:
        List of IncidentRequest objects (app user incident data)
    """
    incidents = []
    
    # Distribution: 40% high-risk, 35% medium-risk, 25% low-risk areas
    high_risk_count = int(count * 0.40)
    medium_risk_count = int(count * 0.35)
    low_risk_count = count - high_risk_count - medium_risk_count
    
    # Generate incidents in high-risk areas
    for i in range(high_risk_count):
        area = random.choice(HIGH_RISK_AREAS)
        incident = _generate_incident_in_area(
            area=area,
            incident_id=f"chennai_hr_{i}",
            start_date_days_ago=start_date_days_ago,
            risk_level="high",
        )
        incidents.append(incident)
    
    # Generate incidents in medium-risk areas
    for i in range(medium_risk_count):
        area = random.choice(MEDIUM_RISK_AREAS)
        incident = _generate_incident_in_area(
            area=area,
            incident_id=f"chennai_mr_{i}",
            start_date_days_ago=start_date_days_ago,
            risk_level="medium",
        )
        incidents.append(incident)
    
    # Generate incidents in low-risk areas
    for i in range(low_risk_count):
        area = random.choice(LOW_RISK_AREAS)
        incident = _generate_incident_in_area(
            area=area,
            incident_id=f"chennai_lr_{i}",
            start_date_days_ago=start_date_days_ago,
            risk_level="low",
        )
        incidents.append(incident)
    
    # Shuffle to mix up the order
    random.shuffle(incidents)
    
    return incidents


def _generate_incident_in_area(
    area: Dict,
    incident_id: str,
    start_date_days_ago: int,
    risk_level: str,
) -> IncidentRequest:
    """
    Generate a single APP USER incident within a specific area
    
    Simulates what an app user would report:
    - Location where user was when incident occurred
    - Time when user reported it
    - Severity user selected
    - Category user selected
    
    Args:
        area: Area dictionary with lat, lng, radius_km (for generation only)
        incident_id: Unique ID for incident
        start_date_days_ago: Days back to start generating
        risk_level: "high", "medium", or "low" (for generation only)
        
    Returns:
        IncidentRequest object (app user incident data)
    """
    # Generate location within area radius
    radius_degrees = area["radius_km"] / 111.0  # Convert km to degrees
    
    # Random angle and distance from center
    angle = random.uniform(0, 2 * 3.14159)
    distance_degrees = random.uniform(0, radius_degrees)
    
    lat = area["lat"] + distance_degrees * random.uniform(-1, 1)
    lng = area["lng"] + distance_degrees * random.uniform(-1, 1)
    
    # Ensure within Chennai bounds
    lat = max(CHENNAI_BOUNDS["south"], min(CHENNAI_BOUNDS["north"], lat))
    lng = max(CHENNAI_BOUNDS["west"], min(CHENNAI_BOUNDS["east"], lng))
    
    # Generate timestamp with temporal patterns
    days_ago = random.uniform(0, start_date_days_ago)
    base_time = datetime.now(timezone.utc) - timedelta(days=days_ago)
    
    # Adjust time based on risk level and patterns
    hour = _generate_risk_aware_hour(risk_level)
    timestamp = base_time.replace(hour=hour, minute=random.randint(0, 59))
    
    # Generate severity based on area and time
    severity = _generate_severity(area, hour, risk_level)
    
    # Generate incident type
    incident_type = _generate_incident_type(severity)
    
    # Generate category
    category = _generate_category(severity)
    
    # Verification status (60% verified)
    verified = random.random() < 0.6
    
    return IncidentRequest(
        id=incident_id,
        latitude=round(lat, 6),
        longitude=round(lng, 6),
        timestamp=timestamp,
        type=incident_type,
        severity=severity,
        category=category,
        verified=verified,
        user_id=f"user_{random.randint(1, 200)}",  # 200 unique users
    )


def _generate_risk_aware_hour(risk_level: str) -> int:
    """
    Generate hour based on risk level patterns
    
    Args:
        risk_level: "high", "medium", or "low"
        
    Returns:
        Hour (0-23)
    """
    if risk_level == "high":
        # 60% chance of high-risk hours, 30% medium, 10% low
        if random.random() < 0.60:
            return random.choice(HIGH_RISK_HOURS)
        elif random.random() < 0.75:  # 30% of remaining 40%
            return random.choice(MEDIUM_RISK_HOURS)
        else:
            return random.choice(LOW_RISK_HOURS)
    elif risk_level == "medium":
        # 40% high-risk, 40% medium-risk, 20% low-risk
        rand = random.random()
        if rand < 0.40:
            return random.choice(HIGH_RISK_HOURS)
        elif rand < 0.80:
            return random.choice(MEDIUM_RISK_HOURS)
        else:
            return random.choice(LOW_RISK_HOURS)
    else:  # low risk
        # 20% high-risk, 30% medium-risk, 50% low-risk
        rand = random.random()
        if rand < 0.20:
            return random.choice(HIGH_RISK_HOURS)
        elif rand < 0.50:
            return random.choice(MEDIUM_RISK_HOURS)
        else:
            return random.choice(LOW_RISK_HOURS)


def _generate_severity(area: Dict, hour: int, risk_level: str) -> int:
    """
    Generate severity score based on area, time, and risk level
    
    Args:
        area: Area dictionary
        hour: Hour of day (0-23)
        risk_level: Risk level string
        
    Returns:
        Severity (1-5)
    """
    base_severity = area.get("base_severity", 2)
    
    # Time-based adjustment
    if hour in HIGH_RISK_HOURS:
        time_multiplier = 1.2
    elif hour in MEDIUM_RISK_HOURS:
        time_multiplier = 1.0
    else:
        time_multiplier = 0.8
    
    # Calculate adjusted severity
    adjusted = base_severity * time_multiplier
    
    # Add some randomness
    adjusted += random.uniform(-0.5, 0.5)
    
    # Clamp to 1-5 and round
    severity = max(1, min(5, int(round(adjusted))))
    
    # Ensure distribution matches expected patterns
    # High-risk areas: more 4-5, medium: more 2-4, low: more 1-3
    if risk_level == "high":
        if severity < 3:
            # 80% chance to bump up severity
            if random.random() < 0.80:
                severity = random.choices([3, 4, 5], weights=[0.3, 0.4, 0.3])[0]
    elif risk_level == "low":
        if severity > 3:
            # 70% chance to reduce severity
            if random.random() < 0.70:
                severity = random.choices([1, 2, 3], weights=[0.3, 0.4, 0.3])[0]
    
    return severity


def _generate_incident_type(severity: int) -> str:
    """
    Generate incident type based on severity
    
    Args:
        severity: Severity score (1-5)
        
    Returns:
        "panic_alert" or "community_report"
    """
    # Higher severity = more likely to be panic alert
    if severity >= 4:
        return random.choices(
            ["panic_alert", "community_report"],
            weights=[0.4, 0.6]
        )[0]
    elif severity == 3:
        return random.choices(
            ["panic_alert", "community_report"],
            weights=[0.2, 0.8]
        )[0]
    else:
        return "community_report"  # Low severity = mostly reports


def _generate_category(severity: int) -> str:
    """
    Generate incident category based on severity
    
    Args:
        severity: Severity score (1-5)
        
    Returns:
        Category string
    """
    if severity >= 4:
        return random.choices(
            ["harassment", "assault", "suspicious"],
            weights=[0.5, 0.3, 0.2]
        )[0]
    elif severity == 3:
        return random.choices(
            ["harassment", "suspicious", "other"],
            weights=[0.4, 0.4, 0.2]
        )[0]
    else:
        return random.choices(
            ["suspicious", "other", "harassment"],
            weights=[0.4, 0.4, 0.2]
        )[0]


def load_chennai_mock_data_into_storage(count: int = 2000):
    """
    Generate and load Chennai APP USER mock incidents into storage
    
    This generates incidents that simulate what app users would report.
    The ML model will train on this data to learn patterns.
    
    Recommended counts:
    - 1000: Too sparse for Chennai's size (~426 km²)
    - 2000-3000: Good for MVP/testing (default: 2000)
    - 5000: Better for model training
    - 10000: Production-like scale
    
    Args:
        count: Number of incidents to generate (default: 2000)
        
    Returns:
        Number of incidents loaded
    """
    from app.db.storage import add_incident
    
    incidents = generate_chennai_incidents(count)
    
    for incident in incidents:
        add_incident(incident)
    
    print(f"✅ Loaded {len(incidents)} Chennai incidents into storage")
    print(f"   - High-risk areas: {int(count * 0.40)} incidents")
    print(f"   - Medium-risk areas: {int(count * 0.35)} incidents")
    print(f"   - Low-risk areas: {count - int(count * 0.40) - int(count * 0.35)} incidents")
    print(f"   - Density: ~{len(incidents) / 426:.2f} incidents per km²")
    print(f"\n💡 Tip: For better model training, consider 5000-10000 incidents")
    
    return len(incidents)


if __name__ == "__main__":
    # Test data generation
    incidents = generate_chennai_incidents(100)
    print(f"Generated {len(incidents)} incidents")
    print(f"Sample incident: {incidents[0]}")

