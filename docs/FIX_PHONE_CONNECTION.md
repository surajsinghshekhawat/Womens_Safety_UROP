# Fix Phone Connection Issue

## Problem
Phone can't connect to Metro bundler:
- Phone IP: `172.20.10.4`
- Computer IP: `192.168.1.15`
- Port: `8081` (Metro bundler)
- Error: Connection timeout after 10000ms

## Root Cause
The phone and computer appear to be on **different networks**:
- Phone: `172.20.10.x` (likely mobile hotspot or different WiFi)
- Computer: `192.168.1.x` (likely home WiFi)

## Solutions

### Solution 1: Use Expo Tunnel (Easiest) ✅

This works even if devices are on different networks:

```powershell
cd frontend/mobile
npx expo start --tunnel
```

**Pros:**
- Works across different networks
- No firewall configuration needed
- Works with mobile hotspot

**Cons:**
- Slightly slower (goes through Expo servers)
- Requires internet connection

---

### Solution 2: Connect to Same WiFi Network

1. **Check your computer's WiFi:**
   ```powershell
   ipconfig
   ```
   Look for `IPv4 Address` under your WiFi adapter

2. **Make sure phone is on the SAME WiFi network**
   - Go to phone Settings > WiFi
   - Connect to the same network as your computer

3. **Update API URL if needed:**
   - Check computer's IP: `ipconfig`
   - Update `frontend/mobile/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = __DEV__
     ? "http://YOUR_COMPUTER_IP:3001"  // e.g., "http://192.168.1.15:3001"
     : "https://api.womensafety.com";
   ```

---

### Solution 3: Allow Firewall Ports (Windows)

1. **Open Windows Defender Firewall:**
   - Press `Win + R`
   - Type: `wf.msc`
   - Press Enter

2. **Create Inbound Rule:**
   - Click "Inbound Rules" → "New Rule"
   - Select "Port" → Next
   - TCP, Specific ports: `8081, 3001, 8000`
   - Allow connection → Next
   - Check all profiles → Next
   - Name: "Expo Development" → Finish

3. **Create Outbound Rule (same steps):**
   - Click "Outbound Rules" → "New Rule"
   - Same steps as above

---

### Solution 4: Use Mobile Hotspot

If your computer is on WiFi and phone is on mobile data:

1. **Turn on mobile hotspot on your phone**
2. **Connect computer to phone's hotspot**
3. **Get phone's hotspot IP:**
   - On phone: Settings > Hotspot > Connected devices
   - Usually `192.168.43.1` or `192.168.137.1`

4. **Update API URL:**
   ```typescript
   const API_BASE_URL = "http://192.168.43.1:3001";  // Phone's hotspot IP
   ```

5. **Start Expo with LAN:**
   ```powershell
   npx expo start --lan
   ```

---

## Quick Fix (Try This First)

```powershell
cd frontend/mobile

# Option 1: Use tunnel (works everywhere)
npx expo start --tunnel

# Option 2: Use LAN mode (same network)
npx expo start --lan

# Option 3: Specify host explicitly
npx expo start --host tunnel
```

Then scan the QR code again.

---

## Verify Connection

1. **Check Metro bundler is running:**
   - Should see: `Metro waiting on exp://...`

2. **Check backend API is accessible:**
   ```powershell
   # From phone's browser, try:
   http://192.168.1.15:3001/health
   ```
   Should return: `{"status":"ok"}`

3. **Check ML service:**
   ```powershell
   # From phone's browser:
   http://192.168.1.15:8000/docs
   ```
   Should show FastAPI docs

---

## Common Issues

### Issue: "Network request failed"
**Fix:** Use tunnel mode or check firewall

### Issue: "Connection refused"
**Fix:** Backend services not running. Start:
- ML Service: `cd backend/ml && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Backend API: `cd backend/api && npm run dev`

### Issue: "Different network"
**Fix:** Use `--tunnel` flag or connect to same WiFi

### Issue: "Firewall blocking"
**Fix:** Allow ports 8081, 3001, 8000 in Windows Firewall

---

## Recommended Setup

**For Development:**
```powershell
# Terminal 1: ML Service
cd backend/ml
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Backend API
cd backend/api
npm run dev

# Terminal 3: Mobile App (with tunnel)
cd frontend/mobile
npx expo start --tunnel
```

**Then:**
- Scan QR code with Expo Go app
- Or press `a` for Android / `i` for iOS emulator

---

## Test Connection

After starting Expo, you should see:
```
Metro waiting on exp://192.168.x.x:8081
Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

If you see this, connection should work!
