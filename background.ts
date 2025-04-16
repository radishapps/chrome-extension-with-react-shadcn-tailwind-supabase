/// <reference types="chrome"/>

// Handle messages from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message.type === "sign-in-with-google") {
    // Open the OAuth page in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL("google-auth.html") });
  }
}); 