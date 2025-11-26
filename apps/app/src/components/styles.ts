export const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  :root {
    --bg-primary: #000000;
    --bg-secondary: #0a0a0a;
    --bg-card: #0d0d0d;
    --bg-card-hover: #111111;
    --border-color: #1a1a1a;
    --border-card: #1f1f1f;
    --border-card-hover: #2a2a2a;
    --text-primary: #ffffff;
    --text-secondary: #888;
    --text-muted: #666;
    --text-description: #777;
    --nav-item-hover-bg: #1a1a1a;
    --nav-item-hover-text: #ffffff;
    --toggle-off-bg: #333;
    --toggle-off-border: #444;
    --toggle-knob: #ffffff;
    --toggle-knob-on: #000000;
  }
  body.light-theme {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --bg-card: #e8e8e8;
    --bg-card-hover: #e0e0e0;
    --border-color: #ddd;
    --border-card: #d0d0d0;
    --border-card-hover: #c0c0c0;
    --text-primary: #000000;
    --text-secondary: #000000;
    --text-muted: #555;
    --text-description: #666;
    --nav-item-hover-bg: #F48120;
    --nav-item-hover-text: #ffffff;
    --toggle-off-bg: #ccc;
    --toggle-off-border: #bbb;
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    margin: 0;
    padding: 0;
    transition: background 0.3s ease, color 0.3s ease;
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
    background: #00ff00;
    color: #000000;
  }
  .announcement-content {
    text-align: center;
    font-size: 14px;
  }
  /* Navigation Styles */
  .nav {
    width: 260px;
    min-width: 260px;
    background: var(--bg-secondary);
    padding: 20px 12px;
    height: 100vh;
    overflow-y: auto;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-right: 1px solid var(--border-color);
    transition: background 0.3s ease, border-color 0.3s ease;
  }
  .nav-brand {
    padding: 8px 16px 24px 16px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 16px;
  }
  .nav-brand-title {
    font-size: 22px;
    font-weight: 700;
    color: #F48120;
    letter-spacing: -0.5px;
  }
  .nav-brand-subtitle {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }
  .nav-item {
    color: var(--text-secondary);
    text-decoration: none;
    padding: 14px 18px;
    background: transparent;
    transition: all 0.2s ease;
    border-radius: 12px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid transparent;
  }
  .nav-item.active {
    background: #F48120;
    color: #ffffff;
    border-color: #F48120;
    box-shadow: 0 2px 8px rgba(244, 129, 32, 0.3);
  }
  .nav-item:not(.active):hover {
    background: var(--nav-item-hover-bg);
    color: var(--nav-item-hover-text);
    border-color: var(--border-card-hover);
  }
  .nav-item-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .nav-item-text {
    font-size: 14px;
    font-weight: 500;
  }
  .nav-item-subtext {
    font-size: 12px;
    margin-top: 2px;
    opacity: 0.7;
  }
  .nav-item.active .nav-item-subtext {
    opacity: 0.8;
  }
  /* Container Styles */
  .container {
    flex: 1;
    margin-left: 260px;
    max-width: calc(100% - 260px);
    padding: 40px 48px;
    min-height: 100vh;
  }
  /* Page Header Styles */
  .page-header {
    margin-bottom: 40px;
  }
  .page-title {
    color: var(--text-primary);
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
    transition: color 0.3s ease;
  }
  .page-subtitle {
    color: var(--text-muted);
    font-size: 16px;
    line-height: 1.5;
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
    background: #F48120;
    color: #000000;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 40px;
    transition: background 0.2s;
  }
  .connect-button:hover {
    background: #FC7C1E;
  }
  /* Optimization List Styles */
  .optimization-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .optimization-item {
    background: var(--bg-card);
    padding: 24px 28px;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    border: 1px solid var(--border-card);
    transition: all 0.3s ease;
  }
  .optimization-item:hover {
    border-color: var(--border-card-hover);
    background: var(--bg-card-hover);
  }
  .optimization-content {
    flex: 1;
  }
  .optimization-title {
    color: var(--text-primary);
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 6px;
    transition: color 0.3s ease;
  }
  .optimization-description {
    color: var(--text-description);
    font-size: 14px;
    line-height: 1.5;
    transition: color 0.3s ease;
  }
  /* Toggle Styles - Bulky Design */
  .toggle-container {
    position: relative;
    width: 64px;
    height: 36px;
    flex-shrink: 0;
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
    transition: all 0.3s ease;
    border-radius: 36px;
    border: 2px solid transparent;
  }
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 3px;
    bottom: 3px;
    background-color: var(--toggle-knob);
    transition: all 0.3s ease;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  .toggle-input:checked + .toggle-slider {
    background-color: #F48120;
    border-color: #F48120;
  }
  .toggle-input:not(:checked) + .toggle-slider {
    background-color: var(--toggle-off-bg);
    border-color: var(--toggle-off-border);
  }
  .toggle-input:checked + .toggle-slider:before {
    transform: translateX(28px);
    background-color: var(--toggle-knob-on);
  }
  .toggle-input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .toggle-input:focus + .toggle-slider {
    box-shadow: 0 0 0 3px rgba(244, 129, 32, 0.3);
  }
  /* Theme Toggle - Bottom Right */
  .theme-toggle {
    position: fixed;
    bottom: 10px;
    right: 10px;
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
  /* Footer Styles */
  .footer {
    width: 100%;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: 20px 48px;
    margin-left: 260px;
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
    gap: 20px;
  }
  .footer-link {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.2s;
  }
  .footer-link:hover {
    color: #F48120;
  }
  .footer-copyright {
    color: var(--text-muted);
    font-size: 12px;
  }
`;
