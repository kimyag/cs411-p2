document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentUrl = tabs[0].url;
        var pageTitle = tabs[0].title;

        document.getElementById("urlInput").value = currentUrl;
        document.getElementById("titleInput").placeholder = pageTitle;
    });

    document.getElementById("addBookmarkButton").addEventListener("click", function () {
        addBookmark();
    });

    document.getElementById("goToBookmarksButton").addEventListener("click", function () {
        chrome.tabs.create({ url: chrome.runtime.getURL('bookmarks.html') });
    });
});

function addBookmark() {
    var titleInput = document.getElementById("titleInput").value || document.getElementById("titleInput").placeholder;
    var urlInput = document.getElementById("urlInput").value;

    if (urlInput) {
        chrome.storage.local.get({ bookmarks: [] }, function (result) {
            var bookmarks = result.bookmarks || [];

            // Check if the URL already exists in bookmarks
            var existingBookmarkIndex = bookmarks.findIndex(function (bookmark) {
                return bookmark.url === urlInput;
            });

            if (existingBookmarkIndex !== -1) {
                // Update the title of the existing bookmark
                bookmarks[existingBookmarkIndex].title = titleInput;
            } else {
                // Add a new bookmark
                var bookmark = {
                    title: titleInput,
                    url: urlInput,
                    timestamp: new Date().getTime()
                };
                bookmarks.push(bookmark);
            }

            chrome.storage.local.set({ bookmarks: bookmarks }, function () {
                console.log("Bookmark added or updated successfully!");
                alert("Bookmark added or updated successfully!");
                location.reload()
            });
        });
    }
}
