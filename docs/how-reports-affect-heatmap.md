# How Community Reports Affect the Heatmap

## Theory: The Complete Flow

### 1. User Submits a Report

When a user submits a community incident report through the mobile app:

```
User → Mobile App → Backend API → ML Service → Database
```

**Steps:**
1. User fills out report form (category, description, severity, location)
2. Mobile app sends POST request to `/api/reports/submit`
3. Backend API validates the data
4. Backend calls ML Service to process the incident
5. ML Service stores incident in PostgreSQL database

### 2. Incident Storage

The incident is stored in the `incidents` table with:
- **Location**: Latitude, Longitude (also stored as PostGIS geography point)
- **Type**: `community_report` or `panic_alert`
- **Severity**: 1-5 (affects risk scoring)
- **Timestamp**: When it occurred
- **Category**: Type of incident (harassment, theft, etc.)
- **Verified**: Whether it's been verified (affects weight in calculations)

### 3. Real-Time Impact on Heatmap

The heatmap is **dynamically calculated** - it doesn't use a pre-trained model. Instead:

#### Risk Score Calculation (for each grid cell):

When you request a heatmap, the ML service:

1. **Finds nearby incidents** (within 1km radius using PostGIS)
2. **Calculates 4 factors:**

   **a) Incident Density (50% weight)**
   - Counts incidents in the area
   - Uses logarithmic scaling: `log(incidents + 1) / log(50)`
   - More incidents = higher density score
   - **Your new report immediately increases this count!**

   **b) Recency (25% weight)**
   - Recent incidents matter more
   - Uses exponential decay: `e^(-days_ago / 7)`
   - A report from today has weight ~1.0
   - A report from 30 days ago has weight ~0.01
   - **Your new report has maximum recency weight!**

   **c) Severity (15% weight)**
   - Average severity of nearby incidents
   - Severity 5 (critical) contributes more than severity 1 (minor)
   - **Your report's severity directly affects this!**

   **d) Time Pattern (10% weight)**
   - Analyzes when incidents occur (night vs day)
   - Night incidents (10 PM - 4 AM) = 0.9 weight
   - Evening (6 PM - 10 PM) = 0.7 weight
   - Day (6 AM - 6 PM) = 0.3 weight
   - **Your report's timestamp affects this!**

3. **Combines factors:**
   ```
   Risk Score = (Density × 0.5 + Recency × 0.25 + Severity × 0.15 + Time Pattern × 0.1) × 5
   ```

4. **Result**: Risk score 0-5 for each grid cell

### 4. Immediate Effect

**When you submit a report:**

✅ **Immediately affects heatmap** - Next time someone requests heatmap data, your incident is included

✅ **Increases risk score** - The area around your report location gets a higher risk score

✅ **Affects nearby cells** - All grid cells within 1km of your report are recalculated

✅ **Influences clustering** - If your report is near other incidents, it may:
   - Join an existing unsafe zone cluster
   - Create a new cluster if it's isolated
   - Expand an existing cluster's radius

### 5. Example Scenario

**Before your report:**
- Location: 13.0827, 80.2707 (Central Railway Station)
- Nearby incidents: 5 incidents in last 30 days
- Risk score: 2.8 (Medium)

**After your report (Severity 4, just now):**
- Nearby incidents: **6 incidents** (your report added)
- Recency: **Increased** (your report is most recent)
- Severity: **Increased** (your severity 4 adds to average)
- Risk score: **3.2** (Medium-High) ⬆️

### 6. Clustering Impact

The system uses **DBSCAN clustering** to identify unsafe zones:

- **Eps**: 220 meters (clustering distance)
- **Min Samples**: 5 incidents needed to form a cluster

**Your report can:**
- Join an existing cluster if within 220m of 4+ other incidents
- Create a new cluster if it attracts 4+ nearby incidents
- Expand a cluster's radius if it's on the edge

### 7. Why No Model File?

This system uses **rule-based risk scoring** and **unsupervised clustering**:

- **No training needed** - Rules are defined (weights, formulas)
- **No model file** - Calculations happen in real-time
- **Always up-to-date** - Every heatmap request uses latest data
- **Adaptive** - New reports immediately affect results

### 8. Data Flow Summary

```
User Report
    ↓
Backend API (/api/reports/submit)
    ↓
ML Service (/ml/incidents/process)
    ↓
PostgreSQL Database (incidents table)
    ↓
[Next Heatmap Request]
    ↓
ML Service queries database
    ↓
Calculates risk scores using ALL incidents (including your report)
    ↓
Returns heatmap with updated risk scores
    ↓
Mobile App displays updated heatmap
```

## Key Points

1. **Real-time**: Reports affect heatmap immediately (no delay)
2. **Cumulative**: Each report adds to the risk assessment
3. **Location-based**: Only affects nearby areas (within 1km)
4. **Time-sensitive**: Recent reports have more impact
5. **Severity matters**: Higher severity reports contribute more
6. **No retraining**: System adapts automatically without model retraining

## Verification

To verify your report affected the heatmap:

1. Submit a report at a specific location
2. Request heatmap for that area
3. Check if risk score increased
4. Check if new cluster appeared (if enough nearby incidents)

The system is designed to be **reactive** - it responds to new data immediately without requiring model retraining or manual updates.


