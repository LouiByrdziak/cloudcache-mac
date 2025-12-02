/**
 * Page configurations for Cloudcache Dashboard
 * Each page contains 5 toggles that control Cloudflare zone settings
 */

export interface ToggleConfig {
  id: string;
  title: string;
  description: string;
  cfSettingName: string; // Cloudflare API setting name
  valueType: "on_off" | "boolean" | "string" | "ttl"; // How the value is sent to CF API
  controlType?: "toggle" | "slider"; // UI control type (default: toggle)
  options?: { value: number | string; label: string }[]; // Options for slider control
}

export interface PageConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  navText: string;
  navSubtext: string;
  toggles: ToggleConfig[];
}

// Navigation items for sidebar
export const NAV_ITEMS = [
  {
    id: "performance",
    text: "Performance",
    icon: "⚡",
    href: "/",
    subtext: "Speed & Optimization",
  },
  { id: "security", text: "Security", icon: "🛡️", href: "/security", subtext: "Protection Rules" },
  { id: "network", text: "Network", icon: "🌐", href: "/network", subtext: "Protocol Settings" },
  { id: "caching", text: "Caching", icon: "💾", href: "/caching", subtext: "Cache Controls" },
  { id: "ssl", text: "SSL/TLS", icon: "🔒", href: "/ssl", subtext: "Encryption Settings" },
  { id: "analytics", text: "Analytics", icon: "📊", href: "/analytics", subtext: "Traffic & Insights" },
];

