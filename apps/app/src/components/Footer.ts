export interface FooterProps {
  copyright?: string;
  links?: Array<{ text: string; href: string }>;
}

export function Footer(props: FooterProps = {}): string {
  const { 
    copyright,
    links = []
  } = props;
  
  // If no copyright or links provided, return empty string (component not used)
  if (!copyright && links.length === 0) {
    return '';
  }
  
  return `
    <footer class="footer">
      <div class="footer-content">
        ${links.length > 0 ? `
          <div class="footer-links">
            ${links.map(link => `<a href="${link.href}" class="footer-link">${link.text}</a>`).join('')}
          </div>
        ` : ''}
        ${copyright ? `<div class="footer-copyright">${copyright}</div>` : ''}
      </div>
    </footer>
  `;
}
