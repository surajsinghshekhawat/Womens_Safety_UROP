# Android Build Options - Google Maps Setup

## Problem

You're getting: `Failed to resolve the Android SDK path` when trying to run `npx expo run:android`

This means Android Studio/SDK is not installed or not configured.

## Solution Options

### Option 1: Use EAS Build (Recommended - Easiest) ⭐

EAS Build creates the app in the cloud - no local Android SDK needed!

#### Setup EAS:

```bash
cd frontend/mobile

# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure
```

#### Create Development Build:

```bash
# Build for Android (creates APK you can install on your phone)
eas build --platform android --profile development

# This will:
# 1. Upload your code to Expo servers
# 2. Build the app in the cloud
# 3. Give you a download link for the APK
# 4. Install it on your Android phone
```

#### Install on Phone:

1. Download the APK from the build link
2. Enable "Install from unknown sources" on your phone
3. Install the APK
4. Run the app - Google Maps will work!

**Pros:**

- ✅ No Android Studio needed
- ✅ Works on any computer
- ✅ Free for development builds
- ✅ Easy to share with testers

**Cons:**

- ⏱️ Takes 10-15 minutes per build
- 🌐 Requires internet connection

---

### Option 2: Install Android Studio (For Local Development)

If you want to build locally:

#### Step 1: Install Android Studio

1. Download from: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio → "More Actions" → "SDK Manager"
4. Install:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools

#### Step 2: Set Environment Variables

**Windows PowerShell (Run as Administrator):**

```powershell
# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\Suraj\AppData\Local\Android\Sdk', 'User')

# Add to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$newPath = "$currentPath;C:\Users\Suraj\AppData\Local\Android\Sdk\platform-tools;C:\Users\Suraj\AppData\Local\Android\Sdk\tools"
[System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')
```

**Restart PowerShell/terminal after this!**

#### Step 3: Verify Setup

```bash
# Check adb is available
adb version

# Check Android SDK
echo $env:ANDROID_HOME  # PowerShell
```

#### Step 4: Run App

```bash
cd frontend/mobile
npx expo run:android
```

**Pros:**

- ✅ Fast builds (local)
- ✅ Full control
- ✅ Good for frequent testing

**Cons:**

- ❌ Large download (~2GB)
- ❌ Complex setup
- ❌ Windows-specific issues sometimes

---

### Option 3: Test on Physical Device (Quick Test)

If you just want to test if the API key works:

#### Step 1: Start Expo Dev Server

```bash
cd frontend/mobile
npm start
```

#### Step 2: Create Development Build APK

Use EAS Build (Option 1) to create an APK, then install on your phone.

**Note:** Expo Go won't work with Google Maps (needs custom native code), so you MUST use a development build.

---

### Option 4: Test on iOS (If you have a Mac)

iOS setup is simpler:

```bash
cd frontend/mobile

# Install CocoaPods (one time)
sudo gem install cocoapods

# Prebuild iOS
npx expo prebuild --platform ios

# Run on iOS Simulator
npx expo run:ios
```

---

## Recommended Path Forward

**For now (quickest):**

1. Use **EAS Build** (Option 1) to create an APK
2. Install on your Android phone
3. Test the Google Maps integration

**For development (later):**

1. Install Android Studio (Option 2) if you want local builds
2. Set up environment variables
3. Build locally

---

## Verify Google Maps API Key Works

Once you have the app running (via any method):

1. Open the app
2. Go to Map screen
3. You should see:
   - ✅ Google Maps tiles (not blank)
   - ✅ Your location marker
   - ✅ Heatmap overlays (colored areas)
   - ✅ No "API key invalid" errors

If you see errors:

- Check API key in `app.json` is correct
- Verify APIs are enabled in Google Cloud Console
- Make sure you rebuilt after adding the key

---

## Next Steps

Choose one option above and follow the steps. **EAS Build (Option 1) is recommended** for the fastest setup without installing Android Studio.

