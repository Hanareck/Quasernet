const { contextBridge, ipcRenderer } = require('electron');

// Exposer les API Electron au renderer de manière sécurisée
contextBridge.exposeInMainWorld('electron', {
    // Vérifier si un dossier de données est configuré
    hasDataFolder: () => ipcRenderer.invoke('electron:hasDataFolder'),

    // Obtenir le dossier de données actuel
    getDataFolder: () => ipcRenderer.invoke('electron:getDataFolder'),

    // Choisir un dossier pour les données
    chooseDataFolder: () => ipcRenderer.invoke('electron:chooseDataFolder'),

    // Charger les entrées depuis le fichier
    loadEntrees: () => ipcRenderer.invoke('electron:loadEntrees'),

    // Sauvegarder les entrées dans le fichier
    saveEntrees: (entrees) => ipcRenderer.invoke('electron:saveEntrees', entrees),

    // Charger les paramètres
    loadSettings: () => ipcRenderer.invoke('electron:loadSettings'),

    // Sauvegarder les paramètres
    saveSettings: (settings) => ipcRenderer.invoke('electron:saveSettings', settings),

    // Créer un backup automatique
    createBackup: () => ipcRenderer.invoke('electron:createBackup'),

    // Exporter les données (dialogue de sauvegarde)
    exportData: () => ipcRenderer.invoke('electron:exportData'),

    // Importer des données (dialogue d'ouverture)
    importData: () => ipcRenderer.invoke('electron:importData'),

    // Réinitialiser le dossier (pour changer de dossier)
    resetDataFolder: () => ipcRenderer.invoke('electron:resetDataFolder'),

    // Indicateur que nous sommes dans Electron
    isElectron: true
});
