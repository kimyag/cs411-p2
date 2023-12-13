document.addEventListener('DOMContentLoaded', function () {
    var username = (new URLSearchParams(window.location.search)).get('user');
    document.getElementById("createFolderButton").addEventListener("click", () => {createFolder(username)});
});


function createFolder(username) {
    var folderName = document.getElementById("folderName").value;

    if (folderName) {
        chrome.storage.local.get({ folders: [] }, function (result) {
            var folders = result.folders || [];


            if (!folders.some(e => e.name === folderName && e.created_by === username)) {
                folders.push({name: folderName, created_by: username});

                chrome.storage.local.set({ folders: folders }, function () {
                    chrome.bookmarks.create(
                    {
                        parentId: '1',
                        title: folderName,
                        url: ""
                    }, () => {});
                    alert(`Folder "${folderName}" has been created`)
                    closePopup();
                    displayFoldersList(username); // Update the displayed folders
                });
            } else {
                alert("Folder with the same name already exists.");
            }
        });
    }
    
    
}

function closePopup() {
    var addFolderPopup = document.getElementById("addFolderPopup");
}

