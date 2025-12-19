# Comparaison des APIs : Electron vs Capacitor Android

Ce document compare les APIs utilisées dans la version Electron et la version Android.

## 📁 Stockage de fichiers

### Electron

```javascript
// Charger les données
const entrees = await window.electron.loadEntrees();

// Sauvegarder les données
await window.electron.saveEntrees(entrees);

// Choisir un dossier
const folder = await window.electron.chooseDataFolder();

// Obtenir le dossier actuel
const currentFolder = await window.electron.getDataFolder();
```

### Capacitor Android

```javascript
// Charger les données
const result = await Filesystem.readFile({
    path: 'quasernet/entrees.json',
    directory: Directory.Documents,
    encoding: Encoding.UTF8
});
const entrees = JSON.parse(result.data);

// Sauvegarder les données
await Filesystem.writeFile({
    path: 'quasernet/entrees.json',
    data: JSON.stringify(entrees),
    directory: Directory.Documents,
    encoding: Encoding.UTF8
});

// Pas de sélection de dossier sur Android
// Les fichiers sont toujours dans Documents/quasernet/
```

## 🔔 Notifications

### Electron (via Node.js)

```javascript
const { Notification } = require('electron');

new Notification({
    title: 'Quasernet',
    body: 'N\'oublie pas d\'ajouter tes découvertes !'
}).show();
```

### Capacitor Android

```javascript
import { LocalNotifications } from '@capacitor/local-notifications';

await LocalNotifications.schedule({
    notifications: [{
        title: 'Quasernet',
        body: 'N\'oublie pas d\'ajouter tes découvertes !',
        id: 1,
        schedule: { at: new Date(Date.now() + 3600000) }
    }]
});
```

## 📤 Partage de fichiers

### Electron

```javascript
// Export vers un fichier choisi par l'utilisateur
const { dialog } = require('electron');
const filePath = await dialog.showSaveDialog({
    defaultPath: 'quasernet-backup.json'
});

await fs.writeFile(filePath, JSON.stringify(data));
```

### Capacitor Android

```javascript
import { Share } from '@capacitor/share';
import { Filesystem } from '@capacitor/filesystem';

// Créer le fichier
await Filesystem.writeFile({
    path: 'quasernet/backup.json',
    data: JSON.stringify(data),
    directory: Directory.Cache
});

// Partager via le système Android
await Share.share({
    title: 'Backup Quasernet',
    text: 'Mon backup Quasernet',
    url: 'file://...',
    dialogTitle: 'Partager le backup'
});
```

## 🔙 Bouton Retour

### Electron

```javascript
// Pas de bouton retour sur desktop
// Navigation via menu ou raccourcis clavier
```

### Capacitor Android

```javascript
import { App } from '@capacitor/app';

App.addListener('backButton', () => {
    if (state.vue !== 'liste') {
        setVue('liste');
    } else {
        App.exitApp();
    }
});
```

## 🖼️ Images et médias

### Electron

```javascript
// Sélection de fichier local
const { dialog } = require('electron');
const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'png'] }]
});
```

### Capacitor Android

```javascript
import { Camera, CameraResultType } from '@capacitor/camera';

const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
});

// ou sélection depuis la galerie
const image = await Camera.pickImages({
    quality: 90
});
```

## 💾 Préférences / Paramètres

### Electron

```javascript
// Via localStorage ou fichier JSON
localStorage.setItem('theme', 'dark');

// ou
await window.electron.saveSettings({ theme: 'dark' });
```

### Capacitor Android

```javascript
import { Preferences } from '@capacitor/preferences';

// Sauvegarder
await Preferences.set({
    key: 'theme',
    value: 'dark'
});

// Lire
const { value } = await Preferences.get({ key: 'theme' });
```

## 🌐 Réseau et connectivité

### Electron

```javascript
// Via l'API Web standard
const online = navigator.onLine;

window.addEventListener('online', () => {
    console.log('Connecté');
});
```

### Capacitor Android

```javascript
import { Network } from '@capacitor/network';

const status = await Network.getStatus();
console.log('Connecté:', status.connected);

Network.addListener('networkStatusChange', status => {
    console.log('Statut réseau:', status);
});
```

## 📋 Presse-papiers

### Electron

```javascript
const { clipboard } = require('electron');

clipboard.writeText('Texte à copier');
const text = clipboard.readText();
```

### Capacitor Android

```javascript
import { Clipboard } from '@capacitor/clipboard';

await Clipboard.write({
    string: 'Texte à copier'
});

const { value } = await Clipboard.read();
```

## 🎤 Permissions

### Electron

```javascript
// Pas de système de permissions
// Accès direct aux ressources système
```

### Capacitor Android

```javascript
import { Camera } from '@capacitor/camera';

// Demander la permission
const permission = await Camera.requestPermissions();

if (permission.camera === 'granted') {
    // Utiliser la caméra
}
```

## 🔄 Auto-update

### Electron

```javascript
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

### Capacitor Android

```javascript
// Géré automatiquement par le Google Play Store
// ou manuellement via App Update API de Google Play

import { AppUpdate } from '@capawesome/capacitor-app-update';

const result = await AppUpdate.getAppUpdateInfo();
if (result.updateAvailability === UpdateAvailability.UPDATE_AVAILABLE) {
    await AppUpdate.performImmediateUpdate();
}
```

## 📊 Résumé des différences

| Fonctionnalité | Electron | Capacitor Android | Difficulté |
|----------------|----------|-------------------|------------|
| Stockage fichiers | ✅ Flexible | ✅ Dossier fixe | Facile ⭐ |
| Sélection dossier | ✅ Oui | ❌ Non | N/A |
| Notifications | ✅ Simples | ✅ Riches | Facile ⭐ |
| Partage | ✅ Export | ✅ Natif Android | Facile ⭐ |
| Bouton retour | N/A | ✅ Géré | Facile ⭐ |
| Permissions | N/A | ✅ Système Android | Moyen ⭐⭐ |
| Appareil photo | ❌ Difficile | ✅ Facile | Facile ⭐ |
| Auto-update | ✅ electron-updater | ✅ Play Store | Automatique |

## 🎯 Points importants

### Différences majeures

1. **Sélection de dossier** : Sur Android, les fichiers sont toujours dans un dossier fixe (`Documents/quasernet/`). Pas de sélection par l'utilisateur.

2. **Permissions** : Android nécessite des permissions explicites pour la caméra, le stockage, etc.

3. **Bouton retour** : Élément crucial de l'expérience Android, doit être géré proprement.

4. **APK vs EXE** : Android compile en APK/AAB, pas en exécutable classique.

### Similitudes

1. **Firebase** : Fonctionne de manière identique
2. **LocalStorage** : Disponible sur les deux
3. **Fetch API** : Identique
4. **DOM/JavaScript** : Même logique métier

## 🔧 Migration facile

La plupart du code est **réutilisable tel quel** :
- ✅ Toute la logique métier (95%)
- ✅ Tout le CSS (98%, juste des ajustements mobile)
- ✅ Firebase et authentification (100%)
- ✅ Rendu et interface (100%)

Seuls les **wrappers de stockage** changent (5% du code).

---

**Conclusion** : La migration Electron → Android est simple car Capacitor utilise les mêmes technologies web (HTML/CSS/JS) avec des APIs natives similaires.
