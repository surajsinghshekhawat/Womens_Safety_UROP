# Mobile App UI and Features Documentation

## Overview
This is a **Women's Safety Analytics Mobile Application** built with React Native and Expo. The app provides real-time safety risk assessment through interactive heatmaps, emergency SOS functionality, community incident reporting, and emergency contact management.

## App Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation (Bottom Tab Navigator)
- **State Management**: React Hooks (useState, useEffect, useFocusEffect)
- **Storage**: AsyncStorage for persistent local data
- **Maps**: react-native-maps (Google Maps for Android/iOS)
- **Styling**: StyleSheet with centralized theme system

---

## Navigation Structure

### Bottom Tab Navigator (5 Tabs)
1. **Map Tab** (🗺️) - Home Screen with Safety Heatmap
2. **SOS Tab** (🚨) - Emergency Panic Button
3. **Contacts Tab** (👥) - Emergency Contacts Management
4. **Report Tab** (📝) - Submit Incident Reports
5. **Community Tab** (👁️) - View All Community Reports

**Tab Bar Styling:**
- Height: 60px
- Active Color: Indigo (#6366f1)
- Inactive Color: Slate 400 (#94a3b8)
- Background: Slate 800 (#1e293b)
- Border: Top border with Slate 700 (#334155)

---

## Color Theme

### Primary Colors
- **Primary**: Indigo (#6366f1)
- **Primary Dark**: (#4f46e5)
- **Primary Light**: (#818cf8)

### Safety/Semantic Colors
- **Danger/Red**: (#ef4444) - For high-risk areas and emergency states
- **Warning/Amber**: (#f59e0b) - For medium-high risk
- **Success/Green**: (#10b981) - For low-risk areas and success states
- **Info/Blue**: (#3b82f6)

### Background Colors (Dark Theme)
- **Background**: Slate 900 (#0f172a) - Main app background
- **Background Secondary**: Slate 800 (#1e293b) - Cards, headers
- **Background Tertiary**: Slate 700 (#334155)

### Text Colors
- **Primary Text**: Slate 100 (#f1f5f9) - Main text
- **Secondary Text**: Slate 300 (#cbd5e1) - Subtitles, descriptions
- **Tertiary Text**: Slate 400 (#94a3b8) - Labels, hints

### Risk Level Colors (Semi-transparent overlays)
- **High Risk** (4.0+): Red with 70% opacity
- **Medium-High Risk** (2.5-4.0): Amber with 60% opacity
- **Medium Risk** (1.5-2.5): Yellow with 50% opacity
- **Low Risk** (0-1.5): Green with 40% opacity

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

---

## Screen 1: Home Screen (Map Tab) 🗺️

### Layout
- **Header Section**: 
  - Title: "Safety Heatmap" (24px, bold, white)
  - Subtitle: "Real-time risk assessment" (14px, secondary text)
  - Toggle Button: Switch between Map View and List View (if map available)
  - Background: Slate 800 with bottom border

- **Main Content**: 
  - **Map View** (Default): Google Maps integration showing:
    - Heatmap cells as colored polygons (risk-based)
    - User location marker (blue pin)
    - Unsafe zone clusters (red circles)
    - Risk legend overlay (bottom-left)
    - Map centered on Chennai (13.0827, 80.2707)
    - Default zoom: 0.15 latitude/longitude delta (city-wide view)
  
  - **List View** (Fallback): 
    - Grid/list of heatmap cells organized by risk level
    - High-risk areas section (red)
    - Medium-risk areas section (orange/yellow)
    - Unsafe zones list (clusters)
    - Cell details: Risk score, coordinates

### Map Features
- **Heatmap Visualization**:
  - Grid-based cells (200m x 200m default)
  - Each cell shows risk score (0-5 scale)
  - Color-coded polygons overlaying map
  - Opacity based on risk level (0.15-0.8 range)
  - Filter: Only shows cells with risk_score > 0

- **Clusters**:
  - Red circles marking unsafe zones
  - Radius based on cluster size
  - Semi-transparent fill (15% opacity)
  - Red border (90% opacity, 3px width)

- **Legend**:
  - White background card (bottom-left)
  - Shows 4 risk levels with color indicators
  - Small colored circles (20px) with labels
  - Labels: "High (4.0+)", "Medium-High (2.5-4.0)", "Medium (1.5-2.5)", "Low (0-1.5)"

### Loading States
- Loading overlay with spinner and "Loading heatmap..." text
- Error overlay with warning icon, error message, and retry button
- "No data" state when heatmap has 0 cells

### Data Parameters
- Default radius: 10,000 meters (10km)
- Default grid size: 200 meters
- Center: Chennai, India (13.0827°N, 80.2707°E)

---

## Screen 2: Panic/SOS Screen 🚨

### Layout
- **Centered Content Design**:
  - Title: "Emergency SOS" (28px, bold, centered)
  - Subtitle: "Press and hold to trigger emergency alert" (16px, centered, secondary)
  - Large Panic Button (150x150px circular)
  - Emergency status panel (when active)

### Panic Button Component
- **Design**:
  - Large circular button (150x150px)
  - Red background (#ff4444)
  - White border (3px)
  - Shadow/elevation: 8
  - Center text: "🚨 SOS" (24px, bold, white)
  - Sub-text: "HOLD FOR EMERGENCY" (12px, white, bold)
  
- **Active State**:
  - Background: Bright red (#ff0000)
  - Border: Yellow (4px, #ffff00)
  - Pulsing animation (scale 1.0 to 1.1, continuous loop)
  - Text changes to "ACTIVE" (yellow color)
  - Larger text size (28px)

- **Interactions**:
  - Press triggers confirmation alert
  - Alert shows: "🚨 EMERGENCY ALERT" with contact count
  - Buttons: "CANCEL" (cancel style) and "CONFIRM" (destructive style)
  - Haptic feedback (vibration) on trigger
  - Scale animation (0.9 → 1.1 → 1.0) on press

### Emergency Status Panel (When Active)
- **Design**:
  - Red background card (full width)
  - Rounded corners (12px)
  - White text
  - Title: "🚨 EMERGENCY MODE ACTIVE" (20px, bold)
  - Subtitle: "Your location is being shared with emergency contacts"
  - Contact count: "{count} contacts notified"
  - Cancel button (white background, red text)

### Functionality
- Requests location permission on trigger
- Sends panic alert to backend with:
  - User ID
  - Current location (latitude, longitude)
  - Emergency contacts array
- Starts location tracking (updates every 30 seconds)
- Can cancel emergency mode

---

## Screen 3: Contacts Screen 👥

### Layout
- **Header**:
  - Title: "Emergency Contacts" (24px, bold)
  - Subtitle: "Manage contacts who will be notified in emergencies" (14px, secondary)
  - Background: Slate 800 with bottom border

- **Content**:
  - **List View** (Default): 
    - FlatList of emergency contacts
    - Each contact card shows:
      - Name (18px, bold)
      - Phone number (16px, secondary)
      - Relationship (14px, tertiary, optional)
      - Delete button (red, "Delete" text)
    - Footer with "Add Emergency Contact" button (full width, primary color)
  
  - **Add Form View** (When adding):
    - Form title: "Add Emergency Contact" (20px, bold)
    - Text inputs:
      - Name (required)
      - Phone Number (required, phone-pad keyboard)
      - Relationship (optional)
    - Buttons: Cancel and Add Contact (side-by-side)

### Contact Card Design
- Background: Slate 800
- Border: 1px Slate 700
- Padding: 16px
- Border radius: 12px
- Margin bottom: 8px
- Flex layout: Info on left, delete button on right

### Empty State
- Centered message
- "No emergency contacts" (18px, bold)
- "Add contacts to notify them during emergencies" (14px, secondary)

### Functionality
- Loads contacts from AsyncStorage on mount
- Default contacts if none exist (Mom, Dad with placeholder numbers)
- Add contact: Validates name and phone, saves to storage
- Delete contact: Confirmation alert before deletion
- Persists to local storage

---

## Screen 4: Reports Screen 📝

### Layout
- **Header**:
  - Title: "Report Incident" (24px, bold)
  - Subtitle: "Help keep the community safe by reporting incidents" (14px, secondary)
  - Background: Slate 800 with bottom border

- **Content** (ScrollView with form):
  - **Category Section**:
    - Label: "Category *" (16px, semibold)
    - Horizontal scrollable buttons:
      - Options: "Harassment", "Suspicious Activity", "Poor Lighting", "Unsafe Area", "Other"
      - Active: Primary background, white text
      - Inactive: Slate 800 background, white text, border
    - Button style: Padding 16px horizontal, 8px vertical, border radius 8px
  
  - **Severity Section**:
    - Label: "Severity" (16px, semibold)
    - Horizontal buttons: 1, 2, 3, 4, 5 (equal width)
    - Active: Primary background, white text (18px, bold)
    - Inactive: Slate 800 background, white text, border
    - Label below: "Very Low", "Low", "Medium", "High", "Very High" (dynamic based on selection)
  
  - **Description Section**:
    - Label: "Description *" (16px, semibold)
    - TextArea: Multi-line input (6 lines, min height 120px)
    - Background: Slate 800, border: Slate 700
    - Placeholder: "Describe what happened..."
  
  - **Location Section**:
    - Label: "Location *" (16px, semibold)
    - If not captured: Button "📍 Capture Current Location"
    - If captured: Info box showing:
      - "✓ Location captured" (green, 16px, semibold)
      - Coordinates (12px, secondary text)
    - Button requests location permission and gets current position
  
  - **Submit Button**:
    - Full width, primary color background
    - Text: "Submit Report" or "Submitting..." (when loading)
    - Disabled state: 50% opacity
    - Padding: 16px, border radius: 12px

### Form Validation
- Category: Required
- Description: Required (non-empty)
- Location: Required (must capture before submit)
- Shows alert dialogs for validation errors

### Functionality
- Submits to backend API: POST /api/reports/submit
- Request body includes: userId, type, category, description, severity, location, timestamp
- Success: Alert with "View Reports" button (navigates to Community tab)
- Error: Alert with connection troubleshooting info

---

## Screen 5: Community Reports Screen 👁️

### Layout
- **Header**:
  - Title: "Community Reports" (24px, bold)
  - Subtitle: "{count} incident(s) reported" (14px, secondary, dynamic)
  - Background: Slate 800 with bottom border

- **Content** (FlatList with pull-to-refresh):
  - **Report Card** (Each item):
    - Background: Slate 800
    - Border: 1px Slate 700
    - Padding: 16px
    - Border radius: 12px
    - Margin bottom: 16px
    
    - **Header Row**:
      - Category name (18px, bold, left)
      - Severity badge (right):
        - High (4+): Red background
        - Medium (3): Amber background
        - Low (1-2): Green background
        - Text: "High", "Medium", or "Low" (12px, bold, white)
        - Padding: 8px horizontal, 4px vertical
        - Border radius: 8px
    
    - **Type Label**: Report type (12px, tertiary, capitalized)
    
    - **Description**: Full description text (14px, secondary, multi-line)
    
    - **Footer Row** (with top border):
      - Date: Formatted timestamp (12px, tertiary, left)
      - Location: Coordinates (12px, tertiary, right, with 📍 icon)
    
    - **Verified Badge** (if verified):
      - Green background badge
      - Text: "✓ Verified" (11px, bold, white)
      - Border radius: 8px
      - Self-start aligned

### Loading States
- Initial loading: Centered "Loading reports..." text
- Empty state: 
  - "No reports yet" (18px, bold)
  - "Community reports will appear here" (14px, secondary, centered)

### Functionality
- Loads on mount and when screen is focused (useFocusEffect)
- Pull-to-refresh support
- Fetches from backend: GET /api/reports/all
- Filters to show only "community_report" type incidents
- Sorts by timestamp (newest first)
- Error handling: Logs network errors, no alerts on initial load

---

## Component Details

### HeatmapMap Component (Android/iOS)
- **Technology**: react-native-maps with Google Maps provider
- **Map Configuration**:
  - Map type: Standard
  - Shows user location: Yes
  - Toolbar: Disabled
  - Pitch/Rotate: Disabled
  - Scroll/Zoom: Enabled
  - Initial region: Chennai center (13.0827, 80.2707) with 0.02 delta
  
- **Heatmap Cells**:
  - Generated as polygons (squares around grid points)
  - Size calculated from gridSize parameter
  - Color based on risk score
  - Opacity: 0.15 + (risk_score / 5) * 0.6, clamped to 0.15-0.8
  - Filter: Only cells with risk_score > 0
  
- **User Location Marker**:
  - Blue pin at current location
  - Title: "Your Location"
  
- **Clusters**:
  - Red circles with radius from cluster data
  - Semi-transparent fill, red border

### HeatmapMapFallback Component
- **Used When**: Map component unavailable or fails to load
- **Layout**: ScrollView with sections:
  - Header: Location and data summary
  - High Risk Areas section (red cells)
  - Medium Risk Areas section (orange/yellow cells)
  - Unsafe Zones section (clusters)
  - Info box with color legend
  
- **Cell Display**: 
  - Cards showing risk score, label, and coordinates
  - Background color matches risk level
  - White text

### PanicButton Component
- **Size**: 150x150px circular
- **States**: 
  - Default: Red (#ff4444), white border
  - Active: Bright red (#ff0000), yellow border, pulsing
  - Pressed: Scale animation
- **Animations**:
  - Press: Scale 1.0 → 0.9 → 1.1 → 1.0 (300ms)
  - Active: Continuous pulse 1.0 → 1.1 (1s each, loop)
- **Interactions**: 
  - Vibration on trigger
  - Confirmation alert before sending

---

## Error Handling & Loading States

### Common Error Patterns
1. **Network Errors**: 
   - Shows user-friendly message
   - Troubleshooting steps: Check backend running, same WiFi, ports
   - Retry button available

2. **Permission Errors**:
   - Alert dialog explaining requirement
   - Graceful fallback (e.g., use default location)

3. **Map Errors**:
   - Automatically falls back to list view
   - Shows error overlay with retry option

4. **Empty States**:
   - Clear messaging ("No reports yet", "No emergency contacts")
   - Helpful subtitles explaining what will appear

### Loading Indicators
- ActivityIndicator (spinner) with primary color
- Loading text: "Loading heatmap...", "Loading reports...", etc.
- Overlay with semi-transparent background
- Disabled buttons with reduced opacity

---

## Data Flow & API Integration

### Backend API Base URL
- Development: `http://192.168.1.5:3001`
- Endpoints used:
  - `GET /api/heatmap` - Fetch heatmap data
  - `POST /api/reports/submit` - Submit incident report
  - `GET /api/reports/all` - Get all community reports
  - `POST /api/panic/trigger` - Trigger emergency alert
  - `POST /api/location/update` - Update user location

### Data Storage (Local)
- AsyncStorage keys:
  - `@emergency_contacts` - JSON array of contact objects
- Fallback: In-memory storage if AsyncStorage unavailable

---

## Current UI/UX Issues & Notes

1. **No Onboarding**: App launches directly to Map tab
2. **No User Authentication**: Uses hardcoded "user123" ID
3. **Limited Error Recovery**: Some errors require app restart
4. **No Offline Support**: All features require backend connection
5. **Basic Typography**: No custom fonts, uses system defaults
6. **Icon System**: Uses emoji for tab icons (temporary solution)
7. **No Animations Between Screens**: Basic tab navigation only
8. **Map View Limitations**: 
   - No user interaction with heatmap cells (no tap for details)
   - No zoom controls visible
   - No way to center back on user location from map
9. **Form UX**: 
   - No character limits shown
   - No draft saving for reports
   - No image/photo attachment for reports
10. **Accessibility**: 
    - No accessibility labels
    - No screen reader support
    - Color contrast may not meet WCAG standards

---

## Platform-Specific Notes

### Android
- Uses Google Maps via react-native-maps
- Requires Google Maps API key in app.json
- AndroidManifest allows cleartext traffic (for development)

### iOS
- Separate HeatmapMap.ios.tsx component
- Requires Google Maps API key configured
- iOS-specific styling if needed

### Development Build
- Uses Expo Dev Client (custom development build)
- Requires Metro bundler running
- Connected via LAN or tunnel mode

---

## Performance Considerations

1. **Heatmap Rendering**:
   - Filters cells to only render those with risk_score > 0
   - Limits visible cells (may need pagination for large datasets)
   - Polygon rendering may be heavy with many cells

2. **Image Loading**: None currently (no profile pics, report images)

3. **List Rendering**: 
   - Uses FlatList for efficient scrolling
   - Key extraction for proper React reconciliation
   - Content container padding for better UX

4. **Location Updates**: 
   - Panic mode updates every 30 seconds
   - No background location tracking (yet)

---

## Future Enhancement Opportunities (For UI Improvement)

1. **Visual Design**:
   - Custom icon set (replace emojis)
   - Custom typography (fonts for safety/trust)
   - Micro-interactions and animations
   - Gradient backgrounds or card designs
   - Better visual hierarchy with shadows/elevation

2. **User Experience**:
   - Onboarding flow explaining features
   - Tutorial/help system
   - Settings screen
   - Profile management
   - Notifications for nearby incidents
   - Route planning with safety scores

3. **Map Features**:
   - Tap cells for risk details
   - User location button
   - Custom markers for reported incidents
   - Search/filter by area
   - Time-based filtering (show recent incidents only)

4. **Reporting**:
   - Photo/evidence attachment
   - Voice recording option
   - Draft saving
   - Report editing
   - Share report functionality

5. **Community Features**:
   - Report upvoting/verification
   - Comments on reports
   - User reputation system
   - Nearby reports notification

6. **Accessibility**:
   - Screen reader support
   - Larger touch targets
   - High contrast mode
   - Reduced motion option
   - Voice commands for panic button

---

_Last Updated: December 2024_
_App Version: 2.0.0_
