/**
 * WebSocket Handler
 * 
 * Handles real-time updates for heatmap and incident reports
 * Provides instant updates when new incidents are reported
 * 
 * @author Women Safety Analytics Team
 * @version 1.0.0
 */

import { Server as SocketIOServer, Socket } from "socket.io";

interface HeatmapUpdate {
  lat: number;
  lng: number;
  radius: number;
  heatmap: any;
  timestamp: string;
}

interface NewIncidentEvent {
  incidentId: string;
  latitude: number;
  longitude: number;
  type: "panic_alert" | "community_report";
  severity: number;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
  };
}

/**
 * Setup WebSocket handlers
 */
export function setupWebSocket(io: SocketIOServer) {
  console.log("🔌 Setting up WebSocket handlers...");

  io.on("connection", (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join room for location-based updates
    socket.on("subscribe:location", (data: { lat: number; lng: number; radius: number }) => {
      const { lat, lng, radius } = data;
      const roomId = `location:${lat.toFixed(4)}:${lng.toFixed(4)}:${radius}`;
      socket.join(roomId);
      console.log(`📍 Client ${socket.id} subscribed to location: ${roomId}`);
      socket.emit("subscribed", { room: roomId });
    });

    // Leave location room
    socket.on("unsubscribe:location", (data: { lat: number; lng: number; radius: number }) => {
      const { lat, lng, radius } = data;
      const roomId = `location:${lat.toFixed(4)}:${lng.toFixed(4)}:${radius}`;
      socket.leave(roomId);
      console.log(`📍 Client ${socket.id} unsubscribed from location: ${roomId}`);
    });

    // Subscribe to all incident updates
    socket.on("subscribe:incidents", () => {
      socket.join("incidents:all");
      console.log(`📢 Client ${socket.id} subscribed to all incidents`);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log("✅ WebSocket handlers set up successfully");
}

/**
 * Emit heatmap update to subscribers in a location
 */
export function emitHeatmapUpdate(
  io: SocketIOServer,
  data: HeatmapUpdate
) {
  const { lat, lng, radius } = data;
  const roomId = `location:${lat.toFixed(4)}:${lng.toFixed(4)}:${radius}`;
  
  io.to(roomId).emit("heatmap:update", {
    ...data,
    timestamp: new Date().toISOString(),
  });
  
  console.log(`📡 Emitted heatmap update to room: ${roomId}`);
}

/**
 * Emit new incident event to subscribers
 */
export function emitNewIncident(io: SocketIOServer, incident: NewIncidentEvent) {
  // Broadcast to all incident subscribers
  io.to("incidents:all").emit("incident:new", {
    ...incident,
    timestamp: new Date().toISOString(),
  });

  // Also notify location-specific rooms if incident is within their radius
  // This is a simplified version - in production, you'd calculate which rooms to notify
  io.emit("incident:new", {
    ...incident,
    timestamp: new Date().toISOString(),
  });

  console.log(`📡 Emitted new incident event: ${incident.incidentId}`);
}

/**
 * Emit real-time risk alert
 */
export function emitRiskAlert(
  io: SocketIOServer,
  data: {
    userId: string;
    location: { lat: number; lng: number };
    riskScore: number;
    riskLevel: string;
    message: string;
  }
) {
  // Send to specific user if they're connected
  io.to(`user:${data.userId}`).emit("risk:alert", {
    ...data,
    timestamp: new Date().toISOString(),
  });

  console.log(`⚠️ Emitted risk alert to user: ${data.userId}`);
}