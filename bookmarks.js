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

        bookmarks.forEach(function (bookmark, index) {
            if (bookmark.title.toLowerCase().includes(searchTerm) || bookmark.url.toLowerCase().includes(searchTerm)) {
                var bookmarkElement = document.createElement("div");
                var linkElement = document.createElement("a");
                var removeButton = document.createElement("button");
                var dateElement = document.createElement("span");
                linkElement.href = bookmark.url;


                linkElement.href = bookmark.url;
                linkElement.target = "_blank"; // Open link in a new tab
                linkElement.textContent = bookmark.title;

                dateElement.textContent = formatDate(bookmark.timestamp);

                removeButton.innerHTML = "&#x2716;"; // Unicode for "x"
                removeButton.className = "remove-button";
                removeButton.addEventListener('click', function () {
                    confirmRemoveBookmark(index, bookmark.title);
                });
                linkElement.style.display = "inline-block";
                removeButton.style.display = "inline-block";
                dateElement.style.display = "inline-block";

                bookmarkElement.appendChild(linkElement);
                bookmarkElement.appendChild(dateElement);
                bookmarkElement.appendChild(removeButton);

                bookmarksContainer.appendChild(bookmarkElement);
            }
        });
    });
}

searchInput.addEventListener('input', function () {
    displayBookmarks();
});

function formatDate(timestamp) {
    var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date(timestamp).toLocaleDateString('en-US', options);
}

function confirmRemoveBookmark(index, title) {
    var confirmation = confirm(`Are you sure you want to remove the bookmark "${title}"?`);
    if (confirmation) {
        removeBookmark(index);
        location.reload();
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
