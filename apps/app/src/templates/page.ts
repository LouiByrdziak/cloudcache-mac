import { AnnouncementBar } from "../components/AnnouncementBar";
import { Navigation, type NavItem } from "../components/Navigation";
import { Dashboard } from "../components/Dashboard";
import { Footer } from "../components/Footer";
import { styles } from "../components/styles";
import { enhancedStyles } from "../components/enhancedStyles";
import { getCloudcacheValidatedBadge } from "@cloudcache/worker-utils";
import { generateSliderPanels, type SliderOption } from "../components/ToggleSection";

export interface PageSpeedData {
  mobile: number | null;
  desktop: number | null;
  lastUpdated?: string;
}

export interface PageProps {
  faviconBase64?: string;
  title?: string;
  activeNavItem?: string;
  pageId?: string;
  navItems?: NavItem[];
  dashboardContent?: string;
  dashboardTitle?: string;
  dashboardSubtitle?: string;
  storeName?: string;
  planName?: string;
  connectButtonText?: string;
  optimizations?: Array<{
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    controlType?: "toggle" | "slider";
    options?: SliderOption[];
    currentValue?: number | string | null;
    currentLabel?: string | null;
  }>;
  announcement?: {
    message?: string;
    type?: "info" | "warning" | "success";
  };
  footer?: {
    copyright?: string;
    links?: Array<{ text: string; href: string }>;
  };
  pageSpeed?: PageSpeedData;
}

