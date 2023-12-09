document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("createFolderButton").addEventListener("click", createFolder);
});



function createFolder() {
    var folderNameInput = document.getElementById("folderName");
    var folderName = folderNameInput.value.trim();

    if (folderName) {
        chrome.storage.local.get({ folders: [] }, function (result) {
            var folders = result.folders || [];

            if (!folders.includes(folderName)) {
                folders.push(folderName);

                chrome.storage.local.set({ folders: folders }, function () {
                    console.log("Folder created successfully!");
                    closePopup();
                    displayFoldersList(); // Update the displayed folders
                });
            } else {
                console.log("Folder with the same name already exists.");
            }
        });
    }
    alert('Folder '+ folderName+' has been created')
}

function closePopup() {
    var addFolderPopup = document.getElementById("addFolderPopup");
}

