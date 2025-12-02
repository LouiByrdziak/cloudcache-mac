/**
 * Help Panel Content Configuration
 *
 * Content for all 25+ toggle help panels including problem/solution text
 * and visualization HTML.
 *
 * See: .cursor/rules/cloud-preview-design.mdc
 */

export interface HelpPanelContent {
  problem: string;
  solution: string;
  callout?: {
    title: string;
    text: string;
  };
  visual?: {
    label: string;
    html: string;
  };
}

/**
 * Visual Components (reusable HTML snippets)
 */
const VISUALS = {
  browserMockup: (url: string, content: string) => `
    <div class="browser">
      <div class="browser__bar">
        <div class="browser__dots"><span></span><span></span><span></span></div>
        <div class="browser__url">${url}</div>
      </div>
      <div class="browser__content">${content}</div>
    </div>
  `,

  skeletonLoader: `
    <div class="skel skel--h"></div>
    <div class="skel skel--nav"></div>
    <div class="skel skel--hero"></div>
    <div class="skel skel--text"></div>
  `,

  banner: (text: string) => `
    <div class="banner" style="margin-top:10px">
      <span class="banner__icon">✓</span>${text}
    </div>
  `,

  timeline: (rows: { label: string; segments: { text: string; width: string; type: string }[]; time: string; timeClass: string }[]) => `
    <div class="timeline" style="margin-top:10px">
      ${rows.map(row => `
        <div class="timeline__row">
          <div class="timeline__label">${row.label}</div>
          <div class="timeline__bar">
            ${row.segments.map(seg => `<div class="timeline__seg timeline__seg--${seg.type}" style="width:${seg.width}">${seg.text}</div>`).join('')}
          </div>
          <div class="timeline__time timeline__time--${row.timeClass}">${row.time}</div>
        </div>
      `).join('')}
    </div>
  `,

  stats: (items: { value: string; label: string }[]) => `
    <div class="stats" style="margin-top:10px">
      ${items.map(item => `
        <div class="stat">
          <div class="stat__value">${item.value}</div>
          <div class="stat__label">${item.label}</div>
        </div>
      `).join('')}
    </div>
  `,

  codeCompare: (before: { label: string; code: string }, after: { label: string; code: string }) => `
    <div class="code-compare">
      <div>
        <div class="code-label">${before.label}</div>
        <div class="code code--before">${before.code}</div>
      </div>
      <div>
        <div class="code-label">${after.label}</div>
        <div class="code code--after">${after.code}</div>
      </div>
    </div>
  `,

  sizeBars: (bars: { label: string; size: string; width: string; type: string }[], savings?: { value: string; label: string }) => `
    <div class="size-bars">
      ${bars.map(bar => `
        <div class="size-bar__row">
          <div class="size-bar__label"><span>${bar.label}</span><span>${bar.size}</span></div>
          <div class="size-bar size-bar--${bar.type}" style="width:${bar.width}"></div>
        </div>
      `).join('')}
      ${savings ? `
        <div class="size-savings">
          <div class="size-savings__val">${savings.value}</div>
          <div class="size-savings__label">${savings.label}</div>
        </div>
      ` : ''}
    </div>
  `,

  sequence: (steps: { num: string; title: string; desc: string; time: string; highlight?: boolean }[]) => `
    <div class="sequence">
      ${steps.map(step => `
        <div class="seq-row${step.highlight ? ' seq-row--hl' : ''}">
          <div class="seq-step">${step.num}</div>
          <div class="seq-content">
            <div class="seq-title">${step.title}</div>
            <div class="seq-desc">${step.desc}</div>
          </div>
          <div class="seq-time">${step.time}</div>
        </div>
      `).join('')}
    </div>
  `,
};

/**
 * Help panel content for all toggles
 */
