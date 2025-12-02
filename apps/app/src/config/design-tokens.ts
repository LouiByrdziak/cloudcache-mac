/**
 * Design Tokens for Cloudcache Dashboard
 *
 * Centralized brand colors and theme variables extracted from
 * preview-v3-chunky-toggles-clean-sidebar.html
 *
 * See: .cursor/rules/cloud-preview-design.mdc
 */

// Brand colors (ENFORCED per cloud-preview-design.mdc)
export const BRAND_COLORS = {
  primary: "#F48120",
  light: "#ff9a3c",
  textDark: "#ffa94d", // On dark backgrounds
  textLight: "#b35500", // On light backgrounds
} as const;

// Dark theme tokens (default)
export const DARK_THEME = {
  bg: "#0d0d0d",
  bgSurface: "#1a1a1a",
  bgHover: "#262626",
  bgSecondary: "#141414",
  bgTertiary: "#1f1f1f",
  border: "#333",
  borderHover: "#444",
  text: "#e3e3e3",
  textSecondary: "#b5b5b5",
  textDim: "#757575",
  textCritical: "#ff8a80",
  icon: "#b5b5b5",
  brand: BRAND_COLORS.primary,
  brandLight: BRAND_COLORS.light,
  brandText: BRAND_COLORS.textDark,
} as const;

// Light theme tokens
export const LIGHT_THEME = {
  bg: "#f1f1f1",
  bgSurface: "#fff",
  bgHover: "#f6f6f7",
  bgSecondary: "#f6f6f7",
  bgTertiary: "#ebebeb",
  border: "#c9cccf",
  borderHover: "#8c9196",
  text: "#202223",
  textSecondary: "#6d7175",
  textDim: "#8c9196",
  icon: "#5c5f62",
  brandText: BRAND_COLORS.textLight,
} as const;

// Layout tokens
export const LAYOUT = {
  sidebarWidth: "220px",
  panelMaxWidth: "460px",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

// Typography tokens
export const TYPOGRAPHY = {
  fontFamily: "'Inter', -apple-system, sans-serif",
  monoFamily: "'JetBrains Mono', monospace",
} as const;

// Toggle switch dimensions (ENFORCED per cloud-preview-design.mdc)
export const TOGGLE_DIMENSIONS = {
  width: "52px",
  height: "28px",
  knobSize: "22px",
} as const;

/**
 * Generate CSS custom properties string for embedding in styles
 */
export function generateCSSVariables(): string {
  return `
:root {
  --bg: ${DARK_THEME.bg};
  --bg-surface: ${DARK_THEME.bgSurface};
  --bg-hover: ${DARK_THEME.bgHover};
  --bg-secondary: ${DARK_THEME.bgSecondary};
  --bg-tertiary: ${DARK_THEME.bgTertiary};
  --border: ${DARK_THEME.border};
  --border-hover: ${DARK_THEME.borderHover};
  --text: ${DARK_THEME.text};
  --text-secondary: ${DARK_THEME.textSecondary};
  --text-dim: ${DARK_THEME.textDim};
  --text-critical: ${DARK_THEME.textCritical};
  --icon: ${DARK_THEME.icon};
  --brand: ${BRAND_COLORS.primary};
  --brand-light: ${BRAND_COLORS.light};
  --brand-text: ${DARK_THEME.brandText};
  --sidebar-w: ${LAYOUT.sidebarWidth};
  --panel-max-w: ${LAYOUT.panelMaxWidth};
  --ease: ${LAYOUT.ease};
  --font: ${TYPOGRAPHY.fontFamily};
  --mono: ${TYPOGRAPHY.monoFamily};
}

body.light {
  --bg: ${LIGHT_THEME.bg};
  --bg-surface: ${LIGHT_THEME.bgSurface};
  --bg-hover: ${LIGHT_THEME.bgHover};
  --bg-secondary: ${LIGHT_THEME.bgSecondary};
  --bg-tertiary: ${LIGHT_THEME.bgTertiary};
  --border: ${LIGHT_THEME.border};
  --border-hover: ${LIGHT_THEME.borderHover};
  --text: ${LIGHT_THEME.text};
  --text-secondary: ${LIGHT_THEME.textSecondary};
  --text-dim: ${LIGHT_THEME.textDim};
  --icon: ${LIGHT_THEME.icon};
  --brand-text: ${LIGHT_THEME.brandText};
}
`;
}
