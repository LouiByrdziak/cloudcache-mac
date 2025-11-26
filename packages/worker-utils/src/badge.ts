export interface BadgeOptions {
  fixed?: boolean;
}

export function getCloudcacheValidatedBadge(options: BadgeOptions = {}): string {
  const { fixed = true } = options;
  const now = new Date();
  const date = `${now.getMonth() + 1}/${now.getDate()}`;
  const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const style = fixed
    ? "position: fixed; bottom: 10px; left: 10px; background-color: #F48120; color: white; padding: 2px 4px; font-size: 10px; border-radius: 4px; z-index: 10000; font-family: sans-serif;"
    : "background-color: #F48120; color: white; padding: 2px 4px; font-size: 10px; border-radius: 4px; font-family: sans-serif; display: inline-block;";

  return `
    <div id="cloudcache-validated-badge" style="${style}">
      Cloudcache ${date} ${time}
    </div>
  `;
}
