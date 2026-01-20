/**
 * Reports Routes
 *
 * Handles community incident reporting
 *
 * @author Women Safety Analytics Team
 * @version 1.0.0
 */

import express from "express";
import { Request, Response } from "express";
import { processIncident } from "../services/mlService";
import { emitNewIncident } from "../websocket/socketHandler";

const router = express.Router();

/**
 * POST /api/reports/submit
 * Submit a community incident report
 */
router.post("/submit", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      type,
      category,
      description,
      severity,
      location,
      timestamp,
    } = req.body;

    // Validate required fields
    if (!userId || !type || !category || !description || !location) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["userId", "type", "category", "description", "location"],
      });
    }

    // Validate location
    if (!location.latitude || !location.longitude) {
      return res.status(400).json({
        error: "Invalid location data",
      });
    }

    // Validate severity (1-5)
    if (severity && (severity < 1 || severity > 5)) {
      return res.status(400).json({
        error: "Severity must be between 1 and 5",
      });
    }

    console.log("📝 Community report received:", {
      userId,
      type,
      category,
      severity: severity || 3,
      location,
    });

    // Process incident through ML service
    try {
      // Validate type is one of the allowed values
      const incidentType: "panic_alert" | "community_report" = 
        type === "panic_alert" || type === "community_report" 
          ? type 
          : "community_report";

      const incidentData = {
        id: `report_${Date.now()}_${userId}`,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: timestamp || new Date().toISOString(),
        type: incidentType,
        severity: severity || 3,
        category: category,
        verified: false,
        user_id: userId,
      };

      const mlResponse = await processIncident(incidentData);

      // Emit WebSocket event for real-time updates
      const io = req.app.locals?.io;
      if (io) {
        console.log('📡 Emitting WebSocket event for new incident:', incidentData.id);
        emitNewIncident(io, {
          incidentId: incidentData.id,
          latitude: location.latitude,
          longitude: location.longitude,
          type: incidentType,
          severity: severity || 3,
          timestamp: incidentData.timestamp,
          location: {
            lat: location.latitude,
            lng: location.longitude,
          },
        });
      } else {
        console.warn('⚠️ WebSocket io not available in app.locals');
      }

      return res.status(200).json({
        success: true,
        message: "Report submitted successfully",
        reportId: incidentData.id,
        timestamp: new Date().toISOString(),
        mlProcessed: mlResponse.success || false,
      });
    } catch (mlError) {
      console.error("ML service error:", mlError);
      // Still return success if ML service fails (report is logged)
      return res.status(200).json({
        success: true,
        message: "Report submitted (ML processing pending)",
        timestamp: new Date().toISOString(),
        warning: "ML service temporarily unavailable",
      });
    }
  } catch (error) {
    console.error("Report submission error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to submit report",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/reports/user/:userId
 * Get reports submitted by a user
 */
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // TODO: Fetch user reports from database
    // For now, return empty array
    return res.status(200).json({
      success: true,
      reports: [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get reports",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/reports/all
 * Get all community reports (for viewing)
 */
router.get("/all", async (req: Request, res: Response) => {
  try {
    // Query ML service to get all incidents
    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
    
    const mlResponse = await fetch(`${mlServiceUrl}/ml/incidents/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let allIncidents: any[] = [];
    
    if (mlResponse.ok) {
      const data = await mlResponse.json() as { incidents?: any[]; success?: boolean; count?: number };
      allIncidents = data.incidents || [];
    } else {
      const errorText = await mlResponse.text().catch(() => "Unknown error");
      console.warn(`❌ ML service unavailable (${mlResponse.status}):`, errorText);
      console.warn("Returning empty reports list");
    }
    
    // Filter to only community reports
    const communityReports = allIncidents
      .filter((incident: any) => incident.type === "community_report")
      .map((incident: any) => ({
        id: incident.id,
        type: incident.type,
        category: incident.category || "General",
        description: incident.category 
          ? `${incident.category} incident reported`
          : `Community safety report at ${new Date(incident.timestamp).toLocaleString()}`,
        severity: incident.severity || 3,
        location: {
          latitude: parseFloat(incident.latitude) || 0,
          longitude: parseFloat(incident.longitude) || 0,
        },
        timestamp: incident.timestamp,
        verified: incident.verified || false,
      }))
      .sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    
    // Single summary log instead of per-item logs
    const panicAlerts = allIncidents.filter((inc: any) => inc.type === "panic_alert").length;
    console.log(`✅ Processed ${allIncidents.length} total incidents: ${communityReports.length} community reports, ${panicAlerts} panic alerts`);

    return res.status(200).json({
      success: true,
      reports: communityReports,
      count: communityReports.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get all reports error:", error);
    // Return empty array if error (don't fail completely)
    return res.status(200).json({
      success: true,
      reports: [],
      count: 0,
      timestamp: new Date().toISOString(),
      error: "Failed to load reports from database",
    });
  }
});

export default router;


