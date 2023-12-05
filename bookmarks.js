document.addEventListener('DOMContentLoaded', function () {
    var searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            displayBookmarks(searchInput);
        });
    }
    displayBookmarks(searchInput);
    displayFoldersList();
    document.getElementById("addFolderButton").addEventListener("click", openAddFolderPopup);
    
});

function displayBookmarks(searchInput) {
    var bookmarksContainer = document.getElementById("bookmarks-container");
    bookmarksContainer.innerHTML = ""; // Clear previous bookmarks
    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        var searchTerm = ''
        if (searchInput){
            searchTerm = searchInput.value.toLowerCase();
        }

        bookmarks.forEach(function (bookmark, index) {
            if (bookmark.title.toLowerCase().includes(searchTerm) || bookmark.url.toLowerCase().includes(searchTerm)) {
                var bookmarkElement = document.createElement("div");
                var linkElement = document.createElement("a");
                var removeButton = document.createElement("button");
                var dateElement = document.createElement("span");
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


function displayFoldersList() {
    chrome.storage.local.get({ folders: [] }, function (result) {
        var folders = result.folders || [];
        var foldersContainer = document.getElementById("folders-container");
        foldersContainer.innerHTML = ""; // Clear previous folders

        folders.forEach(function (folder) {
            var folderElement = document.createElement("div");
            folderElement.className = "folder";
            folderElement.textContent = folder;

            // Add an event listener if you want to do something when clicking a folder
            folderElement.addEventListener('click', function () {
                // Handle the click event for the folder
                // For example, you can open a folder or do something else
                console.log("Folder clicked:", folder);
            });

            foldersContainer.appendChild(folderElement);
        });
    });
}
function openAddFolderPopup() {
    var addFolderPopup = document.getElementById("addFolderPopup");
    addFolderPopup.style.display = "block";
}

