document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const adblockToggle = document.getElementById('adblock-toggle');
  const videoAdsToggle = document.getElementById('video-ads-toggle');
  const bannerAdsToggle = document.getElementById('banner-ads-toggle');
  const statusText = document.getElementById('status-text');
  const adsBlockedToday = document.getElementById('ads-blocked-today');
  const adsBlockedTotal = document.getElementById('ads-blocked-total');

  // Load stored settings
  loadSettings();
  loadStatistics();

  // Event listeners
  adblockToggle.addEventListener('change', updateMainToggle);
  videoAdsToggle.addEventListener('change', updateSettings);
  bannerAdsToggle.addEventListener('change', updateSettings);

  /**
   * Load and apply saved settings
   */
  function loadSettings() {
    chrome.storage.local.get({
      enabled: true,
      blockVideoAds: true,
      blockBannerAds: true
    }, (settings) => {
      adblockToggle.checked = settings.enabled;
      videoAdsToggle.checked = settings.blockVideoAds;
      bannerAdsToggle.checked = settings.blockBannerAds;
      
      // Update UI based on enabled state
      updateUI(settings.enabled);
      
      // Disable option toggles if main toggle is off
      videoAdsToggle.disabled = !settings.enabled;
      bannerAdsToggle.disabled = !settings.enabled;
    });
  }

  /**
   * Load and display statistics
   */
  function loadStatistics() {
    chrome.storage.local.get({
      statsToday: 0,
      statsTotal: 0,
      lastDate: new Date().toDateString()
    }, (stats) => {
      // Reset daily stats if it's a new day
      const today = new Date().toDateString();
      if (today !== stats.lastDate) {
        chrome.storage.local.set({
          statsToday: 0,
          lastDate: today
        });
        adsBlockedToday.textContent = '0';
      } else {
        adsBlockedToday.textContent = stats.statsToday;
      }
      
      adsBlockedTotal.textContent = stats.statsTotal;
    });
  }

  /**
   * Update the main toggle state and propagate changes
   */
  function updateMainToggle() {
    const enabled = adblockToggle.checked;
    
    chrome.storage.local.set({
      enabled: enabled
    });
    
    // Update UI based on new state
    updateUI(enabled);
    
    // Disable option toggles if main toggle is off
    videoAdsToggle.disabled = !enabled;
    bannerAdsToggle.disabled = !enabled;
    
    // Communicate change to content scripts
    notifyContentScripts();
  }

  /**
   * Update settings based on option toggles
   */
  function updateSettings() {
    chrome.storage.local.set({
      blockVideoAds: videoAdsToggle.checked,
      blockBannerAds: bannerAdsToggle.checked
    });
    
    // Communicate changes to content scripts
    notifyContentScripts();
  }

  /**
   * Update the UI based on enabled state
   */
  function updateUI(enabled) {
    if (enabled) {
      statusText.textContent = 'Active';
      statusText.style.color = 'var(--success-color)';
    } else {
      statusText.textContent = 'Inactive';
      statusText.style.color = 'var(--text-secondary)';
    }
  }

  /**
   * Send updated settings to all active content scripts
   */
  function notifyContentScripts() {
    chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'settingsUpdated' })
          .catch(() => {
            // Ignore errors for tabs where content script isn't loaded yet
          });
      });
    });
  }
});