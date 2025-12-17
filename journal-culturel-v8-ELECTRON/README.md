# Quasernet - Mon Journal Culturel

Application Electron pour gérer votre journal de découvertes culturelles : livres, films, musique, vidéos YouTube, articles, et lieux.

## 🎯 Fonctionnalités

- **Mode Cloud** : Synchronisation via Firebase avec fonctionnalités sociales
- **Mode Local** : Stockage de vos données dans un dossier de votre choix (compatible Dropbox/Google Drive)
- Catalogage de découvertes culturelles (livres, films, musique, vidéos, articles, lieux)
- Notes, critiques, tags, et organisation personnalisée
- Import/Export de vos données en JSON
- Backups automatiques tous les 10 ajouts (mode local)
- Interface moderne avec thème clair/sombre

## 🚀 Installation

### Prérequis

- **Node.js** (version 16 ou supérieure)
- **npm** (inclus avec Node.js)

### Installation des dépendances

```bash
cd journal-culturel-v8
npm install
```

## 💻 Développement

### Lancer l'application en mode développement

```bash
npm start
```

Cela ouvrira l'application Electron avec hot reload.

### Structure du projet

```
journal-culturel-v8/
├── electron-main.js       # Processus principal Electron
├── preload.js            # Bridge sécurisé IPC
├── electronMode.js       # Gestion fichiers mode local
├── index.html            # Point d'entrée HTML
├── main.js              # Logique principale de l'app
├── state.js             # État global
├── config.js            # Configuration
├── render*.js           # Fonctions de rendu
├── *.js                 # Autres modules
└── style.css            # Styles globaux
```

## 📦 Build (Création de l'exécutable)

### Build pour Linux

```bash
npm run build
```

Cela créera les fichiers suivants dans le dossier `dist/` :
- **AppImage** : `Quasernet-1.0.0.AppImage` (portable, double-clic pour lancer)
- **DEB** : `quasernet_1.0.0_amd64.deb` (pour Ubuntu/Debian)

### Build pour toutes les plateformes

```bash
npm run build:all
```

Génère les builds pour Windows (.exe), macOS (.dmg), et Linux (.AppImage, .deb).

## 🗂️ Mode Local - Stockage des données

En mode local, vos données sont stockées dans un dossier de votre choix :

```
/votre-dossier-choisi/
├── entrees.json          # Toutes vos entrées culturelles
├── settings.json         # Vos paramètres (pseudo, thème)
└── backups/             # Backups automatiques
    ├── backup-2024-01-15T10-30-00.json
    ├── backup-2024-01-15T14-45-00.json
    └── ...
```

### Avantages du mode local

- ✅ **Vos données restent chez vous** (aucun serveur tiers)
- ✅ **Compatible avec les services cloud** (Dropbox, Google Drive, OneDrive, etc.)
- ✅ **Backups automatiques** tous les 10 ajouts
- ✅ **Format JSON lisible** et facilement exportable
- ✅ **Aucune limite de stockage**

### Changer de dossier

Vous pouvez changer de dossier à tout moment :
1. Ouvrir les Paramètres
2. Section "Mode Local"
3. Cliquer sur "Changer de dossier"

## 🔄 Import / Export

### Export manuel

Dans la vue Import/Export, cliquez sur "Exporter les données" pour télécharger un fichier JSON contenant :
- Toutes vos entrées
- Vos paramètres (pseudo)
- Date d'export

### Import

Importez un fichier JSON précédemment exporté pour restaurer vos données.

**⚠️ Attention** : L'import écrase vos données actuelles.

## 🎨 Thèmes

L'application propose deux thèmes :
- **Thème sombre** (par défaut)
- **Thème clair**

Changez de thème dans les Paramètres.

## 🐛 Développement et Debug

Pour activer les DevTools dans l'application :

Décommentez cette ligne dans `electron-main.js` :

```javascript
mainWindow.webContents.openDevTools();
```

## 📝 Notes techniques

### Sécurité

- Utilisation de `contextIsolation` et `nodeIntegration: false`
- Communication sécurisée via IPC (Inter-Process Communication)
- Les API Electron sont exposées uniquement via `preload.js`

### Compatibilité

- **Electron** : v28.0.0
- **Node.js** : 16+
- **Plateformes** : Linux, Windows, macOS

### Firebase (Mode Cloud uniquement)

Le mode Cloud nécessite une configuration Firebase dans `config.js`.
Le mode Local fonctionne sans Firebase et sans connexion Internet.

## 🤝 Contribution

Ce projet utilise du JavaScript ES5 vanilla (pas de frameworks) pour rester simple et maintenable.

## 📄 Licence

MIT

## ⚙️ Configuration Firebase (optionnel, pour mode Cloud)

Si vous souhaitez activer le mode Cloud, configurez Firebase dans `config.js` :

```javascript
var firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_PROJECT.firebaseapp.com",
    projectId: "VOTRE_PROJECT_ID",
    // ...
};
```

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Firebase (pour le mode Cloud)

---

**Bon catalogage ! 📚🎬🎵**
