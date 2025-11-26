/**
 * Enhanced Toggle Section with Accordion Details & AHA Moment Visualizations
 *
 * Features:
 * - Small icon beside each toggle title
 * - Question mark icon that expands accordion
 * - Humanized technical descriptions
 * - Futuristic animated visualizations showing what each feature does
 */

export interface EnhancedOptimization {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  controlType?: "toggle" | "slider";
  options?: { value: number | string; label: string }[];
  currentValue?: number | string | null;
  currentLabel?: string | null;
}

// Feature icons for each toggle
const FEATURE_ICONS: Record<string, string> = {
  rocket_loader: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  minify_js: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  minify_css: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
  brotli: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  early_hints: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};

// Humanized detailed descriptions
const DETAILED_DESCRIPTIONS: Record<string, string> = {
  rocket_loader: `<p><strong>Imagine your webpage as a race car.</strong> Without Rocket Loader, your car has to wait at the starting line while all the complex engine parts (JavaScript) get assembled. Visitors stare at a blank screen.</p>
  <p>With Rocket Loader, your car <em>rockets off immediately</em>—showing your beautiful content to visitors while the engine quietly assembles in the background. The page feels instant because people see what matters first: your text, images, and design.</p>
  <p class="detail-highlight">✨ <strong>The magic:</strong> JavaScript is deferred until after the visual content renders, making your First Contentful Paint dramatically faster.</p>`,

  minify_js: `<p><strong>Think of JavaScript files like a book with excessive whitespace.</strong> Every unnecessary space, comment, and line break is like blank pages—they add weight without value.</p>
  <p>Minification is like a master editor condensing your book while keeping every word intact. The story stays the same, but the book becomes <em>significantly lighter</em> to carry (download).</p>
  <p class="detail-highlight">📦 <strong>The magic:</strong> Files shrink by 20-60%, meaning faster downloads and less bandwidth consumption.</p>`,

  minify_css: `<p><strong>Your stylesheet is the fashion guide for your website.</strong> But like fashion notes, it often contains verbose descriptions: <code>margin-top: 10px; margin-right: 10px;</code></p>
  <p>CSS minification is like a fashion shorthand expert who rewrites <em>"top, right, bottom, left all 10 pixels"</em> as simply <code>margin: 10px;</code>. Same style, fewer characters.</p>
  <p class="detail-highlight">🎨 <strong>The magic:</strong> Your site's visual instructions load faster, meaning styles apply sooner and your design appears instantly.</p>`,

  brotli: `<p><strong>Imagine shipping a fully assembled IKEA wardrobe versus flat-packed.</strong> Brotli is like the world's best flat-pack engineer—squeezing your files into the smallest possible package.</p>
  <p>Brotli compression is <em>15-25% more efficient</em> than the older Gzip method. It's like fitting three wardrobes worth of content into the space of two.</p>
  <p class="detail-highlight">🗜️ <strong>The magic:</strong> Files travel across the internet in a compressed format, then expand instantly in the browser. Less data = faster loads.</p>`,

  early_hints: `<p><strong>Imagine ordering at a restaurant.</strong> Normally, you wait for the menu, decide, then wait for food. But what if the waiter brought bread and water <em>while</em> you were still reading the menu?</p>
  <p>Early Hints sends a "103" response before your main page—telling browsers to start loading critical resources (fonts, CSS, key images) <em>immediately</em>, while the server prepares the full response.</p>
  <p class="detail-highlight">⚡ <strong>The magic:</strong> By the time your main page arrives, essential resources are already loaded. It's like time travel for web performance.</p>`,
};

