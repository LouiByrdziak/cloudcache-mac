import { ToggleSection, type Optimization } from "./ToggleSection";
import { EnhancedToggleSection } from "./EnhancedToggleSection";

export interface DashboardProps {
  content?: string;
  title?: string;
  subtitle?: string;
  storeName?: string;
  planName?: string;
  connectButtonText?: string;
  optimizations?: Optimization[];
  pageId?: string; // Used to determine which toggle section to render
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

  // Build page header
  let headerHtml = "";
  if (title || subtitle) {
    headerHtml = `
      <div class="page-header">
        ${title ? `<h1 class="page-title">${escapeHtml(title)}</h1>` : ""}
        ${subtitle ? `<p class="page-subtitle">${escapeHtml(subtitle)}</p>` : ""}
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
