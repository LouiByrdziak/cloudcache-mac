const FAVICON_BASE64 =
  "AAABAAIAEBAAAAEAIADGAQAAJgAAACAgAAABACAAiwMAAOwBAACJUE5HDQoaCgAAAA1JSERSAAAAEAAAABAIBgAAAB/z/2EAAAABc1JHQgCuzhzpAAAARGVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAAQoAMABAAAAAEAAAAQAAAAADRVcfIAAAEwSURBVDgR7ZC/L0NRFMc/9762GIjGYhGmjn62EjFa+AvEIhKdJN1IRCLpIGIhsXXqJlY2C4MBbWKukJA0BqQWVNVr33GfvtfQ0L+gd7jfc8/9/jg50DqqcQWyOd5DOHBE0RlmJHhLp97CNqyiXuVd+ilYeyp+vOjrtF/UscKcEUe5qwbI2RGUpHFIg0QQ2sCZl92paZ8f8AsXZTm6gdIrvDi1dq4KuRL0WTDaDsoMLBiN7BtC2CX9nkB0wnyGeJWagXubTMZC3tv0XRMoe40GAyiZBBgKwqQnmjDY8TPHEDTJ/wySXgLcVw7oUpcMWI/Pn91Pa5n42/XhFYVMNq8SJ6k/DdR2NqXWL5RaOFNmiTc82DMqdto7e74zaIv+HrvyUc774qYoS7FYU0Lrs76BL/LgWyHfgEGBAAAAAElFTkSuQmCCiVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAC9UlEQVRYCe1UTUhUURT+7hsdhzQhoUXUmEaLsEKNJswgLSgQghZhGzcp9EtQllCLIMJVEmVBPwTtrI1RtIigoCbaFCS0KAqslAyiJEsdf0Zn3u07d94bx9c8kXDXHOa+c8695+c7331vgJzkGMgx8L8zoOZLgL5Z0wRbncZvew3WB+MI4gtC6jGKrE5VHe2XOvr51nIkrGOYtHZiWpdiGnGMI4rJxFF18MW3bL3mBUBfYPNiqwsjNtCXBFYHgHV5QAHTF1tTsHCcjcCGnUiooLETPJvWwAR1Qt1TLU/3ZAPAKvMQjRPQLDZKACIfCUIyK/PFC0LjmhhQmfMw3vW1rjfnWR5Wlr2/txQqTLERFnXlA0G8TdDjntlmcwEpkm5sHHmU6BvbB/TFbXXiZIovA3pffQjh8aukuZEJIcQ5/VRmKu13BCDLlTCvJlIwAyiFjKfCjF5BYOdp1Ljhon0BoDh2BirQkg4eS1vZDfbFhmBqesMA2RBtSEnba73Jc1yB1WiS3SIx5/69FVx/ExGEnHLmKpzmMryI7Cnw3mbLHAB0WSrUjADEHD07P+WVk/pSLlcM49542VRRN8TV/legMEHEwqn5oYKhQdry6eVxReOpGiGqLQxz40xfyXEB0Daik0jqdsdJK38GNNFKDaEuXVSK0RnKYLKWzUNOkxTN6eIpwxQhINWm2p71eA7neAmh2jnULq6ADDfrExtIvOFOFcKWxirS4Xx20v/Jp0o79v77RO3g3UJJswqCWBRefrvobG+nt7n4vgyoK696OGyboVaGcF9Grc5hyF5CRINYae2gfsA1TIDD9380vL48dtK6VdpR+LJkt+lnx6cw2vu5zjhZHg53WU58tvShqjIE8vtg23vV9Z7uzLCGS/1NSvEvm7K/rxWbh4iNorX+uqwrGTaO5+HLgCduxrWsejrd3uYS8Ki17E7k18OO5v5TP2sympPJA3K+IKIPb+zQzdVLF6TYvxTRRyKRf8nL5eQYyDGQY8CPgT8p4ed9RS416QAAAABJRU5ErkJggg==";

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Health endpoints
    if (pathname === "/healthz" || pathname === "/readyz") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Serve favicon
    if (pathname === "/favicon.ico") {
      const faviconData = Uint8Array.from(atob(FAVICON_BASE64), (c) => c.charCodeAt(0));
      return new Response(faviconData.buffer, {
        headers: {
          "Content-Type": "image/x-icon",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }

    if (pathname === "/") {
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64,${FAVICON_BASE64}">
  <link rel="shortcut icon" type="image/x-icon" href="data:image/x-icon;base64,${FAVICON_BASE64}">
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=1">
  <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=1">
  <title>CloudCache Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      height: 100%;
      width: 100%;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #000000;
      color: #ffffff;
    }
    .nav {
      display: flex;
      gap: 20px;
      padding: 20px;
      border-bottom: 1px solid #333;
      flex-wrap: wrap;
    }
    .nav-item {
      color: #ffffff;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 20px;
      transition: background 0.2s;
    }
    .nav-item.free {
      background: #F48120;
      color: #000000;
    }
    .nav-item:hover {
      background: #333;
    }
    .nav-item.free:hover {
      background: #FC7C1E;
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
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 {
      color: #ffffff;
      font-size: 32px;
      margin-bottom: 20px;
    }
    .store-info {
      color: #ffffff;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .plan-info {
      color: #ffffff;
      margin-bottom: 30px;
      font-size: 16px;
    }
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
  </style>
</head>
<body>
  <nav class="nav">
    <a href="#" class="nav-item free">
      <div class="nav-item-text">Free</div>
      <div class="nav-item-subtext">5 free optimizations</div>
    </a>
    <a href="#" class="nav-item">
      <div class="nav-item-text">Section A</div>
      <div class="nav-item-subtext">10 website optimizations 1-click instant</div>
    </a>
    <a href="#" class="nav-item">
      <div class="nav-item-text">Section B</div>
      <div class="nav-item-subtext">10 webpage optimizations</div>
    </a>
    <a href="#" class="nav-item">
      <div class="nav-item-text">Section C</div>
      <div class="nav-item-subtext">10 website optimizations</div>
    </a>
    <a href="#" class="nav-item">
      <div class="nav-item-text">Section D</div>
      <div class="nav-item-subtext">10 webpage optimizations</div>
    </a>
    <a href="#" class="nav-item">
      <div class="nav-item-text">Section E</div>
      <div class="nav-item-subtext">10 website security</div>
    </a>
    <a href="#" class="nav-item">
      <div class="nav-item-text">Pricing</div>
    </a>
  </nav>
  <div class="container">
    <h1>CloudCache Dashboard</h1>
    <div class="store-info">Store: cloudcache01.myshopify.com</div>
    <div class="plan-info">Current Plan: Free</div>
    <button class="connect-button">Connect Store to Shopify</button>
    
    <div class="optimization-list">
      <div class="optimization-item">
        <div class="optimization-content">
          <div class="optimization-title">Rocket Loader</div>
          <div class="optimization-description">Automatically optimizes your website's loading performance by deferring JavaScript execution.</div>
        </div>
        <label class="toggle-container">
          <input type="checkbox" class="toggle-input" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="optimization-item">
        <div class="optimization-content">
          <div class="optimization-title">Early Hints</div>
          <div class="optimization-description">Sends HTTP 103 responses to preload critical resources before the main response.</div>
        </div>
        <label class="toggle-container">
          <input type="checkbox" class="toggle-input" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="optimization-item">
        <div class="optimization-content">
          <div class="optimization-title">Brotli Compression</div>
          <div class="optimization-description">Uses Brotli compression algorithm for better compression ratios and faster loading.</div>
        </div>
        <label class="toggle-container">
          <input type="checkbox" class="toggle-input">
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="optimization-item">
        <div class="optimization-content">
          <div class="optimization-title">Auto Minify</div>
          <div class="optimization-description">Automatically minifies CSS, JavaScript, and HTML to reduce file sizes.</div>
        </div>
        <label class="toggle-container">
          <input type="checkbox" class="toggle-input">
          <span class="toggle-slider"></span>
        </label>
      </div>
      
      <div class="optimization-item">
        <div class="optimization-content">
          <div class="optimization-title">HTTP/2</div>
          <div class="optimization-description">Enables HTTP/2 protocol for improved performance and multiplexing.</div>
        </div>
        <label class="toggle-container">
          <input type="checkbox" class="toggle-input">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  </div>
</body>
</html>
      `.trim();
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }
    return new Response("NOT_FOUND", { status: 404 });
  },
};
