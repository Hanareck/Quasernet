function renderFolderSelection() {
    var currentFolder = state.currentFolder || null;

    var folderInfo = '';
    var confirmButton = '';

    if (currentFolder) {
        folderInfo = '<div class="current-folder">' +
            '<div class="current-folder-icon">📂</div>' +
            '<div class="current-folder-info">' +
                '<p class="current-folder-label">Dossier actuellement sélectionné :</p>' +
                '<p class="current-folder-path">' + currentFolder + '</p>' +
            '</div>' +
        '</div>';

        confirmButton = '<button class="btn-confirm-folder" onclick="confirmerDossierElectron()">✅ Confirmer ce dossier</button>';
    }

    return '<div class="mode-choice-container">' +
        '<div class="mode-choice-header">' +
            '<h1 class="mode-choice-titre">📁 Choisir un dossier</h1>' +
            '<p class="mode-choice-subtitle">Sélectionnez le dossier où seront stockées vos données Quasernet</p>' +
        '</div>' +
        '<div class="folder-selection-content">' +
            '<div class="folder-selection-card">' +
                folderInfo +
                '<div class="folder-icon">📂</div>' +
                '<h2 class="folder-titre">' + (currentFolder ? 'Changer de dossier ?' : 'Où voulez-vous stocker vos données ?') + '</h2>' +
                '<p class="folder-description">Vos entrées culturelles, paramètres et backups seront sauvegardés dans le dossier de votre choix.</p>' +
                '<ul class="folder-features">' +
                    '<li>✅ Vos fichiers restent chez vous</li>' +
                    '<li>✅ Compatible Dropbox, Google Drive, etc.</li>' +
                    '<li>✅ Backup automatique tous les 10 ajouts</li>' +
                    '<li>✅ Le dossier sera mémorisé pour les prochaines fois</li>' +
                '</ul>' +
                '<div class="folder-buttons">' +
                    confirmButton +
                    '<button class="btn-select-folder" onclick="selectionnerDossierElectron()">' +
                        (currentFolder ? '📁 Choisir un autre dossier' : '📁 Sélectionner un dossier') +
                    '</button>' +
                    '<button class="btn-back-mode" onclick="retourChoixMode()">← Retour au choix de mode</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
}

window.retourChoixMode = function() {
    setMode(null);
    state.needsFolderSelection = false;
    state.currentFolder = null;
    render();
};

window.confirmerDossierElectron = async function() {
    // Charger les données du dossier actuel
    state.needsFolderSelection = false;
    state.authLoading = true;
    render();

    try {
        state.entrees = await chargerEntreesElectron();
        state.userPseudo = await chargerPseudoElectron();
        state.user = null;
        state.vue = 'liste';
        var folderPath = await getDossierElectron();
        afficherToast('Dossier confirmé : ' + folderPath);
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        state.entrees = [];
        state.userPseudo = 'Utilisateur';
        afficherToast('Erreur lors du chargement des données');
    }

    state.authLoading = false;
    render();
};
