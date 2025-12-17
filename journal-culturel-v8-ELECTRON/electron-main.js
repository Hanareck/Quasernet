const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

let mainWindow;
let userDataFolder = null;

// Créer la fenêtre principale
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, 'assets/icon.png')
    });

    mainWindow.loadFile('index.html');

    // Ouvrir DevTools en développement (commenter en production)
    // mainWindow.webContents.openDevTools();
}

// Charger les préférences sauvegardées (dossier choisi)
async function loadPreferences() {
    const prefsPath = path.join(app.getPath('userData'), 'preferences.json');
    try {
        const data = await fs.readFile(prefsPath, 'utf8');
        const prefs = JSON.parse(data);
        userDataFolder = prefs.dataFolder;
        return prefs;
    } catch (error) {
        return null;
    }
}

// Sauvegarder les préférences
async function savePreferences(prefs) {
    const prefsPath = path.join(app.getPath('userData'), 'preferences.json');
    await fs.writeFile(prefsPath, JSON.stringify(prefs, null, 2), 'utf8');
}

// ========== IPC HANDLERS ==========

// Vérifier si un dossier est configuré
ipcMain.handle('electron:hasDataFolder', async () => {
    await loadPreferences();
    return userDataFolder !== null;
});

// Obtenir le dossier de données actuel
ipcMain.handle('electron:getDataFolder', async () => {
    return userDataFolder;
});

// Choisir un dossier pour les données
ipcMain.handle('electron:chooseDataFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory'],
        title: 'Choisir le dossier pour vos données Quasernet',
        buttonLabel: 'Sélectionner'
    });

    if (!result.canceled && result.filePaths.length > 0) {
        userDataFolder = result.filePaths[0];
        await savePreferences({ dataFolder: userDataFolder });

        // Créer les fichiers initiaux s'ils n'existent pas
        await initializeDataFolder(userDataFolder);

        return userDataFolder;
    }

    return null;
});

// Initialiser le dossier avec les fichiers par défaut
async function initializeDataFolder(folderPath) {
    const entreesPath = path.join(folderPath, 'entrees.json');
    const settingsPath = path.join(folderPath, 'settings.json');
    const backupDir = path.join(folderPath, 'backups');

    // Créer entrees.json s'il n'existe pas
    if (!fsSync.existsSync(entreesPath)) {
        await fs.writeFile(entreesPath, JSON.stringify([], null, 2), 'utf8');
    }

    // Créer settings.json s'il n'existe pas
    if (!fsSync.existsSync(settingsPath)) {
        await fs.writeFile(settingsPath, JSON.stringify({
            pseudo: 'Utilisateur',
            theme: 'light'
        }, null, 2), 'utf8');
    }

    // Créer dossier backups
    if (!fsSync.existsSync(backupDir)) {
        await fs.mkdir(backupDir, { recursive: true });
    }
}

// Charger les entrées
ipcMain.handle('electron:loadEntrees', async () => {
    if (!userDataFolder) return [];

    const entreesPath = path.join(userDataFolder, 'entrees.json');
    try {
        const data = await fs.readFile(entreesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur chargement entrées:', error);
        return [];
    }
});

// Sauvegarder les entrées
ipcMain.handle('electron:saveEntrees', async (event, entrees) => {
    if (!userDataFolder) return false;

    const entreesPath = path.join(userDataFolder, 'entrees.json');
    try {
        await fs.writeFile(entreesPath, JSON.stringify(entrees, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erreur sauvegarde entrées:', error);
        return false;
    }
});

// Charger les paramètres
ipcMain.handle('electron:loadSettings', async () => {
    if (!userDataFolder) return { pseudo: 'Utilisateur', theme: 'light' };

    const settingsPath = path.join(userDataFolder, 'settings.json');
    try {
        const data = await fs.readFile(settingsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { pseudo: 'Utilisateur', theme: 'light' };
    }
});

// Sauvegarder les paramètres
ipcMain.handle('electron:saveSettings', async (event, settings) => {
    if (!userDataFolder) return false;

    const settingsPath = path.join(userDataFolder, 'settings.json');
    try {
        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erreur sauvegarde paramètres:', error);
        return false;
    }
});

// Créer un backup
ipcMain.handle('electron:createBackup', async () => {
    if (!userDataFolder) return false;

    const entreesPath = path.join(userDataFolder, 'entrees.json');
    const settingsPath = path.join(userDataFolder, 'settings.json');
    const backupDir = path.join(userDataFolder, 'backups');

    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.json`);

        const entrees = JSON.parse(await fs.readFile(entreesPath, 'utf8'));
        const settings = JSON.parse(await fs.readFile(settingsPath, 'utf8'));

        const backup = {
            entrees: entrees,
            settings: settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        await fs.writeFile(backupPath, JSON.stringify(backup, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erreur création backup:', error);
        return false;
    }
});

// Exporter les données (téléchargement)
ipcMain.handle('electron:exportData', async () => {
    if (!userDataFolder) return false;

    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Exporter vos données',
        defaultPath: `quasernet-backup-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (result.canceled) return false;

    try {
        const entreesPath = path.join(userDataFolder, 'entrees.json');
        const settingsPath = path.join(userDataFolder, 'settings.json');

        const entrees = JSON.parse(await fs.readFile(entreesPath, 'utf8'));
        const settings = JSON.parse(await fs.readFile(settingsPath, 'utf8'));

        const exportData = {
            entrees: entrees,
            pseudo: settings.pseudo,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        await fs.writeFile(result.filePath, JSON.stringify(exportData, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Erreur export:', error);
        return false;
    }
});

// Importer des données
ipcMain.handle('electron:importData', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Importer des données',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
    });

    if (result.canceled) return null;

    try {
        const data = await fs.readFile(result.filePaths[0], 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur import:', error);
        return null;
    }
});

// Réinitialiser le dossier (pour changer de dossier)
ipcMain.handle('electron:resetDataFolder', async () => {
    userDataFolder = null;
    await savePreferences({ dataFolder: null });
    return true;
});

// ========== APP LIFECYCLE ==========

app.whenReady().then(async () => {
    await loadPreferences();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
