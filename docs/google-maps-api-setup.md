# Google Maps API Key Setup Guide

## Overview

To enable the safety heatmap with Google Maps on both iOS and Android, you need to:

1. Get a Google Maps API key from Google Cloud Console
2. Add it to `app.json`
3. Enable the required APIs
4. Configure API key restrictions (optional but recommended)

---

## Step 1: Get Google Maps API Key

### 1.1 Create/Select Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click "Select a project" → "New Project"
4. Enter project name: "Women Safety Analytics"
5. Click "Create"

### 1.2 Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable these APIs:
   - **Maps SDK for Android** (for Android)
   - **Maps SDK for iOS** (for iOS)
   - **Geocoding API** (optional, for address lookup)
   - **Places API** (optional, for location search)

### 1.3 Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Copy the API key (you'll see something like: `AIzaSy...`)

### 1.4 (Recommended) Restrict API Key

1. Click on the API key you just created
2. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check only:
     - Maps SDK for Android
     - Maps SDK for iOS
3. Under **"Application restrictions"**:
   - For Android: Add your package name: `com.womensafety.mobile`
   - For iOS: Add your bundle ID: `com.womensafety.mobile`
4. Click **"Save"**

---

## Step 2: Add API Key to app.json

Open `frontend/mobile/app.json` and add your API key:

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

**Replace `YOUR_ACTUAL_API_KEY_HERE` with your actual API key from Step 1.3**

---

## Step 3: Rebuild the App

After adding the API key, you need to rebuild the native app:

### For Development (Expo Go won't work - need custom build):

```bash
cd frontend/mobile

# Build for Android
npx expo prebuild --platform android
npx expo run:android

# Build for iOS (Mac only)
npx expo prebuild --platform ios
npx expo run:ios
```

### For Production:

```bash
# Build Android APK/AAB
eas build --platform android

# Build iOS IPA
eas build --platform ios
```

**Note:** Expo Go doesn't support custom native code (like Google Maps). You need to create a development build.

---

## Step 4: Verify It Works

1. Start your app
2. Navigate to the Map screen
3. You should see:
   - ✅ Google Maps tiles loading
   - ✅ Your location marker
   - ✅ Heatmap overlays (colored polygons)
   - ✅ Unsafe zone circles

If you see a blank map or error:
- Check API key is correct in `app.json`
- Verify APIs are enabled in Google Cloud Console
- Check API key restrictions allow your app
- Rebuild the app after adding the key

---

## Troubleshooting

### "Map not loading" / Blank screen

1. **Check API key**: Make sure it's correct in `app.json`
2. **Check API restrictions**: Ensure Maps SDK for Android/iOS is enabled
3. **Check billing**: Google Maps requires a billing account (but has free tier)
4. **Rebuild app**: Native changes require rebuild

### "API key not valid" error

1. Check API key is copied correctly (no extra spaces)
2. Verify APIs are enabled in Google Cloud Console
3. Check API key restrictions aren't too strict
4. Make sure billing is enabled on your Google Cloud project

### Android: "java.lang.String cannot be cast to java.lang.Boolean"

This should be fixed now with the `.android.tsx` file. If you still see it:
1. Make sure you're using the platform-specific file
2. Rebuild: `npx expo prebuild --clean --platform android`
3. Check `app.json` has the API key in the correct format

### iOS: Map not showing

1. Verify `googleMapsApiKey` is in `ios.config` (not `android.config`)
2. Rebuild: `npx expo prebuild --clean --platform ios`
3. Check bundle identifier matches your API key restrictions

---

## Cost Information

Google Maps has a **free tier**:
- **$200 free credit per month** (enough for most development/testing)
- After free tier: ~$0.007 per map load
- For production, monitor usage in Google Cloud Console

**Enable billing** in Google Cloud Console (required even for free tier).

---

## Security Best Practices

1. **Restrict API key** to only required APIs
2. **Add application restrictions** (package name/bundle ID)
3. **Don't commit API key** to public repositories
4. **Use environment variables** for production (via EAS Secrets)
5. **Rotate keys** if exposed

---

## Next Steps

Once the map is working:
- ✅ Heatmap overlays will display automatically
- ✅ User location will be shown
- ✅ Unsafe zones will be marked with circles
- ✅ You can toggle between map and list view

The heatmap data comes from your backend ML service - make sure it's running!


