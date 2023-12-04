document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentUrl = tabs[0].url;
        var pageTitle = tabs[0].title;

        document.getElementById("urlInput").value = currentUrl;
        document.getElementById("titleInput").placeholder = pageTitle;
    });

    displayBookmarks();
});

document.getElementById("addBookmarkButton").addEventListener("click", function () {
    addBookmark();
});

function addBookmark() {
    var titleInput = document.getElementById("titleInput").value || document.getElementById("titleInput").placeholder;
    var urlInput = document.getElementById("urlInput").value;

    if (urlInput) {
        chrome.storage.local.get({ bookmarks: [] }, function (result) {
            var bookmarks = result.bookmarks;

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
                displayBookmarks();
            });
        });
    }
}


function displayBookmarks() {
    var bookmarksContainer = document.getElementById("bookmarks-container");
    var searchInput = document.getElementById("searchInput");
    bookmarksContainer.innerHTML = ""; // Clear previous bookmarks

    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;

        bookmarks.forEach(function (bookmark, index) {
            var bookmarkElement = document.createElement("div");
            var titleElement = document.createElement("a");
            var removeButton = document.createElement("button");
            var dateElement = document.createElement("span");

            bookmarkElement.className = "bookmark-item"; // Added a class for styling

            titleElement.href = bookmark.url;
            titleElement.target = "_blank"; // Open link in a new tab
            titleElement.textContent = bookmark.title;

            dateElement.textContent = formatDate(bookmark.timestamp);

            removeButton.innerHTML = "&#x2716;"; // Unicode for "x"
            removeButton.className = "remove-button";
            removeButton.addEventListener('click', function () {
                confirmRemoveBookmark(index, bookmark.title);
            });

            bookmarkElement.appendChild(titleElement);
            bookmarkElement.appendChild(removeButton);
            bookmarkElement.appendChild(dateElement);

            bookmarksContainer.appendChild(bookmarkElement);
        });
    });
}

function formatDate(timestamp) {
    var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date(timestamp).toLocaleDateString('en-US', options);
}

function confirmRemoveBookmark(index, title) {
    var confirmation = confirm(`Are you sure you want to remove the bookmark "${title}"?`);
    if (confirmation) {
        removeBookmark(index);
    }
}

function removeBookmark(index) {
    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        bookmarks.splice(index, 1);

        chrome.storage.local.set({ bookmarks: bookmarks }, function () {
            console.log("Bookmark removed successfully!");
            displayBookmarks();
        });
    });
}

// Optional: If you want to include a search input for filtering bookmarks
searchInput.addEventListener('input', function () {
    displayBookmarks();
});
