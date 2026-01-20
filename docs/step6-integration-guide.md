# Step 6: ML Service Integration Guide

## Overview

This guide explains how to integrate the Python ML service with the Node.js backend API. After completing this step, the backend will communicate with the ML service for all safety-related features.

## What Was Done

### 1. Created ML Service Client (`backend/api/src/services/mlService.ts`)

A TypeScript service client that handles all communication with the Python ML service:

- **`checkMLServiceHealth()`**: Checks if ML service is running
- **`processIncident()`**: Sends incidents to ML service for processing
- **`getHeatmap()`**: Requests heatmap data from ML service
- **`getRiskScore()`**: Gets risk score for a specific location
- **`analyzeRoutes()`**: Analyzes route safety

All functions include error handling and fallback responses if the ML service is unavailable.

### 2. Updated Location Routes (`backend/api/src/routes/location.ts`)

- **`POST /api/location/update`**: Now checks risk score for user location
- **`GET /api/location/heatmap`**: Calls ML service for real heatmap data
- **`GET /api/location/safe-routes`**: Uses ML service to analyze route safety

### 3. Updated Panic Routes (`backend/api/src/routes/panic.ts`)

- **`POST /api/panic/trigger`**: Sends panic incidents to ML service for processing

### 4. Added Dependencies

- Added `axios` to `package.json` for HTTP requests to ML service

## Configuration

The ML service URL is configured via environment variables:

```env
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=10000
```

Default values:
- URL: `http://localhost:8000`
- Timeout: 10 seconds

## Testing the Integration

### Prerequisites

1. **ML Service Running**: The Python ML service must be running on port 8000
2. **Data Loaded**: Ensure you've loaded incident data (Step 2)
3. **Backend Dependencies**: Install Node.js dependencies

### Step 1: Install Backend Dependencies

```bash
cd backend/api
npm install
```

This will install `axios` and other dependencies.

### Step 2: Start ML Service

In a separate terminal:

```bash
cd backend/ml
# Activate virtual environment
.venv\Scripts\activate  # Windows PowerShell
# or
source .venv/bin/activate  # Linux/Mac

# Start ML service
uvicorn app.main:app --reload --port 8000
```

### Step 3: Start Backend API

In another terminal:

```bash
cd backend/api
npm run dev
```

The backend should start on port 3000 (or your configured port).

### Step 4: Test Integration

#### Test 1: Health Check

```bash
curl http://localhost:8000/ml/health
```

Expected response:
```json
{
  "status": "healthy"
}
```

#### Test 2: Location Update with Risk Assessment

```bash
curl -X POST http://localhost:3000/api/location/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "latitude": 13.0827,
    "longitude": 80.2707
  }'
```

Expected response includes `riskAssessment`:
```json
{
  "success": true,
  "message": "Location updated successfully",
  "riskAssessment": {
    "riskScore": 2.5,
    "riskLevel": "moderate",
    "isHighRisk": false
  }
}
```

#### Test 3: Get Heatmap

```bash
curl "http://localhost:3000/api/location/heatmap?lat=13.0827&lng=80.2707&radius=1000"
```

Expected response includes heatmap cells and clusters:
```json
{
  "success": true,
  "heatmap": {
    "center": { "lat": 13.0827, "lng": 80.2707 },
    "radius": 1000,
    "grid_size": 100,
    "cells": [...],
    "clusters": [...]
  }
}
```

#### Test 4: Analyze Routes

```bash
curl "http://localhost:3000/api/location/safe-routes?startLat=13.0827&startLng=80.2707&endLat=13.0850&endLng=80.2750"
```

Expected response includes analyzed routes with safety scores:
```json
{
  "success": true,
  "routes": {
    "start": { "lat": 13.0827, "lng": 80.2707 },
    "end": { "lat": 13.0850, "lng": 80.2750 },
    "routes": [
      {
        "id": "route_direct",
        "safetyScore": 0.85,
        "riskScore": 1.2,
        "distance": 500,
        "highRiskSegments": []
      }
    ],
    "recommendedRoute": "route_direct"
  }
}
```

#### Test 5: Panic Alert Processing

```bash
curl -X POST http://localhost:3000/api/panic/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "location": { "latitude": 13.0827, "longitude": 80.2707 },
    "emergencyContacts": ["contact1", "contact2"]
  }'
```

Expected response includes ML processing info:
```json
{
  "success": true,
  "panicId": "panic_1234567890",
  "mlProcessing": {
    "affectedZones": [...],
    "modelUpdated": false
  }
}
```

## Error Handling

The integration includes graceful error handling:

1. **ML Service Unavailable**: Returns 503 status with error message
2. **Invalid Parameters**: Returns 400 status with validation errors
3. **Network Errors**: Logged and fallback responses returned

## Next Steps

After successful integration:

1. **Database Integration**: Replace in-memory storage with PostgreSQL
2. **Authentication**: Add user authentication to routes
3. **Caching**: Add Redis caching for frequently requested data
4. **Monitoring**: Add logging and monitoring for ML service calls
5. **Testing**: Add integration tests for ML service communication

## Troubleshooting

### ML Service Not Responding

- Check if ML service is running: `curl http://localhost:8000/ml/health`
- Check ML service logs for errors
- Verify port 8000 is not in use by another service

### CORS Errors

If you see CORS errors, ensure the ML service has CORS enabled for your backend origin.

### Timeout Errors

Increase `ML_SERVICE_TIMEOUT` in environment variables if requests are timing out.

### Data Not Found

Ensure you've loaded incident data using `step2_load_data.py` before testing.



