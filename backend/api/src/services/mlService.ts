/**
 * ML Service Client
 *
 * Handles communication with the Python ML service
 * for unsafe zone detection, risk scoring, and heatmap generation
 */

import axios, { AxiosInstance } from "axios";

// ML Service configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_SERVICE_TIMEOUT = parseInt(process.env.ML_SERVICE_TIMEOUT || "120000"); // 120 seconds (2 minutes) default - heatmaps with many cells can take time

// Create axios instance for ML service
const mlClient: AxiosInstance = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: ML_SERVICE_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Check if ML service is available
 */
export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const response = await mlClient.get("/ml/health");
    return response.status === 200 && response.data.status === "healthy";
  } catch (error) {
    console.error("ML Service health check failed:", error);
    return false;
  }
}

/**
 * Process incident through ML service
 */
export async function processIncident(incident: {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  type: "panic_alert" | "community_report";
  severity: number;
  category?: string;
  verified?: boolean;
  user_id?: string;
}) {
  try {
    const response = await mlClient.post("/ml/incidents/process", incident);
    return response.data;
  } catch (error: any) {
    console.error("ML Service incident processing failed:", error.message);
    // Return fallback response if ML service is unavailable
    return {
      success: false,
      incident_id: incident.id,
      affected_zones: [],
      model_updated: false,
      error: "ML service unavailable",
    };
  }
}

/**
 * Get heatmap data from ML service
 * Now supports time-based risk calculation with LOCAL time
 */
export async function getHeatmap(
  lat: number,
  lng: number,
  radius: number = 1000,
  gridSize: number = 100,
  timestamp?: string, // ISO timestamp for logging
  localHour?: number // LOCAL hour (0-23) for accurate time-of-day risk
) {
  try {
    const queryTimestamp = timestamp || new Date().toISOString();
    const queryLocalHour =
      localHour !== undefined ? localHour : new Date().getHours();

    const response = await mlClient.get("/ml/heatmap", {
      params: {
        lat,
        lng,
        radius,
        grid_size: gridSize,
        timestamp: queryTimestamp, // UTC timestamp for logging
        local_hour: queryLocalHour, // LOCAL hour (0-23) for time-of-day risk calculation
        include_time_factor: true, // Flag to enable time-based calculation
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("ML Service heatmap request failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    // Return fallback empty heatmap if ML service is unavailable
    return {
      success: false,
      heatmap: {
        center: { lat, lng },
        radius,
        grid_size: gridSize,
        cells: [],
        clusters: [],
      },
      timestamp: timestamp || new Date().toISOString(),
      error: "ML service unavailable",
    };
  }
}

/**
 * Get risk score for a location from ML service
 */
export async function getRiskScore(lat: number, lng: number) {
  try {
    const response = await mlClient.get("/ml/risk-score", {
      params: { lat, lng },
    });
    return response.data;
  } catch (error: any) {
    console.error("ML Service risk score request failed:", error.message);
    // Return fallback safe score if ML service is unavailable
    return {
      success: false,
      location: { lat, lng },
      risk_score: 0.0,
      risk_level: "very_safe",
      factors: {},
      error: "ML service unavailable",
    };
  }
}

/**
 * Analyze routes for safety
 */
export async function analyzeRoutes(routes: {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  routes: Array<{
    id: string;
    waypoints: Array<{ lat: number; lng: number }>;
  }>;
}) {
  try {
    const response = await mlClient.post("/ml/routes/analyze", routes);
    return response.data;
  } catch (error: any) {
    console.error("ML Service route analysis failed:", error.message);
    // Return fallback response if ML service is unavailable
    return {
      success: false,
      routes: [],
      recommended_route: null,
      error: "ML service unavailable",
    };
  }
}
