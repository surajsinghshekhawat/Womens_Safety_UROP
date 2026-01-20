# Mobile App Setup Guide

## Overview

The mobile app is now set up with map visualization and heatmap support. This guide will help you get it running.

## What We Built

### ✅ Components Created

1. **HeatmapMap Component** (`src/components/HeatmapMap.tsx`)
   - Displays Google Maps with safety heatmap overlay
   - Shows color-coded risk zones (red = high, green = low)
   - Displays unsafe zone clusters
   - Includes legend and loading states

2. **API Service** (`src/services/api.ts`)
   - Fetches heatmap data from backend
   - Updates user location
   - Triggers panic alerts

3. **Updated App.tsx**
   - Toggle between map view and panic button
   - Integrated heatmap visualization

## Setup Steps

### 1. Install Dependencies

```bash
cd frontend/mobile
npm install
```

This will install:
- `react-native-maps` - For map visualization
- `expo-location` - For location services

### 2. Configure Google Maps API Key

**Important:** You need a Google Maps API key to display maps.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create API key
5. Update `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_ACTUAL_API_KEY_HERE"
      }
    }
  }
}
```

### 3. Update API Endpoint

If testing on a physical device, update `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_COMPUTER_IP:3001'  // Replace with your IP
  : 'https://api.womensafety.com';
```

To find your IP:
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

### 4. Start Backend Services

Make sure both services are running:

**Terminal 1 - ML Service:**
```bash
cd backend/ml
# Activate virtual environment
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Start ML service
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Backend API:**
```bash
cd backend/api
npm start
```

### 5. Start Mobile App

```bash
cd frontend/mobile
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Testing

### Test Heatmap

1. Open the app
2. Tap "Show Map"
3. You should see:
   - Map centered on your location (or Chennai Central if permission denied)
   - Color-coded risk zones
   - Legend showing risk levels
   - Unsafe zone clusters (red circles)

### Test Panic Button

1. Tap "Show Panic Button"
2. Press the SOS button
3. Confirm emergency alert
4. Should show "EMERGENCY MODE ACTIVE"

## Troubleshooting

### Map Not Showing

**Problem:** Blank map or error message

**Solutions:**
1. Check Google Maps API key is set in `app.json`
2. Verify API key has Maps SDK enabled
3. Check location permissions are granted
4. For iOS: May need to rebuild with `expo prebuild`

### Heatmap Not Loading

**Problem:** "Failed to load heatmap" error

**Solutions:**
1. Verify backend API is running on port 3001
2. Check ML service is running on port 8000
3. For physical device: Update API_BASE_URL with your computer's IP
4. Check network connection
5. Verify database has incidents loaded (run `step2_load_data.py`)

### Location Permission Denied

**Problem:** App can't get location

**Solutions:**
1. Go to device Settings → Apps → Women Safety → Permissions
2. Enable Location permission
3. Restart the app
4. For iOS: Check `Info.plist` has location descriptions

### Network Error

**Problem:** Can't connect to backend

**Solutions:**
1. Ensure phone and computer are on same WiFi network
2. Update `API_BASE_URL` with correct IP address
3. Check firewall isn't blocking port 3001
4. Try `http://localhost:3001` for emulator/simulator

## Features

### Current Features

- ✅ Map visualization with Google Maps
- ✅ Safety heatmap overlay (color-coded risk zones)
- ✅ Unsafe zone clusters display
- ✅ User location tracking
- ✅ Panic button integration
- ✅ Toggle between map and panic views
- ✅ Loading and error states

### Next Steps

- [ ] Add route planning visualization
- [ ] Real-time location updates
- [ ] Push notifications
- [ ] Firebase Auth integration
- [ ] Community reporting
- [ ] Safe route recommendations on map

## File Structure

```
frontend/mobile/
├── src/
│   ├── components/
│   │   ├── PanicButton.tsx      # Emergency SOS button
│   │   └── HeatmapMap.tsx       # Map with heatmap (NEW)
│   └── services/
│       └── api.ts               # Backend API client (NEW)
├── App.tsx                       # Main app (UPDATED)
├── app.json                      # Expo config (UPDATED)
└── package.json                  # Dependencies (UPDATED)
```

## API Endpoints Used

The app calls these backend endpoints:

1. **GET /api/location/heatmap**
   - Fetches heatmap data for current area
   - Parameters: `lat`, `lng`, `radius`, `grid_size`

2. **POST /api/location/update**
   - Updates user location
   - Body: `userId`, `latitude`, `longitude`

3. **POST /api/panic/trigger**
   - Triggers emergency alert
   - Body: `userId`, `latitude`, `longitude`

## Development Tips

### Hot Reload

Changes to components will hot reload automatically. If not:
- Press `r` in Expo terminal to reload
- Shake device and select "Reload"

### Debugging

- Use `console.log()` in components
- Check Expo DevTools in browser
- Use React Native Debugger for advanced debugging

### Testing on Physical Device

1. Connect phone to same WiFi as computer
2. Find computer's IP address
3. Update `API_BASE_URL` in `api.ts`
4. Start backend services
5. Run `npm start` and scan QR code

## Next Development Steps

1. **Add Route Visualization**
   - Display safe routes on map
   - Show alternative routes
   - Highlight high-risk segments

2. **Real-Time Updates**
   - WebSocket connection for live heatmap updates
   - Push notifications for high-risk areas
   - Live location sharing

3. **Enhanced UI**
   - Better map controls
   - Custom markers
   - Route planning interface
   - Incident reporting form

The mobile app foundation is complete! You can now visualize the safety heatmap on a map.



