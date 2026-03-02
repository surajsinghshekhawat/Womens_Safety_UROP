/**
 * API Service
 *
 * Handles all API calls to the backend
 *
 * @author Women Safety Analytics Team
 * @version 1.0.0
 */

// API Base URL Configuration
// - Use 'localhost' for emulator/simulator testing
// - Use your computer's IP (e.g. 192.168.1.7) for physical device testing
// - Make sure phone and computer are on the same WiFi network
export const API_BASE_URL = __DEV__
  ? "http://192.168.1.7:3001" // Development - Physical device testing (UPDATE THIS IF YOUR IP CHANGES)
  : // ? 'http://localhost:3001'  // Development - Emulator/Simulator testing
    "https://api.womensafety.com"; // Production (update with actual URL)

export interface HeatmapCell {
  lat: number;
  lng: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high";
}

export interface HeatmapData {
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
  grid_size: number;
  cells: HeatmapCell[];
  clusters: Array<{
    id: string;
    center: { lat: number; lng: number };
    radius: number;
    risk_score: number;
    incident_count?: number;
  }>;
}

export interface HeatmapResponse {
  success: boolean;
  heatmap: HeatmapData;
  timestamp: string;
}

export interface RouteWaypoint {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  start: RouteWaypoint;
  end: RouteWaypoint;
  risk_score: number;
}

export interface RouteInstruction {
  instruction: string;
  maneuver?: string;
  distanceMeters?: number;
}

export interface SafeRoute {
  id: string;
  safetyScore: number; // 0-1, higher is safer
  riskScore: number; // 0-5, lower is safer
  distance: number; // meters
  safeDistance: number; // meters through safe zones
  highRiskSegments: RouteSegment[];
  waypoints: RouteWaypoint[];
  duration?: number; // seconds
  instructions?: RouteInstruction[];
}

export interface SafeRoutesResponse {
  success: boolean;
  routes: {
    start: RouteWaypoint;
    end: RouteWaypoint;
    routes: SafeRoute[];
    recommendedRoute: string | null;
  };
  timestamp: string;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  isHighRisk: boolean;
}

export interface LocationUpdateResponse {
  success: boolean;
  message: string;
  timestamp: string;
  riskAssessment: RiskAssessment | null;
}

/**
 * Fetch heatmap data for a given area
 * NOW SUPPORTS TIME-BASED RISK CALCULATION WITH LOCAL TIME
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @param radius - Search radius in meters (default: 1000)
 * @param gridSize - Grid size for heatmap (default: 100)
 * @param timestamp - ISO timestamp for time-based risk (default: current time)
 */
export async function fetchHeatmap(
  lat: number,
  lng: number,
  radius: number = 1000,
  gridSize: number = 100,
  timestamp?: string // Current time for time-based risk calculation
): Promise<HeatmapResponse> {
  try {
    // Use current timestamp if not provided (for time-based risk calculation)
    const queryTimestamp = timestamp || new Date().toISOString();

    // Calculate LOCAL hour (0-23) for accurate time-of-day risk calculation
    // This ensures 9PM local = high risk, not UTC time
    const now = new Date();
    const localHour = now.getHours(); // 0-23 in user's local timezone
    // Minutes east of UTC (e.g., IST => +330). JS getTimezoneOffset() is minutes *behind* UTC.
    const timezoneOffsetMinutes = -now.getTimezoneOffset();

    // Add timestamp and local_hour to query params for time-based risk calculation
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      grid_size: gridSize.toString(),
      timestamp: queryTimestamp, // ISO timestamp for logging/other purposes
      local_hour: localHour.toString(), // LOCAL hour (0-23) for time-of-day risk
      timezone_offset_minutes: timezoneOffsetMinutes.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/location/heatmap?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching heatmap:", error);
    throw error;
  }
}

/**
 * Update user location
 */
/**
 * Fetch all community reports
 */
export async function fetchCommunityReports(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching community reports:", error);
    throw error;
  }
}

export async function updateLocation(
  userId: string,
  latitude: number,
  longitude: number,
  accuracy?: number
): Promise<LocationUpdateResponse> {
  try {
    const tzOffsetMinutes = -new Date().getTimezoneOffset();
    const response = await fetch(`${API_BASE_URL}/api/location/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        timezone_offset_minutes: tzOffsetMinutes,
        accuracy,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
}

/**
 * Trigger panic alert
 */
export async function triggerPanicAlert(
  userId: string,
  latitude: number,
  longitude: number,
  emergencyContacts: string[] = []
): Promise<any> {
  try {
    const tzOffsetMinutes = -new Date().getTimezoneOffset();
    const response = await fetch(`${API_BASE_URL}/api/panic/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        location: {
          latitude,
          longitude,
        },
        emergencyContacts:
          emergencyContacts.length > 0 ? emergencyContacts : [],
        timestamp: new Date().toISOString(),
        timezone_offset_minutes: tzOffsetMinutes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP error! status: ${response.status} - ${
          errorData.error || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error triggering panic alert:", error);
    throw error;
  }
}

/**
 * Search for places using Google Places Autocomplete
 */
export async function searchPlaces(
  query: string,
  location?: { lat: number; lng: number }
): Promise<Array<{ placeId: string; description: string }>> {
  try {
    const params = new URLSearchParams({
      query,
    });
    if (location) {
      params.append("lat", location.lat.toString());
      params.append("lng", location.lng.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/location/search-places?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error("Error searching places:", error);
    throw error;
  }
}

/**
 * Get coordinates from place ID
 */
export async function getPlaceCoordinates(
  placeId: string
): Promise<{ lat: number; lng: number }> {
  try {
    const params = new URLSearchParams({
      placeId,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/location/place-coordinates?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.location;
  } catch (error) {
    console.error("Error getting place coordinates:", error);
    throw error;
  }
}

/**
 * Get safe route recommendations
 */
export async function getSafeRoutes(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<SafeRoutesResponse> {
  try {
    const params = new URLSearchParams({
      startLat: startLat.toString(),
      startLng: startLng.toString(),
      endLat: endLat.toString(),
      endLng: endLng.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/location/safe-routes?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP error! status: ${response.status} - ${
          errorData.error || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting safe routes:", error);
    throw error;
  }
}
