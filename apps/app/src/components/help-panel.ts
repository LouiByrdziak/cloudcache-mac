/**
 * Help Panel Component
 *
 * Right-side sliding panel for toggle documentation and visualizations.
 * Structure extracted from preview-v3-chunky-toggles-clean-sidebar.html
 *
 * See: .cursor/rules/cloud-preview-design.mdc
 */

import { HelpPanelContent, HELP_PANEL_CONTENT } from "../config/help-panel-content";

export interface HelpPanelProps {
  id: string;
  icon: string;
  title: string;
  content: HelpPanelContent;
}

/**
 * Generate a single help panel HTML
 */
export function HelpPanel({ id, icon, title, content }: HelpPanelProps): string {
  return `
<aside class="panel" id="panel-${id}" role="dialog" aria-modal="true" aria-labelledby="panel-${id}-title">
  <header class="panel__header">
    <div class="panel__icon">${icon}</div>
    <h2 class="panel__title" id="panel-${id}-title">${title}</h2>
    <button class="panel__close" data-close aria-label="Close panel">✕</button>
  </header>
  <div class="panel__body">
    <div class="panel__stack">
      <div>
        <div class="panel__label">The Problem</div>
        <p class="panel__text">${content.problem}</p>
      </div>
      <div>
        <div class="panel__label">The Solution</div>
        <p class="panel__text">${content.solution}</p>
      </div>
      ${
        content.callout
          ? `
      <div class="callout">
        <div class="callout__title">✨ ${content.callout.title}</div>
        <p>${content.callout.text}</p>
      </div>
      `
          : ""
      }
      ${
        content.visual
          ? `
      <div class="visual">
        <div class="visual__label">${content.visual.label}</div>
        ${content.visual.html}
      </div>
      `
          : ""
      }
    </div>
  </div>
</aside>
  `.trim();
}

/**
 * Panel icons by toggle ID
 */
const PANEL_ICONS: Record<string, string> = {
  // Performance
  rocket_loader: "🚀",
  minify_js: "📦",
  minify_css: "🎨",
  brotli: "🗜️",
  early_hints: "⏱️",
  // Security
  security_level: "🛡️",
  hotlink_protection: "🔗",
  email_obfuscation: "📧",
  browser_check: "🔍",
  server_side_exclude: "🚫",
  // Network
  ipv6: "🌐",
  websockets: "⚡",
  http3: "🚀",
  ip_geolocation: "📍",
  pseudo_ipv4: "🔄",
  // Caching
  development_mode: "🔧",
  always_online: "☁️",
  browser_cache_ttl: "⏰",
  cache_level: "📊",
  prefetch_preload: "⏩",
  // SSL/TLS
  always_use_https: "🔒",
  tls_1_3: "🔐",
  opportunistic_encryption: "🔑",
  automatic_https_rewrites: "🔄",
  min_tls_version: "📜",
  // Analytics
  web_analytics: "📈",
  rum: "👁️",
  core_web_vitals: "📊",
};

/**
 * Panel titles by toggle ID
 */
const PANEL_TITLES: Record<string, string> = {
  // Performance
  rocket_loader: "Rocket Loader",
  minify_js: "Minify JavaScript",
  minify_css: "Minify CSS",
  brotli: "Brotli Compression",
  early_hints: "Early Hints",
  // Security
  security_level: "I'm Under Attack Mode",
  hotlink_protection: "Hotlink Protection",
  email_obfuscation: "Email Obfuscation",
  browser_check: "Browser Integrity Check",
  server_side_exclude: "Server-side Excludes",
  // Network
  ipv6: "IPv6 Compatibility",
  websockets: "WebSockets",
  http3: "HTTP/3 (QUIC)",
  ip_geolocation: "IP Geolocation",
  pseudo_ipv4: "Pseudo IPv4",
  // Caching
  development_mode: "Development Mode",
  always_online: "Always Online",
  browser_cache_ttl: "Browser Cache TTL",
  cache_level: "Aggressive Caching",
  prefetch_preload: "Prefetch & Preload",
  // SSL/TLS
  always_use_https: "Always Use HTTPS",
  tls_1_3: "TLS 1.3",
  opportunistic_encryption: "Opportunistic Encryption",
  automatic_https_rewrites: "Automatic HTTPS Rewrites",
  min_tls_version: "Minimum TLS 1.2",
  // Analytics
  web_analytics: "Web Analytics",
  rum: "Real User Monitoring",
  core_web_vitals: "Core Web Vitals",
};

/**
 * Generate all help panels from configuration
 */
export function generateHelpPanels(): string {
  const panels: string[] = [];

  for (const [id, content] of Object.entries(HELP_PANEL_CONTENT)) {
    const icon = PANEL_ICONS[id] || "ℹ️";
    const title = PANEL_TITLES[id] || id;

    panels.push(
      HelpPanel({
        id,
        icon,
        title,
        content,
      })
    );
  }

  return panels.join("\n");
}

/**
 * Generate the backdrop overlay element
 */
export function generateBackdrop(): string {
  return `<div class="backdrop" id="backdrop"></div>`;
}

/**
 * Generate the panel JavaScript for opening/closing panels
 */
export function generatePanelScript(): string {
  return `
// Help Panel Controls
const backdrop = document.getElementById('backdrop');
let activePanel = null, activeCard = null;

function openPanel(id, card) {
  const panel = document.getElementById('panel-' + id);
  if (!panel) return;
  activePanel = panel;
  activeCard = card;
  backdrop.classList.add('active');
  panel.classList.add('active');
  if (card) card.classList.add('active');
  document.body.style.overflow = 'hidden';
  panel.querySelector('.panel__close').focus();
}

function closePanel() {
  if (!activePanel) return;
  backdrop.classList.remove('active');
  activePanel.classList.remove('active');
  if (activeCard) activeCard.classList.remove('active');
  document.body.style.overflow = '';
  if (activeCard) activeCard.querySelector('[data-panel]')?.focus();
  activePanel = null;
  activeCard = null;
}

document.querySelectorAll('[data-panel]').forEach(btn => {
  btn.addEventListener('click', () => openPanel(btn.dataset.panel, btn.closest('.card')));
});

document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closePanel));
backdrop.addEventListener('click', closePanel);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
  `.trim();
}
