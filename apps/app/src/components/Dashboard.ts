import { ToggleSection, type Optimization } from "./ToggleSection";
import { EnhancedToggleSection } from "./EnhancedToggleSection";

export interface PageSpeedData {
  mobile: number | null;
  desktop: number | null;
  lastUpdated?: string;
}

export interface DashboardProps {
  content?: string;
  title?: string;
  subtitle?: string;
  storeName?: string;
  planName?: string;
  connectButtonText?: string;
  optimizations?: Optimization[];
  pageId?: string; // Used to determine which toggle section to render
  pageSpeed?: PageSpeedData; // PageSpeed Insights scores
}

/**
 * Get score color class based on PageSpeed score
 */
function getScoreColorClass(score: number | null): string {
  if (score === null) return "score--unknown";
  if (score >= 90) return "score--good";
  if (score >= 50) return "score--needs-improvement";
  return "score--poor";
}

/**
 * Format last updated time as relative string
 */
function formatLastUpdated(isoDate?: string): string {
  if (!isoDate) return "Never";
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Unknown";
  }
}

export function Dashboard(props: DashboardProps = {}): string {
  const {
    content,
    title,
    subtitle,
    storeName,
    planName,
    connectButtonText,
    optimizations = [],
    pageId,
    pageSpeed,
  } = props;

  // If custom content provided, use it
  if (content) {
    return `
      <div class="container">
        ${content}
      </div>
    `;
  }

  // Escape HTML to prevent XSS
  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Build PageSpeed widget HTML
  let pageSpeedWidget = "";
  if (pageSpeed) {
    const mobileClass = getScoreColorClass(pageSpeed.mobile);
    const desktopClass = getScoreColorClass(pageSpeed.desktop);
    const lastUpdated = formatLastUpdated(pageSpeed.lastUpdated);

    pageSpeedWidget = `
      <div class="pagespeed-widget" title="Last checked: ${escapeHtml(lastUpdated)}">
        <div class="pagespeed-widget__scores">
          <div class="pagespeed-score ${mobileClass}">
            <span class="pagespeed-score__icon">📱</span>
            <span class="pagespeed-score__value">${pageSpeed.mobile ?? "--"}</span>
            <span class="pagespeed-score__label">Mobile</span>
          </div>
          <div class="pagespeed-score ${desktopClass}">
            <span class="pagespeed-score__icon">🖥️</span>
            <span class="pagespeed-score__value">${pageSpeed.desktop ?? "--"}</span>
            <span class="pagespeed-score__label">Desktop</span>
          </div>
        </div>
        <div class="pagespeed-widget__updated">Updated ${escapeHtml(lastUpdated)}</div>
      </div>
    `;
  }

  // Build page header
  let headerHtml = "";
  if (title || subtitle || pageSpeedWidget) {
    headerHtml = `
      <div class="page-header">
        <div class="page-header__left">
          ${title ? `<h1 class="page-title">${escapeHtml(title)}</h1>` : ""}
          ${subtitle ? `<p class="page-subtitle">${escapeHtml(subtitle)}</p>` : ""}
        </div>
        ${pageSpeedWidget ? `<div class="page-header__right">${pageSpeedWidget}</div>` : ""}
      </div>
    `;
  }

  // Build other parts
  const parts: string[] = [];

  if (storeName) {
    parts.push(`<div class="store-info">Store: ${escapeHtml(storeName)}</div>`);
  }

  if (planName) {
    parts.push(`<div class="plan-info">Current Plan: ${escapeHtml(planName)}</div>`);
  }

  if (connectButtonText) {
    parts.push(`<button class="connect-button">${escapeHtml(connectButtonText)}</button>`);
  }

  // Use enhanced toggle section for all main pages with toggles
  const enhancedPages = ["performance", "security", "network", "caching", "ssl"];
  const toggleSection = enhancedPages.includes(pageId || "")
    ? EnhancedToggleSection({ optimizations })
    : ToggleSection({ optimizations });

  return `
    <div class="container">
      ${headerHtml}
      ${parts.join("")}
      ${toggleSection}
    </div>
  `;
}
