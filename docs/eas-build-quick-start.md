# EAS Build Quick Start Guide

## Step-by-Step Instructions

### 1. Fixed eas.json ✅

The `eas.json` file has been corrected (removed unsupported `gradleProperty`).

### 2. Configure EAS Project

Run this command **interactively** (it will ask you questions):

```powershell
cd C:\Users\Suraj\Desktop\urop\frontend\mobile
eas build:configure
```

**When prompted:**

- "Would you like to automatically create an EAS project?" → Type `y` and press Enter
- It will create the project and update your `app.json` with the project ID

### 3. Build Android APK

After configuration, build the app:

```powershell
eas build --platform android --profile development
```

**This will:**

- Upload your code to Expo servers
- Build the Android APK in the cloud (takes 10-15 minutes)
- Give you a download link
- You can install the APK on your Android phone

### 4. Install on Your Phone

1. Download the APK from the build link
2. On your Android phone:
   - Go to Settings → Security
   - Enable "Install from unknown sources" or "Install unknown apps"
   - Open the downloaded APK file
   - Install it
3. Open the app - Google Maps should work!

---

## Alternative: Preview Build (Faster)

If you just want to test quickly:

```powershell
eas build --platform android --profile preview
```

This creates a standalone APK (not a development build) - faster but you'll need to rebuild for each code change.

---

## Troubleshooting

### "EAS project not configured"

- Make sure you're logged in: `eas login`
- Run `eas build:configure` and answer `y` when asked

### Build fails

- Check your `app.json` has the Google Maps API key
- Make sure you ran `npx expo prebuild` first (creates native folders)
- Check build logs in the EAS dashboard

### API key not working

- Verify the key is correct in `app.json`
- Check Google Cloud Console - APIs are enabled
- Make sure billing is enabled (required even for free tier)

---

## Next Steps After Build

Once the app is installed:

1. ✅ Open the app
2. ✅ Navigate to Map screen
3. ✅ You should see Google Maps with heatmap overlays
4. ✅ Test the panic button, contacts, and reports features

---

## Cost

- **Development builds**: Free
- **Preview builds**: Free
- **Production builds**: Free (with Expo's free tier)
- **Google Maps API**: $200 free credit/month (enough for testing)

---

## Quick Reference

```powershell
# Login
eas login

# Configure (first time)
eas build:configure

# Build Android APK
eas build --platform android --profile development

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

