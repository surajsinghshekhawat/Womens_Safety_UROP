# 🤖 ML Service Implementation Plan
## Women Safety Analytics - Unsafe Zone Detection & Heatmap Generation

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [ML Algorithms & Approach](#ml-algorithms--approach)
3. [Data Requirements](#data-requirements)
4. [API Design](#api-design)
5. [Implementation Steps](#implementation-steps)
6. [File Structure](#file-structure)
7. [Integration Points](#integration-points)

---

## 🏗️ Architecture Overview

### Service Architecture
```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐         ┌──────────────────┐
│  Backend API    │────────▶│   ML Service     │
│  (Node.js)      │  HTTP   │   (Python/FastAPI)│
└─────────────────┘         └──────────────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌──────────────────┐
│  PostgreSQL     │         │  ML Models       │
│  + PostGIS      │         │  (Pickle/Joblib) │
└─────────────────┘         └──────────────────┘
```

### ML Service Components

1. **FastAPI Application** - REST API server
2. **Risk Scoring Engine** - Calculates risk scores (0-5) for locations
3. **Clustering Module** - Identifies unsafe zones using DBSCAN/K-means
4. **Heatmap Generator** - Creates grid-based heatmap data
5. **Route Analyzer** - Evaluates route safety for navigation
6. **Model Training Pipeline** - Retrains models with new incident data

---

## 🧠 ML Algorithms & Approach

### 1. Unsafe Zone Detection (Clustering)

**Algorithm: DBSCAN (Density-Based Spatial Clustering)**
- **Why DBSCAN?**
  - Handles irregular cluster shapes (unsafe zones aren't always circular)
  - Automatically identifies noise/outliers
  - No need to pre-specify number of clusters
  - Works well with geospatial data

**Alternative: K-Means with Elbow Method**
- Use if we need fixed number of zones
- Simpler but less flexible

**Features for Clustering:**
- Latitude, Longitude (spatial)
- Incident count (density)
- Time of day (temporal patterns)
- Day of week (weekly patterns)
- Incident severity (weighted clustering)

### 2. Risk Scoring (0-5 Scale)

**Formula:**
```
Risk Score = f(
    incident_density,      # Weight: 0.4
    recency_factor,        # Weight: 0.3
    severity_avg,          # Weight: 0.2
    time_pattern_match,    # Weight: 0.1
)
```

**Risk Levels:**
- **0-1**: Very Safe (Green)
- **2**: Safe (Light Green)
- **3**: Moderate Risk (Yellow)
- **4**: High Risk (Orange)
- **5**: Very High Risk (Red)

**Recency Factor:**
- Recent incidents (< 7 days) = higher weight
- Older incidents (> 30 days) = lower weight
- Exponential decay: `weight = e^(-days_ago / 7)`

### 3. Heatmap Generation

**Grid-Based Approach:**
- Divide area into grid cells (e.g., 100m x 100m)
- Calculate risk score for each cell
- Return grid with coordinates and risk scores
- Frontend renders as heatmap overlay

**Optimization:**
- Cache heatmap for static areas
- Update only changed cells
- Use spatial indexing (R-tree) for fast queries

### 4. Safe Route Planning

**Approach:**
1. Get multiple route options from Map API (Google Maps/Mapbox)
2. Score each route segment using risk scores
3. Calculate weighted safety score:
   ```
   route_safety = Σ(segment_risk × segment_length) / total_length
   ```
4. Rank routes by safety score
5. Return top 3 safest routes

---

## 📊 Data Requirements

### Input Data Structure

**Incident Reports:**
```python
{
    "id": "incident_123",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timestamp": "2024-01-15T14:30:00Z",
    "type": "panic_alert" | "community_report",
    "severity": 1-5,  # 1=low, 5=critical
    "category": "harassment" | "assault" | "suspicious" | "other",
    "verified": true | false,
    "user_id": "user_123"
}
```

### Output Data Structure

**Heatmap Response:**
```python
{
    "center": {"lat": 40.7128, "lng": -74.0060},
    "radius": 1000,  # meters
    "grid_size": 100,  # meters per cell
    "cells": [
        {
            "lat": 40.7128,
            "lng": -74.0060,
            "risk_score": 3.5,  # 0-5
            "risk_level": "medium",  # very_safe, safe, medium, high, very_high
            "incident_count": 5,
            "last_incident": "2024-01-15T10:30:00Z"
        },
        ...
    ],
    "clusters": [
        {
            "id": "cluster_1",
            "center": {"lat": 40.7130, "lng": -74.0062},
            "radius": 150,  # meters
            "risk_score": 4.2,
            "incident_count": 12
        },
        ...
    ]
}
```

---

## 🔌 API Design

### Endpoints

#### 1. `POST /ml/incidents/process`
Process new incident and update models
```json
Request:
{
    "incident": {
        "id": "incident_123",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "timestamp": "2024-01-15T14:30:00Z",
        "type": "panic_alert",
        "severity": 4,
        "category": "harassment"
    }
}

Response:
{
    "success": true,
    "incident_id": "incident_123",
    "affected_zones": ["cluster_1", "cluster_2"],
    "model_updated": false  # true if retraining triggered
}
```

#### 2. `GET /ml/heatmap`
Get safety heatmap for area
```json
Query Params:
- lat: float (required)
- lng: float (required)
- radius: int (default: 1000) meters
- grid_size: int (default: 100) meters

Response:
{
    "success": true,
    "heatmap": {
        "center": {"lat": 40.7128, "lng": -74.0060},
        "radius": 1000,
        "grid_size": 100,
        "cells": [...],
        "clusters": [...]
    },
    "timestamp": "2024-01-15T14:30:00Z"
}
```

#### 3. `GET /ml/risk-score`
Get risk score for specific location
```json
Query Params:
- lat: float (required)
- lng: float (required)

Response:
{
    "success": true,
    "location": {"lat": 40.7128, "lng": -74.0060},
    "risk_score": 3.5,
    "risk_level": "medium",
    "nearest_cluster": {
        "id": "cluster_1",
        "distance": 50,  # meters
        "risk_score": 4.2
    },
    "factors": {
        "incident_density": 0.8,
        "recency": 0.6,
        "severity": 0.7,
        "time_pattern": 0.5
    }
}
```

#### 4. `POST /ml/routes/analyze`
Analyze route safety
```json
Request:
{
    "start": {"lat": 40.7128, "lng": -74.0060},
    "end": {"lat": 40.7589, "lng": -73.9851},
    "routes": [
        {
            "id": "route_1",
            "waypoints": [
                {"lat": 40.7128, "lng": -74.0060},
                {"lat": 40.7200, "lng": -74.0000},
                {"lat": 40.7589, "lng": -73.9851}
            ]
        }
    ]
}

Response:
{
    "success": true,
    "routes": [
        {
            "id": "route_1",
            "safety_score": 0.85,  # 0-1, higher is safer
            "risk_score": 2.5,  # 0-5, lower is safer
            "high_risk_segments": [
                {
                    "start": {"lat": 40.7200, "lng": -74.0000},
                    "end": {"lat": 40.7250, "lng": -73.9950},
                    "risk_score": 4.2
                }
            ],
            "total_distance": 1200,  # meters
            "safe_distance": 1000  # meters through safe zones
        }
    ],
    "recommended_route": "route_1"
}
```

#### 5. `POST /ml/models/train`
Manually trigger model retraining
```json
Request:
{
    "force": false  # Force retrain even if recent
}

Response:
{
    "success": true,
    "training_started": true,
    "estimated_time": "5 minutes",
    "incident_count": 1250
}
```

#### 6. `GET /ml/health`
Health check endpoint
```json
Response:
{
    "status": "healthy",
    "models_loaded": true,
    "last_training": "2024-01-15T10:00:00Z",
    "incident_count": 1250,
    "version": "1.0.0"
}
```

---

## 🚀 Implementation Steps

### Phase 1: Foundation Setup (Steps 1-3)

#### Step 1: Create Python Project Structure
- Set up virtual environment
- Create FastAPI application skeleton
- Configure dependencies (requirements.txt)
- Set up project structure

#### Step 2: Create Data Models & Schemas
- Define Pydantic models for requests/responses
- Create data validation schemas
- Set up configuration management

#### Step 3: Implement Mock Data Generator
- Generate synthetic incident data for testing
- Create sample unsafe zones
- Simulate temporal patterns

### Phase 2: Core ML Components (Steps 4-7)

#### Step 4: Implement Risk Scoring Engine
- Create risk calculation functions
- Implement recency decay
- Add severity weighting
- Test with sample data

#### Step 5: Implement Clustering Module
- Set up DBSCAN clustering
- Create cluster identification logic
- Implement cluster metadata extraction
- Add visualization helpers

#### Step 6: Implement Heatmap Generator
- Create grid generation logic
- Calculate risk scores for grid cells
- Optimize with spatial indexing
- Add caching mechanism

#### Step 7: Implement Route Analyzer
- Create route scoring algorithm
- Implement segment-by-segment analysis
- Add route ranking logic

### Phase 3: API & Integration (Steps 8-10)

#### Step 8: Create FastAPI Endpoints
- Implement all 6 API endpoints
- Add request validation
- Implement error handling
- Add API documentation (Swagger)

#### Step 9: Model Persistence
- Implement model saving/loading
- Set up model versioning
- Create model update pipeline

#### Step 10: Integration with Backend
- Update Node.js backend to call ML service
- Replace mock data with real ML calls
- Add error handling and fallbacks

### Phase 4: Testing & Optimization (Steps 11-12)

#### Step 11: Testing
- Unit tests for ML algorithms
- Integration tests for API endpoints
- Performance testing
- Accuracy validation

#### Step 12: Optimization
- Profile and optimize hot paths
- Implement caching strategies
- Add monitoring and logging
- Performance tuning

---

## 📁 File Structure

```
backend/ml/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py           # API route handlers
│   │   └── schemas.py          # Pydantic models
│   │
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── clustering.py       # DBSCAN clustering logic
│   │   ├── risk_scoring.py     # Risk score calculation
│   │   ├── heatmap.py          # Heatmap generation
│   │   ├── route_analyzer.py   # Route safety analysis
│   │   └── models.py           # Model persistence
│   │
│   ├── data/
│   │   ├── __init__.py
│   │   ├── storage.py          # Data storage interface
│   │   ├── mock_data.py        # Mock data generator
│   │   └── processors.py       # Data preprocessing
│   │
│   └── utils/
│       ├── __init__.py
│       ├── geospatial.py       # Geospatial utilities
│       └── cache.py            # Caching utilities
│
├── tests/
│   ├── __init__.py
│   ├── test_clustering.py
│   ├── test_risk_scoring.py
│   ├── test_heatmap.py
│   └── test_api.py
│
├── models/                      # Saved ML models
│   └── .gitkeep
│
├── data/                        # Sample/test data
│   └── sample_incidents.json
│
├── requirements.txt             # Python dependencies
├── .env.example                # Environment variables template
├── README.md                   # ML service documentation
└── .gitignore
```

---

## 🔗 Integration Points

### Backend API Integration

**Update `backend/api/src/routes/location.ts`:**

```typescript
// Replace mock heatmap with ML service call
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function getHeatmapFromML(lat: number, lng: number, radius: number) {
  const response = await fetch(
    `${ML_SERVICE_URL}/ml/heatmap?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return await response.json();
}
```

### Environment Variables

**Backend (.env):**
```
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=5000
```

**ML Service (.env):**
```
PORT=8000
MODEL_PATH=./models
CACHE_TTL=300  # seconds
DBSCAN_EPS=0.001  # ~100 meters
DBSCAN_MIN_SAMPLES=3
```

---

## 📈 Success Metrics

- **Accuracy**: ≥ 85% unsafe-zone prediction accuracy
- **Latency**: < 500ms for heatmap generation
- **Scalability**: Handle 1000+ concurrent requests
- **Model Update**: Retrain within 5 minutes of new data

---

## 🔄 Model Retraining Strategy

### Automatic Retraining
- Trigger when incident count increases by 10%
- Daily retraining at low-traffic hours
- Manual trigger via API endpoint

### Incremental Learning
- Update clusters incrementally
- Recalculate risk scores in real-time
- Full retrain weekly

---

## 🛡️ Security Considerations

- Input validation on all endpoints
- Rate limiting (100 req/min per IP)
- CORS configuration
- API key authentication (future)
- Data sanitization

---

## 📝 Next Steps

1. ✅ Create this implementation plan
2. ⏭️ Set up Python project structure
3. ⏭️ Implement core ML algorithms
4. ⏭️ Create FastAPI endpoints
5. ⏭️ Integrate with backend API
6. ⏭️ Test and optimize

---

**Last Updated:** January 15, 2025  
**Version:** 1.0.0




