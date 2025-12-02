/**
 * ToggleHub Durable Object
 *
 * WebSocket hub that maintains persistent connections to all clients
 * and broadcasts toggle changes in real-time.
 *
 * Architecture:
 * - Each shop domain connects via WebSocket
 * - On connection: sends current toggle state from KV
 * - On toggle change: updates KV, calls Cloudflare API, broadcasts to all clients
 * - Handles reconnection gracefully
 */

export interface Env {
  APP_KV: KVNamespace;
  CF_API_TOKEN: string;
  CF_ZONE_ID: string;
  CF_ACCOUNT_ID: string;
}

interface ConnectionMetadata {
  shopDomain: string;
  clientId: string;
  connectedAt: number;
}

interface ToggleChangeMessage {
  type: "TOGGLE_CHANGE";
  toggleId: string;
  value: boolean;
  timestamp: number;
}

interface FullStateMessage {
  type: "FULL_STATE";
  toggles: Record<string, boolean>;
  timestamp: number;
}

interface ToggleUpdateMessage {
  type: "TOGGLE_UPDATE";
  toggleId: string;
  value: boolean;
  timestamp: number;
  sourceClientId?: string;
}

interface RequestStateMessage {
  type: "REQUEST_STATE";
}

type IncomingMessage = ToggleChangeMessage | RequestStateMessage;
type OutgoingMessage = FullStateMessage | ToggleUpdateMessage;

export class ToggleHub {
  private state: DurableObjectState;
  private env: Env;
  private connections: Map<WebSocket, ConnectionMetadata>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.connections = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade request
    if (request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocketUpgrade(request, url);
    }

    // Internal broadcast endpoint (called by Worker when toggle changes via REST API)
    if (url.pathname === "/broadcast") {
      return this.handleBroadcastRequest(request);
    }

