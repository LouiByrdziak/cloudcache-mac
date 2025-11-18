import { AnnouncementBar } from '../components/AnnouncementBar';
import { Navigation, type NavItem } from '../components/Navigation';
import { Dashboard } from '../components/Dashboard';
import { Footer } from '../components/Footer';
import { styles } from '../components/styles';

export interface PageProps {
  faviconBase64?: string;
  title?: string;
  activeNavItem?: string;
  navItems?: NavItem[];
  dashboardContent?: string;
  dashboardTitle?: string;
  storeName?: string;
  planName?: string;
  connectButtonText?: string;
  optimizations?: Array<{
    id: string;
    title: string;
    description: string;
    enabled: boolean;
  }>;
  announcement?: {
    message?: string;
    type?: 'info' | 'warning' | 'success';
  };
  footer?: {
    copyright?: string;
    links?: Array<{ text: string; href: string }>;
  };
}

export function renderPage(props: PageProps = {}): string {
  const {
    faviconBase64,
    title = "Cloudcache APP",
    activeNavItem,
    navItems = [],
    dashboardContent,
    dashboardTitle,
    storeName,
    planName,
    connectButtonText,
    optimizations = [],
    announcement,
    footer,
  } = props;

  const faviconLinks = faviconBase64 ? `
    <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64,${faviconBase64}">
    <link rel="shortcut icon" type="image/x-icon" href="data:image/x-icon;base64,${faviconBase64}">
    <link rel="icon" type="image/x-icon" href="/favicon.ico?v=1">
    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=1">
  ` : '';

  // Determine if we need layout adjustments (nav/footer/announcement)
  const hasNav = navItems.length > 0;
  const hasFooter = footer && (footer.copyright || (footer.links && footer.links.length > 0));
  const hasAnnouncement = announcement && announcement.message;
  
  // Adjust container margin if nav exists
  const containerStyle = hasNav ? '' : 'style="margin-left: 0; margin-top: 0;"';
  const bodyStyle = hasNav || hasAnnouncement || hasFooter ? '' : 'style="justify-content: center; align-items: center;"';

  // Safely render components with error handling
  let announcementHtml = '';
  let navHtml = '';
  let dashboardHtml = '';
  let footerHtml = '';
  
  try {
    if (hasAnnouncement && announcement) {
      announcementHtml = AnnouncementBar(announcement);
    }
  } catch (e) {
    // Silently fail announcement bar
  }
  
  try {
    if (hasNav && navItems.length > 0) {
      navHtml = Navigation({ items: navItems, activeItem: activeNavItem });
    }
  } catch (e) {
    // Silently fail navigation
  }
  
  try {
    if (dashboardContent) {
      dashboardHtml = Dashboard({ content: dashboardContent });
    } else {
      dashboardHtml = Dashboard({ title: dashboardTitle, storeName, planName, connectButtonText, optimizations });
    }
  } catch (e) {
    dashboardHtml = '<div class="container"><h1>Error loading dashboard</h1></div>';
  }
  
  try {
    if (hasFooter && footer) {
      footerHtml = Footer(footer);
    }
  } catch (e) {
    // Silently fail footer
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${faviconLinks}
  <title>${title || 'CloudCache Dashboard'}</title>
  <style>${styles || ''}</style>
</head>
<body ${bodyStyle || ''}>
  ${announcementHtml}
  ${navHtml}
  ${dashboardHtml}
  ${footerHtml}
  <script>
    // Handle optimization toggle switches
    document.addEventListener('DOMContentLoaded', function() {
      const toggleInputs = document.querySelectorAll('.toggle-input[data-optimization-id]');
      
      toggleInputs.forEach(toggle => {
        toggle.addEventListener('change', async function() {
          const optimizationId = this.getAttribute('data-optimization-id');
          const enabled = this.checked;
          const originalState = !enabled;
          
          // Disable toggle while processing
          this.disabled = true;
          
          try {
            // Only handle rocket-loader for now
            if (optimizationId === 'rocket-loader') {
              const response = await fetch('/api/v1/optimizations/rocket-loader', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled }),
              });
              
              let errorMessage = 'Failed to toggle Rocket Loader. Please try again.';
              
              if (!response.ok) {
                try {
                  const errorData = await response.json();
                  errorMessage = errorData.message || errorData.error || errorMessage;
                  console.error('Failed to toggle Rocket Loader:', {
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
                alert(errorMessage);
              } else {
                try {
                  const result = await response.json();
                  console.log('Rocket Loader toggled successfully:', result);
                } catch (parseError) {
                  console.warn('Success response but failed to parse JSON:', parseError);
                }
              }
            } else {
              // For other optimizations, just log (not implemented yet)
              console.log('Toggle for', optimizationId, 'changed to', enabled);
              // Revert since not implemented
              this.checked = originalState;
              alert('This optimization is not yet implemented.');
            }
          } catch (error) {
            console.error('Error toggling optimization:', error);
            // Revert toggle on error
            this.checked = originalState;
            const errorMsg = error instanceof Error ? error.message : String(error);
            alert('An error occurred: ' + errorMsg);
          } finally {
            // Re-enable toggle
            this.disabled = false;
          }
        });
      });
    });
  </script>
</body>
</html>
  `.trim();
}
