# How to Start ML Service

## Step 1: Navigate to ML Directory
```powershell
cd C:\Users\Suraj\Desktop\urop\backend\ml
```

## Step 2: Create Virtual Environment (if not exists)
```powershell
python -m venv .venv
```

## Step 3: Activate Virtual Environment

**For PowerShell:**
```powershell
.\.venv\Scripts\Activate.ps1
```

If you get an execution policy error, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Alternative (if PowerShell script doesn't work):**
```powershell
.\.venv\Scripts\activate.bat
```

## Step 4: Install Dependencies
```powershell
pip install -r requirements.txt
```

This may take a few minutes. Wait for it to complete.

## Step 5: Load Data (First Time Only)
```powershell
python step2_load_data.py
```

## Step 6: Start ML Service
```powershell
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

## Quick Test
Open another terminal and run:
```powershell
curl http://localhost:8000/health
```

Or visit in browser: http://localhost:8000/docs



