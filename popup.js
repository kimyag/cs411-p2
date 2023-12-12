document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get({loggedin: false}, (res) => {
        alert(res.loggedin);
    });
    var username;
    
    document.getElementById("loginButton").addEventListener("click", function () {
        username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        checkUserExists(username, password, () => {showBookmarkPopup();});
    });


    showBookmarkPopup();

    displayFoldersList();
    var selectedFolder;
    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentUrl = tabs[0].url;
        var pageTitle = tabs[0].title;
        selectedFolder = document.getElementById("folderDropdown").value;
        

        document.getElementById("urlInput").value = currentUrl;
        document.getElementById("titleInput").value = pageTitle;
    });
    

    document.getElementById("addBookmarkButton").addEventListener("click", function () {
        addBookmark(username);                
    });

    document.getElementById("goToBookmarksButton").addEventListener("click", function () {
        var url = chrome.runtime.getURL('bookmarks.html') + '?user=' + encodeURIComponent(username);
        chrome.tabs.create({ url: url });
    });

    document.getElementById("logoutButton").addEventListener("click", function () {
        chrome.storage.local.set({loggedin: false}, () => {showBookmarkPopup();});                
    });

    
});


function displayFoldersList() {
    chrome.storage.local.get({ folders: [] }, function (result) {
        var folders = result.folders || [];
        var folderDropdown = document.getElementById("folderDropdown");

        if (!folderDropdown) {
            console.error("Unable to find the folderDropdown element.");
            return;
        }

        // Clear previous options
        folderDropdown.innerHTML = "";

        // Create a default option
        var defaultOption = document.createElement("option");
        defaultOption.value = "all";
        defaultOption.textContent = "Select a folder";
        folderDropdown.appendChild(defaultOption);

        folders.forEach(function (folder) {
            var option = document.createElement("option");
            option.value = folder;
            option.textContent = folder;
            folderDropdown.appendChild(option);
        });

        //alert("displayFoldersList folderDropdown: " + folderDropdown.value);
    });
}

function addBookmark(username) {
    var titleInput = document.getElementById("titleInput").value || document.getElementById("titleInput").placeholder;
    var urlInput = document.getElementById("urlInput").value;
    var selectedFolder = document.getElementById("folderDropdown").value;

    if (urlInput && selectedFolder) {
        chrome.storage.local.get({ folders: [], bookmarks: [] }, function (result) {
            var folders = result.folders || [];
            var bookmarks = result.bookmarks || [];
            var foldersOfBookmark = ["all"];

            var existingFolder = folders.find(function (folder) {
                return folder === selectedFolder;
            });

            if (!existingFolder) {
                // Add a new folder
                folders.push(selectedFolder);
                // Update the folder dropdown
                updateFolderDropdown(folders);
            }

            if( selectedFolder !== "all" ) foldersOfBookmark.push(selectedFolder);

            // Add a new bookmark associated with the selected folder
            var bookmark = {
                id: bookmarks.length,
                title: titleInput,
                url: urlInput,
                folder: foldersOfBookmark,
                timestamp: new Date().getTime(),
                created_by: username
            };
            bookmarks.push(bookmark);

            addBookmarkChrome(
                {folder: selectedFolder,
                 title: titleInput,
                 url: urlInput   
                });

            chrome.storage.local.set({ folders: folders, bookmarks: bookmarks }, function () {
                console.log("Bookmark added successfully!");
                alert("Bookmark added successfully!");
                // You may choose to perform additional actions here if needed.
            });
        });
    }
}

function addBookmarkChrome(object) {
    if( object.folder !== "all" ) {
        /* THIS IS NOW UNNECESSARY !!!
        chrome.storage.local.get({ folders: [] }, function (result) {
            var folders = result.folders || [];
            console.log("hagi1");
            // chrome.bookmarks.create was here
        });*/

        chrome.bookmarks.getTree((tree) => {
            const rootChildren = tree[0].children; // Accessing the top-level bookmark folders
            var bookmarkTabFolders = rootChildren[0].children;
            for (const bookmarkFolder of bookmarkTabFolders) {
                if (bookmarkFolder.title === object.folder && bookmarkFolder.children) {
                    chrome.bookmarks.create(
                        {
                        parentId: bookmarkFolder.id,
                        title: object.titleInput,
                        url: object.urlInput
                        },
                        (newBookmark) => {
                        console.log('Bookmark added:', newBookmark);
                        //alert('Bookmark added successfully!');
                        //location.reload(); // Refresh the popup
                        }
                    );
                    break; // Exit the loop after removing the folder
                }
            }
        });
    } else {
        chrome.bookmarks.create(
            {
              parentId: '1',
              title: object.title,
              url: object.url
            },
            (newBookmark) => {
              console.log('Bookmark added:', newBookmark);
              alert('Bookmark added successfully!');
              //location.reload(); // Refresh the popup
            }
        );
    }
}

function updateFolderDropdown(folders) {
    var folderDropdown = document.getElementById("folderDropdown");

    // Clear previous options
    folderDropdown.innerHTML = "";

    // Create a default option
    var defaultOption = document.createElement("option");
    defaultOption.value = "all";
    defaultOption.textContent = "Select a folder";
    folderDropdown.appendChild(defaultOption);

    folders.forEach(function (folder) {
        var option = document.createElement("option");
        option.value = folder;
        option.textContent = folder;
        folderDropdown.appendChild(option);
    });
}

function checkUserExists(user, pass, callback) {
    //alert("in checkUserExists")
    chrome.storage.local.get({ users: [], loggedin: false }, function (res) {
        let users = res.users;
        var loggedin = res.loggedin;
        let userExists = users.some(function (o) {
            //alert("user found")
            return o.name === user && o.pass === pass;
        });

        loggedin = userExists;
        //alert("checkUserExists loggedin: "+loggedin)
        chrome.storage.local.set({ loggedin: loggedin }, function () {
            callback(userExists);
        });
    });
}

function showBookmarkPopup() {
    //alert("in showBookmarkPopup");
    chrome.storage.local.get({loggedin: false}, (res) => {
        let loggedin = res.loggedin;
        //alert("showBookmarkPopup loggedin: "+loggedin);
        if (loggedin) {
            document.getElementById("login").hidden = true;
            document.getElementById("bookmarks").hidden = false;
            //alert("divs are updated");
        } else {
            document.getElementById("login").hidden = false;
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
            document.getElementById("bookmarks").hidden = true;
        }
    });
    
}