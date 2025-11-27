// Declare browser namespace for Safari/Firefox compatibility
declare const browser: typeof chrome | undefined;

/**
 * Create the DevTools panel with cross-browser compatibility.
 * Safari has known issues with DevTools extension APIs that can cause crashes.
 * This implementation includes error handling and fallbacks.
 */
function createPanel() {
  // Use browser.* namespace if available (Safari/Firefox), fallback to chrome.*
  const devtools =
    (typeof browser !== "undefined" ? browser?.devtools : null) ||
    chrome?.devtools;

  if (!devtools?.panels) {
    console.error("DevTools panels API not available");
    return;
  }

  try {
    devtools.panels.create(
      "OPFS Explorer",
      "icons/icon-128.png",
      "panel.html",
      (panel) => {
        if (panel) {
          console.log("OPFS Explorer panel created successfully");
        } else {
          console.warn("OPFS Explorer panel creation returned null panel");
        }
      }
    );
  } catch (e) {
    console.error("Failed to create DevTools panel:", e);
  }
}

// Initialize panel creation
createPanel();
