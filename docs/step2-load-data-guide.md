# 📦 Step 2: Load Chennai Data into Storage

## 🎯 Goal
Load 5000 Chennai app user incidents into storage and verify everything works.

---

## 📋 What This Step Does

### **1. Clears Existing Data**
- Removes any old test data
- Ensures clean start

### **2. Generates 5000 Chennai Incidents**
- Uses Chennai mock data generator
- Creates realistic app user incident data
- Distributes across Chennai areas:
  - 40% in high-risk areas (2000 incidents)
  - 35% in medium-risk areas (1750 incidents)
  - 25% in low-risk areas (1250 incidents)

### **3. Loads into Storage**
- Stores all incidents in memory
- Ready for ML model to use

### **4. Verifies Storage**
- Checks count matches
- Shows sample incident
- Displays statistics

### **5. Shows Statistics**
- Type distribution (panic alerts vs reports)
- Severity distribution (1-5)
- Verification status
- Location coverage
- Density calculation

---

## 🚀 How to Run

### **Prerequisites:**
1. Virtual environment activated
2. Dependencies installed (`pip install -r requirements.txt`)

### **Run Step 2:**
```bash
cd backend/ml
python step2_load_data.py
```

### **Expected Output:**
```
============================================================
STEP 2: Loading Chennai Mock Data into Storage
============================================================

1. Clearing existing data...
   ✅ Storage cleared

2. Generating and loading 5000 Chennai incidents...
   (This may take 10-30 seconds)
   ✅ Loaded 5000 Chennai incidents into storage
   - High-risk areas: 2000 incidents
   - Medium-risk areas: 1750 incidents
   - Low-risk areas: 1250 incidents
   - Density: ~11.74 incidents per km²

   ✅ Loaded 5000 incidents

3. Verifying storage...
   ✅ Storage contains 5000 incidents
   ✅ Count matches!

4. Sample incidents:
   Sample incident:
   - ID: chennai_hr_0
   - Location: (13.082700, 80.270700)
   - Type: panic_alert
   - Severity: 4
   - Category: harassment
   - Timestamp: 2024-01-15 14:30:00
   - Verified: True

5. Incident Statistics:
   - Panic Alerts: 1000 (20.0%)
   - Community Reports: 4000 (80.0%)

   Severity Distribution:
   - Severity 1: 750 incidents (15.0%)
   - Severity 2: 1750 incidents (35.0%)
   - Severity 3: 1500 incidents (30.0%)
   - Severity 4: 750 incidents (15.0%)
   - Severity 5: 250 incidents (5.0%)

   Verification Status:
   - Verified: 3000 (60.0%)
   - Unverified: 2000 (40.0%)

   Location Coverage:
   - Latitude range: 12.850000 to 13.200000
   - Longitude range: 80.100000 to 80.350000
   - Chennai area: ~426 km²
   - Density: ~11.74 incidents per km²

6. Testing data retrieval...
   - Incidents near Central Station (~1km radius): 45

============================================================
✅ STEP 2 COMPLETE!
============================================================

📊 Summary:
   - Total incidents loaded: 5000
   - Data ready for ML model training
   - Next step: Test ML algorithms (Step 3)
```

---

## ✅ What to Verify

After running, check:

1. **✅ Count matches**: Should show 5000 incidents
2. **✅ Sample incident**: Should show valid structure
3. **✅ Statistics**: Should show realistic distributions
4. **✅ Location coverage**: Should cover Chennai bounds
5. **✅ Data retrieval**: Should find incidents near test location

---

## 🐛 Troubleshooting

### **Error: Module not found**
```bash
# Make sure you're in backend/ml directory
cd backend/ml

# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### **Error: Import errors**
- Check you're running from `backend/ml` directory
- Make sure `app/` directory exists
- Verify virtual environment is activated

### **Slow generation**
- 5000 incidents takes 10-30 seconds
- This is normal - be patient!

---

## 📊 What Happens Next

After Step 2 completes:
- ✅ 5000 incidents stored in memory
- ✅ Ready for ML model training
- ✅ Can test clustering algorithms
- ✅ Can test risk scoring

**Next: Step 3** - Test ML algorithms with this data!

---

## 💡 Tips

- **Want more data?** Change `count=5000` to `count=10000` in the script
- **Want less data?** Change to `count=2000` for faster testing
- **Data persists** until you clear it or restart Python
- **Can run multiple times** - clears old data first



