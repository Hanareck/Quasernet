# Quasernet Android

Application Android de journal culturel créée avec Capacitor.

## 🚀 Installation et compilation

### Prérequis

- Node.js 16+
- Android Studio
- JDK 11+
- Android SDK (API level 22+)

### 1. Installer les dépendances

```bash
cd quasernet-android
npm install
```

### 2. Ajouter la plateforme Android

```bash
npx cap add android
```

### 3. Synchroniser les fichiers

```bash
npx cap sync
```

### 4. Ouvrir dans Android Studio

```bash
npx cap open android
```

## 📱 Développement

### Synchroniser après modifications

Après avoir modifié les fichiers dans `www/`, synchronisez :

```bash
npx cap sync
```

### Tester sur un appareil

1. Connectez votre appareil Android en USB
2. Activez le débogage USB sur l'appareil
3. Dans Android Studio : Run > Run 'app'

### Tester sur un émulateur

1. Créez un AVD (Android Virtual Device) dans Android Studio
2. Lancez l'émulateur
3. Run > Run 'app'

## 🏗️ Architecture

```
quasernet-android/
├── www/                    # Code web (HTML/CSS/JS)
│   ├── index.html
│   ├── androidMode.js     # Adaptation pour Android (Capacitor)
│   ├── localMode.js       # Mode local (localStorage)
│   ├── main.js
│   ├── render*.js
│   └── css/
├── android/               # Projet Android natif (généré)
├── capacitor.config.json  # Configuration Capacitor
└── package.json
```

## 🔧 Plugins Capacitor utilisés

- `@capacitor/filesystem` : Stockage de fichiers local
- `@capacitor/app` : Gestion du bouton retour
- `@capacitor/share` : Partage de fichiers
- `@capacitor/local-notifications` : Notifications locales
- `@capacitor/toast` : Messages toast natifs

## 📝 Modifications par rapport à la version web

### APIs remplacées

| Electron | Capacitor Android |
|----------|-------------------|
| `window.electron.loadEntrees()` | `Filesystem.readFile()` |
| `window.electron.saveEntrees()` | `Filesystem.writeFile()` |
| `window.electron.chooseDataFolder()` | _N/A (dossier fixe)_ |
| Menu Electron | Bouton retour Android |

### Fonctionnalités ajoutées

- ✅ Gestion du bouton retour Android
- ✅ Adaptation pour écrans mobiles
- ✅ Safe areas pour les encoches
- ✅ Partage natif Android
- ✅ Notifications locales
- ✅ Stockage dans Documents Android

## 🔑 Stockage des données

Les données sont stockées dans :
```
/storage/emulated/0/Documents/quasernet/
├── entrees.json      # Toutes les entrées
├── settings.json     # Paramètres utilisateur
└── backups/          # Backups automatiques
    ├── auto-backup-*.json
    └── quasernet-backup-*.json
```

## 📦 Build de production

### Générer un APK

```bash
# Dans Android Studio :
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### Générer un AAB (pour le Play Store)

```bash
# Build > Generate Signed Bundle / APK
# Sélectionnez "Android App Bundle"
```

### Configuration du keystore

1. Créez un keystore :
```bash
keytool -genkey -v -keystore quasernet.keystore -alias quasernet -keyalg RSA -keysize 2048 -validity 10000
```

2. Ajoutez dans `capacitor.config.json` :
```json
{
  "android": {
    "buildOptions": {
      "keystorePath": "chemin/vers/quasernet.keystore",
      "keystoreAlias": "quasernet"
    }
  }
}
```

## 🎨 Personnalisation

### Icône de l'application

Remplacez les fichiers dans :
```
android/app/src/main/res/
├── mipmap-hdpi/ic_launcher.png
├── mipmap-mdpi/ic_launcher.png
├── mipmap-xhdpi/ic_launcher.png
├── mipmap-xxhdpi/ic_launcher.png
└── mipmap-xxxhdpi/ic_launcher.png
```

### Splash screen

Modifiez :
```
android/app/src/main/res/drawable/splash.png
```

### Couleur de thème

Dans `capacitor.config.json` :
```json
{
  "android": {
    "backgroundColor": "#1a1a2e"
  }
}
```

## 🐛 Dépannage

### L'app ne se lance pas

1. Vérifiez que Android Studio est à jour
2. Synchronisez Gradle : File > Sync Project with Gradle Files
3. Nettoyez le projet : Build > Clean Project

### Les modifications ne s'appliquent pas

```bash
npx cap sync
# Puis dans Android Studio : Build > Clean Project
```

### Erreur de permissions

Vérifiez les permissions dans `android/app/src/main/AndroidManifest.xml`

## 📱 Tests

### Mode debug

```bash
# Lancer en mode debug
npx cap run android
```

### Logs Android

```bash
# Voir les logs en temps réel
adb logcat | grep -i capacitor
```

## 🚀 Publication

### Google Play Store

1. Créez un compte développeur Google Play (25$ one-time)
2. Générez un AAB signé
3. Uploadez sur Google Play Console
4. Remplissez les informations de l'app
5. Soumettez pour review

### Distribution directe (APK)

1. Générez un APK signé
2. Distribuez le fichier `.apk`
3. Les utilisateurs devront activer "Sources inconnues"

## 🔐 Sécurité

- Les données sont stockées localement sur l'appareil
- Firebase Auth pour le mode cloud
- Pas de tracking ou analytics par défaut
- Code open-source et auditable

## 📚 Ressources

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Plugins Capacitor](https://capacitorjs.com/docs/plugins)
- [Android Development](https://developer.android.com/)

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez la documentation Capacitor
2. Consultez les issues GitHub
3. Contactez l'équipe de développement

---

**Note** : Cette application nécessite Android 5.1+ (API 22+)
