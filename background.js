console.log("Background script started.");

// Add your background script logic here.

chrome.runtime.onInstalled.addListener(function () {
  console.log("Extension installed or updated.");
});

var users = [{
  name: "ahmet",
  pass: "1234"
}, {
  name: "mehmet",
  pass: "4567"
}];

var loggedin = false

chrome.storage.local.set({ users: users, loggedin: loggedin }, function () {
  console.log("Users and loggedin flag are created in background.");
});


let isFirstWindow = true;

chrome.windows.onCreated.addListener(function() {
  if (isFirstWindow) {
    isFirstWindow = false;
    chrome.storage.local.set({ loggedin: false }, () => {
      showBookmarkPopup();
    });
  }
});



// More event listeners and background script logic...
