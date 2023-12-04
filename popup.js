document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addBookmarkButton').addEventListener('click', addBookmark);
    document.getElementById('viewBookmarksButton').addEventListener('click', viewBookmarks);
    displayBookmarks();
});

function addBookmark() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var url = tabs[0].url;
        if (url) {
            saveBookmark(url);
        } else {
            console.error("Unable to get the current URL.");
        }
    });
}

function saveBookmark(url) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var title = tabs[0].title || "Untitled";
        chrome.storage.local.get({ bookmarks: [] }, function (result) {
            var bookmarks = result.bookmarks;
            bookmarks.push({ title: title, url: url, timestamp: new Date().toLocaleString() });

            chrome.storage.local.set({ bookmarks: bookmarks }, function () {
                console.log("Bookmark added successfully!");
                displayBookmarks();
            });
        });
    });
}


function viewBookmarks() {
    chrome.tabs.create({ url: chrome.runtime.getURL('bookmarks.html') });
}

function displayBookmarks() {
    var bookmarksContainer = document.getElementById("bookmarks-container");
    bookmarksContainer.innerHTML = "";

    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        bookmarks.forEach(function (bookmark) {
            var bookmarkElement = document.createElement("div");
            var linkElement = document.createElement("a");
            linkElement.href = bookmark.url;
            linkElement.target = "_blank"; // Open link in a new tab
            linkElement.textContent = `${bookmark.title} (Added on: ${bookmark.timestamp})`;
            bookmarkElement.appendChild(linkElement);
            bookmarksContainer.appendChild(bookmarkElement);
        });
    });
}

