"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ==================== Request Schemas ====================

class Location(BaseModel):
    """Geographic location"""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lng: float = Field(..., ge=-180, le=180, description="Longitude")


class IncidentRequest(BaseModel):
    """Incident data for processing"""
    id: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timestamp: datetime
    type: str = Field(..., pattern="^(panic_alert|community_report)$")
    severity: int = Field(..., ge=1, le=5)
    category: Optional[str] = None
    verified: bool = False
    user_id: Optional[str] = None


class RouteWaypoint(BaseModel):
    """Route waypoint"""
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class RouteRequest(BaseModel):
    """Route data for safety analysis"""
    id: str
    waypoints: List[RouteWaypoint] = Field(..., min_items=2)


class AnalyzeRoutesRequest(BaseModel):
    """Request to analyze multiple routes"""
    start: Location
    end: Location
    routes: List[RouteRequest]


class TrainModelRequest(BaseModel):
    """Request to train models"""
    force: bool = False


# ==================== Response Schemas ====================

class ProcessIncidentResponse(BaseModel):
    """Response after processing incident"""
    model_config = {"protected_namespaces": ()}
    
    success: bool
    incident_id: str
    affected_zones: List[str]
    model_updated: bool


class RiskCluster(BaseModel):
    """Unsafe zone cluster"""
    id: str
    center: Location
    radius: float  # meters
    risk_score: float = Field(..., ge=0, le=5)
    incident_count: int


class HeatmapCell(BaseModel):
    """Heatmap grid cell"""
    lat: float
    lng: float
    risk_score: float = Field(..., ge=0, le=5)
    risk_level: str  # very_safe, safe, medium, high, very_high
    incident_count: int
    last_incident: Optional[datetime] = None


class HeatmapResponse(BaseModel):
    """Heatmap data response"""
    success: bool
    heatmap: dict
    timestamp: datetime


class RiskScoreResponse(BaseModel):
    """Risk score response"""
    success: bool
    location: Location
    risk_score: float = Field(..., ge=0, le=5)
    risk_level: str
    nearest_cluster: Optional[RiskCluster] = None
    factors: dict


class RouteSegment(BaseModel):
    """High-risk route segment"""
    start: Location
    end: Location
    risk_score: float = Field(..., ge=0, le=5)


class RouteAnalysis(BaseModel):
    """Route safety analysis"""
    id: str
    safety_score: float = Field(..., ge=0, le=1)  # 0-1, higher is safer
    risk_score: float = Field(..., ge=0, le=5)  # 0-5, lower is safer
    high_risk_segments: List[RouteSegment]
    total_distance: float  # meters
    safe_distance: float  # meters through safe zones


class AnalyzeRoutesResponse(BaseModel):
    """Route analysis response"""
    success: bool
    routes: List[RouteAnalysis]
    recommended_route: Optional[str] = None


class TrainModelResponse(BaseModel):
    """Model training response"""
    success: bool
    training_started: bool
    estimated_time: Optional[str] = None
    incident_count: Optional[int] = None

