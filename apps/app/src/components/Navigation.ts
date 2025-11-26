export interface NavItem {
  id: string;
  text: string;
  subtext?: string;
  href?: string;
  icon?: string;
}

export interface NavigationProps {
  items?: NavItem[];
  activeItem?: string;
  brandTitle?: string;
  brandSubtitle?: string;
}

export function Navigation(props: NavigationProps = {}): string {
  const {
    items = [],
    activeItem,
    brandTitle = "Cloudcache",
    brandSubtitle = "Performance Dashboard",
  } = props;

  // If no items provided, return empty string (component not used)
  if (items.length === 0) {
    return "";
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

  return `
    <nav class="nav">
      <div class="nav-brand">
        <div class="nav-brand-title">${escapeHtml(brandTitle)}</div>
        <div class="nav-brand-subtitle">${escapeHtml(brandSubtitle)}</div>
      </div>
      ${items
        .map(
          (item) => `
        <a href="${escapeHtml(item.href || "#")}" class="nav-item ${item.id === activeItem ? "active" : ""}">
          ${item.icon ? `<span class="nav-item-icon">${item.icon}</span>` : ""}
          <div>
            <div class="nav-item-text">${escapeHtml(item.text || "")}</div>
            ${item.subtext ? `<div class="nav-item-subtext">${escapeHtml(item.subtext)}</div>` : ""}
          </div>
        </a>
      `
        )
        .join("")}
    </nav>
  `;
}
