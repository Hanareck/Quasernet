function renderFolderSelection() {
    return '<div class="mode-choice-container">' +
        '<div class="mode-choice-header">' +
            '<h1 class="mode-choice-titre">📁 Choisir un dossier</h1>' +
            '<p class="mode-choice-subtitle">Sélectionnez le dossier où seront stockées vos données Quasernet</p>' +
        '</div>' +
        '<div class="folder-selection-content">' +
            '<div class="folder-selection-card">' +
                '<div class="folder-icon">📂</div>' +
                '<h2 class="folder-titre">Où voulez-vous stocker vos données ?</h2>' +
                '<p class="folder-description">Vos entrées culturelles, paramètres et backups seront sauvegardés dans le dossier de votre choix.</p>' +
                '<ul class="folder-features">' +
                    '<li>✅ Vos fichiers restent chez vous</li>' +
                    '<li>✅ Compatible Dropbox, Google Drive, etc.</li>' +
                    '<li>✅ Backup automatique tous les 10 ajouts</li>' +
                    '<li>✅ Changez de dossier à tout moment</li>' +
                '</ul>' +
                '<button class="btn-select-folder" onclick="selectionnerDossierElectron()">📁 Sélectionner un dossier</button>' +
                '<button class="btn-back-mode" onclick="retourChoixMode()">← Retour au choix de mode</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

window.retourChoixMode = function() {
    setMode(null);
    state.needsFolderSelection = false;
    render();
};
