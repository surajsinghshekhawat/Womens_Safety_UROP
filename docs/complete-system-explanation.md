# Complete System Explanation - What We Built

## Overview

We built a **backend system** that processes safety incident data and provides risk analysis. This is the **data processing and API layer** - the actual map visualization happens in the mobile app (which we haven't built yet).

---

## What We Actually Built

### 1. **Database Layer (PostgreSQL + PostGIS)**

- Stores 5000 incident reports (panic alerts, community reports)
- Each incident has: location (lat/lng), timestamp, severity, type
- Uses PostGIS for fast geospatial queries (finding incidents near a location)

### 2. **ML Service (Python/FastAPI)**

This is where the "intelligence" happens. It does **3 main things**:

#### A. **Risk Scoring** (No training needed - it's rule-based)

- **How it works:**

  1. You give it a location (lat, lng)
  2. It queries database: "Find all incidents within 1km of this location"
  3. It calculates a risk score (0-5) based on:
     - **Incident density**: More incidents = higher risk
     - **Recency**: Recent incidents = higher risk
     - **Severity**: High severity incidents = higher risk
     - **Time patterns**: Night/evening incidents = higher risk
  4. Returns a number like 3.5/5.0

- **Why no "model training"?**
  - This is **rule-based**, not machine learning
  - It uses a **formula** (like a calculator)
  - Formula: `risk = (density × 0.5) + (recency × 0.25) + (severity × 0.15) + (time_pattern × 0.1)`
  - No training data needed - it just calculates from existing incidents

#### B. **Clustering (DBSCAN - This IS machine learning)**

- **How it works:**

  1. Takes all 5000 incidents
  2. Groups nearby incidents together (clusters)
  3. Each cluster = an "unsafe zone"
  4. Found 118 unsafe zones automatically

- **Why this IS ML:**
  - DBSCAN is an **unsupervised learning algorithm**
  - It learns patterns from data (finds where incidents cluster)
  - No labels needed - it discovers patterns automatically
  - The "model" is the algorithm itself (no file to save/load)

#### C. **Heatmap Generation**

- **How it works:**

  1. You give it: center location, radius (e.g., 1000m), grid size (e.g., 50m)
  2. It divides the area into a grid (like a chessboard)
  3. For each grid cell:
     - Calculates risk score for that cell's center
     - Creates a data point: `{lat, lng, risk_score, risk_level}`
  4. Returns array of ~1640 cells with risk scores

- **What it returns:**

```json
{
  "cells": [
    { "lat": 13.0827, "lng": 80.2707, "risk_score": 3.5, "risk_level": "high" },
    { "lat": 13.083, "lng": 80.2708, "risk_score": 2.1, "risk_level": "medium" }
    // ... 1638 more cells
  ],
  "clusters": [
    {
      "id": "cluster_1",
      "center": { "lat": 13.082, "lng": 80.27 },
      "radius": 500,
      "risk_score": 3.5
    }
  ]
}
```

- **How it maps to a map:**
  - The mobile app receives this data
  - App draws colored circles/overlays on a map (Google Maps/Mapbox)
  - Red = high risk, Yellow = medium, Green = low
  - Each cell becomes a colored square on the map

### 3. **Backend API (Node.js/Express)**

- Receives requests from mobile app
- Calls ML service to get risk data
- Returns formatted data to mobile app

---

## The Complete Flow

### Example: User wants to see heatmap

1. **Mobile App** → "Show me heatmap for this area"

   ```
   GET /api/location/heatmap?lat=13.0827&lng=80.2707&radius=1000
   ```

2. **Backend API** → Calls ML Service

   ```
   GET http://localhost:8000/ml/heatmap?lat=13.0827&lng=80.2707&radius=1000
   ```

3. **ML Service** → Queries Database

   ```sql
   SELECT * FROM incidents
   WHERE ST_DWithin(location, point, 1000 meters)
   ```

4. **ML Service** → Calculates risk for each grid cell

   - Divides area into grid
   - For each cell: calculates risk score
   - Returns array of cells with risk scores

5. **Backend API** → Returns to Mobile App

   ```json
   {
     "heatmap": {
       "cells": [1640 cells with lat/lng/risk_score],
       "clusters": [3 unsafe zones]
     }
   }
   ```

6. **Mobile App** → Draws on Map
   - Takes each cell's lat/lng
   - Draws colored overlay on Google Maps
   - Red areas = high risk, Green = safe

---

## What's Missing (Not Built Yet)

### 1. **Mobile App** (React Native)

- The actual map visualization
- Drawing heatmap overlays
- User interface
- This is what users will see

### 2. **Map Integration**

- Google Maps or Mapbox SDK
- Drawing colored overlays based on risk scores
- Route visualization

### 3. **Real-Time Updates**

- WebSocket connections
- Live location tracking
- Push notifications

---

## Why No "Model File"?

### Traditional ML (Supervised Learning):

```
Training Data → Train Model → Save model.pkl → Load model → Predict
```

### Our Approach (Unsupervised + Rule-Based):

**Clustering (DBSCAN):**

- No training needed
- Algorithm runs on data each time
- Finds patterns dynamically
- No model file to save

**Risk Scoring:**

- Not ML at all - it's a formula
- Like: `risk = (incidents × weight) + (recency × weight)`
- Calculates from current data
- No model file needed

**Why this approach?**

- Safety data changes constantly (new incidents daily)
- We want real-time analysis, not pre-trained predictions
- Patterns change (new unsafe zones appear)
- Better to calculate from current data than use old model

---

## Data Flow Diagram

```
Mobile App (Not built yet)
    ↓
Backend API (Node.js) ✅
    ↓
ML Service (Python) ✅
    ↓
Database (PostgreSQL) ✅
    ↓
5000 Incidents stored ✅

When user requests heatmap:
1. App asks Backend API
2. Backend asks ML Service
3. ML Service queries Database
4. ML Service calculates risk scores
5. Returns grid of risk scores
6. Backend returns to App
7. App draws on map (Not built yet)
```

---

## What Each Component Does

### Database

- **Stores**: Incident reports
- **Provides**: Fast location queries
- **Example**: "Give me all incidents within 500m of (13.0827, 80.2707)"

### ML Service

- **Does**: Risk calculations, clustering, heatmap generation
- **Input**: Location coordinates
- **Output**: Risk scores, unsafe zones, heatmap data
- **No training**: Uses current data + formulas

### Backend API

- **Does**: Receives app requests, calls ML service, formats responses
- **Acts as**: Middleman between app and ML service

### Mobile App (Not built)

- **Will do**: Show map, draw heatmap overlays, user interface
- **Will use**: Google Maps/Mapbox to visualize the data

---

## Example: How Heatmap Works

**Step 1: User requests heatmap for Chennai Central Station area**

**Step 2: System divides area into grid:**

```
Area: 1000m radius around (13.0827, 80.2707)
Grid: 50m × 50m cells
Result: ~1640 cells
```

**Step 3: For each cell, calculate risk:**

```
Cell 1: (13.0827, 80.2707)
  → Query: "Incidents within 1km?"
  → Found: 50 incidents
  → Calculate: risk = 3.5/5.0 (high)

Cell 2: (13.0830, 80.2710)
  → Query: "Incidents within 1km?"
  → Found: 12 incidents
  → Calculate: risk = 2.1/5.0 (medium)

... repeat for all 1640 cells
```

**Step 4: Return data:**

```json
{
  "cells": [
    { "lat": 13.0827, "lng": 80.2707, "risk_score": 3.5 },
    { "lat": 13.083, "lng": 80.271, "risk_score": 2.1 }
    // ... 1638 more
  ]
}
```

**Step 5: Mobile app (when built) draws on map:**

- Cell 1: Draw red overlay (high risk)
- Cell 2: Draw yellow overlay (medium risk)
- Result: Colored heatmap on map

---

## Summary

**What we built:**

- ✅ Database to store incidents
- ✅ ML service to calculate risk scores
- ✅ Backend API to serve data
- ✅ Full integration working

**What we didn't build:**

- ❌ Mobile app (React Native)
- ❌ Map visualization (Google Maps integration)
- ❌ User interface

**The ML part:**

- Uses **DBSCAN clustering** (unsupervised ML) to find unsafe zones
- Uses **rule-based risk scoring** (formula, not ML model)
- No model file because it calculates from current data
- No training needed - it learns patterns from incidents

**The heatmap:**

- Divides area into grid cells
- Calculates risk for each cell
- Returns data (lat, lng, risk_score)
- Mobile app will draw this on a map (not built yet)

---

## Next Steps

1. **Build Mobile App** - React Native with map visualization
2. **Integrate Maps** - Google Maps/Mapbox SDK
3. **Draw Heatmap** - Use the risk score data to color the map
4. **Add Features** - Panic button, route planning, etc.

The backend is complete - now we need the frontend to visualize it!


