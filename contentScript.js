// This file is required for Manifest V3, but we don't need any code here for this extension.
// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "captureScreenshot") {
    // Capture the screenshot
    chrome.scripting.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      sendResponse({ dataUrl: dataUrl });
    });
    // Return true to indicate that we will send the response asynchronously
    return true;
  }
});
