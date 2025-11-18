export interface NavItem {
  id: string;
  text: string;
  subtext?: string;
  href?: string;
}

export interface NavigationProps {
  items?: NavItem[];
  activeItem?: string;
}

export function Navigation(props: NavigationProps = {}): string {
  const { items = [], activeItem } = props;
  
  // If no items provided, return empty string (component not used)
  if (items.length === 0) {
    return '';
  }
  
  // Escape HTML to prevent XSS
  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return `
    <nav class="nav">
      ${items.map(item => `
        <a href="${escapeHtml(item.href || '#')}" class="nav-item ${item.id === activeItem ? 'active' : ''}">
          <div class="nav-item-text">${escapeHtml(item.text || '')}</div>
          ${item.subtext ? `<div class="nav-item-subtext">${escapeHtml(item.subtext)}</div>` : ''}
        </a>
      `).join('')}
    </nav>
  `;
}
