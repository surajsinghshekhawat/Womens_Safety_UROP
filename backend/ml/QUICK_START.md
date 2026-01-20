# Quick Start Guide - ML Service

## If Terminal is Stuck

**Press `Ctrl+C` to cancel the current command**

Then follow these steps manually:

## Step-by-Step Setup

### 1. Open PowerShell and navigate:
```powershell
cd C:\Users\Suraj\Desktop\urop\backend\ml
```

### 2. Activate virtual environment:
```powershell
.\.venv\Scripts\Activate.ps1
```

**If you get execution policy error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Install dependencies (this may take 2-5 minutes):
```powershell
pip install fastapi uvicorn pydantic scikit-learn numpy pandas geopy shapely httpx cachetools joblib python-dotenv
```

**OR install from requirements.txt:**
```powershell
pip install -r requirements.txt
```

### 4. Load test data:
```powershell
python step2_load_data.py
```

### 5. Start ML service:
```powershell
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

## Test it works:
Open browser: http://localhost:8000/docs

Or in another terminal:
```powershell
curl http://localhost:8000/health
```



