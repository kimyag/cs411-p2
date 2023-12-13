document.addEventListener('DOMContentLoaded', function () {

    var username = (new URLSearchParams(window.location.search)).get('user');
    var searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            displayBookmarks(username); // Pass searchInput value
        });
    }

    displayBookmarks(username);
    displayFoldersList(username);

    document.getElementById("addFolderButton").addEventListener("click", openAddFolderPopup);
    var removeFolderButton = document.getElementById("removeFolderButton");
    removeFolderButton.addEventListener("click", function () {
        var folderDropdown = document.getElementById("folderDropdown");
        var selectedFolder = folderDropdown.value;

        if (selectedFolder !== 'Select a folder') {
            // Remove the selected folder from storage
            removeFolder(selectedFolder, username);

            // Update the bookmarks
            refreshFolderList();
            //displayBookmarks(searchInput.value, selectedFolder.title);
        }
    });
});

function displayBookmarks(username) {
    var bookmarksContainer = document.getElementById("bookmarks-container");
    var searchInput = document.getElementById("searchInput");
    bookmarksContainer.innerHTML = "";

    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks;
        var searchTerm = searchInput.value.toLowerCase();

        var filteredBookmarks = bookmarks.filter(function (bookmark) {
            return bookmark.created_by === username
        });

        filteredBookmarks.forEach(function (bookmark, index) {
            if (searchInput !== undefined) {
                if (bookmark.title.toLowerCase().includes(searchTerm) || bookmark.url.toLowerCase().includes(searchTerm)) {
                    var bookmarkElement = createBookmarkElement({ bookmark: bookmark, index: index });
                    bookmarksContainer.appendChild(bookmarkElement);
                    var horizontalLine = document.createElement("hr");
                    bookmarksContainer.appendChild(horizontalLine);
                }

            } else {
                var bookmarkElement = createBookmarkElement({ bookmark: bookmark, index: index });
                bookmarksContainer.appendChild(bookmarkElement);
                var horizontalLine = document.createElement("hr");
                bookmarksContainer.appendChild(horizontalLine);
            }
        });
    });
}

function displayFoldersList(username) {
    chrome.storage.local.get({ folders: [] }, function (result) {
        var folders = result.folders || [];
        var foldersList = document.getElementById("foldersList");

        if (!foldersList) {
            console.error("Unable to find the foldersList element.");
            return;
        }

        foldersList.innerHTML = "";

        var users_folders = folders.filter(f => f.created_by === username);

        users_folders.forEach(function (folder) {
            var folderBox = document.createElement("div");
            folderBox.className = "folder-box";
            folderBox.textContent = folder.name;

            // Add a click event listener to handle folder click
            folderBox.addEventListener('click', function () {
                // Handle folder click, e.g., display bookmarks for the clicked folder
                displayBookmarksForFolder(folder.name, username);
            });

            // Add 'x' button for removing the folder
            var removeButton = document.createElement("button");
            removeButton.innerHTML = "&#x2716;";
            removeButton.className = "remove-folder-button";
            removeButton.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent folder click event from firing
                removeFolder(folder, username);
                //refreshFolderList(); // Update the displayed folders
            });

            folderBox.appendChild(removeButton);
            foldersList.appendChild(folderBox);
        });
    });
}

function displayBookmarksForFolder(foldername, username) {
    // Fetch bookmarks associated with the clicked folder
    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks || [];

        // Filter bookmarks for the clicked folder
        var folderBookmarks = bookmarks.filter(function (bookmark) {
            //return bookmark.folder === folder;
            return bookmark.folder.includes(foldername) && bookmark.created_by === username;
        });

        // Display the bookmarks in the UI (modify this part based on your UI structure)
        var bookmarksContainer = document.getElementById("bookmarks-container");
        if (bookmarksContainer) {
            bookmarksContainer.innerHTML = ""; // Clear previous bookmarks

            folderBookmarks.forEach(function (bookmark) {
                var bookmarkElement = createBookmarkElement({ bookmark: bookmark, folder: foldername });
                bookmarksContainer.appendChild(bookmarkElement);
            });
        }
    });
}

