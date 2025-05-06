/**
 * YouTube Ad Blocker - Background Script
 * Handles initialization and communication between different parts of the extension
 */

// Initialize default settings if not already set
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({
    enabled: true,
    blockVideoAds: true,
    blockBannerAds: true,
    statsToday: 0,
    statsTotal: 0,
    lastDate: new Date().toDateString()
  }, (data) => {
    // Only set if they don't already exist
    if (data.enabled === undefined) {
      chrome.storage.local.set({
        enabled: true,
        blockVideoAds: true,
        blockBannerAds: true,
        statsToday: 0,
        statsTotal: 0,
        lastDate: new Date().toDateString()
      });
    }
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'adBlocked') {
    updateStatistics();
    return true;
  }
});

/**
 * Update ad blocking statistics
 */
function updateStatistics() {
  const today = new Date().toDateString();
  
  chrome.storage.local.get({
    statsToday: 0,
    statsTotal: 0,
    lastDate: today
  }, (stats) => {
    // Reset daily stats if it's a new day
    if (today !== stats.lastDate) {
      chrome.storage.local.set({
        statsToday: 1,
        statsTotal: stats.statsTotal + 1,
        lastDate: today
      });
    } else {
      chrome.storage.local.set({
        statsToday: stats.statsToday + 1,
        statsTotal: stats.statsTotal + 1
      });
    }
  });
}