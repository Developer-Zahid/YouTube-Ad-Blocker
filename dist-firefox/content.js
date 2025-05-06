/**
 * YouTube Ad Blocker - Content Script
 * Runs on YouTube pages to detect and block ads
 */

// Configuration and state variables
let enabled = true;
let blockVideoAds = true;
let blockBannerAds = true;
let adObserver = null;
let skipButtonObserver = null;

// Initialize when the content script loads
initAdBlocker();

/**
 * Initialize the ad blocker with stored settings
 */
function initAdBlocker() {
  chrome.storage.local.get({
    enabled: true,
    blockVideoAds: true,
    blockBannerAds: true
  }, (settings) => {
    enabled = settings.enabled;
    blockVideoAds = settings.blockVideoAds;
    blockBannerAds = settings.blockBannerAds;
    
    if (enabled) {
      startAdBlocking();
    }
  });
}

/**
 * Start all ad blocking mechanisms
 */
function startAdBlocking() {
  // Set up observers for video ads
  if (blockVideoAds) {
    setupSkipAdButtonObserver();
    setupVideoAdObserver();
    
    // Initial check in case ads are already present
    skipAd();
    removeVideoAds();
  }
  
  // Set up observers for banner ads
  if (blockBannerAds) {
    setupBannerAdObserver();
    
    // Initial check for banner ads
    removeBannerAds();
  }
}

/**
 * Stop all ad blocking mechanisms
 */
function stopAdBlocking() {
  if (adObserver) {
    adObserver.disconnect();
    adObserver = null;
  }
  
  if (skipButtonObserver) {
    skipButtonObserver.disconnect();
    skipButtonObserver = null;
  }
}

/**
 * Set up observer to detect and click skip ad buttons
 */
function setupSkipAdButtonObserver() {
  if (skipButtonObserver) {
    skipButtonObserver.disconnect();
  }
  
  skipButtonObserver = new MutationObserver((mutations) => {
    skipAd();
  });
  
  skipButtonObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

/**
 * Set up observer to detect and remove video ads
 */
function setupVideoAdObserver() {
  if (adObserver) {
    adObserver.disconnect();
  }
  
  adObserver = new MutationObserver((mutations) => {
    removeVideoAds();
  });
  
  adObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

/**
 * Set up observer to detect and remove banner ads
 */
function setupBannerAdObserver() {
  const bannerObserver = new MutationObserver((mutations) => {
    removeBannerAds();
  });
  
  bannerObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

/**
 * Find and click skip ad button
 */
function skipAd() {
  if (!enabled || !blockVideoAds) return;
  
  // Look for various skip ad button selectors
  const skipButtons = [
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.ytp-skip-ad-button',
    '.videoAdUiSkipButton',
    '[data-text="Skip Ad"]',
    '[data-text="Skip Ads"]'
  ];
  
  for (const selector of skipButtons) {
    const skipButton = document.querySelector(selector);
    if (skipButton) {
      skipButton.click();
      notifyAdBlocked();
      return; // Return after clicking to avoid multiple clicks
    }
  }
}

/**
 * Remove video ads by manipulating the video player
 */
function removeVideoAds() {
  if (!enabled || !blockVideoAds) return;
  
  // Check for ad indicators
  const adIndicators = [
    '.ad-showing',
    '.ad-interrupting',
    '.ytp-ad-player-overlay'
  ];
  
  let isAdPlaying = false;
  for (const selector of adIndicators) {
    if (document.querySelector(selector)) {
      isAdPlaying = true;
      break;
    }
  }
  
  if (isAdPlaying) {
    // Find the video element
    const video = document.querySelector('video');
    if (video) {
      // Skip to the end of the ad
      video.currentTime = video.duration;
      notifyAdBlocked();
    }
  }
}

/**
 * Remove banner and overlay ads
 */
function removeBannerAds() {
  if (!enabled || !blockBannerAds) return;
  
  const bannerAdSelectors = [
    '.ytd-display-ad-renderer',
    '.ytd-statement-banner-renderer',
    '.ytd-in-feed-ad-layout-renderer',
    '.ytd-banner-promo-renderer',
    '.ytd-video-masthead-ad-v3-renderer',
    '.ytd-primetime-promo-renderer',
    '.ytd-ad-slot-renderer',
    '.ad-container',
    '.ad-div',
    '.masthead-ad',
    '.ytd-promoted-video-renderer',
    '.ytd-merch-shelf-renderer',
    '#player-ads',
    '#panels',
    '#masthead-ad'
  ];
  
  for (const selector of bannerAdSelectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach(element => {
        element.style.display = 'none';
        notifyAdBlocked();
      });
    }
  }
}

/**
 * Notify the background script that an ad was blocked
 */
function notifyAdBlocked() {
  chrome.runtime.sendMessage({ action: 'adBlocked' });
}

/**
 * Listen for settings changes from popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'settingsUpdated') {
    initAdBlocker();
    return true;
  }
});

// Additional utility to detect when page changes (for YouTube SPA)
let currentUrl = location.href;
setInterval(() => {
  if (currentUrl !== location.href) {
    currentUrl = location.href;
    
    // Restart ad blocking on page navigation
    if (enabled) {
      setTimeout(() => {
        removeVideoAds();
        removeBannerAds();
      }, 1000);
    }
  }
}, 1000);