// This file is required for Manifest V3, but we don't need any code here for this extension.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureScreenshot") {
    // Capture the screenshot of the current tab.
    chrome.tabs.captureVisibleTab((screenshotUrl) => {
      // Send the screenshot URL back to the popup script.
      chrome.runtime.sendMessage({
        action: "screenshotCaptured",
        screenshotUrl,
      });
    });
  }
});
