# Network Analysis Report: "The Battle of 198.18.x.x"
**Date:** 2025-11-28  
**Subject:** Root Cause Analysis of Slow DNS Resolution & Connectivity Failures (Double Tunnel Conflict)

## 1. Executive Summary

We have identified a critical **Double Tunnel Conflict** between **Clash Verge** and **Cloudflare Zero Trust (WARP)** that is causing intermittent connectivity failures (`ENOTFOUND`) and extreme latency (18s+) for backend services like `api2.cursor.sh`.

**The core issue:** Both applications are attempting to utilize the **198.18.0.0/15** IP range (RFC 2544 Benchmark/CGNAT space) for their internal traffic interception mechanisms. This overlap creates a routing blackhole where DNS resolves to a "Fake IP" that the operating system cannot correctly route back to the appropriate tunnel.

**Recommendation:** Immediately reconfigure Clash to stop using `fake-ip` mode or shift its Fake-IP range, and configure Cloudflare Split Tunnels to bypass Clash traffic.

---

## 2. Evidence & Forensics

### A. The "18-Second" Delay & `ENOTFOUND`
Logs provided by the client show a distinct pattern:
1.  **DNS Resolution:** `api2.cursor.sh` resolves to `198.18.0.17` (Clash Fake-IP) almost instantly (<1ms).
2.  **Connection Attempt:** The client attempts to connect to `198.18.0.17`.
3.  **Timeout:** The connection hangs for ~18-22 seconds.
4.  **Failure:** `Error: getaddrinfo ENOTFOUND api2.cursor.sh` or `No route to host`.

### B. Local Diagnostics
Our local diagnostics confirmed:
-   **Clash Presence:** `Clash Verge` and `Cloudflare WARP` are running simultaneously.
-   **DNS Hijacking:** `dig api2.cursor.sh @1.1.1.1` returns `198.18.0.17`. This proves Clash is intercepting *all* DNS traffic, even requests explicitly directed to Cloudflare's public resolver, and returning a Fake IP.
-   **Routing Conflict:** `curl -v https://api2.cursor.sh` fails with `Immediate connect fail for 198.18.0.17: No route to host` after 22 seconds.
-   **System Resolvers:** macOS is configured to use `192.0.2.2` and `192.0.2.3` (likely Clash's DNS listeners) as primary resolvers for the `utun4` interface, but WARP is also manipulating routes.

---

## 3. Technical Deep Dive: The "Fake-IP" Collision

1.  **Clash `fake-ip` Mode:** When an app asks for `api2.cursor.sh`, Clash doesn't resolve it immediately. Instead, it returns a fake IP (`198.18.0.17`) to the app and remembers "198.18.0.17 = api2.cursor.sh". When traffic hits that IP, Clash proxies it.
2.  **Cloudflare WARP:** Cloudflare Zero Trust *also* often uses `100.64.0.0/10` (CGNAT) or `198.18.0.0/15` for its own internal routing and inspection.
3.  **The Collision:** 
    -   Clash tells the OS: "Send 198.18.0.17 traffic to me."
    -   WARP tells the OS: "I handle all traffic, or I handle this specific range."
    -   **Result:** The packet destined for `198.18.0.17` gets dropped, looped, or routed into the wrong tunnel (WARP) which doesn't know what "198.18.0.17" maps to (because Clash holds that mapping in memory).

### C. Visual Routing Table Evidence (Cloudflare)
The provided routing table screenshot confirms:
-   **Gateway `198.19.0.1`:** Massive subnet blocks (e.g., `1.0.0.0/8`, `4.0.0.0/6`) are routed to this WARP virtual gateway.
-   **`192.0.2.x` Exceptions:** Routes for `192.0.2.2` and `192.0.2.3` (Clash DNS listeners) are correctly routed to the physical gateway (`192.168.1.1`), preventing a DNS loop.
-   **The "Blackhole":** However, traffic destined for the *response* IP `198.18.0.17` (Clash Fake-IP) falls into the WARP tunnel catch-all routes, causing the connection failure. WARP receives the packet for `198.18.0.17` and drops it because it has no valid route for that private range.

---

## 4. Remediation Plan

### Phase 1: Immediate Stabilization (Clash Config)
**Objective:** Stop Clash from poisoning the system DNS cache with unroutable IPs.

1.  **Switch Clash to `redir-host` (or "Compatible") Mode:**
    -   In Clash Verge settings -> DNS -> Enhanced Mode.
    -   Change `fake-ip` to `redir-host` (or `real-ip` / `compatible`).
    -   *Why:* This forces Clash to resolve the *real* IP (e.g., `104.x.x.x`) before returning it to the system. Both WARP and Clash can route real IPs more reliably than internal Fake IPs.

2.  **Alternative: Change Fake-IP Range (If Fake-IP is required):**
    -   Edit `clash-config.yaml`:
        ```yaml
        dns:
          enable: true
          enhanced-mode: fake-ip
          fake-ip-range: 198.19.0.1/16 # Shift to avoid 198.18.0.0/15 collision
        ```

### Phase 2: Frictionless "Double Tunnel" Setup
**Objective:** Allow Clash and Cloudflare Zero Trust to coexist without fighting.

1.  **Cloudflare Split Tunnels (Exclude Clash):**
    -   In Cloudflare Zero Trust Dashboard -> Settings -> Network -> Split Tunnels.
    -   **Exclude** the Clash local proxy port (usually `7890` or `7897`).
    -   **Exclude** the Clash Dashboard/Controller port (`9090` or `9097`).
    -   **Exclude** the Clash Fake-IP range if you kept it (`198.18.0.0/15`).

2.  **Clash "Process Direct" (Tun Mode):**
    -   Ensure `Cloudflare WARP` is in the `skip-proxy` or "Direct" list in Clash config so Clash doesn't try to proxy WARP's tunnel traffic.

### Phase 3: Verification
1.  Run `dig api2.cursor.sh` -> Should return a **Public IP** (not `198.18.x.x`) or a functioning internal IP.
2.  Run `curl -v https://api2.cursor.sh` -> Should connect in <500ms (TLS handshake).

### Phase 4: Troubleshooting "Instant Failure" (Post-Config Change)
If you see `ENOTFOUND` immediately after switching to `redir-host`:
-   **Cause:** The macOS network stack is still clinging to the old "Fake-IP" DNS resolvers (`192.0.2.2`) which may be unresponsive in the new mode.
-   **Solution:**
    1.  **Restart Clash Verge:** Toggle "Tun Mode" OFF and ON again.
    2.  **Flush DNS:** Run `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` in the terminal.
    3.  **Verify:** Check `scutil --dns` to ensure the resolver list is clean.

### Phase 6: Latency Optimization (The "GLOBAL" Route)
**Status:** DNS resolution is FIXED (`198.18.x.x` is gone). However, latency is high (~1000ms) because traffic is routing through a proxy group ("GLOBAL" / "日本IEPL") that is unstable or slow.

**Logs indicate:**
-   `[TCP] 127.0.0.1:58837 --> api2.cursor.sh:443 using GLOBAL`
-   `日本IEPL 02 failed ... context deadline exceeded`

**Recommendation:**
1.  **Switch Proxy Mode:** In Clash Verge, change from "Global" to "Rule" mode.
2.  **Verify Rule:** Ensure `api2.cursor.sh` is hitting a fast node (e.g., "Auto Select" or "Direct" if you are in a region that allows it), not a failing manual node.
3.  **Health Check:** The current node "日本IEPL 02" is timing out. Select a different node manually in the Dashboard if staying in Global mode.


