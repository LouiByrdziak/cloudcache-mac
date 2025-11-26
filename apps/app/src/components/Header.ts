export interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header(props: HeaderProps = {}): string {
  const {
    title = "Cloudcache",
    subtitle = "Manage your Cloudflare optimizations and workers with simple toggle switches.",
  } = props;

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
    <div class="page-header">
      <h1 class="page-header-title">${escapeHtml(title)}</h1>
      <p class="page-header-subtitle">${escapeHtml(subtitle)}</p>
    </div>
  `;
}
