/**
 * Enhanced Toggle Section with Accordion Details & AHA Moment Visualizations
 *
 * Features:
 * - Small icon beside each toggle title
 * - Question mark icon that expands accordion
 * - Humanized technical descriptions
 * - Futuristic animated visualizations showing what each feature does
 */

export interface EnhancedOptimization {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  controlType?: "toggle" | "slider";
  options?: { value: number | string; label: string }[];
  currentValue?: number | string | null;
  currentLabel?: string | null;
}

// Feature icons for each toggle
const FEATURE_ICONS: Record<string, string> = {
  // Performance
  rocket_loader: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  minify_js: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  minify_css: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
  brotli: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  early_hints: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,

  // Security
  security_level: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  hotlink_protection: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  email_obfuscation: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
  browser_check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  server_side_exclude: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,

  // Network
  ipv6: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  websockets: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>`,
  http3: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  ip_geolocation: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  pseudo_ipv4: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,

  // Caching
  development_mode: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
  always_online: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  browser_cache_ttl: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  cache_level: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  prefetch_preload: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,

  // SSL/TLS
  always_use_https: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>`,
  tls_1_3: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
  opportunistic_encryption: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
  automatic_https_rewrites: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  min_tls_version: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

// Humanized detailed descriptions
const DETAILED_DESCRIPTIONS: Record<string, string> = {
  // ===== PERFORMANCE =====
  rocket_loader: `<p><strong>Imagine your webpage as a race car.</strong> Without Rocket Loader, your car has to wait at the starting line while all the complex engine parts (JavaScript) get assembled. Visitors stare at a blank screen.</p>
  <p>With Rocket Loader, your car <em>rockets off immediately</em>—showing your beautiful content to visitors while the engine quietly assembles in the background. The page feels instant because people see what matters first: your text, images, and design.</p>
  <p class="detail-highlight">✨ <strong>The magic:</strong> JavaScript is deferred until after the visual content renders, making your First Contentful Paint dramatically faster.</p>`,

  minify_js: `<p><strong>Think of JavaScript files like a book with excessive whitespace.</strong> Every unnecessary space, comment, and line break is like blank pages—they add weight without value.</p>
  <p>Minification is like a master editor condensing your book while keeping every word intact. The story stays the same, but the book becomes <em>significantly lighter</em> to carry (download).</p>
  <p class="detail-highlight">📦 <strong>The magic:</strong> Files shrink by 20-60%, meaning faster downloads and less bandwidth consumption.</p>`,

  minify_css: `<p><strong>Your stylesheet is the fashion guide for your website.</strong> But like fashion notes, it often contains verbose descriptions: <code>margin-top: 10px; margin-right: 10px;</code></p>
  <p>CSS minification is like a fashion shorthand expert who rewrites <em>"top, right, bottom, left all 10 pixels"</em> as simply <code>margin: 10px;</code>. Same style, fewer characters.</p>
  <p class="detail-highlight">🎨 <strong>The magic:</strong> Your site's visual instructions load faster, meaning styles apply sooner and your design appears instantly.</p>`,

  brotli: `<p><strong>Imagine shipping a fully assembled IKEA wardrobe versus flat-packed.</strong> Brotli is like the world's best flat-pack engineer—squeezing your files into the smallest possible package.</p>
  <p>Brotli compression is <em>15-25% more efficient</em> than the older Gzip method. It's like fitting three wardrobes worth of content into the space of two.</p>
  <p class="detail-highlight">🗜️ <strong>The magic:</strong> Files travel across the internet in a compressed format, then expand instantly in the browser. Less data = faster loads.</p>`,

  early_hints: `<p><strong>Imagine ordering at a restaurant.</strong> Normally, you wait for the menu, decide, then wait for food. But what if the waiter brought bread and water <em>while</em> you were still reading the menu?</p>
  <p>Early Hints sends a "103" response before your main page—telling browsers to start loading critical resources (fonts, CSS, key images) <em>immediately</em>, while the server prepares the full response.</p>
  <p class="detail-highlight">⚡ <strong>The magic:</strong> By the time your main page arrives, essential resources are already loaded. It's like time travel for web performance.</p>`,

  // ===== SECURITY =====
  security_level: `<p><strong>Think of your website as a nightclub.</strong> Normally, the bouncer checks IDs quickly and lets most people in. But when there's a riot outside (a DDoS attack), you need to slow everyone down.</p>
  <p>"I'm Under Attack" mode is like adding <em>a full security screening</em> at the door. Every visitor waits a few seconds while Cloudflare checks if they're a real person or a malicious bot trying to crash your party.</p>
  <p class="detail-highlight">🛡️ <strong>The magic:</strong> Legitimate visitors see a brief "checking your browser" page, while attack traffic gets blocked. Your site stays online during massive attacks.</p>`,

  hotlink_protection: `<p><strong>Imagine someone photocopying your restaurant menu and handing it out on the street</strong>—but the copies say "call THIS number for delivery" (their number, not yours). They get the business; you pay for the printing.</p>
  <p>Hotlink protection stops other websites from <em>embedding your images directly</em>. When someone tries to display your image on their site, they see nothing—or a placeholder you choose.</p>
  <p class="detail-highlight">🔐 <strong>The magic:</strong> Your bandwidth is protected. Only visitors on YOUR site see your images. Bandwidth thieves get blocked.</p>`,

  email_obfuscation: `<p><strong>Leaving your email visible on a website is like writing your phone number on a bathroom wall.</strong> Spam bots constantly crawl the web, harvesting any email addresses they find.</p>
  <p>Email obfuscation scrambles your email in the HTML code—<em>humans see it normally</em>, but bots see gibberish. It's like writing in invisible ink that only humans can read.</p>
  <p class="detail-highlight">📧 <strong>The magic:</strong> Your inbox stays clean. Bots can't harvest what they can't read, but your customers can still contact you.</p>`,

  browser_check: `<p><strong>Imagine a bouncer who can spot fake IDs instantly.</strong> Bad bots often use outdated or suspicious browser signatures—like showing up to a 2024 party with a 1995 driver's license.</p>
  <p>Browser Integrity Check examines each visitor's "ID" (HTTP headers) and <em>blocks requests that look suspicious</em>. Legitimate browsers pass instantly; sketchy ones get stopped.</p>
  <p class="detail-highlight">🔍 <strong>The magic:</strong> Automated attacks from bots with malformed headers are blocked before they reach your site. Real visitors don't notice a thing.</p>`,

  server_side_exclude: `<p><strong>Think of it as a VIP section in your website.</strong> Regular visitors see everything, but suspicious characters (visitors flagged by Cloudflare's threat intelligence) see a redacted version.</p>
  <p>You wrap sensitive content in special tags, and Cloudflare <em>automatically hides it</em> from visitors who might be threats—like phone numbers, pricing, or special offers.</p>
  <p class="detail-highlight">👁️ <strong>The magic:</strong> Scrapers and suspicious visitors see "[hidden]" while legitimate customers see your full content. Protect your competitive intelligence.</p>`,

  // ===== NETWORK =====
  ipv6: `<p><strong>The internet is running out of phone numbers.</strong> IPv4 (the old system) only has about 4 billion addresses—and we've used them all. IPv6 is the new system with virtually unlimited addresses.</p>
  <p>Enabling IPv6 means visitors with newer internet connections can reach your site <em>directly</em> instead of going through translation services that add delay.</p>
  <p class="detail-highlight">🌐 <strong>The magic:</strong> Future-proof your site. As more ISPs switch to IPv6, your site remains accessible to everyone without extra hops.</p>`,

  websockets: `<p><strong>Normal web requests are like sending letters.</strong> You send one, wait for a reply, send another. WebSockets are like picking up the phone—<em>a constant open line</em> for instant back-and-forth.</p>
  <p>This powers real-time features: live chat, multiplayer games, stock tickers, collaborative editing. Without it, these features would be slow and clunky.</p>
  <p class="detail-highlight">🔌 <strong>The magic:</strong> Real-time communication flows through Cloudflare's network. Your live features work seamlessly with all of Cloudflare's protection.</p>`,

  http3: `<p><strong>HTTP/3 is like upgrading from a dirt road to a superhighway.</strong> The older HTTP/2 uses TCP—reliable but slow to recover from problems. HTTP/3 uses QUIC—faster, smarter, and better on spotty connections.</p>
  <p>On mobile networks or WiFi with interference, HTTP/3 <em>keeps data flowing</em> even when some packets get lost. No more waiting for retransmissions.</p>
  <p class="detail-highlight">⚡ <strong>The magic:</strong> Pages load faster, especially on mobile. Connection setup is quicker. Packet loss doesn't stall everything.</p>`,

  ip_geolocation: `<p><strong>Imagine knowing every customer's country the moment they walk in.</strong> IP Geolocation adds a special header to every request telling your server exactly where the visitor is located.</p>
  <p>Use it to show local currency, language, or content. Redirect EU visitors to GDPR-compliant pages. Block or allow specific countries—<em>all automatically</em>.</p>
  <p class="detail-highlight">📍 <strong>The magic:</strong> Your server receives a "CF-IPCountry" header with every request. Personalize experiences without complex geolocation services.</p>`,

  pseudo_ipv4: `<p><strong>Some older systems only speak IPv4</strong>—like someone who only understands landline phone numbers, not cell phones. But more visitors arrive via IPv6 every day.</p>
  <p>Pseudo IPv4 creates a <em>fake IPv4 address</em> for IPv6 visitors. Your legacy systems can still log and track them, even though they're really using IPv6.</p>
  <p class="detail-highlight">🔄 <strong>The magic:</strong> Backward compatibility. Your IPv4-only analytics and logging systems keep working while you transition to the IPv6 future.</p>`,

  // ===== CACHING =====
  development_mode: `<p><strong>Caching is normally your best friend</strong>—it makes your site lightning fast by saving copies of your pages. But when you're making changes, it becomes annoying. You update something, refresh, and see the OLD version.</p>
  <p>Development Mode <em>temporarily bypasses all caching</em> for 3 hours. Every refresh shows your latest changes instantly. Perfect for design tweaks and debugging.</p>
  <p class="detail-highlight">🔧 <strong>The magic:</strong> See changes immediately without clearing caches. After 3 hours, caching automatically resumes—no need to remember to turn it back on.</p>`,

  always_online: `<p><strong>What happens when your server crashes at 3 AM?</strong> Normally, visitors see an ugly error page. With Always Online, they see a <em>cached version of your site</em> instead.</p>
  <p>Cloudflare keeps a copy of your pages. If your origin server goes down, visitors still see your content—maybe slightly outdated, but infinitely better than "503 Service Unavailable."</p>
  <p class="detail-highlight">🌟 <strong>The magic:</strong> Your site never truly goes offline. Server problems become invisible to visitors while you fix things behind the scenes.</p>`,

  browser_cache_ttl: `<p><strong>Every time someone visits your site, their browser asks "Is this file still good?"</strong> Browser Cache TTL tells browsers how long to trust their local copy before checking again.</p>
  <p>Set it longer for files that rarely change (logos, fonts). Your visitors' browsers <em>skip the network entirely</em>—the fastest request is one you never make.</p>
  <p class="detail-highlight">⏱️ <strong>The magic:</strong> Returning visitors experience instant loads. Static files come from their own device, not the internet. Huge speed boost.</p>`,

  cache_level: `<p><strong>Standard caching ignores URLs with question marks</strong> (like ?ref=twitter or ?size=large). Aggressive caching treats them as cacheable—same content, different URL? Cache it anyway.</p>
  <p>This is perfect for e-commerce sites where products have variants, or marketing campaigns with tracking parameters. <em>One cached copy serves many URLs</em>.</p>
  <p class="detail-highlight">📈 <strong>The magic:</strong> Dramatically higher cache hit rates. More requests served from cache = faster site + lower origin server load.</p>`,

  prefetch_preload: `<p><strong>What if your site could predict the future?</strong> Prefetch analyzes your pages and <em>starts loading the next likely resources</em> before visitors even click.</p>
  <p>Hover over a link? The page is already loading. Click and it appears instantly. It's like having a psychic assistant fetching things before you ask.</p>
  <p class="detail-highlight">🔮 <strong>The magic:</strong> Navigation feels telepathic. Pages appear to load in zero time because they were already fetched in the background.</p>`,

  // ===== SSL/TLS =====
  always_use_https: `<p><strong>HTTP is like sending postcards—anyone can read them.</strong> HTTPS is like sending sealed letters. This setting ensures ALL your visitors use the sealed envelope version.</p>
  <p>Any visitor typing "http://yoursite.com" is <em>automatically redirected</em> to "https://yoursite.com". No mixed signals, no security warnings, no eavesdropping possible.</p>
  <p class="detail-highlight">🔒 <strong>The magic:</strong> Every connection is encrypted. Google ranks you higher. Browsers show the reassuring padlock. Visitors trust you more.</p>`,

  tls_1_3: `<p><strong>TLS 1.3 is like upgrading from a combination lock to fingerprint recognition.</strong> It's the newest, fastest, most secure way to encrypt connections—and it's significantly quicker to establish.</p>
  <p>The handshake (setup) takes <em>one round trip instead of two</em>. Plus, it removes old vulnerable features that hackers could exploit in previous versions.</p>
  <p class="detail-highlight">🚀 <strong>The magic:</strong> Faster secure connections. Stronger encryption. Protection against downgrade attacks. The gold standard of web security.</p>`,

  opportunistic_encryption: `<p><strong>Some visitors or systems might request HTTP</strong> (unencrypted) even though HTTPS is available. Opportunistic Encryption says "let's encrypt anyway, just in case."</p>
  <p>It adds encryption <em>even when not explicitly requested</em>. Like a bartender who serves drinks in clean glasses even if you didn't specifically ask for clean glasses.</p>
  <p class="detail-highlight">🛡️ <strong>The magic:</strong> More encrypted connections, fewer exposed sessions. A safety net for the encryption-unaware. Better protection for everyone.</p>`,

  automatic_https_rewrites: `<p><strong>"Mixed content" is when a secure page loads insecure resources.</strong> Imagine a bank vault with a screen door—the https page is secure, but that http image creates a hole.</p>
  <p>Automatic HTTPS Rewrites <em>fixes these links on the fly</em>. When your page references "http://example.com/image.jpg", Cloudflare changes it to "https://" automatically.</p>
  <p class="detail-highlight">✨ <strong>The magic:</strong> No more mixed content warnings. No broken padlocks. Your secure page stays fully secure, even with legacy content.</p>`,

  min_tls_version: `<p><strong>Old encryption is like an old lock—experts know how to pick it.</strong> TLS 1.0 and 1.1 have known vulnerabilities. Requiring TLS 1.2+ means only modern, secure connections are allowed.</p>
  <p>Yes, some ancient browsers won't connect. But those browsers have <em>far bigger security problems</em> than your website. You're protecting users from themselves.</p>
  <p class="detail-highlight">🔐 <strong>The magic:</strong> Compliance with PCI DSS and modern security standards. Only secure encryption allowed. No weak links.</p>`,
};

// Simple visualization generator for consistent look
const createSimpleViz = (
  emoji: string,
  stat1: string,
  stat1Label: string,
  stat2: string,
  stat2Label: string,
  bottomText: string
): string => `
  <div class="visualization simple-viz">
    <div class="viz-container">
      <div class="viz-emoji">${emoji}</div>
      <div class="viz-stats">
        <div class="viz-stat">
          <span class="viz-stat-value">${stat1}</span>
          <span class="viz-stat-label">${stat1Label}</span>
        </div>
        <div class="viz-stat">
          <span class="viz-stat-value">${stat2}</span>
          <span class="viz-stat-label">${stat2Label}</span>
        </div>
      </div>
      <div class="viz-bottom-text">${bottomText}</div>
    </div>
  </div>
`;

// AHA Moment Visualization SVGs - These are the futuristic animated graphics
const VISUALIZATIONS: Record<string, string> = {
  // ===== SECURITY =====
  security_level: createSimpleViz(
    "🛡️",
    "5sec",
    "Challenge Time",
    "99.9%",
    "Bots Blocked",
    "Visitors see a brief security check → Your site stays online during attacks"
  ),

  hotlink_protection: createSimpleViz(
    "🔐",
    "100%",
    "Bandwidth Saved",
    "0",
    "Stolen Images",
    "Your images → Your bandwidth → Your visitors only"
  ),

  email_obfuscation: createSimpleViz(
    "📧",
    "0",
    "Harvested Emails",
    "100%",
    "Human Readable",
    "Bots see: j&#x61;ne&#64;... → Humans see: jane@example.com"
  ),

  browser_check: createSimpleViz(
    "🔍",
    "< 1ms",
    "Check Time",
    "∞",
    "Bots Blocked",
    "Valid browser headers pass instantly → Malformed requests blocked"
  ),

  server_side_exclude: createSimpleViz(
    "👁️",
    "VIP",
    "Content Protected",
    "100%",
    "Threat Visibility",
    "Good visitors see all → Suspicious visitors see [hidden]"
  ),

  // ===== NETWORK =====
  ipv6: createSimpleViz(
    "🌐",
    "340T",
    "Addresses Available",
    "∞",
    "Future-Proof",
    "IPv4: 4 billion addresses (exhausted) → IPv6: Unlimited growth"
  ),

  websockets: createSimpleViz(
    "🔌",
    "< 1ms",
    "Latency",
    "∞",
    "Messages/sec",
    "HTTP: Request → Wait → Response → Repeat | WebSocket: Instant two-way"
  ),

  http3: createSimpleViz(
    "⚡",
    "0-RTT",
    "Connection Setup",
    "30%",
    "Faster on Mobile",
    "HTTP/2: Stalls on packet loss → HTTP/3: Streams independently"
  ),

  ip_geolocation: createSimpleViz(
    "📍",
    "195+",
    "Countries Detected",
    "100%",
    "Accuracy",
    "Every request includes: CF-IPCountry: US, GB, DE, JP..."
  ),

  pseudo_ipv4: createSimpleViz(
    "🔄",
    "100%",
    "IPv6 Compatible",
    "100%",
    "Legacy Support",
    "IPv6 visitor → Pseudo IPv4 header → Legacy systems work"
  ),

  // ===== CACHING =====
  development_mode: createSimpleViz(
    "🔧",
    "3hrs",
    "Duration",
    "0%",
    "Cache Used",
    "Cache bypassed → See changes instantly → Auto-resumes"
  ),

  always_online: createSimpleViz(
    "🌟",
    "100%",
    "Uptime Appearance",
    "0",
    "Error Pages Shown",
    "Server down → Cached version served → Visitors happy"
  ),

  browser_cache_ttl: createSimpleViz(
    "⏱️",
    "0ms",
    "Network Time",
    "100%",
    "Local Cache",
    "First visit: Download → Return visits: Instant from device"
  ),

  cache_level: createSimpleViz(
    "📈",
    "90%+",
    "Cache Hit Rate",
    "10x",
    "Less Server Load",
    "?ref=a, ?ref=b, ?ref=c → All served from ONE cached copy"
  ),

  prefetch_preload: createSimpleViz(
    "🔮",
    "0ms",
    "Perceived Load Time",
    "100%",
    "Pre-fetched",
    "Hover → Already loading → Click → Instant appearance"
  ),

  // ===== SSL/TLS =====
  always_use_https: createSimpleViz(
    "🔒",
    "100%",
    "Encrypted",
    "A+",
    "SSL Rating",
    "http://site.com → Redirects → https://site.com 🔒"
  ),

  tls_1_3: createSimpleViz(
    "🚀",
    "1-RTT",
    "Handshake",
    "100%",
    "Forward Secrecy",
    "TLS 1.2: 2 round trips → TLS 1.3: 1 round trip (or 0-RTT!)"
  ),

  opportunistic_encryption: createSimpleViz(
    "🛡️",
    "100%",
    "Opportunistic",
    "0",
    "Exposed Sessions",
    "HTTP request → Encrypted anyway → Better than nothing"
  ),

  automatic_https_rewrites: createSimpleViz(
    "✨",
    "0",
    "Mixed Content",
    "100%",
    "Links Fixed",
    "http://img.jpg → https://img.jpg (automatic)"
  ),

  min_tls_version: createSimpleViz(
    "🔐",
    "TLS 1.2+",
    "Minimum",
    "100%",
    "PCI Compliant",
    "TLS 1.0 ❌ | TLS 1.1 ❌ | TLS 1.2 ✅ | TLS 1.3 ✅"
  ),

  rocket_loader: `
    <div class="visualization rocket-loader-viz">
      <div class="viz-container">
        <!-- Timeline comparison -->
        <div class="timeline-compare">
          <div class="timeline-section">
            <div class="timeline-label">Without Rocket Loader</div>
            <div class="timeline-bar slow">
              <div class="timeline-segment js-block">
                <span>⏳ JS Loading...</span>
              </div>
              <div class="timeline-segment content-wait">
                <span>Content</span>
              </div>
            </div>
            <div class="timeline-time">~3.2s to see content</div>
          </div>
          
          <div class="timeline-section">
            <div class="timeline-label">With Rocket Loader</div>
            <div class="timeline-bar fast">
              <div class="timeline-segment content-first">
                <span>Content</span>
              </div>
              <div class="timeline-segment js-defer">
                <span>JS (deferred)</span>
              </div>
            </div>
            <div class="timeline-time">~0.8s to see content</div>
          </div>
        </div>
        
        <!-- Animated Rocket -->
        <div class="rocket-animation">
          <div class="rocket-trail"></div>
          <div class="rocket-icon">
            <svg viewBox="0 0 64 64" class="rocket-svg">
              <defs>
                <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#F48120"/>
                  <stop offset="100%" style="stop-color:#ff6b00"/>
                </linearGradient>
              </defs>
              <path d="M32 4 L40 20 L40 44 L36 52 L28 52 L24 44 L24 20 Z" fill="url(#rocketGrad)"/>
              <ellipse cx="32" cy="28" rx="4" ry="6" fill="#fff" opacity="0.9"/>
              <path d="M24 32 L16 40 L20 44 L24 40 Z" fill="url(#rocketGrad)" opacity="0.8"/>
              <path d="M40 32 L48 40 L44 44 L40 40 Z" fill="url(#rocketGrad)" opacity="0.8"/>
              <path d="M28 52 L32 64 L36 52 Z" fill="#ff4444" class="flame"/>
            </svg>
          </div>
          <div class="speed-lines">
            <div class="speed-line"></div>
            <div class="speed-line"></div>
            <div class="speed-line"></div>
          </div>
        </div>
        
        <!-- Browser mockup showing instant content -->
        <div class="browser-mockup">
          <div class="browser-bar">
            <div class="browser-dots">
              <span></span><span></span><span></span>
            </div>
            <div class="browser-url">yoursite.com</div>
          </div>
          <div class="browser-content">
            <div class="content-block header-block"></div>
            <div class="content-block nav-block"></div>
            <div class="content-block hero-block"></div>
            <div class="content-block text-block"></div>
            <div class="js-indicator">
              <span class="js-loading">JS Loading...</span>
              <span class="js-done">✓ JS Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  minify_js: `
    <div class="visualization minify-viz">
      <div class="viz-container">
        <!-- Code transformation animation -->
        <div class="code-transform">
          <div class="code-block before">
            <div class="code-label">Before Minification</div>
            <pre class="code-content">
<span class="keyword">function</span> <span class="fn">calculateTotal</span>(items) {
  <span class="comment">// Loop through items</span>
  <span class="keyword">let</span> total = <span class="num">0</span>;
  
  <span class="keyword">for</span> (<span class="keyword">let</span> i = <span class="num">0</span>; i < items.length; i++) {
    total += items[i].price;
  }
  
  <span class="keyword">return</span> total;
}</pre>
            <div class="file-size">2.4 KB</div>
          </div>
          
          <div class="transform-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>Minify</span>
          </div>
          
          <div class="code-block after">
            <div class="code-label">After Minification</div>
            <pre class="code-content"><span class="keyword">function</span> <span class="fn">calculateTotal</span>(t){<span class="keyword">let</span> e=<span class="num">0</span>;<span class="keyword">for</span>(<span class="keyword">let</span> n=<span class="num">0</span>;n<t.length;n++)e+=t[n].price;<span class="keyword">return</span> e}</pre>
            <div class="file-size">0.9 KB <span class="savings">-62%</span></div>
          </div>
        </div>
        
        <!-- Size comparison bars -->
        <div class="size-bars">
          <div class="size-bar-row">
            <span class="bar-label">Original</span>
            <div class="bar-container">
              <div class="bar-fill original"></div>
            </div>
            <span class="bar-value">100%</span>
          </div>
          <div class="size-bar-row">
            <span class="bar-label">Minified</span>
            <div class="bar-container">
              <div class="bar-fill minified"></div>
            </div>
            <span class="bar-value">38%</span>
          </div>
        </div>
      </div>
    </div>
  `,

  minify_css: `
    <div class="visualization minify-css-viz">
      <div class="viz-container">
        <!-- Style transformation -->
        <div class="style-transform">
          <div class="style-block before">
            <div class="style-label">Verbose CSS</div>
            <div class="style-content">
              <div class="css-rule">
                <span class="selector">.button</span> {
                <div class="props">
                  <span class="prop">margin-top</span>: <span class="val">10px</span>;
                  <span class="prop">margin-right</span>: <span class="val">10px</span>;
                  <span class="prop">margin-bottom</span>: <span class="val">10px</span>;
                  <span class="prop">margin-left</span>: <span class="val">10px</span>;
                </div>
                }
              </div>
            </div>
          </div>
          
          <div class="style-arrow">
            <div class="compression-wave"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          
          <div class="style-block after">
            <div class="style-label">Minified CSS</div>
            <div class="style-content compact">
              <span class="selector">.button</span>{<span class="prop">margin</span>:<span class="val">10px</span>}
            </div>
          </div>
        </div>
        
        <!-- Visual button demo -->
        <div class="button-demo">
          <div class="demo-label">Same Result, Smaller Code</div>
          <button class="demo-button">Click Me</button>
          <div class="demo-stats">
            <span class="stat">96 chars → 21 chars</span>
            <span class="stat highlight">78% smaller</span>
          </div>
        </div>
      </div>
    </div>
  `,

  brotli: `
    <div class="visualization brotli-viz">
      <div class="viz-container">
        <!-- Compression visualization -->
        <div class="compression-demo">
          <div class="data-cube original">
            <div class="cube-face front">
              <div class="data-blocks">
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
              </div>
            </div>
            <div class="cube-label">Original<br/><strong>100 KB</strong></div>
          </div>
          
          <div class="compression-arrow">
            <div class="arrow-body">
              <div class="compression-particles">
                <span class="particle"></span>
                <span class="particle"></span>
                <span class="particle"></span>
                <span class="particle"></span>
              </div>
            </div>
            <div class="arrow-label">Brotli Compression</div>
          </div>
          
          <div class="data-cube compressed">
            <div class="cube-face front">
              <div class="data-blocks compressed">
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
              </div>
            </div>
            <div class="cube-label">Compressed<br/><strong>22 KB</strong></div>
          </div>
        </div>
        
        <!-- Transfer animation -->
        <div class="transfer-demo">
          <div class="server-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="8" rx="2" fill="currentColor"/>
              <rect x="2" y="14" width="20" height="8" rx="2" fill="currentColor"/>
              <circle cx="6" cy="6" r="1.5" fill="#22c55e"/>
              <circle cx="6" cy="18" r="1.5" fill="#22c55e"/>
            </svg>
            <span>Server</span>
          </div>
          
          <div class="transfer-line">
            <div class="data-packet packet-1"></div>
            <div class="data-packet packet-2"></div>
            <div class="data-packet packet-3"></div>
          </div>
          
          <div class="browser-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="3" width="20" height="18" rx="2" fill="currentColor"/>
              <line x1="2" y1="8" x2="22" y2="8" stroke="var(--bg-card)" stroke-width="2"/>
              <circle cx="5" cy="5.5" r="1" fill="#ef4444"/>
              <circle cx="8" cy="5.5" r="1" fill="#eab308"/>
              <circle cx="11" cy="5.5" r="1" fill="#22c55e"/>
            </svg>
            <span>Browser</span>
          </div>
        </div>
        
        <div class="brotli-stats">
          <div class="stat-item">
            <span class="stat-value">78%</span>
            <span class="stat-label">Compression</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">4x</span>
            <span class="stat-label">Faster Transfer</span>
          </div>
        </div>
      </div>
    </div>
  `,

  early_hints: `
    <div class="visualization early-hints-viz">
      <div class="viz-container">
        <!-- Sequence diagram -->
        <div class="sequence-diagram">
          <div class="actor browser-actor">
            <div class="actor-icon">🌐</div>
            <span>Browser</span>
          </div>
          
          <div class="sequence-arrows">
            <div class="arrow-row">
              <div class="arrow request">
                <span>Request page</span>
                <div class="arrow-line"></div>
              </div>
            </div>
            
            <div class="arrow-row hint-row">
              <div class="arrow response hint">
                <span>103 Early Hints</span>
                <div class="arrow-line"></div>
                <div class="hint-details">
                  <code>Link: &lt;/style.css&gt;; rel=preload</code>
                  <code>Link: &lt;/font.woff2&gt;; rel=preload</code>
                </div>
              </div>
            </div>
            
            <div class="parallel-section">
              <div class="parallel-label">⚡ Parallel Loading</div>
              <div class="parallel-items">
                <div class="parallel-item">CSS loading...</div>
                <div class="parallel-item">Fonts loading...</div>
                <div class="parallel-item">Server preparing...</div>
              </div>
            </div>
            
            <div class="arrow-row">
              <div class="arrow response final">
                <span>200 Full Response</span>
                <div class="arrow-line"></div>
              </div>
            </div>
            
            <div class="result-row">
              <div class="result-badge">✓ Resources already loaded!</div>
            </div>
          </div>
          
          <div class="actor server-actor">
            <div class="actor-icon">⚙️</div>
            <span>Server</span>
          </div>
        </div>
        
        <!-- Time savings -->
        <div class="time-savings">
          <div class="time-bar without">
            <span class="bar-label">Without Early Hints</span>
            <div class="time-segments">
              <div class="segment wait">Wait</div>
              <div class="segment load">Load CSS</div>
              <div class="segment load">Load Fonts</div>
              <div class="segment render">Render</div>
            </div>
            <span class="total-time">2.1s</span>
          </div>
          
          <div class="time-bar with">
            <span class="bar-label">With Early Hints</span>
            <div class="time-segments">
              <div class="segment parallel">
                <span>Parallel</span>
                <div class="sub-segment">CSS</div>
                <div class="sub-segment">Fonts</div>
              </div>
              <div class="segment render fast">Render</div>
            </div>
            <span class="total-time">0.9s</span>
          </div>
          
          <div class="savings-badge">57% faster page load!</div>
        </div>
      </div>
    </div>
  `,
};

// Question mark icon SVG
const QUESTION_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

// Escape HTML to prevent XSS
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export interface EnhancedToggleSectionProps {
  optimizations?: EnhancedOptimization[];
}

export function EnhancedToggleSection(props: EnhancedToggleSectionProps = {}): string {
  const { optimizations = [] } = props;

  if (optimizations.length === 0) {
    return "";
  }

  return `
    <div class="enhanced-optimization-list">
      ${optimizations
        .map((opt) => {
          const featureIcon = FEATURE_ICONS[opt.id] || FEATURE_ICONS.rocket_loader;
          const detailedDesc =
            DETAILED_DESCRIPTIONS[opt.id] || `<p>${escapeHtml(opt.description)}</p>`;
          const visualization = VISUALIZATIONS[opt.id] || "";

          return `
          <div class="enhanced-optimization-item" data-optimization="${escapeHtml(opt.id)}">
            <!-- Main Row -->
            <div class="optimization-main-row">
              <!-- Feature Icon -->
              <div class="feature-icon">
                ${featureIcon}
              </div>
              
              <!-- Content -->
              <div class="optimization-content">
                <div class="optimization-title-row">
                  <span class="optimization-title">${escapeHtml(opt.title)}</span>
                </div>
                <div class="optimization-description">${escapeHtml(opt.description)}</div>
                ${opt.currentLabel ? `<div class="optimization-value">${escapeHtml(opt.currentLabel)}</div>` : ""}
              </div>
              
              <!-- Info Button - Expands accordion -->
              <button class="expand-btn" aria-expanded="false" aria-label="Learn more about ${escapeHtml(opt.title)}">
                ${QUESTION_ICON}
              </button>
              
              <!-- Toggle -->
              <label class="toggle-container">
                <input type="checkbox" class="toggle-input" ${opt.enabled ? "checked" : ""} data-optimization-id="${escapeHtml(opt.id)}">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <!-- Accordion Content (Hidden by default) -->
            <div class="optimization-accordion" aria-hidden="true">
              <div class="accordion-inner">
                <!-- Detailed Description -->
                <div class="detailed-description">
                  ${detailedDesc}
                </div>
                
                <!-- AHA Moment Visualization -->
                <div class="aha-visualization">
                  <div class="viz-header">
                    <span class="viz-label">✨ Visual Explanation</span>
                  </div>
                  ${visualization}
                </div>
              </div>
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}