export function renderPage(props: PageProps = {}): string {
  const {
    faviconBase64,
    title = "Cloudcache APP",
    activeNavItem,
    pageId,
    navItems = [],
    dashboardContent,
    dashboardTitle,
    dashboardSubtitle,
    storeName,
    planName,
    connectButtonText,
    optimizations = [],
    announcement,
    footer,
    pageSpeed,
  } = props;

  const faviconLinks = faviconBase64
    ? `
    <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64,${faviconBase64}">
    <link rel="shortcut icon" type="image/x-icon" href="data:image/x-icon;base64,${faviconBase64}">
    <link rel="icon" type="image/x-icon" href="/favicon.ico?v=1">
    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=1">
  `
    : "";

  // Determine if we need layout adjustments (nav/footer/announcement)
  const hasNav = navItems.length > 0;
  const hasFooter = footer && (footer.copyright || (footer.links && footer.links.length > 0));
  const hasAnnouncement = announcement && announcement.message;

  // Adjust body style based on layout components
  const bodyStyle =
    hasNav || hasAnnouncement || hasFooter
      ? ""
      : 'style="justify-content: center; align-items: center;"';

  // Safely render components with error handling
  let announcementHtml = "";
  let navHtml = "";
  let dashboardHtml = "";
  let footerHtml = "";
  let sliderPanelsHtml = "";

  try {
    if (hasAnnouncement && announcement) {
      announcementHtml = AnnouncementBar(announcement);
    }
  } catch {
    // Silently fail announcement bar
  }

  try {
    if (hasNav && navItems.length > 0) {
      navHtml = Navigation({ items: navItems, activeItem: activeNavItem });
    }
  } catch {
    // Silently fail navigation
  }

  try {
    if (dashboardContent) {
      dashboardHtml = Dashboard({ content: dashboardContent });
    } else {
      dashboardHtml = Dashboard({
        title: dashboardTitle,
        subtitle: dashboardSubtitle,
        storeName,
        planName,
        connectButtonText,
        optimizations,
        pageId,
        pageSpeed,
      });
    }
  } catch {
    dashboardHtml = '<div class="container"><h1>Error loading dashboard</h1></div>';
  }

  try {
    if (hasFooter && footer) {
      footerHtml = Footer(footer);
    }
  } catch {
    // Silently fail footer
  }

  // Generate slider panels for any slider-type controls
  try {
    sliderPanelsHtml = generateSliderPanels(optimizations);
  } catch {
    // Silently fail slider panels
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${faviconLinks}
  <title>${title || "CloudCache Dashboard"}</title>
  <style>${styles || ""}${enhancedStyles || ""}</style>
</head>
<body ${bodyStyle || ""}>
  ${announcementHtml}
  ${navHtml}
  ${dashboardHtml}
  ${footerHtml}
  ${sliderPanelsHtml}
  
  <!-- Theme Toggle - Bottom Right -->
  <div class="theme-toggle">
    <label class="toggle-container">
      <input type="checkbox" class="toggle-input" id="theme-toggle-input">
      <span class="toggle-slider"></span>
    </label>
  </div>
  
  <script>
    // Theme toggle functionality
    (function() {
      const themeToggle = document.getElementById('theme-toggle-input');
      const savedTheme = localStorage.getItem('cloudcache-theme');
      
      // Apply saved theme on load
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.checked = true;
      }
      
      themeToggle.addEventListener('change', function() {
        if (this.checked) {
          document.body.classList.add('light-theme');
          localStorage.setItem('cloudcache-theme', 'light');
        } else {
          document.body.classList.remove('light-theme');
          localStorage.setItem('cloudcache-theme', 'dark');
        }
      });
    })();
    
    // ===== TOGGLE SYNC MANAGER =====
    // Real-time toggle state synchronization via WebSocket
    class ToggleSyncManager {
      constructor() {
        this.toggles = {};
        this.serviceWorkerReady = false;
        this.shopDomain = this.getShopDomain();
      }
      
      getShopDomain() {
        // Extract shop domain from URL params or use default
        const params = new URLSearchParams(window.location.search);
        return params.get('shop') || window.location.hostname;
      }
      
      async init() {
        // Layer 1: Load from localStorage (instant, possibly stale)
        this.loadFromLocalStorage();
        this.render();
        
        // Layer 2: Register Service Worker for persistent WebSocket
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            
            // Wait for the service worker to be ready
            await navigator.serviceWorker.ready;
            this.serviceWorkerReady = true;
            
            // Initialize connection
            navigator.serviceWorker.controller?.postMessage({
              type: 'INIT',
              shopDomain: this.shopDomain
            });
            
            // Listen for messages from Service Worker
            navigator.serviceWorker.addEventListener('message', (e) => {
              this.handleMessage(e.data);
            });
          } catch (error) {
            console.error('[ToggleSync] Service Worker registration failed:', error);
          }
        }
        
        // Layer 3: Refetch on tab focus (catch up if tab was hidden)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && this.serviceWorkerReady) {
            navigator.serviceWorker.controller?.postMessage({ type: 'REQUEST_STATE' });
          }
        });
      }
      
      loadFromLocalStorage() {
        try {
          const cached = localStorage.getItem('toggleState');
          if (cached) {
            const data = JSON.parse(cached);
            this.toggles = data.toggles || data;
          }
        } catch (error) {
          console.error('[ToggleSync] Failed to load from localStorage:', error);
        }
      }
      
      saveToLocalStorage() {
        try {
          localStorage.setItem('toggleState', JSON.stringify({
            toggles: this.toggles,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('[ToggleSync] Failed to save to localStorage:', error);
        }
      }
      
      handleMessage(msg) {
        if (msg.type === 'FULL_STATE') {
          this.toggles = msg.toggles || {};
          this.saveToLocalStorage();
          this.render();
        }
        
        if (msg.type === 'TOGGLE_UPDATE' && msg.toggleId) {
          this.toggles[msg.toggleId] = msg.value;
          this.saveToLocalStorage();
          this.renderSingle(msg.toggleId);
        }
      }
      
      render() {
        // Update all toggle UI elements
        Object.entries(this.toggles).forEach(([id, value]) => {
          this.renderSingle(id);
        });
      }
      
      renderSingle(toggleId) {
        const toggle = document.querySelector('[data-optimization-id="' + toggleId + '"]');
        if (toggle && toggle.checked !== this.toggles[toggleId]) {
          toggle.checked = this.toggles[toggleId];
        }
      }
      
      // Called when user toggles a switch
      toggle(id, value) {
        // Optimistic update
        this.toggles[id] = value;
        this.saveToLocalStorage();
        
        // Send to Service Worker for WebSocket broadcast
        if (this.serviceWorkerReady && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'TOGGLE_CHANGE',
            toggleId: id,
            value: value
          });
        }
      }
    }
    
    // Initialize toggle sync manager
    const toggleSyncManager = new ToggleSyncManager();
    toggleSyncManager.init().catch(err => console.error('[ToggleSync] Init failed:', err));
    
    // Handle optimization toggle switches
    document.addEventListener('DOMContentLoaded', function() {
      const toggleInputs = document.querySelectorAll('.toggle-input[data-optimization-id]');
      
      toggleInputs.forEach(toggle => {
        toggle.addEventListener('change', async function() {
          const optimizationId = this.getAttribute('data-optimization-id');
          const enabled = this.checked;
          const originalState = !enabled;
          
          // Add loading state
          const toggleContainer = this.closest('.toggle-container');
          toggleContainer.classList.add('loading');
          
          // Disable toggle while processing
          this.disabled = true;
          
          try {
            // Use the generic settings API endpoint
            const response = await fetch('/api/v1/settings/' + optimizationId, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ enabled }),
            });
            
            let errorMessage = 'Failed to toggle setting. Please try again.';
            
            if (!response.ok) {
              try {
                const errorData = await response.json();
                // Error response format: { error: { code, message, correlationId } }
                errorMessage = errorData.error?.message || errorData.message || errorMessage;
                console.error('Failed to toggle setting:', {
                  setting: optimizationId,
                  status: response.status,
                  statusText: response.statusText,
                  error: errorData,
                });
              } catch (parseError) {
                const errorText = await response.text();
                errorMessage = 'Server error (' + response.status + '): ' + (errorText || response.statusText);
                console.error('Failed to parse error response:', parseError, 'Raw response:', errorText);
              }
              
              // Revert toggle on error
              this.checked = originalState;
              showToast(errorMessage, 'error');
            } else {
              try {
                const result = await response.json();
                console.log('Setting toggled - Full Response:', JSON.stringify(result, null, 2));
                console.log('Cloudflare API Response:', result.cfResponse);
                if (result.cfResponse && result.cfResponse.actualValue !== undefined) {
                  console.log('Actual value from Cloudflare:', result.cfResponse.actualValue);
                }
                showToast(optimizationId.replace(/_/g, ' ') + ' ' + (enabled ? 'enabled' : 'disabled'), 'success');
              } catch (parseError) {
                console.warn('Success response but failed to parse JSON:', parseError);
              }
            }
          } catch (error) {
            console.error('Error toggling setting:', error);
            // Revert toggle on error
            this.checked = originalState;
            const errorMsg = error instanceof Error ? error.message : String(error);
            showToast('An error occurred: ' + errorMsg, 'error');
          } finally {
            // Re-enable toggle and remove loading state
            this.disabled = false;
            toggleContainer.classList.remove('loading');
          }
        });
      });
      
      // Handle slider panel triggers (toggle clicks)
      const sliderToggleTriggers = document.querySelectorAll('.toggle-slider-trigger');
      const overlay = document.getElementById('slider-panel-overlay');
      
      sliderToggleTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const sliderId = this.getAttribute('data-slider-id');
          const panel = document.getElementById('slider-panel-' + sliderId);
          if (panel && overlay) {
            // Close any other open panels first
            closeAllPanels();
            panel.classList.add('active');
            overlay.classList.add('active');
          }
        });
      });
      
      // Also allow clicking on the whole card to open slider
      const sliderItems = document.querySelectorAll('.optimization-item-slider');
      sliderItems.forEach(item => {
        item.addEventListener('click', function(e) {
          // If click was on the toggle, it will handle itself
          if (e.target.closest('.toggle-slider-trigger')) {
            return;
          }
          
          const sliderId = this.getAttribute('data-slider-id');
          const panel = document.getElementById('slider-panel-' + sliderId);
          if (panel && overlay) {
            closeAllPanels();
            panel.classList.add('active');
            overlay.classList.add('active');
          }
        });
      });
      
      // Handle slider panel close button
      const closeButtons = document.querySelectorAll('.slider-panel-close');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          closeAllPanels();
        });
      });
      
      // Close panel on overlay click (clicking outside the panel)
      if (overlay) {
        overlay.addEventListener('click', closeAllPanels);
      }
      
      // Also close panel when clicking anywhere on the page outside the panel
      document.addEventListener('click', function(e) {
        const clickedPanel = e.target.closest('.slider-panel');
        const clickedTrigger = e.target.closest('.toggle-slider-trigger');
        const clickedSliderItem = e.target.closest('.optimization-item-slider');
        
        // If we clicked outside the panel and outside any trigger
        if (!clickedPanel && !clickedTrigger && !clickedSliderItem) {
          closeAllPanels();
        }
      });
      
      // Handle slider radio selection
      const sliderRadios = document.querySelectorAll('.slider-radio');
      sliderRadios.forEach(radio => {
        radio.addEventListener('change', async function() {
          const settingId = this.getAttribute('data-setting-id');
          const value = this.value;
          const label = this.getAttribute('data-label');
          
          // Close the panel immediately
          closeAllPanels();
          
          // Update the value display
          updateSliderValueDisplay(settingId, label);
          
          // Send API request
          try {
            const response = await fetch('/api/v1/settings/' + settingId, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: parseInt(value, 10) }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              showToast(errorData.message || 'Failed to update setting', 'error');
            } else {
              const result = await response.json();
              console.log('Setting updated - Full Response:', JSON.stringify(result, null, 2));
              showToast('Browser Cache TTL set to ' + label, 'success');
            }
          } catch (error) {
            console.error('Error updating setting:', error);
            showToast('An error occurred', 'error');
          }
        });
      });
      
      function closeAllPanels() {
        document.querySelectorAll('.slider-panel.active').forEach(p => p.classList.remove('active'));
        if (overlay) overlay.classList.remove('active');
      }
      
      function updateSliderValueDisplay(settingId, label) {
        const item = document.querySelector('.optimization-item-slider[data-slider-id="' + settingId + '"]');
        if (item) {
          let valueEl = item.querySelector('.optimization-value');
          if (label) {
            if (!valueEl) {
              valueEl = document.createElement('div');
              valueEl.className = 'optimization-value';
              item.querySelector('.optimization-content').appendChild(valueEl);
            }
            valueEl.textContent = label;
          } else if (valueEl) {
            valueEl.remove();
          }
        }
      }
      
      // ===== ENHANCED ACCORDION FUNCTIONALITY =====
      // Handle accordion expand/collapse for enhanced toggle section
      const expandButtons = document.querySelectorAll('.expand-btn');
      
      expandButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const item = this.closest('.enhanced-optimization-item');
          if (!item) return;
          
          const isExpanded = item.classList.contains('expanded');
          const accordion = item.querySelector('.optimization-accordion');
          
          // Close all other accordions first
          document.querySelectorAll('.enhanced-optimization-item.expanded').forEach(openItem => {
            if (openItem !== item) {
              openItem.classList.remove('expanded');
              const openBtn = openItem.querySelector('.expand-btn');
              if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
              const openAccordion = openItem.querySelector('.optimization-accordion');
              if (openAccordion) openAccordion.setAttribute('aria-hidden', 'true');
            }
          });
          
          // Toggle current accordion
          if (isExpanded) {
            item.classList.remove('expanded');
            this.setAttribute('aria-expanded', 'false');
            if (accordion) accordion.setAttribute('aria-hidden', 'true');
          } else {
            item.classList.add('expanded');
            this.setAttribute('aria-expanded', 'true');
            if (accordion) accordion.setAttribute('aria-hidden', 'false');
            
            // Smooth scroll to show the expanded content
            setTimeout(() => {
              item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
          }
        });
      });
      
      // Also allow clicking on the feature icon or title to expand
      document.querySelectorAll('.enhanced-optimization-item .feature-icon, .enhanced-optimization-item .optimization-title').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', function(e) {
          const item = this.closest('.enhanced-optimization-item');
          if (!item) return;
          
          const expandBtn = item.querySelector('.expand-btn');
          if (expandBtn) {
            expandBtn.click();
          }
        });
      });
      
    });
    
    // Toast notification system
    function showToast(message, type) {
      // Remove existing toast
      const existingToast = document.querySelector('.toast');
      if (existingToast) {
        existingToast.remove();
      }
      
      const toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      // Trigger animation
      setTimeout(() => toast.classList.add('show'), 10);
      
      // Remove after 3 seconds
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  </script>
  ${getCloudcacheValidatedBadge()}
</body>
</html>
  `.trim();
}
