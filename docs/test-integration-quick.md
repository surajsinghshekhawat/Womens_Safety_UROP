# Quick Integration Test Guide

## Prerequisites

1. ✅ Axios installed (`npm install` completed)
2. ML Service must be running on port 8000
3. Backend API must be running on port 3001 (or configured port)

## Step 1: Start ML Service

Open **Terminal 1**:

```bash
cd backend/ml
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Wait for: `Application startup complete`

## Step 2: Start Backend API

Open **Terminal 2**:

```bash
cd backend/api
npm run dev
```

Wait for: `🚀 Women Safety Analytics API running on port 3001`

## Step 3: Run Integration Tests

Open **Terminal 3**:

```bash
cd backend/api
node test-integration.js
```

## Expected Results

You should see:
- ✅ ML Service is healthy
- ✅ Backend API is responding
- ✅ Location update successful (with risk assessment)
- ✅ Heatmap generation successful
- ✅ Route analysis successful
- ✅ Panic alert processed successfully

## Manual Testing (Alternative)

If you prefer to test manually:

### Test 1: ML Service Health
```bash
curl http://localhost:8000/ml/health
```

### Test 2: Backend Health
```bash
curl http://localhost:3001/health
```

### Test 3: Location Update
```bash
curl -X POST http://localhost:3001/api/location/update -H "Content-Type: application/json" -d "{\"userId\":\"test\",\"latitude\":13.0827,\"longitude\":80.2707}"
```

### Test 4: Heatmap
```bash
curl "http://localhost:3001/api/location/heatmap?lat=13.0827&lng=80.2707&radius=1000"
```

### Test 5: Route Analysis
```bash
curl "http://localhost:3001/api/location/safe-routes?startLat=13.0827&startLng=80.2707&endLat=13.0850&endLng=80.2750"
```

### Test 6: Panic Alert
```bash
curl -X POST http://localhost:3001/api/panic/trigger -H "Content-Type: application/json" -d "{\"userId\":\"test\",\"location\":{\"latitude\":13.0827,\"longitude\":80.2707},\"emergencyContacts\":[\"contact1\"]}"
```

## Troubleshooting

### ML Service Not Responding
- Check if port 8000 is in use
- Verify ML service logs for errors
- Ensure data is loaded: `python step2_load_data.py`

### Backend Not Responding
- Check if port 3001 is in use
- Verify backend logs for errors
- Check if TypeScript compiled successfully

### Connection Refused
- Ensure both services are running
- Check firewall settings
- Verify URLs match configured ports



