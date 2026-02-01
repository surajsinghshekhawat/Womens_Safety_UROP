"""
Database storage layer - replaces in-memory storage
"""

from typing import List, Dict, Optional
from datetime import datetime, timezone, timedelta
from app.db.connection import get_db_connection
from app.api.schemas import IncidentRequest
import psycopg2
import psycopg2.extras
import logging

logger = logging.getLogger(__name__)


def add_incident(incident: IncidentRequest) -> str:
    """
    Add incident to database
    
    Args:
        incident: IncidentRequest object
        
    Returns:
        incident_id: ID of stored incident
    """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                # Create PostGIS point from lat/lng
                # Note: ST_MakePoint takes (longitude, latitude) not (lat, lng)
                # Precompute incident local hour-of-day using the client-provided timezone offset (if present).
                tz_offset = getattr(incident, "timezone_offset_minutes", None)
                if tz_offset is not None:
                    try:
                        incident_local_hour = (incident.timestamp + timedelta(minutes=int(tz_offset))).hour
                    except Exception:
                        incident_local_hour = incident.timestamp.hour
                else:
                    incident_local_hour = incident.timestamp.hour

                cur.execute(
                    """
                    INSERT INTO incidents (
                        id, latitude, longitude, location, timestamp,
                        timezone_offset_minutes, incident_local_hour,
                        type, severity, category, verified, user_id
                    ) VALUES (
                        %s, %s, %s,
                        ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                        %s,
                        %s, %s,
                        %s, %s, %s, %s, %s
                    )
                """,
                    (
                        incident.id,
                        incident.latitude,
                        incident.longitude,
                        incident.longitude,  # lng first for PostGIS ST_MakePoint
                        incident.latitude,  # lat second
                        incident.timestamp,
                        tz_offset,
                        incident_local_hour,
                        incident.type,
                        incident.severity,
                        incident.category,
                        incident.verified,
                        incident.user_id,
                    ),
                )
        logger.info(f"Incident {incident.id} added to database")
        return incident.id
    except Exception as e:
        logger.error(f"Failed to add incident: {e}")
        raise


def get_incidents(
    lat_min: Optional[float] = None,
    lat_max: Optional[float] = None,
    lng_min: Optional[float] = None,
    lng_max: Optional[float] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
) -> List[Dict]:
    """
    Get incidents with optional filtering
    
    Args:
        lat_min, lat_max: Latitude bounds
        lng_min, lng_max: Longitude bounds
        start_time, end_time: Time range
        
    Returns:
        List of incident dictionaries
    """
    try:
        conditions = []
        params = []
        
        if lat_min is not None:
            conditions.append("latitude >= %s")
            params.append(lat_min)
        if lat_max is not None:
            conditions.append("latitude <= %s")
            params.append(lat_max)
        if lng_min is not None:
            conditions.append("longitude >= %s")
            params.append(lng_min)
        if lng_max is not None:
            conditions.append("longitude <= %s")
            params.append(lng_max)
        if start_time is not None:
            conditions.append("timestamp >= %s")
            params.append(start_time)
        if end_time is not None:
            conditions.append("timestamp <= %s")
            params.append(end_time)
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        query = f"""
            SELECT 
                id, latitude, longitude, timestamp,
                timezone_offset_minutes, incident_local_hour,
                type, severity, category, verified, user_id
            FROM incidents
            WHERE {where_clause}
            ORDER BY timestamp DESC
        """
        
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                
                # Convert to list of dicts
                incidents = []
                for row in rows:
                    incidents.append({
                        "id": row["id"],
                        "latitude": float(row["latitude"]),
                        "longitude": float(row["longitude"]),
                        "timestamp": row["timestamp"],
                        "timezone_offset_minutes": row.get("timezone_offset_minutes"),
                        "incident_local_hour": row.get("incident_local_hour"),
                        "type": row["type"],
                        "severity": row["severity"],
                        "category": row["category"],
                        "verified": row["verified"],
                        "user_id": row["user_id"],
                    })
                
                return incidents
    except Exception as e:
        logger.error(f"Failed to get incidents: {e}")
        raise


def get_incidents_in_radius(
    lat: float,
    lng: float,
    radius_meters: float
) -> List[Dict]:
    """
    Get incidents within a radius using PostGIS
    
    Args:
        lat: Center latitude
        lng: Center longitude
        radius_meters: Radius in meters
        
    Returns:
        List of incident dictionaries
    """
    try:
        query = """
            SELECT 
                id, latitude, longitude, timestamp,
                timezone_offset_minutes, incident_local_hour,
                type, severity, category, verified, user_id
            FROM incidents
            WHERE ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                %s
            )
            ORDER BY timestamp DESC
        """
        
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(query, (lng, lat, radius_meters))
                rows = cur.fetchall()
                
                incidents = []
                for row in rows:
                    incidents.append({
                        "id": row["id"],
                        "latitude": float(row["latitude"]),
                        "longitude": float(row["longitude"]),
                        "timestamp": row["timestamp"],
                        "timezone_offset_minutes": row.get("timezone_offset_minutes"),
                        "incident_local_hour": row.get("incident_local_hour"),
                        "type": row["type"],
                        "severity": row["severity"],
                        "category": row["category"],
                        "verified": row["verified"],
                        "user_id": row["user_id"],
                    })
                
                return incidents
    except Exception as e:
        logger.error(f"Failed to get incidents in radius: {e}")
        raise


def get_incident_count() -> int:
    """Get total number of incidents"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM incidents")
                result = cur.fetchone()
                return result[0] if result else 0
    except Exception as e:
        logger.error(f"Failed to get incident count: {e}")
        return 0


def get_all_incidents() -> List[Dict]:
    """Get all incidents (for model training)"""
    return get_incidents()


def clear_incidents():
    """Clear all incidents (for testing)"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("TRUNCATE TABLE incidents RESTART IDENTITY CASCADE")
        logger.info("All incidents cleared from database")
    except Exception as e:
        logger.error(f"Failed to clear incidents: {e}")
        raise

