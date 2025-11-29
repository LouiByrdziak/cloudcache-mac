# Network Analysis Report: "The Battle of 198.18.x.x"
**Date:** 2025-11-28  
**Subject:** Root Cause Analysis of Slow DNS Resolution & Connectivity Failures (Double Tunnel Conflict)

## 1. Executive Summary

We have identified a critical **Double Tunnel Conflict** between **Clash Verge** and **Cloudflare Zero Trust (WARP)** that is causing intermittent connectivity failures (`ENOTFOUND`) and extreme latency (18s+) for backend services like `api2.cursor.sh`.

**The core issue:** Both applications are attempting to utilize the **198.18.0.0/15** IP range (RFC 2544 Benchmark/CGNAT space) for their internal traffic interception mechanisms. This overlap creates a routing blackhole where DNS resolves to a "Fake IP" that the operating system cannot correctly route back to the appropriate tunnel.

**Recommendation:** Configure Cloudflare Zero Trust to **Exclude** the specific IP ranges used by Clash (Fake-IP and DNS listeners) to allow both tunnels to coexist peacefully.

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

## 4. Remediation Plan: The "Coexistence" Strategy
**Objective:** Allow Clash to keep using its preferred "Fake IP" mode (for speed and features) by configuring Cloudflare Zero Trust to **ignore** Clash's traffic ranges. Instead of fighting Clash, we tell Cloudflare to step aside.

### Step 1: Cloudflare Split Tunnel Exclusions
**Action:** You must add the specific IP ranges Clash uses to the **Split Tunnels "Exclude"** list in your Cloudflare Zero Trust Dashboard.

1.  Go to **Settings** -> **Network** -> **Split Tunnels**.
2.  Ensure the mode is set to **Exclude IPs and domains**.
3.  **Add the following CIDR ranges:**
    *   **`198.18.0.0/15`** (Clash IPv4 Fake-IP Range)
    *   **`192.0.2.0/24`** (Clash DNS Listener Range / TEST-NET-1)
    *   **`2001:db8::/32`** (Clash IPv6 Fake-IP / Documentation Range)

**Why this works:** This tells the Cloudflare WARP client: *"If you see traffic destined for these Clash IPs, do NOT send it to Cloudflare. Let the local OS routing table handle it."* The local OS knows that `198.18.x.x` belongs to the Clash interface (`utun4`).

### Step 2: Revert/Verify Clash Settings
Once Cloudflare is configured to ignore these ranges, you can run Clash in its native/preferred mode:
1.  **Enhanced Mode:** You can use `fake-ip` (preferred for speed) or `redir-host`. Both should now work because Cloudflare won't steal the traffic.
2.  **IPv6:** You can re-enable IPv6 if desired, as `2001:db8::` is now excluded from the tunnel.

### Step 3: Verification
1.  **Flush DNS:** `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` (Clear out old bad states).
2.  **Test:** `curl -v https://api2.cursor.sh`
    *   If Clash uses Fake-IP, it might resolve to `198.18.0.x`, but `curl` will now successfully connect because WARP won't intercept it.

---

### Phase 6: Latency Optimization (The "GLOBAL" Route)
**Status:** DNS resolution is FIXED (`198.18.x.x` is gone). However, latency is high (~1000ms) because traffic is routing through a proxy group ("GLOBAL" / "日本IEPL") that is unstable or slow.

**Logs indicate:**
-   `[TCP] 127.0.0.1:58837 --> api2.cursor.sh:443 using GLOBAL`
-   `日本IEPL 02 failed ... context deadline exceeded`

**Recommendation:**
1.  **Switch Proxy Mode:** In Clash Verge, change from "Global" to "Rule" mode.
2.  **Verify Rule:** Ensure `api2.cursor.sh` is hitting a fast node (e.g., "Auto Select" or "Direct" if you are in a region that allows it), not a failing manual node.
3.  **Health Check:** The current node "日本IEPL 02" is timing out. Select a different node manually in the Dashboard if staying in Global mode.
