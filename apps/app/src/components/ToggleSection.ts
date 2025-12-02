export interface SliderOption {
  value: number | string;
  label: string;
}

export interface Optimization {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  controlType?: "toggle" | "slider";
  options?: SliderOption[];
  currentValue?: number | string | null;
  currentLabel?: string | null;
}

export interface ToggleSectionProps {
  optimizations?: Optimization[];
}

export function ToggleSection(props: ToggleSectionProps = {}): string {
  const { optimizations = [] } = props;

  // If no optimizations provided, return empty string (component not used)
  if (optimizations.length === 0) {
    return "";
  }

  // Escape HTML to prevent XSS
  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return `
    <div class="optimization-list">
      ${optimizations
        .map((opt) => {
          const isSlider = opt.controlType === "slider";

          if (isSlider) {
            // Slider control - toggle that opens a slide-out panel (always ON)
            return `
            <div class="optimization-item optimization-item-slider card" data-slider-id="${escapeHtml(opt.id || "")}" data-id="${escapeHtml(opt.id || "")}">
              <div class="optimization-content">
                <div class="optimization-title">${escapeHtml(opt.title || "")}</div>
                <div class="optimization-description">${escapeHtml(opt.description || "")}</div>
                ${opt.currentLabel ? `<div class="optimization-value">${escapeHtml(opt.currentLabel)}</div>` : ""}
              </div>
              <button class="card__info" data-panel="${escapeHtml(opt.id || "")}" aria-label="Learn more about ${escapeHtml(opt.title || "")}">ⓘ</button>
              <label class="toggle-container toggle-slider-trigger" data-slider-id="${escapeHtml(opt.id || "")}">
                <input type="checkbox" class="toggle-input toggle-always-on" checked disabled data-slider-id="${escapeHtml(opt.id || "")}">
                <span class="toggle-slider"></span>
              </label>
            </div>
          `;
          } else {
            // Regular toggle control with info button for help panel
            return `
            <div class="optimization-item card" data-id="${escapeHtml(opt.id || "")}">
              <div class="optimization-content">
                <div class="optimization-title">${escapeHtml(opt.title || "")}</div>
                <div class="optimization-description">${escapeHtml(opt.description || "")}</div>
              </div>
              <button class="card__info" data-panel="${escapeHtml(opt.id || "")}" aria-label="Learn more about ${escapeHtml(opt.title || "")}">ⓘ</button>
              <label class="toggle-container">
                <input type="checkbox" class="toggle-input" ${opt.enabled ? "checked" : ""} data-optimization-id="${escapeHtml(opt.id || "")}">
                <span class="toggle-slider"></span>
              </label>
            </div>
          `;
          }
        })
        .join("")}
    </div>
  `;
}

// Generate the slide-out panel HTML for slider options
export function generateSliderPanels(optimizations: Optimization[]): string {
  const sliderOpts = optimizations.filter((opt) => opt.controlType === "slider" && opt.options);

  if (sliderOpts.length === 0) return "";

  // Escape HTML to prevent XSS
  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  return `
    <!-- Slide-out Panel Overlay -->
    <div class="slider-panel-overlay" id="slider-panel-overlay"></div>
    
    <!-- Slide-out Panels -->
    ${sliderOpts
      .map(
        (opt) => `
      <div class="slider-panel" id="slider-panel-${escapeHtml(opt.id)}" data-setting-id="${escapeHtml(opt.id)}">
        <div class="slider-panel-header">
          <h3 class="slider-panel-title">${escapeHtml(opt.title || "")}</h3>
          <button class="slider-panel-close" aria-label="Close panel">×</button>
        </div>
        <div class="slider-panel-content">
          <p class="slider-panel-description">${escapeHtml(opt.description || "")}</p>
          <div class="slider-options">
            ${(opt.options || [])
              .map(
                (option) => `
              <label class="slider-option">
                <input type="radio" 
                       name="slider-${escapeHtml(opt.id)}" 
                       value="${option.value}" 
                       ${opt.currentValue === option.value ? "checked" : ""}
                       class="slider-radio"
                       data-setting-id="${escapeHtml(opt.id)}"
                       data-label="${escapeHtml(option.label)}">
                <span class="slider-option-indicator"></span>
                <span class="slider-option-label">${escapeHtml(option.label)}</span>
              </label>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `
      )
      .join("")}
  `;
}
