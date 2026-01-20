# Step 7: Test ML Service Integration

## Overview

Now that both services are running, we need to test that the Node.js backend can successfully communicate with the Python ML service.

## Prerequisites

1. ✅ Backend API running on port 3001
2. ⚠️ ML Service running on port 8000 (check this!)
3. ✅ Data loaded in ML service (5000 incidents)

## Quick Status Check

### Check ML Service
Open browser: http://localhost:8000/docs
Or run: `curl http://localhost:8000/health`

### Check Backend API
Open browser: http://localhost:3001/health
Or run: `curl http://localhost:3001/health`

## Running Integration Tests

### Option 1: Automated Test Script

```bash
cd backend/api
node test-integration.js
```

This will test:
1. ML Service health check
2. Backend API health check
3. Location update with risk assessment
4. Heatmap generation
5. Route analysis
6. Panic alert processing

### Option 2: Manual Testing

#### Test 1: Location Update with Risk Assessment
```bash
curl -X POST http://localhost:3001/api/location/update \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"test123\",\"latitude\":13.0827,\"longitude\":80.2707}"
```

Expected: Response with `riskAssessment` object

#### Test 2: Get Heatmap
```bash
curl "http://localhost:3001/api/location/heatmap?lat=13.0827&lng=80.2707&radius=1000"
```

Expected: Heatmap data with cells and clusters

#### Test 3: Analyze Routes
```bash
curl "http://localhost:3001/api/location/safe-routes?startLat=13.0827&startLng=80.2707&endLat=13.0850&endLng=80.2750"
```

Expected: Route analysis with safety scores

#### Test 4: Panic Alert
```bash
curl -X POST http://localhost:3001/api/panic/trigger \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"test123\",\"location\":{\"latitude\":13.0827,\"longitude\":80.2707},\"emergencyContacts\":[\"contact1\"]}"
```

Expected: Panic alert processed with ML service response

## Troubleshooting

### ML Service Not Running
If ML service is not running:
```bash
cd backend/ml
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### ML Service Has No Data
If you get empty results, load data first:
```bash
cd backend/ml
python step2_load_data.py
```

### Connection Refused Errors
- Check if ML service is on port 8000
- Check if backend is on port 3001
- Verify firewall settings
- Check ML_SERVICE_URL in backend environment

### Empty Heatmap/Routes
- Ensure data is loaded (5000 incidents)
- Check ML service logs for errors
- Verify coordinates are within Chennai bounds (13.0-13.2 lat, 80.0-80.3 lng)

## Next Steps After Successful Testing

1. **Database Integration**: Replace in-memory storage with PostgreSQL
2. **Authentication**: Add JWT authentication to routes
3. **Caching**: Add Redis for frequently requested data
4. **Monitoring**: Add logging and error tracking
5. **Performance**: Optimize ML service response times
6. **Testing**: Add unit tests and integration tests

## Success Criteria

✅ All 6 integration tests pass
✅ Heatmap returns real data (not empty)
✅ Route analysis works correctly
✅ Panic alerts are processed by ML service
✅ Risk scores are calculated correctly



