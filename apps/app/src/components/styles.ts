export const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html, body {
    width: 100%;
    height: 100%;
    background: white;
  }
  body {
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #000000;
    color: #ffffff;
    margin: 0;
    padding: 0;
  }
  /* Announcement Bar Styles */
  .announcement-bar {
    width: 100%;
    padding: 12px 20px;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
  }
  .announcement-bar-info {
    background: #1a1a1a;
    color: #ffffff;
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
    width: 250px;
    min-width: 250px;
    background: #000000;
    padding: 0;
    height: calc(100vh - 48px);
    margin-top: 48px;
    overflow-y: auto;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }
  .nav-item {
    color: #ffffff;
    text-decoration: none;
    padding: 15px 20px;
    background: #000000;
    transition: background 0.2s;
    border-radius: 8px;
    margin: 0;
    display: block;
  }
  .nav-item.active {
    background: #F48120;
    color: #000000;
  }
  .nav-item:not(.active) {
    background: #000000;
    color: #ffffff;
  }
  .nav-item:not(.active):hover {
    background: #F48120;
    color: #000000;
  }
  .nav-item-text {
    font-size: 14px;
    font-weight: 500;
  }
  .nav-item-subtext {
    font-size: 12px;
    margin-top: 4px;
    opacity: 0.8;
  }
  .nav-item.active .nav-item-subtext {
    opacity: 0.7;
  }
  /* Container Styles */
  .container {
    flex: 1;
    margin-left: 250px;
    max-width: calc(100% - 250px);
    padding: 40px 20px;
  }
  h1 {
    color: #ffffff;
    font-size: 32px;
    margin-bottom: 20px;
  }
  /* Store Info Styles */
  .store-info {
    color: #ffffff;
    margin-bottom: 10px;
    font-size: 16px;
  }
  /* Plan Info Styles */
  .plan-info {
    color: #ffffff;
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
    gap: 20px;
  }
  .optimization-item {
    background: #1a1a1a;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }
  .optimization-content {
    flex: 1;
  }
  .optimization-title {
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .optimization-description {
    color: #cccccc;
    font-size: 14px;
    line-height: 1.5;
  }
  /* Toggle Styles */
  .toggle-container {
    position: relative;
    width: 50px;
    height: 28px;
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
    transition: 0.3s;
    border-radius: 28px;
  }
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  .toggle-input:checked + .toggle-slider {
    background-color: #F48120;
  }
  .toggle-input:not(:checked) + .toggle-slider {
    background-color: #d3d3d3;
  }
  .toggle-input:checked + .toggle-slider:before {
    transform: translateX(22px);
  }
  /* Footer Styles */
  .footer {
    width: 100%;
    background: #1a1a1a;
    border-top: 1px solid #333;
    padding: 20px;
    margin-left: 250px;
    margin-top: auto;
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
    color: #ffffff;
    text-decoration: none;
    font-size: 14px;
  }
  .footer-link:hover {
    color: #F48120;
  }
  .footer-copyright {
    color: #cccccc;
    font-size: 12px;
  }
`;