    // Health check
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          connections: this.connections.size,
          timestamp: Date.now(),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Not Found", { status: 404 });
  }

  private async handleWebSocketUpgrade(request: Request, url: URL): Promise<Response> {
    const shopDomain = url.searchParams.get("shop");
    const clientId = url.searchParams.get("clientId") || crypto.randomUUID();

    if (!shopDomain) {
      return new Response("Missing shop parameter", { status: 400 });
    }

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket connection
    server.accept();

    // Store connection metadata
    const metadata: ConnectionMetadata = {
      shopDomain,
      clientId,
      connectedAt: Date.now(),
    };
    this.connections.set(server, metadata);

    // Set up message handler
    server.addEventListener("message", async (event) => {
      await this.handleMessage(server, metadata, event.data);
    });

    // Set up close handler
    server.addEventListener("close", () => {
      this.connections.delete(server);
      console.log(`Client ${clientId} disconnected from ${shopDomain}`);
    });

    // Set up error handler
    server.addEventListener("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.connections.delete(server);
    });

    // Send current state immediately after connection
    await this.sendCurrentState(server, shopDomain);

    console.log(`Client ${clientId} connected for shop ${shopDomain}`);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async handleMessage(
    ws: WebSocket,
    metadata: ConnectionMetadata,
    data: string | ArrayBuffer
  ): Promise<void> {
    try {
      const message: IncomingMessage = JSON.parse(data.toString());

      switch (message.type) {
        case "TOGGLE_CHANGE":
          await this.handleToggleChange(ws, metadata, message);
          break;

        case "REQUEST_STATE":
          await this.sendCurrentState(ws, metadata.shopDomain);
          break;

        default:
          console.warn("Unknown message type:", message);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          timestamp: Date.now(),
        })
      );
    }
  }

  private async handleToggleChange(
    ws: WebSocket,
    metadata: ConnectionMetadata,
    message: ToggleChangeMessage
  ): Promise<void> {
    const { shopDomain, clientId } = metadata;
    const { toggleId, value } = message;

    try {
      // 1. Update KV (source of truth)
      const kvKey = `shop:${shopDomain}:toggles`;
      const existingToggles = await this.env.APP_KV.get(kvKey, "json");
      const toggles: Record<string, boolean> = (existingToggles as Record<string, boolean>) || {};
      toggles[toggleId] = value;
      await this.env.APP_KV.put(kvKey, JSON.stringify(toggles));

      // 2. Update Cloudflare Zone Settings (async, don't block)
      this.updateCloudflareSettingAsync(toggleId, value);

      // 3. Broadcast to all clients for this shop
      const updateMessage: ToggleUpdateMessage = {
        type: "TOGGLE_UPDATE",
        toggleId,
        value,
        timestamp: Date.now(),
        sourceClientId: clientId,
      };

      this.broadcastToShop(shopDomain, updateMessage);

      console.log(`Toggle ${toggleId} changed to ${value} for shop ${shopDomain}`);
    } catch (error) {
      console.error(`Error handling toggle change for ${toggleId}:`, error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: `Failed to update ${toggleId}`,
          timestamp: Date.now(),
        })
      );
    }
  }

  private async sendCurrentState(ws: WebSocket, shopDomain: string): Promise<void> {
    try {
      const kvKey = `shop:${shopDomain}:toggles`;
      const toggles = await this.env.APP_KV.get(kvKey, "json");

      const message: FullStateMessage = {
        type: "FULL_STATE",
        toggles: (toggles as Record<string, boolean>) || {},
        timestamp: Date.now(),
      };

      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending current state for ${shopDomain}:`, error);
    }
  }

  private broadcastToShop(shopDomain: string, message: OutgoingMessage): void {
    const data = JSON.stringify(message);

    for (const [ws, metadata] of this.connections) {
      if (metadata.shopDomain === shopDomain) {
        try {
          ws.send(data);
        } catch (error) {
          console.error(`Error broadcasting to client ${metadata.clientId}:`, error);
          // Connection may be stale, remove it
          this.connections.delete(ws);
        }
      }
    }
  }

  private broadcast(message: OutgoingMessage): void {
    const data = JSON.stringify(message);

    for (const [ws, metadata] of this.connections) {
      try {
        ws.send(data);
      } catch (error) {
        console.error(`Error broadcasting to client ${metadata.clientId}:`, error);
        this.connections.delete(ws);
      }
    }
  }

  private async handleBroadcastRequest(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const { shopDomain, ...message } = body as { shopDomain?: string } & OutgoingMessage;

      if (shopDomain) {
        this.broadcastToShop(shopDomain, message);
      } else {
        this.broadcast(message);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }

  /**
   * Update Cloudflare zone setting asynchronously.
   * This runs in the background and doesn't block the toggle response.
   */
  private async updateCloudflareSettingAsync(toggleId: string, value: boolean): Promise<void> {
    // Map toggle IDs to Cloudflare setting names
    const settingMap: Record<string, { name: string; valueType: string }> = {
      rocket_loader: { name: "rocket_loader", valueType: "on_off" },
      minify_js: { name: "minify", valueType: "object" },
      minify_css: { name: "minify", valueType: "object" },
      brotli: { name: "brotli", valueType: "on_off" },
      early_hints: { name: "early_hints", valueType: "on_off" },
      security_level: { name: "security_level", valueType: "string" },
      hotlink_protection: { name: "hotlink_protection", valueType: "on_off" },
      email_obfuscation: { name: "email_obfuscation", valueType: "on_off" },
      browser_check: { name: "browser_check", valueType: "on_off" },
      server_side_exclude: { name: "server_side_exclude", valueType: "on_off" },
      ipv6: { name: "ipv6", valueType: "on_off" },
      websockets: { name: "websockets", valueType: "on_off" },
      http3: { name: "http3", valueType: "on_off" },
      ip_geolocation: { name: "ip_geolocation", valueType: "on_off" },
      pseudo_ipv4: { name: "pseudo_ipv4", valueType: "string" },
      development_mode: { name: "development_mode", valueType: "on_off" },
      always_online: { name: "always_online", valueType: "on_off" },
      always_use_https: { name: "always_use_https", valueType: "on_off" },
      tls_1_3: { name: "tls_1_3", valueType: "on_off" },
      opportunistic_encryption: { name: "opportunistic_encryption", valueType: "on_off" },
      automatic_https_rewrites: { name: "automatic_https_rewrites", valueType: "on_off" },
      min_tls_version: { name: "min_tls_version", valueType: "string" },
    };

    const setting = settingMap[toggleId];
    if (!setting) {
      console.warn(`Unknown toggle ID for Cloudflare: ${toggleId}`);
      return;
    }

    try {
      let apiValue: string | boolean | object;

      switch (setting.valueType) {
        case "on_off":
          apiValue = value ? "on" : "off";
          break;
        case "string":
          if (toggleId === "security_level") {
            apiValue = value ? "under_attack" : "medium";
          } else if (toggleId === "min_tls_version") {
            apiValue = value ? "1.2" : "1.0";
          } else if (toggleId === "pseudo_ipv4") {
            apiValue = value ? "add_header" : "off";
          } else {
            apiValue = value ? "on" : "off";
          }
          break;
        case "object":
          if (toggleId === "minify_js") {
            apiValue = { js: value ? "on" : "off" };
          } else if (toggleId === "minify_css") {
            apiValue = { css: value ? "on" : "off" };
          } else {
            apiValue = value ? "on" : "off";
          }
          break;
        default:
          apiValue = value ? "on" : "off";
      }

      const cfApiUrl = `https://api.cloudflare.com/client/v4/zones/${this.env.CF_ZONE_ID}/settings/${setting.name}`;

      const response = await fetch(cfApiUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: apiValue }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Cloudflare API error for ${toggleId}:`, errorText);
      } else {
        console.log(`Successfully updated ${toggleId} in Cloudflare`);
      }
    } catch (error) {
      console.error(`Error updating Cloudflare setting ${toggleId}:`, error);
    }
  }
}
