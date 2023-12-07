document.addEventListener('DOMContentLoaded', function () {
    displayFoldersList();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentUrl = tabs[0].url;
        var pageTitle = tabs[0].title;
        var selectedFolder = document.getElementById("folderDropdown").value;

        document.getElementById("urlInput").value = currentUrl;
        document.getElementById("titleInput").value = pageTitle;
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
    var selectedFolder = document.getElementById("folderDropdown").value;

    if (urlInput && selectedFolder) {
        chrome.storage.local.get({ folders: [], bookmarks: [] }, function (result) {
            var folders = result.folders || [];
            var bookmarks = result.bookmarks || [];

            var existingFolder = folders.find(function (folder) {
                return folder === selectedFolder;
            });

            if (!existingFolder) {
                // Add a new folder
                folders.push(selectedFolder);
            }

            // Add a new bookmark associated with the selected folder
            var bookmark = {
                title: titleInput,
                url: urlInput,
                folder: selectedFolder,
                timestamp: new Date().getTime()
            };
            bookmarks.push(bookmark);

            chrome.storage.local.set({ folders: folders, bookmarks: bookmarks }, function () {
                console.log("Bookmark added successfully!");
                alert("Bookmark added successfully!");
                location.reload();
            });
        });
    }
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




