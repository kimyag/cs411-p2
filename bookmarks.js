document.addEventListener('DOMContentLoaded', function () {
    displayBookmarks();
});



function displayBookmarks() {
    var bookmarksContainer = document.getElementById("bookmarks-container");
    var searchInput = document.getElementById("searchInput");
    bookmarksContainer.innerHTML = ""; // Clear previous bookmarks

    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        var searchTerm = searchInput.value.toLowerCase();

        bookmarks.forEach(function (bookmark) {
            if (bookmark.title.toLowerCase().includes(searchTerm) || bookmark.url.toLowerCase().includes(searchTerm)) {
                var bookmarkElement = document.createElement("div");
                var linkElement = document.createElement("a");
                linkElement.href = bookmark.url;
                linkElement.target = "_blank"; // Open link in a new tab
                linkElement.textContent = `${bookmark.title} (Added on: ${bookmark.timestamp})`;
                bookmarkElement.appendChild(linkElement);
                bookmarksContainer.appendChild(bookmarkElement);
            }
        });
    });
}

searchInput.addEventListener('input', function () {
    displayBookmarks();
});

