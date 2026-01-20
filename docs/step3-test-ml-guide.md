# 🧠 Step 3: Test ML Algorithms

## 🎯 Goal
Test DBSCAN clustering and risk scoring algorithms with the loaded 5000 Chennai incidents.

---

## 📋 What This Step Tests

### **1. DBSCAN Clustering**
- Finds unsafe zones from incident data
- Groups nearby incidents into clusters
- Calculates cluster centers and radii
- Assigns risk scores to clusters

### **2. Risk Scoring**
- Calculates risk scores (0-5) for sample locations
- Shows contributing factors:
  - Incident density
  - Recency
  - Severity
  - Time patterns

### **3. Model Verification**
- Checks if clusters align with high-risk locations
- Verifies model is learning patterns correctly

---

## 🚀 How to Run

### **Prerequisites:**
1. Step 2 completed (5000 incidents loaded)
2. Dependencies installed

### **Run Step 3:**
```bash
cd backend/ml
python step3_test_ml_algorithms.py
```

### **Expected Output:**
```
============================================================
STEP 3: Testing ML Algorithms
============================================================

1. Checking data availability...
   ✅ Found 5000 incidents in storage

2. Testing DBSCAN Clustering...
   (Finding unsafe zones from incident data)
   This may take 10-30 seconds...
   ✅ Clustering completed!
   ✅ Found 15 unsafe zone clusters

   Cluster Details:
   --------------------------------------------------------

   Cluster 1:
   - ID: cluster_0
   - Center: (13.082700, 80.270700)
   - Radius: 450 meters
   - Incidents: 85
   - Risk Score: 4.25/5.0
   - Risk Level: High Risk

   Cluster 2:
   - ID: cluster_1
   - Center: (13.047500, 80.282500)
   - Radius: 380 meters
   - Incidents: 72
   - Risk Score: 4.10/5.0
   - Risk Level: High Risk

   ... (more clusters)

3. Testing Risk Scoring...
   (Calculating risk scores for sample locations)

   Risk Scores for Sample Locations:
   --------------------------------------------------------

   Central Railway Station:
   - Location: (13.082700, 80.270700)
   - Risk Score: 4.25/5.0
   - Risk Level: High Risk
   - Contributing Factors:
     • Incident Density: 0.850
     • Recency: 0.720
     • Severity: 0.680
     • Time Pattern: 0.600

   Marina Beach:
   - Location: (13.047500, 80.282500)
   - Risk Score: 4.10/5.0
   - Risk Level: High Risk
   ...

4. Verifying Model Learning...
   Checking if clusters align with high-risk locations...
   - Clusters near high-risk locations: 3/5
   ✅ Model is learning spatial patterns correctly!

============================================================
✅ STEP 3 COMPLETE!
============================================================
```

---

## ✅ What to Verify

### **Clustering Results:**
- ✅ Should find multiple clusters (10-30 expected)
- ✅ Clusters should have reasonable sizes (20-200 incidents)
- ✅ Risk scores should vary (some high, some low)
- ✅ Cluster centers should be in Chennai bounds

### **Risk Scoring Results:**
- ✅ High-risk areas (stations, bus stands) should have scores 3.5-5.0
- ✅ Low-risk areas (residential) should have scores 0-2.0
- ✅ Contributing factors should make sense
- ✅ Scores should reflect incident density

### **Model Learning:**
- ✅ Clusters should align with high-risk locations
- ✅ Model should discover patterns from data
- ✅ No errors or crashes

---

## 🐛 Troubleshooting

### **No Clusters Found**
- **Cause**: Incidents too spread out or DBSCAN parameters too strict
- **Solution**: 
  - Check if you have enough incidents (need 500+)
  - Adjust `dbscan_eps` in `app/config.py` (try 0.002 for larger clusters)
  - Adjust `dbscan_min_samples` (try 2 instead of 3)

### **All Risk Scores Are 0**
- **Cause**: No incidents near test locations
- **Solution**: 
  - Check if incidents are loaded correctly
  - Verify test locations are in Chennai bounds
  - Check incident distribution

### **Clustering Takes Too Long**
- **Cause**: Too many incidents or inefficient algorithm
- **Solution**: 
  - This is normal for 5000 incidents (10-30 seconds)
  - For faster testing, use fewer incidents (2000)

---

## 📊 Understanding Results

### **Good Clustering Results:**
- 10-30 clusters found
- Clusters have 20-200 incidents each
- Some clusters have high risk scores (3.5-5.0)
- Clusters align with known high-risk areas

### **Good Risk Scoring Results:**
- Transport hubs: High scores (3.5-5.0)
- Residential areas: Low scores (0-2.0)
- Contributing factors make sense
- Scores reflect actual incident density

---

## 💡 Next Steps

After Step 3:
- ✅ Clustering works
- ✅ Risk scoring works
- ✅ Model learns from data

**Next:**
- Step 4: Test heatmap generation
- Step 5: Test route analysis
- Or: Integrate with backend API



