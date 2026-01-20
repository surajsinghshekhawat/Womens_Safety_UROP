# Network Troubleshooting Guide

## "Network request failed" Error

If you're getting "Network request failed" errors, follow these steps:

### 1. Check Backend Services Are Running

**Terminal 1 - ML Service:**
```powershell
cd C:\Users\Suraj\Desktop\urop\backend\ml
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Node.js API:**
```powershell
cd C:\Users\Suraj\Desktop\urop\backend\api
npm run dev
```

**Terminal 3 - Expo Dev Server:**
```powershell
cd C:\Users\Suraj\Desktop\urop\frontend\mobile
npx expo start --dev-client --host lan
```

### 2. Verify Backend is Accessible

Open browser on your computer and go to:
- `http://localhost:3001/health` - Should show API status
- `http://localhost:8000/ml/health` - Should show ML service status

### 3. Check Your Computer's IP Address

```powershell
ipconfig | findstr /i "IPv4"
```

Should show: `192.168.1.5` (or your current IP)

### 4. Update API URL in Mobile App

If your IP changed, update `frontend/mobile/src/services/api.ts`:
```typescript
const API_BASE_URL = "http://YOUR_IP_HERE:3001";
```

### 5. Check Windows Firewall

Windows Firewall might be blocking connections:

1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Firewall"
3. Make sure Node.js is allowed for Private networks
4. Or temporarily disable firewall to test

### 6. Verify Phone and Computer on Same WiFi

- Phone and computer must be on the **same WiFi network**
- Not on mobile data
- Not on different networks

### 7. Test Connection from Phone

On your phone's browser, try:
- `http://192.168.1.5:3001/health`

If this doesn't work, the phone can't reach your computer.

### 8. Common Issues

**Issue:** Backend only listening on localhost
- **Fix:** Backend now listens on `0.0.0.0` (all interfaces)

**Issue:** CORS blocking requests
- **Fix:** CORS now allows all origins in development

**Issue:** Firewall blocking port 3001
- **Fix:** Allow Node.js through Windows Firewall

**Issue:** Wrong IP address
- **Fix:** Check IP with `ipconfig` and update API_BASE_URL

### 9. Quick Test

Run this in PowerShell to test if backend is accessible:
```powershell
curl http://192.168.1.5:3001/health
```

Should return JSON with status "OK".


