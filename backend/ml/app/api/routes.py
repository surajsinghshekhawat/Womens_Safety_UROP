"""
API Route Handlers
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime, timezone

from app.api.schemas import (
    IncidentRequest,
    ProcessIncidentResponse,
    HeatmapResponse,
    RiskScoreResponse,
    AnalyzeRoutesRequest,
    AnalyzeRoutesResponse,
    TrainModelRequest,
    TrainModelResponse,
    Location,
)

router = APIRouter()


@router.post("/incidents/process", response_model=ProcessIncidentResponse)
async def process_incident(incident: IncidentRequest):
    """
    Process a new incident and update ML models
    
    This endpoint receives incident data and:
    1. Updates the incident database
    2. Recalculates affected unsafe zones
    3. Triggers model retraining if needed
    """
    try:
        # Import here to avoid circular imports
        from app.db.storage import add_incident
        
        # Store incident
        add_incident(incident)
        
        # Check if we need to update clusters
        from app.ml.clustering import update_clusters_if_needed
        affected_zones = update_clusters_if_needed(incident)
        
        return ProcessIncidentResponse(
            success=True,
            incident_id=incident.id,
            affected_zones=affected_zones,
            model_updated=False,  # Will be true when retraining is triggered
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process incident: {str(e)}")


@router.get("/heatmap", response_model=HeatmapResponse)
async def get_heatmap(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
    radius: int = Query(1000, ge=100, le=50000, description="Radius in meters (max 50km)"),
    grid_size: int = Query(100, ge=50, le=1000, description="Grid cell size in meters"),
    timestamp: Optional[str] = Query(None, description="ISO timestamp for logging"),
    local_hour: Optional[int] = Query(None, ge=0, le=23, description="LOCAL hour (0-23) for time-based risk calculation"),
    include_time_factor: bool = Query(True, description="Include time-of-day risk factors"),
):
    """
    Get safety heatmap data for a geographic area
    NOW SUPPORTS TIME-BASED RISK CALCULATION WITH LOCAL TIME
    
    The heatmap now changes based on LOCAL time of day:
    - Night (9PM-4AM LOCAL): Higher risk
    - Evening (6PM-9PM LOCAL): Medium-high risk
    - Day (10AM-6PM LOCAL): Lower risk
    
    Uses local_hour (0-23) to calculate risk based on user's actual local time,
    not UTC time. This ensures 9PM in India = high risk, not 3:30PM UTC.
    
    Returns:
    - Grid cells with risk scores (0-5) calculated for local time
    - Identified unsafe zone clusters
    - Risk levels for visualization
    """
    try:
        from app.ml.heatmap import generate_heatmap
        import logging
        logger = logging.getLogger(__name__)
        
        # Use local_hour if provided (user's local time), otherwise use server time as fallback
        query_local_hour = local_hour if local_hour is not None else datetime.now().hour
        
        # Parse timestamp if provided (for logging only)
        query_timestamp = None
        if timestamp:
            try:
                from dateutil import parser
                query_timestamp = parser.isoparse(timestamp)
            except:
                query_timestamp = datetime.now(timezone.utc)
        else:
            query_timestamp = datetime.now(timezone.utc)
        
        logger.info(f"Generating time-based heatmap: center=({lat}, {lng}), radius={radius}m, grid_size={grid_size}m, local_hour={query_local_hour} (LOCAL TIME)")
        heatmap_data = generate_heatmap(lat, lng, radius, grid_size, query_timestamp, query_local_hour)
        
        cells_count = len(heatmap_data.get("cells", []))
        clusters_count = len(heatmap_data.get("clusters", []))
        logger.info(f"Heatmap generated: {cells_count} cells, {clusters_count} clusters at {query_timestamp.isoformat()}")
        
        return HeatmapResponse(
            success=True,
            heatmap=heatmap_data,
            timestamp=query_timestamp,
        )
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to generate heatmap: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate heatmap: {str(e)}")


@router.get("/risk-score", response_model=RiskScoreResponse)
async def get_risk_score(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lng: float = Query(..., ge=-180, le=180, description="Longitude"),
):
    """
    Get risk score for a specific location
    
    Returns:
    - Risk score (0-5)
    - Risk level (very_safe, safe, medium, high, very_high)
    - Nearest unsafe zone cluster (if any)
    - Contributing factors breakdown
    """
    try:
        from app.ml.risk_scoring import calculate_risk_score
        
        risk_data = calculate_risk_score(lat, lng)
        
        return RiskScoreResponse(
            success=True,
            location=Location(lat=lat, lng=lng),
            risk_score=risk_data["risk_score"],
            risk_level=risk_data["risk_level"],
            nearest_cluster=risk_data.get("nearest_cluster"),
            factors=risk_data.get("factors", {}),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate risk score: {str(e)}")


@router.post("/routes/analyze", response_model=AnalyzeRoutesResponse)
async def analyze_routes(request: AnalyzeRoutesRequest):
    """
    Analyze safety of multiple routes
    
    Takes route waypoints and calculates:
    - Overall safety score (0-1)
    - Risk score (0-5)
    - High-risk segments
    - Recommended safest route
    """
    try:
        from app.ml.route_analyzer import analyze_routes
        
        routes_analysis = await analyze_routes(request.routes)
        
        # Find recommended route (highest safety score)
        recommended = max(routes_analysis, key=lambda r: r.safety_score).id if routes_analysis else None
        
        return AnalyzeRoutesResponse(
            success=True,
            routes=routes_analysis,
            recommended_route=recommended,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze routes: {str(e)}")


@router.post("/models/train", response_model=TrainModelResponse)
async def train_models(request: TrainModelRequest):
    """
    Manually trigger model retraining
    
    This endpoint:
    1. Collects all incident data
    2. Retrains clustering models
    3. Updates risk scoring parameters
    4. Saves updated models
    """
    try:
        from app.ml.models import train_models
        
        result = await train_models(force=request.force)
        
        return TrainModelResponse(
            success=True,
            training_started=result["started"],
            estimated_time=result.get("estimated_time"),
            incident_count=result.get("incident_count"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to train models: {str(e)}")


@router.get("/incidents/all")
async def get_all_incidents():
    """
    Get all incidents from database
    
    Returns:
    - List of all incidents
    """
    try:
        from app.db.storage import get_all_incidents
        
        incidents = get_all_incidents()
        
        return {
            "success": True,
            "incidents": incidents,
            "count": len(incidents),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get incidents: {str(e)}")


@router.get("/health")
async def ml_health():
    """
    ML service health check
    
    Returns:
    - Service status
    - Model loading status
    - Last training timestamp
    - Incident count
    """
    try:
        from app.db.storage import get_incident_count
        from app.ml.models import get_model_status
        
        model_status = get_model_status()
        incident_count = get_incident_count()
        
        return {
            "status": "healthy",
            "models_loaded": model_status["loaded"],
            "last_training": model_status.get("last_training"),
            "incident_count": incident_count,
            "version": "1.0.0",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

