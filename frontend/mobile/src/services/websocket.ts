/**
 * WebSocket Service
 *
 * Handles real-time updates for heatmap and incidents
 * Connects to backend WebSocket server for instant updates
 *
 * @author Women Safety Analytics Team
 * @version 1.0.0
 */

// Use require() for React Native compatibility with socket.io-client
// This avoids ESM module resolution issues in Metro bundler
// Type definitions maintained via @types/socket.io-client
const socketIO = require("socket.io-client");
// socket.io-client exports io as the default function
const io =
  typeof socketIO === "function"
    ? socketIO
    : socketIO.io || socketIO.default || socketIO;
const Socket = socketIO.Socket;

// Import API_BASE_URL from api.ts (using same config)
import { API_BASE_URL } from "./api";

let socket: ReturnType<typeof io> | null = null;
let isConnected = false;

/**
 * Initialize WebSocket connection
 * Returns socket but doesn't block if connection fails - app continues to work
 */
export function initWebSocket(): ReturnType<typeof io> {
  // Reuse existing socket if already connected or connecting
  if (socket?.connected) {
    return socket; // Already connected, reuse
  }
  if (socket && !socket.disconnected) {
    return socket; // Already connecting, reuse
  }

  // Don't block - try to connect but continue if it fails
  try {
    console.log("🔌 Initializing WebSocket connection to:", API_BASE_URL);
    socket = io(API_BASE_URL, {
      transports: ["polling", "websocket"], // Try polling first (more reliable on mobile networks)
      reconnection: true,
      reconnectionDelay: 3000, // Wait 3 seconds between reconnection attempts
      reconnectionAttempts: 3, // Only try 3 times to avoid excessive retries
      forceNew: false,
      upgrade: true, // Allow transport upgrade from polling to websocket
      rememberUpgrade: false, // Don't remember upgrade for mobile networks
      timeout: 10000, // Reduced timeout to 10 seconds (fail faster, retry if needed)
      autoConnect: true,
      // Additional options for better mobile compatibility
      jsonp: false, // Disable JSONP polling
      forceBase64: false, // Use native binary
    });

    socket.on("connect", () => {
      isConnected = true;
      // Only log once to avoid spam
      if (!socket?._hasLoggedConnect) {
        console.log("✅ WebSocket connected:", socket?.id);
        socket._hasLoggedConnect = true;
      }
    });

    socket.on("disconnect", () => {
      isConnected = false;
      // Only log disconnect if it wasn't intentional
      if (socket?._hasLoggedConnect) {
        console.log(
          "❌ WebSocket disconnected (app continues with HTTP polling)"
        );
        socket._hasLoggedConnect = false;
      }
    });

    socket.on("connect_error", (error) => {
      // Silently handle errors - app will use HTTP polling instead
      isConnected = false;
      // Only log once to avoid spam
      if (!socket?._reconnecting) {
        console.warn(
          "⚠️ WebSocket unavailable - using HTTP polling for updates"
        );
      }
    });

    socket.on("error", (error) => {
      isConnected = false;
      // WebSocket is optional - app continues without it
    });

    // Set a flag to prevent multiple connection attempts
    if (!socket._reconnecting) {
      socket._reconnecting = false;
    }
  } catch (error) {
    console.warn(
      "⚠️ WebSocket initialization failed - app will use HTTP polling:",
      error
    );
    // Continue without WebSocket - app still works
  }

  return socket || ({} as any); // Return empty object if socket is null to prevent errors
}

/**
 * Subscribe to location-based heatmap updates
 * Gracefully handles WebSocket failures - app continues without real-time updates
 */
export function subscribeToLocation(
  lat: number,
  lng: number,
  radius: number,
  onUpdate: (heatmapData: any) => void
) {
  if (!socket || !socket.connected) {
    socket = initWebSocket();
  }

  // Only subscribe if socket is connected
  if (socket && socket.connected) {
    try {
      // Join location room
      socket.emit("subscribe:location", { lat, lng, radius });

      // Listen for heatmap updates
      socket.on("heatmap:update", (data) => {
        console.log("📡 Received heatmap update via WebSocket");
        onUpdate(data);
      });

      socket.on("subscribed", (data) => {
        console.log("📍 Subscribed to location room:", data.room);
      });
    } catch (error) {
      console.warn(
        "⚠️ WebSocket subscription failed - using HTTP polling:",
        error
      );
      // Continue without WebSocket - app will use HTTP requests
    }
  } else {
    console.warn(
      "⚠️ WebSocket not connected - using HTTP polling for heatmap updates"
    );
  }
}

/**
 * Subscribe to all incident updates
 * Gracefully handles WebSocket failures - app continues without real-time updates
 */
export function subscribeToIncidents(onNewIncident: (incident: any) => void) {
  if (!socket || !socket.connected) {
    socket = initWebSocket();
  }

  // Only subscribe if socket is connected
  if (socket && socket.connected) {
    try {
      socket.emit("subscribe:incidents");

      socket.on("incident:new", (data) => {
        console.log("📡 Received new incident via WebSocket:", data.incidentId);
        onNewIncident(data);
      });
    } catch (error) {
      console.warn(
        "⚠️ WebSocket subscription failed - using HTTP polling:",
        error
      );
      // Continue without WebSocket - app will use HTTP requests
    }
  } else {
    console.warn(
      "⚠️ WebSocket not connected - using HTTP polling for incident updates"
    );
  }
}

/**
 * Unsubscribe from location updates
 */
export function unsubscribeFromLocation(
  lat: number,
  lng: number,
  radius: number
) {
  if (socket) {
    socket.emit("unsubscribe:location", { lat, lng, radius });
    socket.off("heatmap:update");
    console.log("📍 Unsubscribed from location updates");
  }
}

/**
 * Disconnect WebSocket
 */
export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    console.log("🔌 WebSocket disconnected");
  }
}

/**
 * Check if WebSocket is connected
 */
export function isWebSocketConnected(): boolean {
  return isConnected && socket?.connected === true;
}

export { socket };
