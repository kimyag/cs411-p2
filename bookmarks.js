document.addEventListener('DOMContentLoaded', function () {
    var searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            displayBookmarks(searchInput);
        });
    }
    var folderDropdown = document.getElementById("folderDropdown");
        folderDropdown.addEventListener("change", function () {
            var selectedFolder = folderDropdown.value;
            if (selectedFolder === ''){
                selectedFolder = 'Select a folder';
            }
            console.log("Selected folder:", selectedFolder);
            displayBookmarks(selectedFolder)
        });
    displayBookmarks();
    displayFoldersList();
    document.getElementById("addFolderButton").addEventListener("click", openAddFolderPopup);
    
});

function displayBookmarks(folderDropdown) {
    var bookmarksContainer = document.getElementById("bookmarks-container");
    var searchInput = document.getElementById("searchInput");
    bookmarksContainer.innerHTML = ""; 

    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        var searchTerm = searchInput.value.toLowerCase();
        bookmarks.forEach(function (bookmark, index) {
        if ((folderDropdown === 'Select a folder' || bookmark.folder === folderDropdown) && (bookmark.title.toLowerCase().includes(searchTerm) || bookmark.url.toLowerCase().includes(searchTerm))) {
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
        var folderDropdown = document.getElementById("folderDropdown");

        // Clear previous options
        folderDropdown.innerHTML = "";

        // Create a default option
        var defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a folder";
        folderDropdown.appendChild(defaultOption);

        folders.forEach(function (folder) {
            var option = document.createElement("option");
            option.value = folder;
            option.textContent = folder;
            folderDropdown.appendChild(option);
        });
    });
}

function openAddFolderPopup() {
    var addFolderPopup = document.getElementById("addFolderPopup");
    addFolderPopup.style.display = "block";
}

