# Women Safety Analytics - Mobile App

React Native mobile application for women's safety with real-time risk assessment and heatmap visualization.

## Features

- 🗺️ **Safety Heatmap**: Real-time visualization of risk zones
- 🚨 **Panic Button**: Emergency alert system
- 📍 **Location Tracking**: Real-time location updates
- 🛡️ **Risk Assessment**: ML-powered risk scoring

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:

```bash
cd frontend/mobile
npm install
```

2. Start the development server:

```bash
npm start
```

3. Run on device/emulator:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Configuration

### API Endpoint

Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? "http://localhost:3001" // Development
  : "https://api.womensafety.com"; // Production
```

For physical device testing, replace `localhost` with your computer's IP address:

```typescript
const API_BASE_URL = "http://192.168.1.XXX:3001";
```

### Google Maps API Key

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_API_KEY"
      }
    }
  }
}
```

## Project Structure

```
frontend/mobile/
├── src/
│   ├── components/
│   │   ├── PanicButton.tsx      # Emergency SOS button
│   │   └── HeatmapMap.tsx       # Map with heatmap overlay
│   └── services/
│       └── api.ts              # Backend API client
├── App.tsx                      # Main app component
└── package.json
```

## Usage

### Viewing Heatmap

1. Open the app
2. Tap "Show Map" to view the safety heatmap
3. The map displays color-coded risk zones:
   - 🔴 Red: High risk (4.0+)
   - 🟠 Orange: Medium-high risk (2.5-4.0)
   - 🟡 Yellow: Medium risk (1.5-2.5)
   - 🟢 Green: Low risk (0-1.5)

### Panic Button

1. Tap "Show Panic Button"
2. Press and hold the SOS button
3. Confirm emergency alert
4. Location is shared with emergency contacts

## Backend Requirements

Make sure the backend API is running:

1. **ML Service** (Python/FastAPI): `http://localhost:8000`
2. **Backend API** (Node.js): `http://localhost:3001`
3. **Database** (PostgreSQL): Running with PostGIS extension

See `backend/` directory for setup instructions.

## Troubleshooting

### Map not showing

- Check Google Maps API key is configured
- Ensure location permissions are granted
- Verify backend API is accessible

### Heatmap not loading

- Check backend API is running on port 3001
- Verify ML service is running on port 8000
- Check network connection (use IP address for physical devices)

### Location permission denied

- Go to device settings
- Enable location permissions for the app
- Restart the app

## Development

### Adding New Features

1. Create component in `src/components/`
2. Add API methods in `src/services/api.ts`
3. Update `App.tsx` to integrate new features

### Testing

```bash
# Run tests (when implemented)
npm test

# Lint code
npm run lint
```

## Next Steps

- [ ] Add route planning visualization
- [ ] Implement real-time location tracking
- [ ] Add push notifications
- [ ] Integrate Firebase Auth
- [ ] Add community reporting features