// AHA Moment Visualization SVGs - These are the futuristic animated graphics
const VISUALIZATIONS: Record<string, string> = {
  rocket_loader: `
    <div class="visualization rocket-loader-viz">
      <div class="viz-container">
        <!-- Timeline comparison -->
        <div class="timeline-compare">
          <div class="timeline-section">
            <div class="timeline-label">Without Rocket Loader</div>
            <div class="timeline-bar slow">
              <div class="timeline-segment js-block">
                <span>⏳ JS Loading...</span>
              </div>
              <div class="timeline-segment content-wait">
                <span>Content</span>
              </div>
            </div>
            <div class="timeline-time">~3.2s to see content</div>
          </div>
          
          <div class="timeline-section">
            <div class="timeline-label">With Rocket Loader</div>
            <div class="timeline-bar fast">
              <div class="timeline-segment content-first">
                <span>Content</span>
              </div>
              <div class="timeline-segment js-defer">
                <span>JS (deferred)</span>
              </div>
            </div>
            <div class="timeline-time">~0.8s to see content</div>
          </div>
        </div>
        
        <!-- Animated Rocket -->
        <div class="rocket-animation">
          <div class="rocket-trail"></div>
          <div class="rocket-icon">
            <svg viewBox="0 0 64 64" class="rocket-svg">
              <defs>
                <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#F48120"/>
                  <stop offset="100%" style="stop-color:#ff6b00"/>
                </linearGradient>
              </defs>
              <path d="M32 4 L40 20 L40 44 L36 52 L28 52 L24 44 L24 20 Z" fill="url(#rocketGrad)"/>
              <ellipse cx="32" cy="28" rx="4" ry="6" fill="#fff" opacity="0.9"/>
              <path d="M24 32 L16 40 L20 44 L24 40 Z" fill="url(#rocketGrad)" opacity="0.8"/>
              <path d="M40 32 L48 40 L44 44 L40 40 Z" fill="url(#rocketGrad)" opacity="0.8"/>
              <path d="M28 52 L32 64 L36 52 Z" fill="#ff4444" class="flame"/>
            </svg>
          </div>
          <div class="speed-lines">
            <div class="speed-line"></div>
            <div class="speed-line"></div>
            <div class="speed-line"></div>
          </div>
        </div>
        
        <!-- Browser mockup showing instant content -->
        <div class="browser-mockup">
          <div class="browser-bar">
            <div class="browser-dots">
              <span></span><span></span><span></span>
            </div>
            <div class="browser-url">yoursite.com</div>
          </div>
          <div class="browser-content">
            <div class="content-block header-block"></div>
            <div class="content-block nav-block"></div>
            <div class="content-block hero-block"></div>
            <div class="content-block text-block"></div>
            <div class="js-indicator">
              <span class="js-loading">JS Loading...</span>
              <span class="js-done">✓ JS Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  minify_js: `
    <div class="visualization minify-viz">
      <div class="viz-container">
        <!-- Code transformation animation -->
        <div class="code-transform">
          <div class="code-block before">
            <div class="code-label">Before Minification</div>
            <pre class="code-content">
<span class="keyword">function</span> <span class="fn">calculateTotal</span>(items) {
  <span class="comment">// Loop through items</span>
  <span class="keyword">let</span> total = <span class="num">0</span>;
  
  <span class="keyword">for</span> (<span class="keyword">let</span> i = <span class="num">0</span>; i < items.length; i++) {
    total += items[i].price;
  }
  
  <span class="keyword">return</span> total;
}</pre>
            <div class="file-size">2.4 KB</div>
          </div>
          
          <div class="transform-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>Minify</span>
          </div>
          
          <div class="code-block after">
            <div class="code-label">After Minification</div>
            <pre class="code-content"><span class="keyword">function</span> <span class="fn">calculateTotal</span>(t){<span class="keyword">let</span> e=<span class="num">0</span>;<span class="keyword">for</span>(<span class="keyword">let</span> n=<span class="num">0</span>;n<t.length;n++)e+=t[n].price;<span class="keyword">return</span> e}</pre>
            <div class="file-size">0.9 KB <span class="savings">-62%</span></div>
          </div>
        </div>
        
        <!-- Size comparison bars -->
        <div class="size-bars">
          <div class="size-bar-row">
            <span class="bar-label">Original</span>
            <div class="bar-container">
              <div class="bar-fill original"></div>
            </div>
            <span class="bar-value">100%</span>
          </div>
          <div class="size-bar-row">
            <span class="bar-label">Minified</span>
            <div class="bar-container">
              <div class="bar-fill minified"></div>
            </div>
            <span class="bar-value">38%</span>
          </div>
        </div>
      </div>
    </div>
  `,

  minify_css: `
    <div class="visualization minify-css-viz">
      <div class="viz-container">
        <!-- Style transformation -->
        <div class="style-transform">
          <div class="style-block before">
            <div class="style-label">Verbose CSS</div>
            <div class="style-content">
              <div class="css-rule">
                <span class="selector">.button</span> {
                <div class="props">
                  <span class="prop">margin-top</span>: <span class="val">10px</span>;
                  <span class="prop">margin-right</span>: <span class="val">10px</span>;
                  <span class="prop">margin-bottom</span>: <span class="val">10px</span>;
                  <span class="prop">margin-left</span>: <span class="val">10px</span>;
                </div>
                }
              </div>
            </div>
          </div>
          
          <div class="style-arrow">
            <div class="compression-wave"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          
          <div class="style-block after">
            <div class="style-label">Minified CSS</div>
            <div class="style-content compact">
              <span class="selector">.button</span>{<span class="prop">margin</span>:<span class="val">10px</span>}
            </div>
          </div>
        </div>
        
        <!-- Visual button demo -->
        <div class="button-demo">
          <div class="demo-label">Same Result, Smaller Code</div>
          <button class="demo-button">Click Me</button>
          <div class="demo-stats">
            <span class="stat">96 chars → 21 chars</span>
            <span class="stat highlight">78% smaller</span>
          </div>
        </div>
      </div>
    </div>
  `,

  brotli: `
    <div class="visualization brotli-viz">
      <div class="viz-container">
        <!-- Compression visualization -->
        <div class="compression-demo">
          <div class="data-cube original">
            <div class="cube-face front">
              <div class="data-blocks">
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
              </div>
            </div>
            <div class="cube-label">Original<br/><strong>100 KB</strong></div>
          </div>
          
          <div class="compression-arrow">
            <div class="arrow-body">
              <div class="compression-particles">
                <span class="particle"></span>
                <span class="particle"></span>
                <span class="particle"></span>
                <span class="particle"></span>
              </div>
            </div>
            <div class="arrow-label">Brotli Compression</div>
          </div>
          
          <div class="data-cube compressed">
            <div class="cube-face front">
              <div class="data-blocks compressed">
                <div class="data-block"></div>
                <div class="data-block"></div>
                <div class="data-block"></div>
              </div>
            </div>
            <div class="cube-label">Compressed<br/><strong>22 KB</strong></div>
          </div>
        </div>
        
        <!-- Transfer animation -->
        <div class="transfer-demo">
          <div class="server-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="20" height="8" rx="2" fill="currentColor"/>
              <rect x="2" y="14" width="20" height="8" rx="2" fill="currentColor"/>
              <circle cx="6" cy="6" r="1.5" fill="#22c55e"/>
              <circle cx="6" cy="18" r="1.5" fill="#22c55e"/>
            </svg>
            <span>Server</span>
          </div>
          
          <div class="transfer-line">
            <div class="data-packet packet-1"></div>
            <div class="data-packet packet-2"></div>
            <div class="data-packet packet-3"></div>
          </div>
          
          <div class="browser-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="3" width="20" height="18" rx="2" fill="currentColor"/>
              <line x1="2" y1="8" x2="22" y2="8" stroke="var(--bg-card)" stroke-width="2"/>
              <circle cx="5" cy="5.5" r="1" fill="#ef4444"/>
              <circle cx="8" cy="5.5" r="1" fill="#eab308"/>
              <circle cx="11" cy="5.5" r="1" fill="#22c55e"/>
            </svg>
            <span>Browser</span>
          </div>
        </div>
        
        <div class="brotli-stats">
          <div class="stat-item">
            <span class="stat-value">78%</span>
            <span class="stat-label">Compression</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">4x</span>
            <span class="stat-label">Faster Transfer</span>
          </div>
        </div>
      </div>
    </div>
  `,

  early_hints: `
    <div class="visualization early-hints-viz">
      <div class="viz-container">
        <!-- Sequence diagram -->
        <div class="sequence-diagram">
          <div class="actor browser-actor">
            <div class="actor-icon">🌐</div>
            <span>Browser</span>
          </div>
          
          <div class="sequence-arrows">
            <div class="arrow-row">
              <div class="arrow request">
                <span>Request page</span>
                <div class="arrow-line"></div>
              </div>
            </div>
            
            <div class="arrow-row hint-row">
              <div class="arrow response hint">
                <span>103 Early Hints</span>
                <div class="arrow-line"></div>
                <div class="hint-details">
                  <code>Link: &lt;/style.css&gt;; rel=preload</code>
                  <code>Link: &lt;/font.woff2&gt;; rel=preload</code>
                </div>
              </div>
            </div>
            
            <div class="parallel-section">
              <div class="parallel-label">⚡ Parallel Loading</div>
              <div class="parallel-items">
                <div class="parallel-item">CSS loading...</div>
                <div class="parallel-item">Fonts loading...</div>
                <div class="parallel-item">Server preparing...</div>
              </div>
            </div>
            
            <div class="arrow-row">
              <div class="arrow response final">
                <span>200 Full Response</span>
                <div class="arrow-line"></div>
              </div>
            </div>
            
            <div class="result-row">
              <div class="result-badge">✓ Resources already loaded!</div>
            </div>
          </div>
          
          <div class="actor server-actor">
            <div class="actor-icon">⚙️</div>
            <span>Server</span>
          </div>
        </div>
        
        <!-- Time savings -->
        <div class="time-savings">
          <div class="time-bar without">
            <span class="bar-label">Without Early Hints</span>
            <div class="time-segments">
              <div class="segment wait">Wait</div>
              <div class="segment load">Load CSS</div>
              <div class="segment load">Load Fonts</div>
              <div class="segment render">Render</div>
            </div>
            <span class="total-time">2.1s</span>
          </div>
          
          <div class="time-bar with">
            <span class="bar-label">With Early Hints</span>
            <div class="time-segments">
              <div class="segment parallel">
                <span>Parallel</span>
                <div class="sub-segment">CSS</div>
                <div class="sub-segment">Fonts</div>
              </div>
              <div class="segment render fast">Render</div>
            </div>
            <span class="total-time">0.9s</span>
          </div>
          
          <div class="savings-badge">57% faster page load!</div>
        </div>
      </div>
    </div>
  `,
};

// Question mark icon SVG
const QUESTION_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

// Escape HTML to prevent XSS
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export interface EnhancedToggleSectionProps {
  optimizations?: EnhancedOptimization[];
}

export function EnhancedToggleSection(props: EnhancedToggleSectionProps = {}): string {
  const { optimizations = [] } = props;

  if (optimizations.length === 0) {
    return "";
  }

  return `
    <div class="enhanced-optimization-list">
      ${optimizations
        .map((opt) => {
          const featureIcon = FEATURE_ICONS[opt.id] || FEATURE_ICONS.rocket_loader;
          const detailedDesc =
            DETAILED_DESCRIPTIONS[opt.id] || `<p>${escapeHtml(opt.description)}</p>`;
          const visualization = VISUALIZATIONS[opt.id] || "";

          return `
          <div class="enhanced-optimization-item" data-optimization="${escapeHtml(opt.id)}">
            <!-- Main Row -->
            <div class="optimization-main-row">
              <!-- Feature Icon -->
              <div class="feature-icon">
                ${featureIcon}
              </div>
              
              <!-- Content -->
              <div class="optimization-content">
                <div class="optimization-title-row">
                  <span class="optimization-title">${escapeHtml(opt.title)}</span>
                </div>
                <div class="optimization-description">${escapeHtml(opt.description)}</div>
                ${opt.currentLabel ? `<div class="optimization-value">${escapeHtml(opt.currentLabel)}</div>` : ""}
              </div>
              
              <!-- Question Mark / Expand Button -->
              <button class="expand-btn" aria-label="Learn more about ${escapeHtml(opt.title)}" aria-expanded="false">
                ${QUESTION_ICON}
              </button>
              
              <!-- Toggle -->
              <label class="toggle-container">
                <input type="checkbox" class="toggle-input" ${opt.enabled ? "checked" : ""} data-optimization-id="${escapeHtml(opt.id)}">
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <!-- Accordion Content (Hidden by default) -->
            <div class="optimization-accordion" aria-hidden="true">
              <div class="accordion-inner">
                <!-- Detailed Description -->
                <div class="detailed-description">
                  ${detailedDesc}
                </div>
                
                <!-- AHA Moment Visualization -->
                <div class="aha-visualization">
                  <div class="viz-header">
                    <span class="viz-label">✨ Visual Explanation</span>
                  </div>
                  ${visualization}
                </div>
              </div>
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}
