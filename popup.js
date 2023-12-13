var user;

//chrome.storage.local.set({bookmarks: [], folders: []});

document.addEventListener('DOMContentLoaded', function () {
    
    document.getElementById("loginButton").addEventListener("click", function () {
        var usern = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        checkUserExists(usern, password, () => {showBookmarkPopup(function(loggedin) {bookmarksTabOnLogin(loggedin); location.reload();} )});       
    });    

    showBookmarkPopup(function (loggedin) {
        // Now you can use the 'loggedin' value here
        user = loggedin;
        // Perform other actions that depend on the user being defined
        displayFoldersList(user);

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currentUrl = tabs[0].url;
            var pageTitle = tabs[0].title;
            selectedFolder = document.getElementById("folderDropdown").value;
            
    
            document.getElementById("urlInput").value = currentUrl;
            document.getElementById("titleInput").value = pageTitle;
        });
        
    
        document.getElementById("addBookmarkButton").addEventListener("click", function () {
            addBookmark(user);
            location.reload();                
        });
    
        document.getElementById("goToBookmarksButton").addEventListener("click", function () {
            var url = chrome.runtime.getURL('bookmarks.html') + '?user=' + encodeURIComponent(user);
            chrome.tabs.create({ url: url }, function (tab) {
                // Store the created tab ID in a variable
                var bookmarksTabId = tab.id;
                
                // Add the tab ID to storage or a global variable for later reference
                chrome.storage.local.set({ bookmarksTabId: bookmarksTabId });
            });
        });
        
        document.getElementById("logoutButton").addEventListener("click", function () {
            // Retrieve the stored bookmarksTabId from storage
            chrome.storage.local.get({ bookmarksTabId: null }, function (result) {
                var bookmarksTabId = result.bookmarksTabId;
                
                // Check if a bookmarks tab is open
                if (bookmarksTabId !== null)
                    // Close the bookmarks tab
                    chrome.tabs.remove(bookmarksTabId, function () {
                        // Clear the stored bookmarksTabId
                        chrome.storage.local.remove('bookmarksTabId');
                    });
                    // If no bookmarks tab is open, simply proceed to logout

                chrome.storage.local.set({ loggedin: "" }, function () {
                    showBookmarkPopup();
                });
                
            });
        });

    });

    
});

function displayFoldersList(username) {
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
        const defaultOption = document.createElement("option");
        defaultOption.value = "all";
        defaultOption.textContent = "Select a folder";
        folderDropdown.appendChild(defaultOption);

        var users_folders = folders.filter(f => f.created_by === username );

        //alert(username);

        users_folders.forEach((folder) => {
            //alert(folder.name);
            var option = document.createElement("option");
            option.value = folder.name;
            option.textContent = folder.name;
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
                {folder: foldersOfBookmark,
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

    if ((object.folder).length > 1) {

        var title = object.folder[(object.folder).length - 1];
        chrome.bookmarks.getTree((tree) => {
            var rootChildren = tree[0].children; // Accessing the top-level bookmark folders
            // Search for the target folder by name
            var targetFolder = rootChildren[0].children.find((folder) => folder.title === title && folder.url === undefined);

            if (targetFolder) {
                // Get the target folder ID
                chrome.bookmarks.create({
                    parentId: targetFolder.id,
                    title: object.title,
                    url: object.url
                }, () => {});

            } else {
                console.error("Target folder not found");
            }
        });


    } else {
        chrome.bookmarks.create({
            parentId: "1",
            title: object.title,
            url: object.url
        }, () => { });

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
    chrome.storage.local.get({ users: [], loggedin: "" }, function (res) {
        let users = res.users;
        var loggedin = res.loggedin;
        let userExists = users.some(function (o) {
            //alert("user found")
            return o.name === user && o.pass === pass;
        });

        if (userExists) loggedin = user;
        //alert("checkUserExists loggedin: "+loggedin)
        chrome.storage.local.set({ loggedin: loggedin }, function () {
            callback(userExists);
        });
    });
}

function showBookmarkPopup(callback) {
    chrome.storage.local.get({loggedin: ""}, (res) => {
        let loggedin = res.loggedin;

        if (loggedin !== "") {
            document.getElementById("login").hidden = true;
            document.getElementById("bookmarks").hidden = false;
        } else {
            document.getElementById("login").hidden = false;
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
            document.getElementById("bookmarks").hidden = true;
            bookmarksTabOnLogout();
        }

        // Call the callback function with the result
        callback(loggedin);
    });
}

function bookmarksTabOnLogout(){
    chrome.bookmarks.getTree((tree) => {
        var rootChildren = tree[0].children;
        var bookmarksTab = rootChildren[0].children;

        for (const bookmark of bookmarksTab) {
            chrome.bookmarks.removeTree(bookmark.id, () => {
                location.reload();
            });
        }
    });
}

function bookmarksTabOnLogin(username) {
    chrome.storage.local.get({ bookmarks: [], folders: [] }, (res) => {
        var bookmarks = res.bookmarks;
        var folders = res.folders;

        var users_folders = folders.filter(f => f.created_by === username);

        if (users_folders.length > 0) {
            for (const folder of users_folders) {
                chrome.bookmarks.create({
                    parentId: "1",
                    title: folder.name,
                    url: ""
                }, () => { });

            }

        }

        var users_bookmarks = bookmarks.filter(b => b.created_by === username);

        processBookmarks(users_bookmarks);
    });
}

function createBookmarkInFolder(bookmark, targetFolder) {
    return new Promise((resolve, reject) => {
        chrome.bookmarks.create({
            parentId: targetFolder.id,
            title: bookmark.title,
            url: bookmark.url
        }, (result) => {
            if (!chrome.runtime.lastError) {
                resolve(result);
            } else {
                reject(chrome.runtime.lastError);
            }
        });
    });
}

async function processBookmarks(bookmarksArray) {
    for (const bookmark of bookmarksArray) {
        if (bookmark.folder.length > 1) {
            var title = bookmark.folder[bookmark.folder.length - 1];
            console.log("1 " + bookmark.title + ": " + title);

            try {
                const tree = await new Promise((resolve) => {
                    chrome.bookmarks.getTree((result) => resolve(result));
                });

                var rootChildren = tree[0].children; // Accessing the top-level bookmark folders
                var tab = rootChildren[0].children;

                const targetFolder = tab.find((folder) => folder.title === title);

                console.log("2 " + bookmark.title + ": " + targetFolder.title);

                if (targetFolder) {
                    await createBookmarkInFolder(bookmark, targetFolder);
                } else {
                    console.error("Target folder not found");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        } else {
            await chrome.bookmarks.create({
                parentId: "1",
                title: bookmark.title,
                url: bookmark.url
            }, () => { });
        }
    }
}