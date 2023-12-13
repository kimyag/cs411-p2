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


chrome.storage.local.set({ users: users, loggedin: "" }, function () {
  console.log("Users and loggedin flag are created in background.");
});


let isFirstWindow = true;

chrome.windows.onCreated.addListener(function() {
  if (isFirstWindow) {
    //bookmarksTabOnLogout();
    chrome.bookmarks.getTree((tree) => {
        var rootChildren = tree[0].children;
        var bookmarksTab = rootChildren[0].children;

        for (const bookmark of bookmarksTab) {
            chrome.bookmarks.removeTree(bookmark.id, () => {
                location.reload();
            });
        }
    });
    isFirstWindow = false;
    chrome.storage.local.set({ loggedin: "" }, () => {
      showBookmarkPopup();
    });
  }
});



// More event listeners and background script logic...
