export interface Optimization {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface ToggleSectionProps {
  optimizations?: Optimization[];
}

export function ToggleSection(props: ToggleSectionProps = {}): string {
  const { optimizations = [] } = props;
  
  // If no optimizations provided, return empty string (component not used)
  if (optimizations.length === 0) {
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
    <div class="optimization-list">
      ${optimizations.map(opt => `
        <div class="optimization-item">
          <div class="optimization-content">
            <div class="optimization-title">${escapeHtml(opt.title || '')}</div>
            <div class="optimization-description">${escapeHtml(opt.description || '')}</div>
          </div>
          <label class="toggle-container">
            <input type="checkbox" class="toggle-input" ${opt.enabled ? 'checked' : ''} data-optimization-id="${escapeHtml(opt.id || '')}">
            <span class="toggle-slider"></span>
          </label>
        </div>
      `).join('')}
    </div>
  `;
}
