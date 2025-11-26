export interface BadgeOptions {
  fixed?: boolean;
  showOpus?: boolean;
}

export function getCloudcacheValidatedBadge(options: BadgeOptions = {}): string {
  const { fixed = true, showOpus = true } = options;
  const now = new Date();
  const date = `${now.getMonth() + 1}/${now.getDate()}`;
  const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const badgeStyle = fixed
    ? "position: fixed; bottom: 10px; left: 10px; background-color: #F48120; color: white; padding: 2px 4px; font-size: 10px; border-radius: 4px; z-index: 10000; font-family: sans-serif;"
    : "background-color: #F48120; color: white; padding: 2px 4px; font-size: 10px; border-radius: 4px; font-family: sans-serif; display: inline-block;";

  const opusHtml = showOpus && fixed ? `<span class="opus-text">Opus</span>` : "";

  return `
    <div id="cloudcache-validated-badge" style="${badgeStyle}">
      Cloudcache ${date} ${time}
    </div>
    ${opusHtml}
  `;
}
