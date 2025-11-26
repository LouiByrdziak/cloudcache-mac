/**
 * Enhanced Styles for Accordion Toggle Section with AHA Moment Visualizations
 *
 * Features futuristic, animated visualizations for each performance feature
 */

export const enhancedStyles = `
  /* ===== ENHANCED TOGGLE SECTION ===== */
  .enhanced-optimization-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .enhanced-optimization-item {
    background: var(--bg-card);
    border-radius: 20px;
    border: 1px solid var(--border-card);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeInUp 0.4s ease-out backwards;
  }

  .enhanced-optimization-item:nth-child(1) { animation-delay: 0.05s; }
  .enhanced-optimization-item:nth-child(2) { animation-delay: 0.1s; }
  .enhanced-optimization-item:nth-child(3) { animation-delay: 0.15s; }
  .enhanced-optimization-item:nth-child(4) { animation-delay: 0.2s; }
  .enhanced-optimization-item:nth-child(5) { animation-delay: 0.25s; }

  .enhanced-optimization-item:hover {
    border-color: var(--border-card-hover);
    background: var(--bg-card-hover);
  }

  .enhanced-optimization-item.expanded {
    border-color: var(--accent-primary);
    box-shadow: 0 8px 32px rgba(244, 129, 32, 0.15);
  }

  /* Main Row Layout */
  .optimization-main-row {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px 28px;
  }

  /* Feature Icon */
  .feature-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(244, 129, 32, 0.15), rgba(244, 129, 32, 0.05));
    border-radius: 12px;
    color: var(--accent-primary);
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .enhanced-optimization-item:hover .feature-icon {
    background: linear-gradient(135deg, rgba(244, 129, 32, 0.25), rgba(244, 129, 32, 0.1));
    transform: scale(1.05);
  }

  .enhanced-optimization-item.expanded .feature-icon {
    background: var(--accent-primary);
    color: #000;
    transform: scale(1.1);
  }

  .feature-icon svg {
    width: 22px;
    height: 22px;
  }

  /* Expand Button (Question Mark) */
  .expand-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border-card);
    border-radius: 10px;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.25s ease;
    flex-shrink: 0;
  }

  .expand-btn:hover {
    background: var(--bg-card-hover);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
    transform: scale(1.1);
  }

  .enhanced-optimization-item.expanded .expand-btn {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: #000;
    transform: rotate(180deg);
  }

  /* Accordion */
  .optimization-accordion {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .enhanced-optimization-item.expanded .optimization-accordion {
    max-height: 2000px;
  }

  .accordion-inner {
    padding: 0 28px 28px 28px;
    border-top: 1px solid var(--border-card);
    margin-top: 0;
    padding-top: 24px;
  }

  /* Detailed Description */
  .detailed-description {
    margin-bottom: 28px;
  }

  .detailed-description p {
    color: var(--text-secondary);
    font-size: 15px;
    line-height: 1.7;
    margin-bottom: 14px;
  }

  .detailed-description strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  .detailed-description em {
    color: var(--accent-primary);
    font-style: normal;
    font-weight: 500;
  }

  .detailed-description code {
    background: rgba(244, 129, 32, 0.1);
    color: var(--accent-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 13px;
  }

  .detail-highlight {
    background: linear-gradient(135deg, rgba(244, 129, 32, 0.1), rgba(244, 129, 32, 0.05));
    padding: 14px 18px;
    border-radius: 12px;
    border-left: 3px solid var(--accent-primary);
    margin-top: 16px !important;
  }

  /* AHA Visualization Header */
  .aha-visualization {
    background: var(--bg-secondary);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border-color);
  }

  .viz-header {
    padding: 14px 20px;
    background: linear-gradient(135deg, rgba(244, 129, 32, 0.1), transparent);
    border-bottom: 1px solid var(--border-color);
  }

  .viz-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--accent-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ===== VISUALIZATION CONTAINERS ===== */
  .visualization {
    padding: 32px;
  }

  .viz-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* ===== ROCKET LOADER VISUALIZATION ===== */
  .rocket-loader-viz .timeline-compare {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .timeline-section {
    position: relative;
  }

  .timeline-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 10px;
  }

  .timeline-bar {
    display: flex;
    height: 44px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
  }

  .timeline-bar.slow {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
  }

  .timeline-bar.fast {
    background: var(--bg-card);
    border: 1px solid var(--accent-primary);
  }

  .timeline-segment {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .timeline-segment span {
    white-space: nowrap;
    padding: 0 8px;
  }

  .timeline-segment.js-block {
    width: 70%;
    background: linear-gradient(90deg, #ef4444, #dc2626);
    color: #fff;
    animation: pulseRed 2s ease-in-out infinite;
  }

  .timeline-segment.content-wait {
    width: 30%;
    background: var(--bg-card-hover);
    color: var(--text-muted);
    border-left: 1px dashed var(--border-card);
  }

  .timeline-segment.content-first {
    width: 30%;
    background: linear-gradient(90deg, var(--accent-primary), #ff9033);
    color: #000;
    animation: slideInLeft 0.5s ease-out;
  }

  .timeline-segment.js-defer {
    width: 70%;
    background: rgba(244, 129, 32, 0.15);
    color: var(--accent-primary);
    font-style: italic;
  }

  .timeline-time {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 8px;
    text-align: right;
  }

  .timeline-bar.fast + .timeline-time {
    color: var(--success-color);
    font-weight: 600;
  }

  /* Rocket Animation */
  .rocket-animation {
    position: relative;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .rocket-icon {
    position: relative;
    z-index: 2;
    animation: rocketFloat 2s ease-in-out infinite;
  }

  .rocket-svg {
    width: 64px;
    height: 64px;
    filter: drop-shadow(0 4px 12px rgba(244, 129, 32, 0.4));
  }

  .rocket-svg .flame {
    animation: flameFlicker 0.15s ease-in-out infinite;
    transform-origin: center top;
  }

  .rocket-trail {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, 0);
    width: 30px;
    height: 100px;
    background: linear-gradient(to bottom, rgba(244, 129, 32, 0.4), transparent);
    border-radius: 50%;
    animation: trailPulse 0.3s ease-in-out infinite;
  }

  .speed-lines {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 100px;
  }

  .speed-line {
    position: absolute;
    height: 2px;
    background: linear-gradient(to right, transparent, var(--accent-primary), transparent);
    animation: speedLine 1s ease-out infinite;
  }

  .speed-line:nth-child(1) {
    left: 0;
    top: 30%;
    width: 60px;
    animation-delay: 0s;
  }

  .speed-line:nth-child(2) {
    left: 10px;
    top: 50%;
    width: 80px;
    animation-delay: 0.3s;
  }

  .speed-line:nth-child(3) {
    left: 5px;
    top: 70%;
    width: 50px;
    animation-delay: 0.6s;
  }

  /* Browser Mockup */
  .browser-mockup {
    background: var(--bg-card);
    border-radius: 12px;
    border: 1px solid var(--border-card);
    overflow: hidden;
    max-width: 320px;
    margin: 0 auto;
  }

  .browser-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }

  .browser-dots {
    display: flex;
    gap: 6px;
  }

  .browser-dots span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--border-card);
  }

  .browser-dots span:nth-child(1) { background: #ef4444; }
  .browser-dots span:nth-child(2) { background: #eab308; }
  .browser-dots span:nth-child(3) { background: #22c55e; }

  .browser-url {
    flex: 1;
    background: var(--bg-card);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    color: var(--text-muted);
    font-family: 'SF Mono', monospace;
  }

  .browser-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .content-block {
    border-radius: 6px;
    animation: contentLoad 2s ease-out infinite;
  }

  .content-block.header-block {
    height: 24px;
    width: 50%;
    background: var(--accent-primary);
    animation-delay: 0s;
  }

  .content-block.nav-block {
    height: 12px;
    width: 80%;
    background: var(--border-card);
    animation-delay: 0.1s;
  }

  .content-block.hero-block {
    height: 60px;
    background: linear-gradient(90deg, var(--border-card), var(--border-card-hover));
    animation-delay: 0.2s;
  }

  .content-block.text-block {
    height: 8px;
    width: 90%;
    background: var(--border-card);
    animation-delay: 0.3s;
  }

  .js-indicator {
    font-size: 11px;
    margin-top: 8px;
    padding: 8px;
    border-radius: 6px;
    text-align: center;
    animation: jsState 4s ease-in-out infinite;
  }

  .js-indicator .js-loading {
    color: var(--text-muted);
  }

  .js-indicator .js-done {
    color: var(--success-color);
    display: none;
  }

  /* ===== MINIFY JS VISUALIZATION ===== */
  .minify-viz .code-transform {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .code-block {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-radius: 12px;
    overflow: hidden;
    flex: 1;
    min-width: 200px;
    max-width: 320px;
  }

  .code-label {
    padding: 10px 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .code-content {
    padding: 16px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 11px;
    line-height: 1.6;
    color: var(--text-primary);
    overflow-x: auto;
  }

  .code-content .keyword { color: #c678dd; }
  .code-content .fn { color: #61afef; }
  .code-content .comment { color: #5c6370; font-style: italic; }
  .code-content .num { color: #d19a66; }
  .code-content .str { color: #98c379; }

  .code-block.after .code-content {
    word-break: break-all;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), transparent);
  }

  .file-size {
    padding: 10px 16px;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .file-size .savings {
    color: var(--success-color);
    margin-left: 8px;
  }

  .transform-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--accent-primary);
  }

  .transform-arrow svg {
    width: 32px;
    height: 32px;
    animation: arrowPulse 1.5s ease-in-out infinite;
  }

  .transform-arrow span {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Size Bars */
  .size-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
    margin: 0 auto;
  }

  .size-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .bar-label {
    width: 70px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .bar-container {
    flex: 1;
    height: 24px;
    background: var(--bg-card);
    border-radius: 6px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 1s ease-out;
  }

  .bar-fill.original {
    width: 100%;
    background: linear-gradient(90deg, #ef4444, #f87171);
    animation: barGrow 2s ease-out;
  }

  .bar-fill.minified {
    width: 38%;
    background: linear-gradient(90deg, var(--accent-primary), #ff9033);
    animation: barGrow 2s ease-out 0.3s backwards;
  }

  .bar-value {
    width: 50px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    text-align: right;
  }

  /* ===== MINIFY CSS VISUALIZATION ===== */
  .minify-css-viz .style-transform {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .style-block {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-radius: 12px;
    padding: 20px;
    flex: 1;
    min-width: 180px;
    max-width: 260px;
  }

  .style-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .style-content {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.6;
  }

  .style-content .selector { color: #e5c07b; }
  .style-content .prop { color: #61afef; }
  .style-content .val { color: #d19a66; }

  .style-content .css-rule {
    color: var(--text-primary);
  }

  .style-content .props {
    padding-left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .style-content.compact {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent);
    padding: 12px;
    border-radius: 8px;
    word-break: break-all;
  }

  .style-arrow {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--accent-primary);
  }

  .style-arrow svg {
    width: 28px;
    height: 28px;
    animation: compressPulse 1.5s ease-in-out infinite;
  }

  .compression-wave {
    position: absolute;
    width: 40px;
    height: 40px;
    border: 2px solid var(--accent-primary);
    border-radius: 50%;
    opacity: 0;
    animation: waveExpand 2s ease-out infinite;
  }

  /* Button Demo */
  .button-demo {
    text-align: center;
    padding: 20px;
    background: var(--bg-card);
    border-radius: 12px;
    max-width: 300px;
    margin: 0 auto;
  }

  .demo-label {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 16px;
  }

  .demo-button {
    background: var(--accent-primary);
    color: #000;
    border: none;
    padding: 12px 32px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 10px;
  }

  .demo-button:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(244, 129, 32, 0.4);
  }

  .demo-stats {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .demo-stats .stat {
    font-size: 12px;
    color: var(--text-muted);
    padding: 6px 12px;
    background: var(--bg-secondary);
    border-radius: 6px;
  }

  .demo-stats .stat.highlight {
    background: rgba(34, 197, 94, 0.15);
    color: var(--success-color);
    font-weight: 600;
  }

  /* ===== BROTLI VISUALIZATION ===== */
  .brotli-viz .compression-demo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
    flex-wrap: wrap;
  }

  .data-cube {
    text-align: center;
  }

  .cube-face {
    width: 100px;
    height: 100px;
    background: var(--bg-card);
    border: 2px solid var(--border-card);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
  }

  .data-cube.original .cube-face {
    animation: cubeFloat 3s ease-in-out infinite;
  }

  .data-cube.compressed .cube-face {
    width: 60px;
    height: 60px;
    border-color: var(--accent-primary);
    background: linear-gradient(135deg, rgba(244, 129, 32, 0.1), transparent);
    animation: cubeFloat 3s ease-in-out infinite 0.5s;
  }

  .data-blocks {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 8px;
  }

  .data-blocks.compressed {
    grid-template-columns: repeat(2, 1fr);
  }

  .data-block {
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, var(--border-card-hover), var(--border-card));
    border-radius: 3px;
    animation: blockPulse 2s ease-in-out infinite;
  }

  .data-blocks.compressed .data-block {
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, var(--accent-primary), #ff9033);
    animation-duration: 1.5s;
  }

  .data-block:nth-child(2) { animation-delay: 0.1s; }
  .data-block:nth-child(3) { animation-delay: 0.2s; }
  .data-block:nth-child(4) { animation-delay: 0.3s; }
  .data-block:nth-child(5) { animation-delay: 0.4s; }
  .data-block:nth-child(6) { animation-delay: 0.5s; }
  .data-block:nth-child(7) { animation-delay: 0.6s; }
  .data-block:nth-child(8) { animation-delay: 0.7s; }
  .data-block:nth-child(9) { animation-delay: 0.8s; }

  .cube-label {
    margin-top: 12px;
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .cube-label strong {
    display: block;
    color: var(--text-primary);
    font-size: 16px;
    margin-top: 4px;
  }

  .data-cube.compressed .cube-label strong {
    color: var(--accent-primary);
  }

  .compression-arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .arrow-body {
    width: 80px;
    height: 8px;
    background: linear-gradient(90deg, var(--border-card), var(--accent-primary));
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .compression-particles {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
  }

  .particle {
    width: 8px;
    height: 8px;
    background: var(--accent-primary);
    border-radius: 50%;
    position: absolute;
    animation: particleMove 1.5s linear infinite;
  }

  .particle:nth-child(1) { animation-delay: 0s; }
  .particle:nth-child(2) { animation-delay: 0.3s; }
  .particle:nth-child(3) { animation-delay: 0.6s; }
  .particle:nth-child(4) { animation-delay: 0.9s; }

  .arrow-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--accent-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Transfer Demo */
  .transfer-demo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 20px;
    background: var(--bg-card);
    border-radius: 12px;
  }

  .server-icon, .browser-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .server-icon svg, .browser-icon svg {
    width: 40px;
    height: 40px;
    color: var(--text-secondary);
  }

  .server-icon span, .browser-icon span {
    font-size: 11px;
    color: var(--text-muted);
  }

  .transfer-line {
    flex: 1;
    height: 4px;
    background: var(--border-card);
    border-radius: 2px;
    position: relative;
    max-width: 150px;
  }

  .data-packet {
    position: absolute;
    width: 12px;
    height: 12px;
    background: var(--accent-primary);
    border-radius: 3px;
    top: 50%;
    transform: translateY(-50%);
    animation: packetMove 2s ease-in-out infinite;
    box-shadow: 0 2px 8px rgba(244, 129, 32, 0.4);
  }

  .packet-1 { animation-delay: 0s; }
  .packet-2 { animation-delay: 0.6s; }
  .packet-3 { animation-delay: 1.2s; }

  /* Brotli Stats */
  .brotli-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 32px;
    font-weight: 700;
    color: var(--accent-primary);
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  /* ===== EARLY HINTS VISUALIZATION ===== */
  .early-hints-viz .sequence-diagram {
    display: flex;
    align-items: stretch;
    gap: 16px;
    padding: 24px;
    background: var(--bg-card);
    border-radius: 12px;
    overflow-x: auto;
  }

  .actor {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: 10px;
    min-width: 70px;
  }

  .actor-icon {
    font-size: 24px;
  }

  .actor span {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 500;
  }

  .sequence-arrows {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 200px;
  }

  .arrow-row {
    position: relative;
  }

  .arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 12px;
    position: relative;
  }

  .arrow span {
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .arrow-line {
    width: 100%;
    height: 2px;
    background: var(--border-card);
    position: relative;
  }

  .arrow-line::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-left-color: var(--border-card);
  }

  .arrow.request span { color: var(--text-muted); }
  .arrow.request .arrow-line { background: var(--text-muted); }
  .arrow.request .arrow-line::after { border-left-color: var(--text-muted); }

  .arrow.hint span { color: var(--accent-primary); }
  .arrow.hint .arrow-line { 
    background: var(--accent-primary);
    animation: arrowGlow 1s ease-in-out infinite;
  }
  .arrow.hint .arrow-line::after { 
    border-left-color: transparent;
    border-right-color: var(--accent-primary);
    right: auto;
    left: 0;
  }

  .hint-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 8px;
  }

  .hint-details code {
    font-size: 9px;
    background: rgba(244, 129, 32, 0.1);
    color: var(--accent-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'SF Mono', monospace;
  }

  .parallel-section {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent);
    border-radius: 8px;
    padding: 12px;
    border: 1px dashed var(--success-color);
  }

  .parallel-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--success-color);
    margin-bottom: 8px;
  }

  .parallel-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .parallel-item {
    font-size: 10px;
    padding: 4px 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    color: var(--text-secondary);
    animation: itemBlink 1s ease-in-out infinite;
  }

  .parallel-item:nth-child(2) { animation-delay: 0.2s; }
  .parallel-item:nth-child(3) { animation-delay: 0.4s; }

  .arrow.final span { color: var(--success-color); }
  .arrow.final .arrow-line { 
    background: var(--success-color);
  }
  .arrow.final .arrow-line::after { 
    border-left-color: transparent;
    border-right-color: var(--success-color);
    right: auto;
    left: 0;
  }

  .result-row {
    text-align: center;
    padding: 8px;
  }

  .result-badge {
    display: inline-block;
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
    border: 1px solid var(--success-color);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: var(--success-color);
    animation: badgePop 2s ease-out infinite;
  }

  /* Time Savings */
  .time-savings {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 500px;
    margin: 0 auto;
  }

  .time-bar {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .time-bar .bar-label {
    width: 120px;
    font-size: 11px;
    color: var(--text-muted);
  }

  .time-segments {
    flex: 1;
    display: flex;
    height: 32px;
    border-radius: 6px;
    overflow: hidden;
    background: var(--bg-card);
  }

  .segment {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 500;
    padding: 0 8px;
    white-space: nowrap;
    color: #fff;
  }

  .time-bar.without .segment.wait {
    width: 30%;
    background: #6b7280;
  }

  .time-bar.without .segment.load {
    width: 25%;
    background: #3b82f6;
  }

  .time-bar.without .segment.render {
    width: 20%;
    background: #22c55e;
  }

  .time-bar.with .segment.parallel {
    width: 30%;
    background: linear-gradient(135deg, var(--accent-primary), #ff9033);
    flex-direction: column;
    gap: 2px;
    padding: 4px;
  }

  .time-bar.with .segment.parallel .sub-segment {
    font-size: 8px;
    background: rgba(0,0,0,0.2);
    padding: 2px 6px;
    border-radius: 3px;
  }

  .time-bar.with .segment.render.fast {
    width: 15%;
    background: var(--success-color);
  }

  .total-time {
    width: 50px;
    font-size: 13px;
    font-weight: 600;
    text-align: right;
  }

  .time-bar.without .total-time {
    color: var(--text-muted);
  }

  .time-bar.with .total-time {
    color: var(--success-color);
  }

  .savings-badge {
    text-align: center;
    padding: 12px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    color: var(--success-color);
    margin-top: 8px;
  }

  /* ===== ANIMATIONS ===== */
  @keyframes pulseRed {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes slideInLeft {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes rocketFloat {
    0%, 100% { transform: translateY(0) rotate(-45deg); }
    50% { transform: translateY(-10px) rotate(-45deg); }
  }

  @keyframes flameFlicker {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.3); }
  }

  @keyframes trailPulse {
    0%, 100% { opacity: 0.3; height: 80px; }
    50% { opacity: 0.6; height: 100px; }
  }

  @keyframes speedLine {
    0% { opacity: 0; transform: translateX(60px); }
    50% { opacity: 1; }
    100% { opacity: 0; transform: translateX(-60px); }
  }

  @keyframes contentLoad {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes jsState {
    0%, 70% { 
      background: rgba(239, 68, 68, 0.1);
    }
    80%, 100% {
      background: rgba(34, 197, 94, 0.1);
    }
  }

  @keyframes arrowPulse {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(5px); }
  }

  @keyframes barGrow {
    from { width: 0; }
  }

  @keyframes compressPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(0.9); }
  }

  @keyframes waveExpand {
    0% { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }

  @keyframes cubeFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @keyframes blockPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes particleMove {
    0% { left: -10px; opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { left: calc(100% + 10px); opacity: 0; }
  }

  @keyframes packetMove {
    0% { left: -15px; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { left: calc(100% + 15px); opacity: 0; }
  }

  @keyframes arrowGlow {
    0%, 100% { box-shadow: 0 0 5px var(--accent-primary); }
    50% { box-shadow: 0 0 15px var(--accent-primary); }
  }

  @keyframes itemBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes badgePop {
    0%, 90%, 100% { transform: scale(1); }
    95% { transform: scale(1.05); }
  }

  /* ===== SIMPLE VISUALIZATION (for non-Performance pages) ===== */
  .simple-viz .viz-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 32px;
    text-align: center;
  }

  .viz-emoji {
    font-size: 64px;
    line-height: 1;
    animation: emojiPulse 2s ease-in-out infinite;
  }

  .viz-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    flex-wrap: wrap;
  }

  .viz-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .viz-stat-value {
    font-size: 36px;
    font-weight: 700;
    color: var(--accent-primary);
    line-height: 1;
  }

  .viz-stat-label {
    font-size: 12px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .viz-bottom-text {
    font-size: 14px;
    color: var(--text-secondary);
    background: var(--bg-card);
    padding: 16px 24px;
    border-radius: 12px;
    max-width: 500px;
    line-height: 1.6;
  }

  @keyframes emojiPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 768px) {
    .optimization-main-row {
      flex-wrap: wrap;
      gap: 12px;
    }

    .feature-icon {
      width: 36px;
      height: 36px;
    }

    .visualization {
      padding: 20px;
    }

    .code-transform,
    .style-transform,
    .compression-demo {
      flex-direction: column;
    }

    .transform-arrow,
    .style-arrow,
    .compression-arrow {
      transform: rotate(90deg);
      margin: 16px 0;
    }

    .sequence-diagram {
      flex-direction: column;
      align-items: stretch;
    }

    .actor {
      flex-direction: row;
      justify-content: center;
    }
  }
`;
