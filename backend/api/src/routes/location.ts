/**
 * Location Tracking Routes
 *
 * Handles location updates, safety heatmap data,
 * and unsafe zone detection
 *
 * @author Women Safety Analytics Team
 * @version 1.0.0
 */

import express from "express";
import { Request, Response } from "express";
import {
  getHeatmap,
  getRiskScore,
  analyzeRoutes as mlAnalyzeRoutes,
} from "../services/mlService";

const router = express.Router();

/**
 * POST /api/location/update
 * Update user location
 */
router.post("/update", async (req: Request, res: Response) => {
  try {
    const { userId, latitude, longitude, timestamp, accuracy } = req.body;

    // Validate required fields
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({
        error: "Missing required fields: userId, latitude, longitude",
      });
    }

    console.log("📍 Location update received:", {
      userId,
      latitude,
      longitude,
      accuracy: accuracy || "unknown",
      timestamp: timestamp || new Date().toISOString(),
    });

    // Validate coordinates
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        error: "Invalid coordinates",
        timestamp: new Date().toISOString(),
      });
    }

    // Check risk score for this location
    let riskData = null;
    try {
      riskData = await getRiskScore(latitude, longitude);
    } catch (error) {
      console.error("Risk score check failed:", error);
      // Continue even if risk check fails
    }

    // TODO: Store location in database
    // TODO: Trigger alerts if in high-risk area (risk_score >= 4.0)

    // Check if location is in high-risk area
    const isHighRisk = riskData && riskData.risk_score >= 4.0 ? true : false;

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      timestamp: new Date().toISOString(),
      riskAssessment: riskData
        ? {
            riskScore: riskData.risk_score,
            riskLevel: riskData.risk_level,
            isHighRisk,
          }
        : null,
    });
  } catch (error) {
    console.error("Location update error:", error);
    return res.status(500).json({
      error: "Failed to update location",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/location/heatmap
 * Get safety heatmap data for area
 * NOW SUPPORTS TIME-BASED RISK CALCULATION WITH LOCAL TIME
 *
 * Query parameters:
 * - lat, lng: Center coordinates (required)
 * - radius: Search radius in meters (default: 1000)
 * - grid_size: Grid size for heatmap (default: 100)
 * - timestamp: ISO timestamp for logging (optional)
 * - local_hour: LOCAL hour (0-23) for time-of-day risk calculation (required for accurate risk)
 */
router.get("/heatmap", async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 1000, timestamp, local_hour, timezone_offset_minutes } =
      req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Missing required parameters: lat, lng",
      });
    }

    // Use provided timestamp or current time for logging
    const queryTimestamp = timestamp
      ? (timestamp as string)
      : new Date().toISOString();

    // Get LOCAL hour from query (user's local time, not UTC)
    // This ensures time-based risk uses user's actual time (9PM local = high risk)
    const localHourNum = local_hour
      ? parseInt(local_hour as string)
      : new Date().getHours(); // Fallback to server time if not provided

    const tzOffsetMinutes =
      timezone_offset_minutes !== undefined
        ? parseInt(timezone_offset_minutes as string)
        : undefined;

    // Validate local hour (0-23)
    if (localHourNum < 0 || localHourNum > 23) {
      return res.status(400).json({
        error: "Invalid local_hour. Must be between 0-23.",
      });
    }

    // Query ML service for safety heatmap data with time-based factors
    const latNum = parseFloat(lat as string);
    const lngNum = parseFloat(lng as string);
    const radiusNum = parseInt(radius as string) || 1000;
    const gridSize = parseInt((req.query.grid_size as string) || "100");

    console.log("📍 Heatmap request:", {
      lat: latNum,
      lng: lngNum,
      radius: radiusNum,
      local_hour: localHourNum, // User's local time hour
      timestamp: queryTimestamp, // UTC timestamp for logging
    });

    // Get heatmap with time-based risk calculation using LOCAL hour
    const mlResponse = await getHeatmap(
      latNum,
      lngNum,
      radiusNum,
      gridSize,
      queryTimestamp, // UTC timestamp for logging
      localHourNum, // LOCAL hour (0-23) for accurate time-of-day risk
      tzOffsetMinutes,
      false // clusters are admin-only; mobile heatmap does not need them
    );

    console.log("🔍 ML Service Response:", {
      success: mlResponse?.success,
      hasHeatmap: !!mlResponse?.heatmap,
      cellsCount: mlResponse?.heatmap?.cells?.length || 0,
      error: mlResponse?.error,
      fullResponse: JSON.stringify(mlResponse).substring(0, 500), // First 500 chars
    });

    if (!mlResponse || !mlResponse.success) {
      // ML service unavailable, return empty heatmap instead of error
      console.warn(
        "⚠️ ML service unavailable or returned error, returning empty heatmap:",
        mlResponse?.error
      );
      return res.status(200).json({
        success: true,
        heatmap: {
          center: { lat: latNum, lng: lngNum },
          radius: radiusNum,
          grid_size: gridSize,
          cells: [],
          clusters: [],
        },
        timestamp: queryTimestamp,
        warning: "ML service unavailable - showing empty heatmap",
      });
    }

    // Transform ML service response to match expected format
    const heatmapData = mlResponse.heatmap;

    const cellsCount = heatmapData?.cells?.length || 0;
    if (cellsCount === 0) {
      console.warn("⚠️ ML service returned 0 cells! Heatmap data:", {
        center: heatmapData?.center,
        radius: heatmapData?.radius,
        grid_size: heatmapData?.grid_size,
        hasCells: !!heatmapData?.cells,
        cellsType: typeof heatmapData?.cells,
      });
    }

    return res.status(200).json({
      success: true,
      heatmap: {
        center: heatmapData.center,
        radius: heatmapData.radius,
        grid_size: heatmapData.grid_size,
        cells: heatmapData.cells || [],
        clusters: heatmapData.clusters || [],
        // Include time-based metadata
        time_factors: heatmapData.time_factors || null,
        calculated_at: queryTimestamp,
        next_update_recommended: new Date(Date.now() + 30 * 1000).toISOString(), // Suggest refresh in 30 seconds
      },
      timestamp: queryTimestamp,
      metadata: {
        time_based: true,
        considers_recent_reports: true, // Always consider recent reports in risk calculation
      },
    });
  } catch (error) {
    console.error("Heatmap error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get heatmap data",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/location/safe-routes
 * Get safe route recommendations
 */
router.get("/safe-routes", async (req: Request, res: Response) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        error:
          "Missing required parameters: startLat, startLng, endLat, endLng",
      });
    }

    // Get route options from Map API (Google Maps/Mapbox)
    // For now, create a simple direct route
    // TODO: Integrate with actual map routing API

    const startLatNum = parseFloat(startLat as string);
    const startLngNum = parseFloat(startLng as string);
    const endLatNum = parseFloat(endLat as string);
    const endLngNum = parseFloat(endLng as string);

    // Create route options (simplified - in production, get from Map API)
    const routeOptions = [
      {
        id: "route_direct",
        waypoints: [
          { lat: startLatNum, lng: startLngNum },
          { lat: endLatNum, lng: endLngNum },
        ],
      },
      {
        id: "route_alternative_1",
        waypoints: [
          { lat: startLatNum, lng: startLngNum },
          {
            lat: (startLatNum + endLatNum) / 2 + 0.001,
            lng: (startLngNum + endLngNum) / 2,
          },
          { lat: endLatNum, lng: endLngNum },
        ],
      },
    ];

    // Analyze routes using ML service
    const mlResponse = await mlAnalyzeRoutes({
      start: { lat: startLatNum, lng: startLngNum },
      end: { lat: endLatNum, lng: endLngNum },
      routes: routeOptions,
    });

    if (!mlResponse.success) {
      // ML service unavailable, return error
      return res.status(503).json({
        success: false,
        error: "ML service unavailable",
        message: mlResponse.error || "Failed to analyze routes",
        timestamp: new Date().toISOString(),
      });
    }

    // Transform ML service response
    const analyzedRoutes = mlResponse.routes || [];

    return res.status(200).json({
      success: true,
      routes: {
        start: { lat: startLatNum, lng: startLngNum },
        end: { lat: endLatNum, lng: endLngNum },
        routes: analyzedRoutes.map((route: any) => ({
          id: route.id,
          safetyScore: route.safety_score,
          riskScore: route.risk_score,
          distance: route.total_distance,
          safeDistance: route.safe_distance,
          highRiskSegments: route.high_risk_segments || [],
          waypoints:
            routeOptions.find((r) => r.id === route.id)?.waypoints || [],
        })),
        recommendedRoute: mlResponse.recommended_route,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Safe routes error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get safe routes",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