export const HELP_PANEL_CONTENT: Record<string, HelpPanelContent> = {
  // ========================================
  // PERFORMANCE PAGE
  // ========================================
  rocket_loader: {
    problem: "<strong>Imagine your webpage as a race car.</strong> Without Rocket Loader, visitors wait at a blank screen while JavaScript loads.",
    solution: "Rocket Loader makes your page <em>launch immediately</em>—content appears while JavaScript loads in the background.",
    callout: {
      title: "The Magic",
      text: "JavaScript is deferred until after DOM renders, making First Contentful Paint dramatically faster.",
    },
    visual: {
      label: "Performance Comparison",
      html: `
        ${VISUALS.browserMockup("yourstore.myshopify.com", VISUALS.skeletonLoader)}
        ${VISUALS.banner("Content visible instantly")}
        ${VISUALS.timeline([
          { label: "❌ Without", segments: [{ text: "JS Blocking", width: "70%", type: "block" }, { text: "Content", width: "30%", type: "delay" }], time: "~3.2s", timeClass: "slow" },
          { label: "✅ With", segments: [{ text: "Content", width: "25%", type: "fast" }, { text: "JS Deferred", width: "75%", type: "defer" }], time: "~0.8s", timeClass: "fast" },
        ])}
        ${VISUALS.stats([{ value: "75%", label: "Faster Paint" }, { value: "4x", label: "Quicker Load" }])}
      `,
    },
  },

  minify_js: {
    problem: "<strong>Think of JS files like a moving truck.</strong> Developers write code with spaces and comments—browsers don't need that.",
    solution: "Minification <em>vacuum-seals your code</em>—removing whitespace, shortening names.",
    callout: {
      title: "The Magic",
      text: "Less bytes = faster downloads = happier customers.",
    },
    visual: {
      label: "Code Transformation",
      html: `
        ${VISUALS.codeCompare(
          { label: "❌ Before", code: `<span class="cmt">// Calculate total</span>\n<span class="kw">function</span> <span class="prop">calculateTotal</span>(items) {\n  <span class="kw">let</span> total = <span class="val">0</span>;\n  <span class="kw">for</span> (<span class="kw">let</span> i = <span class="val">0</span>; i < items.length; i++) {\n    total += items[i].price;\n  }\n  <span class="kw">return</span> total;\n}` },
          { label: "✅ After", code: `<span class="kw">function</span> <span class="prop">c</span>(a){<span class="kw">let</span> t=<span class="val">0</span>;<span class="kw">for</span>(<span class="kw">let</span> i=<span class="val">0</span>;i<a.length;i++)t+=a[i].price;<span class="kw">return</span> t}` }
        )}
        ${VISUALS.sizeBars(
          [
            { label: "Original", size: "186 bytes", width: "100%", type: "orig" },
            { label: "Minified", size: "72 bytes", width: "39%", type: "comp" },
          ],
          { value: "61%", label: "Smaller" }
        )}
      `,
    },
  },

  minify_css: {
    problem: "<strong>CSS is like interior design notes.</strong> Designers write with formatting. Browsers just need instructions.",
    solution: "CSS minification <em>strips the fluff</em>—same design, faster delivery.",
    visual: {
      label: "Style Compression",
      html: `
        ${VISUALS.codeCompare(
          { label: "❌ Before", code: `<span class="cmt">/* Button */</span>\n<span class="prop">.btn</span> {\n  <span class="prop">background</span>: <span class="val">#F48120</span>;\n  <span class="prop">border-radius</span>: <span class="val">8px</span>;\n}` },
          { label: "✅ After", code: `<span class="prop">.btn</span>{<span class="prop">background</span>:<span class="val">#F48120</span>;<span class="prop">border-radius</span>:<span class="val">8px</span>}` }
        )}
        ${VISUALS.stats([{ value: "~30%", label: "Smaller" }, { value: "50ms", label: "Faster" }])}
      `,
    },
  },

  brotli: {
    problem: "<strong>Sending data is like shipping packages.</strong> Bigger = slower.",
    solution: "Brotli is Google's <em>next-gen compression</em>. 15-25% smaller than gzip.",
    visual: {
      label: "Compression Comparison",
      html: `
        ${VISUALS.sizeBars([
          { label: "Original", size: "500 KB", width: "100%", type: "orig" },
          { label: "Gzip", size: "150 KB", width: "30%", type: "gzip" },
          { label: "Brotli", size: "115 KB", width: "23%", type: "comp" },
        ])}
        ${VISUALS.stats([{ value: "77%", label: "Smaller" }, { value: "20%", label: "vs Gzip" }])}
        ${VISUALS.banner("All modern browsers supported")}
      `,
    },
  },

  early_hints: {
    problem: "<strong>Loading a page is like cooking.</strong> Browser waits for the \"recipe\" before gathering ingredients.",
    solution: "Early Hints is a <em>prep cook giving a head start</em>. Browser downloads files while server prepares.",
    visual: {
      label: "Request Timeline",
      html: `
        ${VISUALS.sequence([
          { num: "1", title: "Browser requests page", desc: "GET /products/thing", time: "0ms", highlight: true },
          { num: "2", title: "🚀 Early Hint arrives!", desc: "103: Preload styles, fonts", time: "50ms", highlight: true },
          { num: "3", title: "Browser preloads", desc: "Downloads in parallel", time: "51ms" },
          { num: "4", title: "Full response", desc: "200 OK with HTML", time: "200ms" },
          { num: "✓", title: "Faster render!", desc: "CSS already loaded", time: "250ms", highlight: true },
        ])}
        ${VISUALS.stats([{ value: "~30%", label: "Faster LCP" }, { value: "150ms", label: "Head Start" }])}
      `,
    },
  },

  // ========================================
  // SECURITY PAGE
  // ========================================
  security_level: {
    problem: "<strong>DDoS attacks flood your site with fake traffic.</strong> Real customers can't get through the crowd.",
    solution: "I'm Under Attack Mode adds a <em>security checkpoint</em>—verifying visitors are human before letting them in.",
    callout: {
      title: "When to Use",
      text: "Enable during active attacks. Disable when traffic normalizes to avoid slowing legitimate visitors.",
    },
    visual: {
      label: "Traffic Flow",
      html: `
        ${VISUALS.sequence([
          { num: "1", title: "Suspicious request detected", desc: "High traffic from unusual patterns", time: "0ms", highlight: true },
          { num: "2", title: "JavaScript challenge", desc: "5-second browser verification", time: "100ms" },
          { num: "3", title: "Bot blocked / Human passes", desc: "Legitimate traffic continues", time: "5s" },
        ])}
        ${VISUALS.stats([{ value: "99%", label: "Bot Blocked" }, { value: "~5s", label: "Human Delay" }])}
      `,
    },
  },

  hotlink_protection: {
    problem: "<strong>Other sites linking to your images steal your bandwidth.</strong> You pay for their traffic.",
    solution: "Hotlink Protection <em>blocks unauthorized embedding</em>—images only load from your domain.",
    visual: {
      label: "How It Works",
      html: `
        ${VISUALS.sequence([
          { num: "❌", title: "External site embeds your image", desc: "&lt;img src='yoursite.com/photo.jpg'&gt;", time: "Blocked" },
          { num: "✓", title: "Your site displays image", desc: "Same-origin request", time: "Allowed", highlight: true },
        ])}
        ${VISUALS.stats([{ value: "0", label: "Bandwidth Stolen" }, { value: "100%", label: "Your Images" }])}
      `,
    },
  },

  email_obfuscation: {
    problem: "<strong>Bots scrape email addresses for spam lists.</strong> Your contact info becomes spam fodder.",
    solution: "Email Obfuscation <em>scrambles addresses in HTML</em>—humans see normal emails, bots see gibberish.",
    visual: {
      label: "Protection in Action",
      html: `
        ${VISUALS.codeCompare(
          { label: "❌ What Bots See", code: `<span class="str">[encrypted string]</span>` },
          { label: "✅ What Humans See", code: `contact@yourstore.com` }
        )}
        ${VISUALS.stats([{ value: "0", label: "Scraped Emails" }, { value: "100%", label: "Spam Reduced" }])}
      `,
    },
  },

  browser_check: {
    problem: "<strong>Malicious bots disguise as browsers.</strong> They scrape content, probe for vulnerabilities.",
    solution: "Browser Integrity Check <em>validates HTTP headers</em>—blocking requests with suspicious signatures.",
    visual: {
      label: "Verification Process",
      html: `
        ${VISUALS.sequence([
          { num: "1", title: "Request arrives", desc: "Check User-Agent, headers", time: "0ms" },
          { num: "2", title: "Header analysis", desc: "Compare against known patterns", time: "5ms", highlight: true },
          { num: "✓", title: "Legitimate browser", desc: "Request proceeds", time: "10ms", highlight: true },
          { num: "❌", title: "Suspicious headers", desc: "Request blocked", time: "10ms" },
        ])}
        ${VISUALS.stats([{ value: "95%", label: "Bad Bots Blocked" }, { value: "0ms", label: "Added Latency" }])}
      `,
    },
  },

  server_side_exclude: {
    problem: "<strong>Sensitive content visible to suspicious visitors.</strong> Scrapers grab everything they can.",
    solution: "Server-side Excludes <em>hide marked content from bots</em>—only clean visitors see the full page.",
    callout: {
      title: "How to Use",
      text: "Wrap sensitive HTML in <!--sse-->...<!--/sse--> tags to hide it from suspicious visitors.",
    },
    visual: {
      label: "Content Filtering",
      html: `
        ${VISUALS.codeCompare(
          { label: "Your HTML", code: `<!--sse--><span class="str">Secret content</span><!--/sse-->` },
          { label: "Bot Sees", code: `<span class="cmt">[empty]</span>` }
        )}
        ${VISUALS.stats([{ value: "100%", label: "Protected" }, { value: "0", label: "Data Leaked" }])}
      `,
    },
  },

  // ========================================
  // NETWORK PAGE
  // ========================================
  ipv6: {
    problem: "<strong>IPv4 addresses are running out.</strong> Some visitors only have IPv6 connectivity.",
    solution: "IPv6 Compatibility <em>creates a gateway</em>—IPv6 visitors reach your IPv4 server seamlessly.",
    visual: {
      label: "Address Translation",
      html: `
        ${VISUALS.sequence([
          { num: "1", title: "IPv6 visitor connects", desc: "2001:db8::1234", time: "0ms", highlight: true },
          { num: "2", title: "Cloudflare receives", desc: "IPv6 → IPv4 translation", time: "1ms" },
          { num: "3", title: "Your server responds", desc: "Standard IPv4 request", time: "50ms", highlight: true },
        ])}
        ${VISUALS.stats([{ value: "30%", label: "IPv6 Traffic" }, { value: "100%", label: "Compatible" }])}
      `,
    },
  },

  websockets: {
    problem: "<strong>Real-time features need persistent connections.</strong> HTTP polling wastes bandwidth and adds latency.",
    solution: "WebSockets <em>keep a channel open</em>—instant two-way communication between browser and server.",
    visual: {
      label: "Connection Types",
      html: `
        ${VISUALS.timeline([
          { label: "❌ Polling", segments: [{ text: "Request", width: "20%", type: "block" }, { text: "Wait", width: "30%", type: "delay" }, { text: "Request", width: "20%", type: "block" }, { text: "Wait", width: "30%", type: "delay" }], time: "Wasteful", timeClass: "slow" },
          { label: "✅ WebSocket", segments: [{ text: "Open Connection ↔ Instant Updates", width: "100%", type: "fast" }], time: "Efficient", timeClass: "fast" },
        ])}
        ${VISUALS.stats([{ value: "~1ms", label: "Latency" }, { value: "90%", label: "Less Overhead" }])}
      `,
    },
  },

  http3: {
    problem: "<strong>HTTP/2 struggles on unstable networks.</strong> Packet loss stalls the entire connection.",
    solution: "HTTP/3 uses QUIC protocol—<em>individual streams are independent</em>, so one lost packet doesn't block others.",
    visual: {
      label: "Protocol Comparison",
      html: `
        ${VISUALS.timeline([
          { label: "HTTP/2", segments: [{ text: "TCP Handshake", width: "30%", type: "delay" }, { text: "TLS", width: "20%", type: "delay" }, { text: "Data", width: "50%", type: "block" }], time: "3 RTT", timeClass: "slow" },
          { label: "HTTP/3", segments: [{ text: "0-RTT QUIC", width: "20%", type: "fast" }, { text: "Data", width: "80%", type: "fast" }], time: "0-1 RTT", timeClass: "fast" },
        ])}
        ${VISUALS.stats([{ value: "25%", label: "Faster" }, { value: "0", label: "Head-of-line" }])}
        ${VISUALS.banner("Built-in TLS 1.3 encryption")}
      `,
    },
  },

  ip_geolocation: {
    problem: "<strong>Your server doesn't know where visitors are from.</strong> Personalization requires extra lookups.",
    solution: "IP Geolocation <em>adds a country header</em>—your app instantly knows each visitor's location.",
    visual: {
      label: "Header Added",
      html: `
        ${VISUALS.codeCompare(
          { label: "Original Request", code: `GET /products HTTP/1.1\nHost: yourstore.com` },
          { label: "With Geolocation", code: `GET /products HTTP/1.1\nHost: yourstore.com\n<span class="prop">CF-IPCountry</span>: <span class="val">US</span>` }
        )}
        ${VISUALS.stats([{ value: "195", label: "Countries" }, { value: "0ms", label: "Lookup Time" }])}
      `,
    },
  },

  pseudo_ipv4: {
    problem: "<strong>Legacy systems require IPv4 addresses.</strong> Pure IPv6 clients can't be identified.",
    solution: "Pseudo IPv4 <em>generates a Class E address</em>—consistent per IPv6 client for logging and analytics.",
    visual: {
      label: "Address Mapping",
      html: `
        ${VISUALS.codeCompare(
          { label: "IPv6 Address", code: `<span class="val">2001:db8::abcd:1234</span>` },
          { label: "Pseudo IPv4", code: `<span class="val">240.0.171.52</span>` }
        )}
        ${VISUALS.stats([{ value: "1:1", label: "Mapping" }, { value: "100%", label: "Consistent" }])}
      `,
    },
  },

  // ========================================
  // CACHING PAGE
  // ========================================
  development_mode: {
    problem: "<strong>Cache makes it hard to see changes.</strong> You update files but see old versions.",
    solution: "Development Mode <em>bypasses cache for 3 hours</em>—changes appear immediately during development.",
    callout: {
      title: "Auto-Disable",
      text: "Automatically turns off after 3 hours to prevent forgetting to re-enable caching.",
    },
    visual: {
      label: "Cache Bypass",
      html: `
        ${VISUALS.timeline([
          { label: "Normal", segments: [{ text: "Cached", width: "100%", type: "delay" }], time: "Old content", timeClass: "slow" },
          { label: "Dev Mode", segments: [{ text: "Origin Request", width: "100%", type: "fast" }], time: "Fresh content", timeClass: "fast" },
        ])}
        ${VISUALS.stats([{ value: "3hr", label: "Duration" }, { value: "100%", label: "Fresh" }])}
      `,
    },
  },

  always_online: {
    problem: "<strong>Server outages mean customers see error pages.</strong> You lose sales during downtime.",
    solution: "Always Online <em>serves cached pages</em> when your origin is unreachable—keeping your store visible.",
    visual: {
      label: "Failover Protection",
      html: `
        ${VISUALS.sequence([
          { num: "1", title: "Origin server down", desc: "Connection refused or timeout", time: "0ms" },
          { num: "2", title: "Cloudflare detects failure", desc: "Triggers Always Online", time: "100ms", highlight: true },
          { num: "3", title: "Cached page served", desc: "Visitor sees recent content", time: "150ms", highlight: true },
        ])}
        ${VISUALS.stats([{ value: "100%", label: "Uptime Visible" }, { value: "0", label: "Error Pages" }])}
      `,
    },
  },

  browser_cache_ttl: {
    problem: "<strong>Browsers re-download unchanged files.</strong> Repeated visits waste bandwidth.",
    solution: "Browser Cache TTL <em>controls how long browsers keep files</em>—balance freshness with performance.",
    visual: {
      label: "Cache Duration",
      html: `
        ${VISUALS.timeline([
          { label: "Short TTL", segments: [{ text: "Cache", width: "20%", type: "fast" }, { text: "Revalidate", width: "80%", type: "delay" }], time: "More fresh", timeClass: "slow" },
          { label: "Long TTL", segments: [{ text: "Cache (fast loads)", width: "90%", type: "fast" }, { text: "Refresh", width: "10%", type: "delay" }], time: "More speed", timeClass: "fast" },
        ])}
        ${VISUALS.stats([{ value: "1yr", label: "Max TTL" }, { value: "90%", label: "Bandwidth Saved" }])}
      `,
    },
  },

  cache_level: {
    problem: "<strong>Query strings create unique URLs.</strong> Same content downloaded multiple times.",
    solution: "Aggressive Caching <em>ignores query strings</em>—treats ?v=1 and ?v=2 as the same resource.",
    visual: {
      label: "URL Handling",
      html: `
        ${VISUALS.codeCompare(
          { label: "Standard Caching", code: `/style.css?v=1 → Cache Miss\n/style.css?v=2 → Cache Miss` },
          { label: "Aggressive Caching", code: `/style.css?v=1 → Cache Hit\n/style.css?v=2 → Cache Hit` }
        )}
        ${VISUALS.stats([{ value: "95%", label: "Hit Rate" }, { value: "5x", label: "Faster" }])}
      `,
    },
  },

  prefetch_preload: {
    problem: "<strong>Next page resources load after click.</strong> Navigation feels slow and clunky.",
    solution: "Prefetch & Preload <em>loads resources ahead of time</em>—next page is ready before the click.",
    visual: {
      label: "Resource Loading",
      html: `
        ${VISUALS.sequence([
          { num: "1", title: "Page loads", desc: "Preload hints parsed", time: "0ms", highlight: true },
          { num: "2", title: "Background fetch", desc: "Next page resources", time: "100ms" },
          { num: "3", title: "User clicks link", desc: "Resources already cached!", time: "User action", highlight: true },
          { num: "✓", title: "Instant navigation", desc: "No wait time", time: "0ms", highlight: true },
        ])}
        ${VISUALS.stats([{ value: "~0ms", label: "Navigation" }, { value: "100%", label: "Pre-loaded" }])}
      `,
    },
  },

  // ========================================
  // SSL/TLS PAGE
  // ========================================
  always_use_https: {
    problem: "<strong>HTTP traffic is unencrypted.</strong> Passwords and data visible to attackers.",
    solution: "Always Use HTTPS <em>redirects all HTTP to HTTPS</em>—every connection is encrypted.",
    visual: {
      label: "Traffic Security",
      html: `
        ${VISUALS.sequence([
          { num: "❌", title: "HTTP request", desc: "http://yourstore.com", time: "Insecure" },
          { num: "→", title: "301 Redirect", desc: "Automatic HTTPS upgrade", time: "0ms", highlight: true },
          { num: "✓", title: "HTTPS connection", desc: "https://yourstore.com", time: "Secure", highlight: true },
        ])}
        ${VISUALS.stats([{ value: "100%", label: "Encrypted" }, { value: "A+", label: "SSL Rating" }])}
        ${VISUALS.banner("Better SEO with HTTPS")}
      `,
    },
  },

  tls_1_3: {
    problem: "<strong>TLS 1.2 handshakes are slow.</strong> Multiple round trips before encryption starts.",
    solution: "TLS 1.3 <em>reduces handshake to one round trip</em>—faster, more secure connections.",
    visual: {
      label: "Handshake Comparison",
      html: `
        ${VISUALS.timeline([
          { label: "TLS 1.2", segments: [{ text: "Hello", width: "25%", type: "delay" }, { text: "Key", width: "25%", type: "delay" }, { text: "Verify", width: "25%", type: "delay" }, { text: "Done", width: "25%", type: "block" }], time: "2 RTT", timeClass: "slow" },
          { label: "TLS 1.3", segments: [{ text: "Hello + Key", width: "50%", type: "fast" }, { text: "Ready", width: "50%", type: "fast" }], time: "1 RTT", timeClass: "fast" },
        ])}
        ${VISUALS.stats([{ value: "50%", label: "Faster" }, { value: "0", label: "Weak Ciphers" }])}
      `,
    },
  },

  opportunistic_encryption: {
    problem: "<strong>Some links still use HTTP.</strong> Traffic on those URLs is unprotected.",
    solution: "Opportunistic Encryption <em>encrypts HTTP URLs over TLS</em>—security without changing links.",
    visual: {
      label: "Transparent Encryption",
      html: `
        ${VISUALS.codeCompare(
          { label: "URL Unchanged", code: `http://yourstore.com/page` },
          { label: "Connection Encrypted", code: `<span class="cmt">TLS tunnel active</span>\n🔒 Data protected in transit` }
        )}
        ${VISUALS.stats([{ value: "100%", label: "Encrypted" }, { value: "0", label: "Link Changes" }])}
      `,
    },
  },

  automatic_https_rewrites: {
    problem: "<strong>Mixed content breaks HTTPS.</strong> HTTP resources on HTTPS pages show warnings.",
    solution: "Automatic HTTPS Rewrites <em>upgrades HTTP links to HTTPS</em>—eliminating mixed content.",
    visual: {
      label: "Link Transformation",
      html: `
        ${VISUALS.codeCompare(
          { label: "❌ Before", code: `&lt;img src="<span class="str">http://</span>cdn.com/img.jpg"&gt;` },
          { label: "✅ After", code: `&lt;img src="<span class="str">https://</span>cdn.com/img.jpg"&gt;` }
        )}
        ${VISUALS.stats([{ value: "0", label: "Warnings" }, { value: "100%", label: "HTTPS Assets" }])}
        ${VISUALS.banner("No mixed content warnings")}
      `,
    },
  },

  min_tls_version: {
    problem: "<strong>Old TLS versions have vulnerabilities.</strong> TLS 1.0/1.1 are considered insecure.",
    solution: "Minimum TLS 1.2 <em>blocks outdated protocols</em>—only modern, secure connections allowed.",
    visual: {
      label: "Protocol Support",
      html: `
        ${VISUALS.sequence([
          { num: "❌", title: "TLS 1.0 / 1.1", desc: "Blocked - Known vulnerabilities", time: "Denied" },
          { num: "✓", title: "TLS 1.2", desc: "Allowed - Secure", time: "Allowed", highlight: true },
          { num: "✓", title: "TLS 1.3", desc: "Allowed - Most secure", time: "Preferred", highlight: true },
        ])}
        ${VISUALS.stats([{ value: "99%", label: "Browser Support" }, { value: "A+", label: "Security Grade" }])}
      `,
    },
  },

  // ========================================
  // ANALYTICS PAGE (Future)
  // ========================================
  web_analytics: {
    problem: "<strong>Traditional analytics require third-party scripts.</strong> They slow pages and raise privacy concerns.",
    solution: "Cloudflare Web Analytics <em>runs at the edge</em>—no scripts, no cookies, complete privacy.",
    visual: {
      label: "Analytics Comparison",
      html: `
        ${VISUALS.timeline([
          { label: "Traditional", segments: [{ text: "JS Load", width: "30%", type: "block" }, { text: "Track", width: "40%", type: "delay" }, { text: "Send", width: "30%", type: "block" }], time: "Slow", timeClass: "slow" },
          { label: "Cloudflare", segments: [{ text: "Edge Collection (Zero impact)", width: "100%", type: "fast" }], time: "Instant", timeClass: "fast" },
        ])}
        ${VISUALS.stats([{ value: "0ms", label: "Page Impact" }, { value: "100%", label: "Privacy" }])}
      `,
    },
  },

  rum: {
    problem: "<strong>Synthetic tests don't show real user experience.</strong> Lab data misses real-world issues.",
    solution: "Real User Monitoring <em>collects actual performance</em>—see what your customers experience.",
    visual: {
      label: "Data Collection",
      html: `
        ${VISUALS.sequence([
          { num: "1", title: "Real visitor loads page", desc: "Performance API collects metrics", time: "0ms", highlight: true },
          { num: "2", title: "Beacon sent", desc: "LCP, FID, CLS captured", time: "Page load" },
          { num: "3", title: "Data aggregated", desc: "Dashboard shows real metrics", time: "Real-time", highlight: true },
        ])}
        ${VISUALS.stats([{ value: "100%", label: "Real Data" }, { value: "Core Vitals", label: "Tracked" }])}
      `,
    },
  },

  core_web_vitals: {
    problem: "<strong>Google uses page experience for ranking.</strong> Poor vitals hurt your SEO.",
    solution: "Core Web Vitals monitoring <em>tracks LCP, FID, and CLS</em>—the metrics that matter for ranking.",
    visual: {
      label: "Key Metrics",
      html: `
        ${VISUALS.stats([{ value: "LCP", label: "Loading" }, { value: "FID", label: "Interactivity" }])}
        ${VISUALS.stats([{ value: "CLS", label: "Stability" }, { value: "INP", label: "Responsiveness" }])}
        ${VISUALS.banner("Track the metrics Google uses for ranking")}
      `,
    },
  },
};