function createBookmarkElement(object) {
    var bookmarkElement = document.createElement("div");
    var linkElement = document.createElement("a");
    var removeButton = document.createElement("button");
    var dateElement = document.createElement("span");

    linkElement.href = object.bookmark.url;
    linkElement.target = "_blank"; // Open link in a new tab
    linkElement.textContent = object.bookmark.title;

    dateElement.textContent = formatDate(object.bookmark.timestamp);

    removeButton.innerHTML = "&#x2716;"; // Unicode for "x"
    removeButton.className = "remove-button";
    removeButton.addEventListener('click', function () {
        if (object.folder !== undefined) confirmRemoveBookmarkFromFolder(object.bookmark.url, object.bookmark.title, object.folder);
        else confirmRemoveBookmark(object.bookmark.url, object.bookmark.title);
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

function confirmRemoveBookmark(url, title) {
    var confirmation = confirm(`Are you sure you want to remove the bookmark "${title}"?`);
    if (confirmation) {
        removeBookmark( url, title, "all" );
        location.reload();
    }
}

function confirmRemoveBookmarkFromFolder(url, title, folder) {
    var confirmation = confirm(`Are you sure you want to remove the bookmark "${title}" from the folder "${folder}"?`);
    if (confirmation) {
        removeBookmark(url, title, folder);
        location.reload();
    }
}

function removeBookmark(url, title, folder) {
    chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmark = result.bookmarks || [];
        var indexToRemove = bookmark.findIndex(b => b.title === title && b.url === url);

        if (folder === "all") {
            chrome.bookmarks.search({ title: title, url: url }, (results) => {
                for (const result of results) {
                    chrome.bookmarks.remove(result.id, () => {
                        bookmark.splice(indexToRemove, 1); // Update the array after bookmark removal
                        
                        chrome.storage.local.set({ bookmarks: bookmark }, function () {
                            console.log("Bookmark removed successfully!")
                            displayBookmarks();
                        });
                    });

                    break;
                }
            });

        } else {
            console.log("else");
            foldersOfBookmark = bookmark[indexToRemove].folder;
            var folderIndex = foldersOfBookmark.indexOf(folder);            

            chrome.bookmarks.search({ title: title, url: url }, (results) => {
                for (const result of results) {
                    chrome.bookmarks.move(result.id, {parentId: '1'}, () => {
                        console.table(result);
                        foldersOfBookmark.splice(folderIndex, 1); // Update the array after bookmark removal
                        
                        chrome.storage.local.set({ bookmarks: bookmark }, function () {
                            console.table(bookmark);
                            console.log("Bookmark removed successfully!")
                            displayBookmarks();
                        });
                    });

                    break;
                }
            });
        }
    });
    /*chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks || [];

        if (object.folder === "all") {
            chrome.bookmarks.search({ url: bookmarks[object.index].url, title: object.title }, (results) => {
                for (const result of results) {
                    if (result.url === bookmarks[object.index].url && result.title === object.title) {

                        chrome.bookmarks.remove(result.id, () => {
                            console.table(bookmarks);
                            bookmarks.splice(object.index, 1); // Update the array after bookmark removal
                            
                            chrome.storage.local.set({ bookmarks: bookmarks }, function () {
                                console.table(bookmarks);
                                if (object.folder === undefined) console.log("Bookmark removed successfully!");
                                else console.log("Bookmark removed successfully from the folder!");
                                displayBookmarks();
                            });
                        });

                    }
                }
            });

        } else {
            alert("removeBookmark folder: " + object.index);
            let folderIndex = bookmarks[object.index].folder.indexOf(object.folder);
            bookmarks[object.index].folder.splice(folderIndex, 1);
            chrome.storage.local.set({ bookmarks: bookmarks }, function () {
                console.table(bookmarks);
                console.log("Bookmark removed successfully from the folder!");
                displayBookmarks();
            });
        }
    });*/
    // Eski remove func: bookmarks tab'i kaale almadan listeden siler
    /* chrome.storage.local.get({ bookmarks: [] }, function (result) {
        var bookmarks = result.bookmarks || [];
        bookmarks.splice(object.index, 1);

        chrome.storage.local.set({ bookmarks: bookmarks }, function () {
            console.log("Bookmark removed successfully!");
            displayBookmarks();
        });
    });*/
}

// old
function removeFolder(folderToRemove, username) {
    chrome.storage.local.get({ bookmarks: [], folders: [] }, function (result) {
        var folders = result.folders || [];
        var bookmarks = result.bookmarks || [];

        var bookmarksUnderFolder = bookmarks.filter( b => (b.folder).includes(folderToRemove));
        
        bookmarksUnderFolder.forEach((b) => {
            var indexToRemove = bookmarks.indexOf(b);
            console.log(indexToRemove + " = " + bookmarks[indexToRemove]);
            chrome.bookmarks.search({ title: b.title, url: b.url }, (results) => {
                results.forEach((result) => {
                    chrome.bookmarks.remove(result.id, () => {
                        bookmarks.splice(indexToRemove, 1);
                        chrome.storage.local.set({ bookmarks: bookmarks }, () => {
                            console.log("Bookmark removed successfully!");
                        });
                    });
                });
            });
        });
    
        chrome.bookmarks.getTree((tree) => {
            const rootChildren = tree[0].children;
            var bookmarkTabFolders = rootChildren[0].children;
    
            bookmarkTabFolders.forEach((bookmarkFolder) => {
                if (bookmarkFolder.title === folderToRemove.name && bookmarkFolder.children) {
                    chrome.bookmarks.removeTree(bookmarkFolder.id, () => {
                        var updatedFolders = folders.filter(folder => (folder.name !== folderToRemove.name && folder.created_by === username));
                        chrome.storage.local.set({ folders: updatedFolders }, () => {
                            alert(`Folder ${folderToRemove.name} has been removed`);
                            location.reload();
                        });
                    });
                }
            });
        });
    });
    
}


/*
// To remove the folder only from the storage if the folder does not exist on bookmarks tab
function removeFolder(folderToRemove, username) {
    chrome.storage.local.get({ folders: [] }, function (result) {
        var folders = result.folders || [];
        console.log("hagi1");
        var updatedFolders = folders.filter(folder => (folder.name !== folderToRemove.name && folder.created_by === username));
        chrome.storage.local.set({ folders: updatedFolders }, function () {
            location.reload();
        });
    });
    alert(`Folder ${folderToRemove.name} has been removed`);
}
*/

/*
function removeFolder(folderToRemove, username) {
    chrome.storage.local.get({ bookmarks: [], folders: [] }, function (result) {
        var folders = result.folders || [];
        var bookmarks = result.bookmarks || [];

        var bookmarksUnderFolder = bookmarks.filter(b => b.folder === folderToRemove && b.created_by === username);

        function deleteBookmark(index) {
            if (index < bookmarksUnderFolder.length) {
                var b = bookmarksUnderFolder[index];
                chrome.bookmarks.search({ title: b.title, url: b.url }, (results) => {
                    if (results.length > 0) {
                        chrome.bookmarks.remove(results[0].id, () => {
                            bookmarks.splice(indexToRemove, 1);
                            chrome.storage.local.set({ bookmarks: bookmarks }, () => {
                                console.log("Bookmark removed successfully!");
                                deleteBookmark(index + 1); // Move to the next bookmark
                            });
                        });
                    } else {
                        // Handle the case where the bookmark was not found
                        console.log("Bookmark not found");
                        deleteBookmark(index + 1);
                    }
                });
            } else {
                // All bookmarks have been processed, proceed to remove the folder
                removeFolderAndReload();
            }
        }

        function removeFolderAndReload() {
            chrome.bookmarks.getTree((tree) => {
                const rootChildren = tree[0].children;
                var bookmarkTabFolders = rootChildren[0].children;

                bookmarkTabFolders.forEach((bookmarkFolder) => {
                    if (bookmarkFolder.title === folderToRemove.name && bookmarkFolder.children) {
                        chrome.bookmarks.removeTree(bookmarkFolder.id, () => {
                            var updatedFolders = folders.filter(folder => (folder.name !== folderToRemove.name && folder.created_by === username));
                            chrome.storage.local.set({ folders: updatedFolders }, () => {
                                alert(`Folder ${folderToRemove.name} has been removed`);
                                location.reload();
                            });
                        });
                    }
                });
            });
        }

        var indexToRemove = 0;
        deleteBookmark(indexToRemove); // Start the removal process from the first bookmark
    });
}*/

function openAddFolderPopup() {
    var addFolderPopup = document.getElementById("addFolderPopup");
    addFolderPopup.style.display = "block";
}
