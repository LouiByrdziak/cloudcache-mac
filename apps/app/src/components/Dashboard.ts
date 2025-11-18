import { ToggleSection, type Optimization } from './ToggleSection';

export interface DashboardProps {
  content?: string;
  title?: string;
  storeName?: string;
  planName?: string;
  connectButtonText?: string;
  optimizations?: Optimization[];
}

export function Dashboard(props: DashboardProps = {}): string {
  const { 
    content,
    title,
    storeName,
    planName,
    connectButtonText,
    optimizations = []
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
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Otherwise build from props
  const parts: string[] = [];
  
  if (title) {
    parts.push(`<h1>${escapeHtml(title)}</h1>`);
  }
  
  if (storeName) {
    parts.push(`<div class="store-info">Store: ${escapeHtml(storeName)}</div>`);
  }
  
  if (planName) {
    parts.push(`<div class="plan-info">Current Plan: ${escapeHtml(planName)}</div>`);
  }
  
  if (connectButtonText) {
    parts.push(`<button class="connect-button">${escapeHtml(connectButtonText)}</button>`);
  }
  
  const toggleSection = ToggleSection({ optimizations });
  
  return `
    <div class="container">
      ${parts.join('')}
      ${toggleSection}
    </div>
  `;
}
