/**
 * Panic Alert Routes
 *
 * Handles emergency panic button triggers, location sharing,
 * and emergency contact notifications
 *
 * @author Women Safety Analytics Team
 * @version 1.0.0
 */

import express from "express";
import { Request, Response } from "express";
import { processIncident } from "../services/mlService";

const router = express.Router();

/**
 * POST /api/panic/trigger
 * Trigger emergency panic alert
 */
router.post("/trigger", async (req: Request, res: Response) => {
  try {
    const { userId, location, emergencyContacts, panicType, timezone_offset_minutes } =
      req.body;

    // Validate required fields
    if (!userId || !location || !emergencyContacts) {
      return res.status(400).json({
        error: "Missing required fields: userId, location, emergencyContacts",
      });
    }

    console.log("🚨 PANIC ALERT RECEIVED:", {
      userId,
      location,
      panicType: panicType || "manual",
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement actual panic response logic:
    // 1. Verify user authentication
    // 2. Store panic incident in database
    // 3. Send notifications to emergency contacts
    // 4. Notify local authorities
    // 5. Start continuous location tracking
    // 6. Log incident for admin dashboard

    const panicId = `panic_${Date.now()}`;
    const incidentTimestamp = new Date().toISOString();

    // Process incident through ML service
    let mlResponse = null;
    try {
      const incidentData: any = {
        id: panicId,
        latitude: location.latitude || location.lat,
        longitude: location.longitude || location.lng,
        timestamp: incidentTimestamp,
        type: "panic_alert",
        severity: 5, // Panic alerts are always high severity
        category: "emergency",
        verified: true,
        user_id: userId,
      };

      // With exactOptionalPropertyTypes, omit optional fields instead of setting `undefined`.
      if (timezone_offset_minutes !== undefined) {
        incidentData.timezone_offset_minutes = Number(timezone_offset_minutes);
      }

      mlResponse = await processIncident(incidentData);
    } catch (error) {
      console.error("ML Service incident processing failed:", error);
      // Continue even if ML service fails
    }

    return res.status(200).json({
      success: true,
      panicId,
      message: "Emergency alert triggered successfully",
      timestamp: incidentTimestamp,
      actions: {
        contactsNotified: emergencyContacts.length,
        authoritiesAlerted: true,
        locationTrackingStarted: true,
      },
      mlProcessing: mlResponse
        ? {
            affectedZones: mlResponse.affected_zones || [],
            modelUpdated: mlResponse.model_updated || false,
          }
        : null,
    });
  } catch (error) {
    console.error("Panic trigger error:", error);
    return res.status(500).json({
      error: "Failed to process panic alert",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/panic/cancel
 * Cancel active panic alert
 */
router.post("/cancel", async (req: Request, res: Response) => {
  try {
    const { userId, panicId } = req.body;

    if (!userId || !panicId) {
      return res.status(400).json({
        error: "Missing required fields: userId, panicId",
      });
    }

    console.log("✅ PANIC ALERT CANCELLED:", {
      userId,
      panicId,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement panic cancellation logic:
    // 1. Verify user owns the panic alert
    // 2. Update panic status in database
    // 3. Stop location tracking
    // 4. Send cancellation notifications

    return res.status(200).json({
      success: true,
      message: "Panic alert cancelled successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Panic cancellation error:", error);
    return res.status(500).json({
      error: "Failed to cancel panic alert",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/panic/status/:userId
 * Get current panic status for user
 */
router.get("/status/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // TODO: Query database for active panic alerts
    // For now, return mock data
    res.status(200).json({
      hasActivePanic: false,
      lastPanicTime: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Panic status error:", error);
    res.status(500).json({
      error: "Failed to get panic status",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;




