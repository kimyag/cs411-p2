document.addEventListener('DOMContentLoaded', function () {
    var searchInput = document.getElementById("searchInput");
    var foldersList = document.getElementById("foldersList");

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            displayBookmarks(searchInput.value); // Pass searchInput value
        });
    }




    displayBookmarks();
    displayFoldersList();

    document.getElementById("addFolderButton").addEventListener("click", openAddFolderPopup);
    var removeFolderButton = document.getElementById("removeFolderButton");
    removeFolderButton.addEventListener("click", function () {
        var folderDropdown = document.getElementById("folderDropdown");
        var selectedFolder = folderDropdown.value;

        if (selectedFolder !== 'Select a folder') {
            // Remove the selected folder from storage
            removeFolder(selectedFolder);

            // Update the bookmarks
            refreshFolderList(); // Call refreshFolderList before displaying bookmarks
            displayBookmarks(searchInput.value, selectedFolder);
        }
    });
});

function displayBookmarks(folderDropdown) {
    var bookmarksContainer = document.getElementById("bookmarks-container");
    var searchInput = document.getElementById("searchInput");
    bookmarksContainer.innerHTML = ""; 

    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        var searchTerm = searchInput.value.toLowerCase();
        bookmarks.forEach(function (bookmark, index) {
        if ((bookmark.title.toLowerCase().includes(searchTerm) || bookmark.url.toLowerCase().includes(searchTerm))) {
                var bookmarkObject = {
                    title: bookmark.title,
                    url: bookmark.url,
                    timestamp: bookmark.timestamp,
                    folder: bookmark.folder
                };
                var bookmarkElement = createBookmarkElement(bookmarkObject, index);
                bookmarksContainer.appendChild(bookmarkElement);
                var horizontalLine = document.createElement("hr");
                bookmarksContainer.appendChild(horizontalLine);
            }
        });
    });
}

function displayFoldersList() {
    chrome.storage.local.get({ folders: [] }, function (result) {
        var folders = result.folders || [];
        var foldersList = document.getElementById("foldersList");

        if (!foldersList) {
            console.error("Unable to find the foldersList element.");
            return;
        }

        foldersList.innerHTML = "";

        folders.forEach(function (folder) {
            var folderBox = document.createElement("div");
            folderBox.className = "folder-box";
            folderBox.textContent = folder;

            // Add a click event listener to handle folder click
            folderBox.addEventListener('click', function () {
                // Handle folder click, e.g., display bookmarks for the clicked folder
                displayBookmarksForFolder(folder);
            });

            // Add 'x' button for removing the folder
            var removeButton = document.createElement("button");
            removeButton.innerHTML = "&#x2716;";
            removeButton.className = "remove-folder-button";
            removeButton.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent folder click event from firing
                removeFolder(folder);
                refreshFolderList(); // Update the displayed folders
            });

            folderBox.appendChild(removeButton);
            foldersList.appendChild(folderBox);
        });
    });
}

function displayBookmarksForFolder(folder) {
    // Fetch bookmarks associated with the clicked folder
    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks || [];

        // Filter bookmarks for the clicked folder
        var folderBookmarks = bookmarks.filter(function (bookmark) {
            return bookmark.folder === folder;
        });

        // Display the bookmarks in the UI (modify this part based on your UI structure)
        var bookmarksContainer = document.getElementById("bookmarks-container");
        if (bookmarksContainer) {
            bookmarksContainer.innerHTML = ""; // Clear previous bookmarks

            folderBookmarks.forEach(function (bookmark) {
                var bookmarkElement = createBookmarkElement(bookmark);
                bookmarksContainer.appendChild(bookmarkElement);
            });
        }
    });
}




function createBookmarkElement(bookmark, index) {
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

    bookmarkElement.appendChild(linkElement);
    bookmarkElement.appendChild(dateElement);
    bookmarkElement.appendChild(removeButton);

    return bookmarkElement;
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
        var bookmarks = result.bookmarks || [];
        bookmarks.splice(index, 1);

        chrome.storage.local.set({ bookmarks: bookmarks }, function () {
            console.log("Bookmark removed successfully!");
            displayBookmarks();
        });
    });
}

function openAddFolderPopup() {
    var addFolderPopup = document.getElementById("addFolderPopup");
    addFolderPopup.style.display = "block";
}

function removeFolder(folderToRemove) {
    chrome.storage.local.get({ folders: [] }, function (result) {
        var folders = result.folders || [];

        var updatedFolders = folders.filter(folder => folder !== folderToRemove);

        chrome.storage.local.set({ folders: updatedFolders }, function () {
            alert(`Folder ${folderToRemove} has been removed`);

            location.reload();
        });
    });
}