// Page configurations with their toggles
export const PAGE_CONFIGS: Record<string, PageConfig> = {
  "/": {
    id: "performance",
    title: "Performance",
    subtitle: "Optimize your site's speed and loading times with these Cloudflare settings.",
    icon: "⚡",
    href: "/",
    navText: "Performance",
    navSubtext: "Speed & Optimization",
    toggles: [
      {
        id: "rocket_loader",
        title: "Rocket Loader",
        description:
          "Improve paint times for pages that include JavaScript by deferring their loading until after rendering.",
        cfSettingName: "rocket_loader",
        valueType: "on_off",
      },
      {
        id: "minify_js",
        title: "Minify JavaScript",
        description:
          "Reduce JavaScript file sizes by removing unnecessary characters and whitespace.",
        cfSettingName: "minify",
        valueType: "on_off",
      },
      {
        id: "minify_css",
        title: "Minify CSS",
        description: "Reduce CSS file sizes by removing unnecessary characters and whitespace.",
        cfSettingName: "minify",
        valueType: "on_off",
      },
      {
        id: "brotli",
        title: "Brotli Compression",
        description:
          "Enable Brotli compression to reduce file sizes and improve load times for supported browsers.",
        cfSettingName: "brotli",
        valueType: "on_off",
      },
      {
        id: "early_hints",
        title: "Early Hints",
        description:
          "Send 103 Early Hints responses to preload resources before the main response arrives.",
        cfSettingName: "early_hints",
        valueType: "on_off",
      },
    ],
  },
  "/security": {
    id: "security",
    title: "Security",
    subtitle: "Protect your site from attacks and malicious traffic with these security features.",
    icon: "🛡️",
    href: "/security",
    navText: "Security",
    navSubtext: "Protection Rules",
    toggles: [
      {
        id: "security_level",
        title: "I'm Under Attack Mode",
        description:
          "Display an interstitial page to visitors while Cloudflare analyzes traffic to stop DDoS attacks.",
        cfSettingName: "security_level",
        valueType: "string",
      },
      {
        id: "hotlink_protection",
        title: "Hotlink Protection",
        description:
          "Prevent other websites from linking directly to your images and consuming your bandwidth.",
        cfSettingName: "hotlink_protection",
        valueType: "on_off",
      },
      {
        id: "email_obfuscation",
        title: "Email Obfuscation",
        description:
          "Protect email addresses on your site from bots and scrapers by obfuscating them.",
        cfSettingName: "email_obfuscation",
        valueType: "on_off",
      },
      {
        id: "browser_check",
        title: "Browser Integrity Check",
        description:
          "Evaluate HTTP headers from visitors to eliminate bots and crawlers with bad intent.",
        cfSettingName: "browser_check",
        valueType: "on_off",
      },
      {
        id: "server_side_exclude",
        title: "Server-side Excludes",
        description:
          "Automatically hide specific content from suspicious visitors to protect sensitive data.",
        cfSettingName: "server_side_exclude",
        valueType: "on_off",
      },
    ],
  },
  "/network": {
    id: "network",
    title: "Network",
    subtitle: "Configure network protocols and connection settings for optimal performance.",
    icon: "🌐",
    href: "/network",
    navText: "Network",
    navSubtext: "Protocol Settings",
    toggles: [
      {
        id: "ipv6",
        title: "IPv6 Compatibility",
        description:
          "Enable IPv6 support to allow visitors with IPv6 addresses to connect to your site.",
        cfSettingName: "ipv6",
        valueType: "on_off",
      },
      {
        id: "websockets",
        title: "WebSockets",
        description:
          "Allow WebSocket connections to your origin server for real-time communication.",
        cfSettingName: "websockets",
        valueType: "on_off",
      },
      {
        id: "http3",
        title: "HTTP/3 (QUIC)",
        description: "Enable HTTP/3 with QUIC protocol for faster, more reliable connections.",
        cfSettingName: "http3",
        valueType: "on_off",
      },
      {
        id: "ip_geolocation",
        title: "IP Geolocation",
        description:
          "Add a header containing the visitor's country code to all requests to your origin.",
        cfSettingName: "ip_geolocation",
        valueType: "on_off",
      },
      {
        id: "pseudo_ipv4",
        title: "Pseudo IPv4",
        description: "Add a header with a Class E IPv4 address for IPv6-only clients.",
        cfSettingName: "pseudo_ipv4",
        valueType: "on_off",
      },
    ],
  },
  "/caching": {
    id: "caching",
    title: "Caching",
    subtitle: "Control how Cloudflare caches your content for faster delivery worldwide.",
    icon: "💾",
    href: "/caching",
    navText: "Caching",
    navSubtext: "Cache Controls",
    toggles: [
      {
        id: "development_mode",
        title: "Development Mode",
        description:
          "Temporarily bypass Cloudflare's cache to see changes immediately during development.",
        cfSettingName: "development_mode",
        valueType: "on_off",
      },
      {
        id: "always_online",
        title: "Always Online",
        description: "Serve cached pages to visitors when your origin server is unavailable.",
        cfSettingName: "always_online",
        valueType: "on_off",
      },
      {
        id: "browser_cache_ttl",
        title: "Browser Cache TTL",
        description:
          "Control how long browsers cache static resources before requesting them from Cloudflare again.",
        cfSettingName: "browser_cache_ttl",
        valueType: "ttl",
        controlType: "slider",
        options: [
          { value: 0, label: "Respect Existing Headers" },
          { value: 1800, label: "30 minutes" },
          { value: 3600, label: "1 hour" },
          { value: 7200, label: "2 hours" },
          { value: 14400, label: "4 hours" },
          { value: 28800, label: "8 hours" },
          { value: 57600, label: "16 hours" },
          { value: 86400, label: "1 day" },
          { value: 172800, label: "2 days" },
          { value: 259200, label: "3 days" },
          { value: 345600, label: "4 days" },
          { value: 432000, label: "5 days" },
          { value: 691200, label: "8 days" },
          { value: 1382400, label: "16 days" },
          { value: 2678400, label: "1 month" },
          { value: 5356800, label: "2 months" },
          { value: 16070400, label: "6 months" },
          { value: 31536000, label: "1 year" },
        ],
      },
      {
        id: "cache_level",
        title: "Aggressive Caching",
        description: "Cache static content more aggressively, including URLs with query strings.",
        cfSettingName: "cache_level",
        valueType: "string",
      },
      {
        id: "prefetch_preload",
        title: "Prefetch & Preload",
        description: "Preload resources before they're needed to speed up subsequent page loads.",
        cfSettingName: "prefetch_preload",
        valueType: "on_off",
      },
    ],
  },
  "/ssl": {
    id: "ssl",
    title: "SSL/TLS",
    subtitle: "Configure encryption settings to secure connections between visitors and your site.",
    icon: "🔒",
    href: "/ssl",
    navText: "SSL/TLS",
    navSubtext: "Encryption Settings",
    toggles: [
      {
        id: "always_use_https",
        title: "Always Use HTTPS",
        description: "Redirect all HTTP requests to HTTPS for improved security and SEO.",
        cfSettingName: "always_use_https",
        valueType: "on_off",
      },
      {
        id: "tls_1_3",
        title: "TLS 1.3",
        description: "Enable the latest TLS protocol for faster and more secure connections.",
        cfSettingName: "tls_1_3",
        valueType: "on_off",
      },
      {
        id: "opportunistic_encryption",
        title: "Opportunistic Encryption",
        description: "Allow browsers to access HTTP URLs over an encrypted TLS channel.",
        cfSettingName: "opportunistic_encryption",
        valueType: "on_off",
      },
      {
        id: "automatic_https_rewrites",
        title: "Automatic HTTPS Rewrites",
        description: "Automatically rewrite HTTP links to HTTPS to prevent mixed content issues.",
        cfSettingName: "automatic_https_rewrites",
        valueType: "on_off",
      },
      {
        id: "min_tls_version",
        title: "Minimum TLS 1.2",
        description: "Require TLS 1.2 or higher for all connections to improve security.",
        cfSettingName: "min_tls_version",
        valueType: "string",
      },
    ],
  },
  "/analytics": {
    id: "analytics",
    title: "Analytics",
    subtitle: "Monitor your site's performance and visitor metrics with Cloudflare analytics.",
    icon: "📊",
    href: "/analytics",
    navText: "Analytics",
    navSubtext: "Traffic & Insights",
    toggles: [
      {
        id: "web_analytics",
        title: "Web Analytics",
        description: "Privacy-first analytics without client-side scripts. Zero impact on page performance.",
        cfSettingName: "web_analytics",
        valueType: "on_off",
      },
      {
        id: "rum",
        title: "Real User Monitoring",
        description: "Collect performance metrics from actual visitors to understand real-world experience.",
        cfSettingName: "rum",
        valueType: "on_off",
      },
      {
        id: "core_web_vitals",
        title: "Core Web Vitals",
        description: "Track LCP, FID, CLS, and INP—the metrics Google uses for page experience ranking.",
        cfSettingName: "core_web_vitals",
        valueType: "on_off",
      },
    ],
  },
};

// Helper to get page config by pathname
export function getPageConfig(pathname: string): PageConfig | undefined {
  return PAGE_CONFIGS[pathname];
}

// Helper to get all toggle IDs and their CF settings
export function getAllToggleConfigs(): Map<string, ToggleConfig> {
  const configs = new Map<string, ToggleConfig>();
  for (const page of Object.values(PAGE_CONFIGS)) {
    for (const toggle of page.toggles) {
      configs.set(toggle.id, toggle);
    }
  }
  return configs;
}
