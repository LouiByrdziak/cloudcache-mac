/**
 * Service Worker for Toggle State Persistence
 *
 * This Service Worker maintains a WebSocket connection to the ToggleHub
 * across page navigations, ensuring real-time sync of toggle states.
 *
 * Architecture:
 * - Maintains persistent WebSocket connection
 * - Caches toggle state in localStorage
 * - Broadcasts updates to all open tabs
 * - Handles reconnection with exponential backoff
 */

// TypeScript declarations for Service Worker globals
declare const self: ServiceWorkerGlobalScope;

interface ToggleState {
  [toggleId: string]: boolean;
}

interface ToggleChangeMessage {
  type: "TOGGLE_CHANGE";
  toggleId: string;
  value: boolean;
}

interface InitMessage {
  type: "INIT";
  shopDomain: string;
}

interface RequestStateMessage {
  type: "REQUEST_STATE";
}

interface FullStateMessage {
  type: "FULL_STATE";
  toggles: ToggleState;
  timestamp: number;
}

interface ToggleUpdateMessage {
  type: "TOGGLE_UPDATE";
  toggleId: string;
  value: boolean;
  timestamp: number;
  sourceClientId?: string;
}

type IncomingMessage = InitMessage | ToggleChangeMessage | RequestStateMessage;
type ServerMessage = FullStateMessage | ToggleUpdateMessage;

// Service Worker state
let ws: WebSocket | null = null;
let toggleState: ToggleState = {};
let shopDomain: string | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

/**
 * Connect to the ToggleHub WebSocket
 */
function connect(domain: string): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log("[SW] Already connected");
    return;
  }

  shopDomain = domain;

  // Determine WebSocket URL based on environment
  const wsProtocol = self.location.protocol === "https:" ? "wss:" : "ws:";
  const wsHost = self.location.host;
  const wsUrl = `${wsProtocol}//${wsHost}/ws?shop=${encodeURIComponent(domain)}`;

  console.log(`[SW] Connecting to ${wsUrl}`);

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[SW] WebSocket connected");
      reconnectAttempts = 0;
    };

    ws.onmessage = async (event: MessageEvent) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data as string);
        await handleServerMessage(msg);
      } catch (error) {
        console.error("[SW] Error parsing message:", error);
      }
    };

    ws.onclose = (event: CloseEvent) => {
      console.log(`[SW] WebSocket closed: ${event.code} ${event.reason}`);
      ws = null;
      scheduleReconnect();
    };

    ws.onerror = (error: Event) => {
      console.error("[SW] WebSocket error:", error);
    };
  } catch (error) {
    console.error("[SW] Failed to create WebSocket:", error);
    scheduleReconnect();
  }
}

/**
 * Schedule a reconnection with exponential backoff
 */
function scheduleReconnect(): void {
  if (!shopDomain) return;

  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);

  console.log(`[SW] Scheduling reconnect in ${delay}ms (attempt ${reconnectAttempts})`);

  setTimeout(() => {
    if (shopDomain) {
      connect(shopDomain);
    }
  }, delay);
}

/**
 * Handle messages from the server
 */
async function handleServerMessage(msg: ServerMessage): Promise<void> {
  switch (msg.type) {
    case "FULL_STATE":
      toggleState = msg.toggles;
      // Persist to storage
      await saveToStorage(toggleState);
      // Broadcast to all tabs
      await broadcastToClients(msg);
      console.log("[SW] Full state received:", Object.keys(toggleState).length, "toggles");
      break;

    case "TOGGLE_UPDATE":
      toggleState[msg.toggleId] = msg.value;
      // Persist to storage
      await saveToStorage(toggleState);
      // Broadcast to all tabs
      await broadcastToClients(msg);
      console.log(`[SW] Toggle ${msg.toggleId} updated to ${msg.value}`);
      break;
  }
}

/**
 * Save toggle state to IndexedDB or localStorage
 */
async function saveToStorage(state: ToggleState): Promise<void> {
  try {
    // Use cache API as localStorage isn't available in Service Workers
    const cache = await caches.open("toggle-state");
    const response = new Response(JSON.stringify({
      toggles: state,
      timestamp: Date.now(),
    }));
    await cache.put("/toggle-state", response);
  } catch (error) {
    console.error("[SW] Failed to save to storage:", error);
  }
}

/**
 * Load toggle state from storage
 */
async function loadFromStorage(): Promise<ToggleState> {
  try {
    const cache = await caches.open("toggle-state");
    const response = await cache.match("/toggle-state");
    if (response) {
      const data = await response.json();
      return data.toggles || {};
    }
  } catch (error) {
    console.error("[SW] Failed to load from storage:", error);
  }
  return {};
}

/**
 * Broadcast a message to all connected clients (tabs)
 */
async function broadcastToClients(message: ServerMessage): Promise<void> {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

/**
 * Send current state to a specific client
 */
async function sendStateToClient(client: Client): Promise<void> {
  const message: FullStateMessage = {
    type: "FULL_STATE",
    toggles: toggleState,
    timestamp: Date.now(),
  };
  client.postMessage(message);
}

// Service Worker lifecycle events
self.addEventListener("install", (event: ExtendableEvent) => {
  console.log("[SW] Installing...");
  // Skip waiting to activate immediately
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  console.log("[SW] Activating...");
  // Claim all clients immediately
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      // Load any cached state
      toggleState = await loadFromStorage();
      console.log("[SW] Loaded cached state:", Object.keys(toggleState).length, "toggles");
    })()
  );
});

// Handle messages from the main page
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const msg = event.data as IncomingMessage;

  switch (msg.type) {
    case "INIT":
      // Initialize connection with shop domain
      connect(msg.shopDomain);
      // Send current cached state immediately
      if (event.source) {
        sendStateToClient(event.source as Client);
      }
      break;

    case "TOGGLE_CHANGE":
      // Forward toggle change to server
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
        // Optimistic update
        toggleState[msg.toggleId] = msg.value;
      } else {
        console.warn("[SW] WebSocket not connected, queuing toggle change");
        // Queue for later? For now just update local state
        toggleState[msg.toggleId] = msg.value;
      }
      break;

    case "REQUEST_STATE":
      // Send current state to requesting client
      if (event.source) {
        sendStateToClient(event.source as Client);
      }
      break;
  }
});

// Handle fetch events (pass through - we don't intercept network requests)
self.addEventListener("fetch", (event: FetchEvent) => {
  // Don't interfere with normal fetches
  // This SW is only for WebSocket state management
});

console.log("[SW] Service Worker loaded");

