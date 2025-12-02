export const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  :root {
    --bg-primary: #0a0a0a;
    --bg-secondary: #080808;
    --bg-card: #0f0f0f;
    --bg-card-hover: #141414;
    --border-color: #1a1a1a;
    --border-card: #1f1f1f;
    --border-card-hover: #2a2a2a;
    --text-primary: #ffffff;
    --text-secondary: #a0a0a0;
    --text-muted: #666;
    --text-description: #888;
    --nav-item-hover-bg: #1a1a1a;
    --nav-item-hover-text: #ffffff;
    --toggle-off-bg: #2a2a2a;
    --toggle-off-border: #3a3a3a;
    --toggle-knob: #ffffff;
    --toggle-knob-on: #000000;
    --accent-primary: #F48120;
    --accent-glow: rgba(244, 129, 32, 0.3);
    --success-color: #22c55e;
    --error-color: #ef4444;
  }
  body.light-theme {
    --bg-primary: #fafafa;
    --bg-secondary: #f0f0f0;
    --bg-card: #ffffff;
    --bg-card-hover: #f5f5f5;
    --border-color: #e0e0e0;
    --border-card: #d5d5d5;
    --border-card-hover: #c0c0c0;
    --text-primary: #111111;
    --text-secondary: #333333;
    --text-muted: #666666;
    --text-description: #555555;
    --nav-item-hover-bg: #F48120;
    --nav-item-hover-text: #ffffff;
    --toggle-off-bg: #d0d0d0;
    --toggle-off-border: #b0b0b0;
    --toggle-knob: #ffffff;
    --toggle-knob-on: #000000;
  }
  html, body {
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
  }
  body {
    display: flex;
    flex-direction: column;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    margin: 0;
    padding: 0;
    transition: background 0.3s ease, color 0.3s ease;
  }
  
  /* Page enter animation */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  /* Announcement Bar Styles */
  .announcement-bar {
    width: 100%;
    padding: 12px 20px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
  }
  .announcement-bar-info {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
  .announcement-bar-warning {
    background: #F48120;
    color: #000000;
  }
  .announcement-bar-success {
    background: var(--success-color);
    color: #000000;
  }
  .announcement-content {
    text-align: center;
    font-size: 14px;
  }
  
  /* Navigation Styles */
  .nav {
    width: 280px;
    min-width: 280px;
    background: var(--bg-secondary);
    padding: 24px 16px;
    height: 100vh;
    overflow-y: auto;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-right: 1px solid var(--border-color);
    transition: background 0.3s ease, border-color 0.3s ease;
  }
  .nav-brand {
    padding: 12px 20px 32px 20px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 20px;
  }
  .nav-brand-title {
    font-size: 26px;
    font-weight: 700;
    color: var(--accent-primary);
    letter-spacing: -0.5px;
  }
  .nav-brand-subtitle {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 6px;
    letter-spacing: 0.2px;
  }
  .nav-item {
    color: var(--text-secondary);
    text-decoration: none;
    padding: 16px 20px;
    background: transparent;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 14px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 14px;
    border: 1px solid transparent;
  }
  .nav-item.active {
    background: var(--accent-primary);
    color: #ffffff;
    border-color: var(--accent-primary);
    box-shadow: 0 4px 16px var(--accent-glow);
    transform: scale(1.02);
  }
  .nav-item:not(.active):hover {
    background: var(--nav-item-hover-bg);
    color: var(--nav-item-hover-text);
    border-color: var(--border-card-hover);
    transform: translateX(4px);
  }
  .nav-item-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
  .nav-item-text {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.2px;
  }
  .nav-item-subtext {
    font-size: 12px;
    margin-top: 3px;
    opacity: 0.65;
  }
  .nav-item.active .nav-item-subtext {
    opacity: 0.85;
  }
  
  /* Container Styles */
  .container {
    flex: 1;
    margin-left: 280px;
    max-width: calc(100% - 280px);
    padding: 48px 56px;
    min-height: 100vh;
    animation: fadeInUp 0.4s ease-out;
  }
  
  /* Page Header Styles */
  .page-header {
    margin-bottom: 48px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    flex-wrap: wrap;
  }
  .page-header__left {
    flex: 1;
    min-width: 200px;
  }
  .page-header__right {
    flex-shrink: 0;
  }
  .page-title {
    color: var(--text-primary);
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: -1px;
    transition: color 0.3s ease;
  }
  
  /* PageSpeed Widget */
  .pagespeed-widget {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-radius: 12px;
    padding: 16px 20px;
    min-width: 200px;
  }
  .pagespeed-widget__scores {
    display: flex;
    gap: 20px;
    margin-bottom: 8px;
  }
  .pagespeed-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .pagespeed-score__icon {
    font-size: 16px;
  }
  .pagespeed-score__value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }
  .pagespeed-score__label {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .pagespeed-widget__updated {
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
  }
  
  /* PageSpeed score colors */
  .score--good .pagespeed-score__value {
    color: #0cce6b;
  }
  .score--needs-improvement .pagespeed-score__value {
    color: #ffa400;
  }
  .score--poor .pagespeed-score__value {
    color: #ff4e42;
  }
  .score--unknown .pagespeed-score__value {
    color: var(--text-muted);
  }
  .page-subtitle {
    color: var(--text-muted);
    font-size: 17px;
    line-height: 1.6;
    max-width: 600px;
    transition: color 0.3s ease;
  }
  h1 {
    color: var(--text-primary);
    font-size: 32px;
    margin-bottom: 20px;
  }
  
  /* Store Info Styles */
  .store-info {
    color: var(--text-primary);
    margin-bottom: 10px;
    font-size: 16px;
  }
  
  /* Plan Info Styles */
  .plan-info {
    color: var(--text-primary);
    margin-bottom: 30px;
    font-size: 16px;
  }
  
  /* Connect Button Styles */
  .connect-button {
    background: var(--accent-primary);
    color: #000000;
    border: none;
    padding: 14px 28px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 40px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .connect-button:hover {
    background: #ff9033;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px var(--accent-glow);
  }
  
  /* Optimization List Styles */
  .optimization-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .optimization-item {
    background: var(--bg-card);
    padding: 28px 32px;
    border-radius: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 28px;
    border: 1px solid var(--border-card);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeInUp 0.4s ease-out backwards;
  }
  .optimization-item:nth-child(1) { animation-delay: 0.05s; }
  .optimization-item:nth-child(2) { animation-delay: 0.1s; }
  .optimization-item:nth-child(3) { animation-delay: 0.15s; }
  .optimization-item:nth-child(4) { animation-delay: 0.2s; }
  .optimization-item:nth-child(5) { animation-delay: 0.25s; }
  
  .optimization-item:hover {
    border-color: var(--border-card-hover);
    background: var(--bg-card-hover);
    transform: translateX(4px);
  }
  .optimization-content {
    flex: 1;
  }
  .optimization-title {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
    transition: color 0.3s ease;
  }
  .optimization-description {
    color: var(--text-description);
    font-size: 14px;
    line-height: 1.6;
    max-width: 520px;
    transition: color 0.3s ease;
  }
  
  /* Toggle Styles - Premium Design */
  .toggle-container {
    position: relative;
    width: 68px;
    height: 38px;
    flex-shrink: 0;
    transition: opacity 0.2s ease;
  }
  .toggle-container.loading {
    opacity: 0.6;
    pointer-events: none;
  }
  .toggle-container.loading .toggle-slider:before {
    animation: pulse 1s ease-in-out infinite;
  }
  .toggle-input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 38px;
    border: 2px solid transparent;
  }
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 28px;
    width: 28px;
    left: 3px;
    bottom: 3px;
    background-color: var(--toggle-knob);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
  .toggle-input:checked + .toggle-slider {
    background-color: var(--accent-primary);
    border-color: var(--accent-primary);
    box-shadow: 0 0 20px var(--accent-glow);
  }
  .toggle-input:not(:checked) + .toggle-slider {
    background-color: var(--toggle-off-bg);
    border-color: var(--toggle-off-border);
  }
  .toggle-input:checked + .toggle-slider:before {
    transform: translateX(30px);
    background-color: var(--toggle-knob-on);
  }
  .toggle-input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .toggle-input:focus + .toggle-slider {
    box-shadow: 0 0 0 4px var(--accent-glow);
  }
  .toggle-input:not(:checked):hover + .toggle-slider {
    border-color: #4a4a4a;
    background-color: #333;
  }
  
  /* Theme Toggle - Bottom Right */
  .theme-toggle {
    position: fixed;
    bottom: 12px;
    right: 12px;
    z-index: 10000;
  }
  .theme-toggle .toggle-container {
    width: 56px;
    height: 32px;
  }
  .theme-toggle .toggle-slider:before {
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
  }
  .theme-toggle .toggle-input:checked + .toggle-slider:before {
    transform: translateX(24px);
  }
  
  /* Toast Notifications */
  .toast {
    position: fixed;
    bottom: 80px;
    right: 20px;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10001;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    max-width: 320px;
  }
  .toast.show {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  .toast-success {
    background: var(--success-color);
    color: #000;
  }
  .toast-error {
    background: var(--error-color);
    color: #fff;
  }
  
  /* Footer Styles */
  .footer {
    width: calc(100% - 280px);
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: 24px 56px;
    margin-left: 280px;
    margin-top: auto;
    transition: background 0.3s ease, border-color 0.3s ease;
  }
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-links {
    display: flex;
    gap: 24px;
  }
  .footer-link {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s ease;
  }
  .footer-link:hover {
    color: var(--accent-primary);
  }
  .footer-copyright {
    color: var(--text-muted);
    font-size: 13px;
  }
  
  /* Opus Badge Text */
  .opus-text {
    position: fixed;
    bottom: 12px;
    left: 130px;
    font-size: 10px;
    color: var(--text-muted);
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
    font-weight: 500;
    letter-spacing: 0.5px;
    z-index: 10000;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
  .opus-text:hover {
    opacity: 1;
  }
  
  /* Slider Toggle Trigger (always-on toggle that opens slider panel) */
  .optimization-item-slider {
    cursor: pointer;
  }
  .optimization-item-slider:hover {
    border-color: var(--accent-primary);
  }
  .toggle-slider-trigger {
    cursor: pointer;
  }
  .toggle-slider-trigger .toggle-input {
    pointer-events: none;
  }
  .toggle-always-on + .toggle-slider {
    cursor: pointer;
  }
  .toggle-always-on:disabled + .toggle-slider {
    opacity: 1;
    cursor: pointer;
  }
  
  /* Optimization Value Display */
  .optimization-value {
    margin-top: 10px;
    padding: 6px 12px;
    background: var(--accent-primary);
    color: #000;
    font-size: 13px;
    font-weight: 600;
    border-radius: 8px;
    display: inline-block;
  }
  
  /* Slide-out Panel Overlay */
  .slider-panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 9998;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  .slider-panel-overlay.active {
    opacity: 1;
    visibility: visible;
  }
  
  /* Slide-out Panel */
  .slider-panel {
    position: fixed;
    top: 0;
    right: -420px;
    width: 400px;
    height: 100vh;
    background: var(--bg-secondary);
    border-left: 1px solid var(--border-color);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
  }
  .slider-panel.active {
    right: 0;
  }
  .slider-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 28px;
    border-bottom: 1px solid var(--border-color);
  }
  .slider-panel-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
  .slider-panel-close {
    background: transparent;
    border: none;
    font-size: 28px;
    color: var(--text-muted);
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    transition: all 0.2s ease;
  }
  .slider-panel-close:hover {
    background: var(--bg-card-hover);
    color: var(--text-primary);
  }
  .slider-panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
  }
  .slider-panel-description {
    color: var(--text-description);
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  
  /* Slider Options (Radio Buttons) */
  .slider-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .slider-option {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .slider-option:hover {
    border-color: var(--border-card-hover);
    background: var(--bg-card-hover);
  }
  .slider-option:has(.slider-radio:checked) {
    border-color: var(--accent-primary);
    background: rgba(244, 129, 32, 0.1);
  }
  .slider-radio {
    display: none;
  }
  .slider-option-indicator {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid var(--border-card-hover);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .slider-option-indicator::after {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--accent-primary);
    opacity: 0;
    transform: scale(0);
    transition: all 0.2s ease;
  }
  .slider-radio:checked + .slider-option-indicator {
    border-color: var(--accent-primary);
  }
  .slider-radio:checked + .slider-option-indicator::after {
    opacity: 1;
    transform: scale(1);
  }
  .slider-option-label {
    font-size: 15px;
    color: var(--text-primary);
    font-weight: 500;
  }
  .slider-radio:checked ~ .slider-option-label {
    color: var(--accent-primary);
  }
  
  /* Responsive adjustments */
  @media (max-width: 1024px) {
    .nav {
      width: 240px;
      min-width: 240px;
    }
    .container {
      margin-left: 240px;
      max-width: calc(100% - 240px);
      padding: 40px 32px;
    }
    .footer {
      width: calc(100% - 240px);
      margin-left: 240px;
      padding: 20px 32px;
    }
    .opus-text {
      left: 115px;
    }
    .slider-panel {
      width: 340px;
      right: -360px;
    }
  }
`;
