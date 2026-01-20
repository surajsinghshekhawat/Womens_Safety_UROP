# 🤖 ML Service - Women Safety Analytics

Machine Learning service for unsafe zone detection, risk scoring, and safety heatmap generation.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- pip

### Installation

```bash
# Navigate to ML service directory
cd backend/ml

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file (optional)
cp .env.example .env
```

### Running the Service

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Or use Python directly
python -m app.main
```

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📋 API Endpoints

### Health Check
```
GET /ml/health
```

### Process Incident
```
POST /ml/incidents/process
Body: {
  "id": "incident_123",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timestamp": "2024-01-15T14:30:00Z",
  "type": "panic_alert",
  "severity": 4,
  "category": "harassment"
}
```

### Get Heatmap
```
GET /ml/heatmap?lat=40.7128&lng=-74.0060&radius=1000&grid_size=100
```

### Get Risk Score
```
GET /ml/risk-score?lat=40.7128&lng=-74.0060
```

### Analyze Routes
```
POST /ml/routes/analyze
Body: {
  "start": {"lat": 40.7128, "lng": -74.0060},
  "end": {"lat": 40.7589, "lng": -73.9851},
  "routes": [...]
}
```

### Train Models
```
POST /ml/models/train
Body: {"force": false}
```

## 🧪 Testing with Mock Data

```python
# In Python shell or script
from app.data.mock_data import load_mock_data_into_storage

# Load 100 mock incidents
load_mock_data_into_storage(100)

# Now test endpoints with real data
```

## 📁 Project Structure

```
backend/ml/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration
│   ├── api/                 # API routes and schemas
│   ├── ml/                  # ML algorithms
│   │   ├── clustering.py    # DBSCAN clustering
│   │   ├── risk_scoring.py  # Risk calculation
│   │   ├── heatmap.py       # Heatmap generation
│   │   ├── route_analyzer.py # Route safety
│   │   └── models.py        # Model persistence
│   ├── data/                # Data processing
│   │   ├── storage.py       # In-memory storage
│   │   └── mock_data.py     # Mock data generator
│   └── utils/               # Utilities
├── tests/                   # Test files (TODO)
└── requirements.txt         # Dependencies
```

## 🔧 Configuration

Key configuration in `app/config.py`:
- `dbscan_eps`: Clustering distance threshold (~100m)
- `dbscan_min_samples`: Minimum incidents per cluster
- `default_grid_size`: Heatmap grid cell size (meters)
- `cache_ttl`: Cache time-to-live (seconds)

## 📊 ML Algorithms

- **Clustering**: DBSCAN for unsafe zone detection
- **Risk Scoring**: Weighted formula (0-5 scale)
- **Heatmap**: Grid-based risk visualization
- **Route Analysis**: Segment-by-segment safety scoring

See `docs/ml-implementation-plan.md` for detailed documentation.

## 🔗 Integration

The ML service is called by the Node.js backend API:

```typescript
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
```

## 📝 Development Status

✅ **Completed:**
- FastAPI application structure
- API endpoints (6 endpoints)
- Risk scoring engine
- DBSCAN clustering
- Heatmap generation
- Route analyzer
- Mock data generator
- In-memory storage

⏭️ **Next Steps:**
- Database integration (replace in-memory storage)
- Model persistence (save/load trained models)
- Unit tests
- Performance optimization
- Caching implementation

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
uvicorn app.main:app --port 8001
```

### Import Errors
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

### No Data Showing
```python
# Load mock data first
from app.data.mock_data import load_mock_data_into_storage
load_mock_data_into_storage(100)
```

## 📚 Documentation

- Full implementation plan: `docs/ml-implementation-plan.md`
- API documentation: http://localhost:8000/docs (when running)
