"""
Mock data generator for testing and development
"""

import random
from datetime import datetime, timedelta
from typing import List
from app.api.schemas import IncidentRequest


def generate_mock_incidents(
    count: int = 100,
    center_lat: float = 40.7128,
    center_lng: float = -74.0060,
    radius_km: float = 5.0,
) -> List[IncidentRequest]:
    """
    Generate mock incident data for testing
    
    Args:
        count: Number of incidents to generate
        center_lat, center_lng: Center point for incidents
        radius_km: Radius in kilometers
        
    Returns:
        List of IncidentRequest objects
    """
    incidents = []
    
    # Create some high-risk clusters
    cluster_centers = [
        (center_lat + 0.005, center_lng + 0.003),  # Cluster 1
        (center_lat - 0.004, center_lng + 0.002),  # Cluster 2
        (center_lat + 0.002, center_lng - 0.005),  # Cluster 3
    ]
    
    for i in range(count):
        # Decide if incident belongs to a cluster or is random
        if random.random() < 0.6:  # 60% in clusters
            cluster_center = random.choice(cluster_centers)
            # Generate near cluster center
            lat = cluster_center[0] + random.uniform(-0.002, 0.002)
            lng = cluster_center[1] + random.uniform(-0.002, 0.002)
            severity = random.choices([3, 4, 5], weights=[0.3, 0.4, 0.3])[0]
        else:
            # Random location
            lat = center_lat + random.uniform(-radius_km/111, radius_km/111)
            lng = center_lng + random.uniform(-radius_km/111, radius_km/111)
            severity = random.choices([1, 2, 3], weights=[0.4, 0.4, 0.2])[0]
        
        # Generate timestamp (within last 30 days)
        days_ago = random.uniform(0, 30)
        timestamp = datetime.utcnow() - timedelta(days=days_ago)
        
        incident = IncidentRequest(
            id=f"mock_incident_{i}",
            latitude=lat,
            longitude=lng,
            timestamp=timestamp,
            type=random.choice(["panic_alert", "community_report"]),
            severity=severity,
            category=random.choice(["harassment", "assault", "suspicious", "other"]),
            verified=random.random() > 0.3,  # 70% verified
            user_id=f"user_{random.randint(1, 50)}",
        )
        
        incidents.append(incident)
    
    return incidents


def load_mock_data_into_storage(count: int = 100):
    """
    Generate and load mock incidents into storage
    
    Args:
        count: Number of incidents to generate
    """
    from app.db.storage import add_incident
    
    incidents = generate_mock_incidents(count)
    for incident in incidents:
        add_incident(incident)
    
    return len(incidents)

