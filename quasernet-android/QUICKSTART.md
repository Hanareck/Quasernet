# 🚀 Démarrage Rapide - Quasernet Android

Guide ultra-rapide pour compiler et tester l'application.

## ⚡ Installation Express (5 minutes)

### 1. Prérequis

Installez si pas déjà fait :
- [Node.js](https://nodejs.org/) (version 16+)
- [Android Studio](https://developer.android.com/studio)
- JDK 11 (inclus avec Android Studio)

### 2. Configuration Android Studio (première fois uniquement)

1. Ouvrez Android Studio
2. Allez dans **More Actions > SDK Manager**
3. Cochez :
   - ✅ Android SDK Platform 33
   - ✅ Android SDK Build-Tools 33
   - ✅ Android SDK Command-line Tools
4. Cliquez sur **Apply**

### 3. Installation du projet

```bash
# Aller dans le dossier
cd quasernet-android

# Installer les dépendances
npm install

# Ajouter la plateforme Android
npx cap add android

# Synchroniser les fichiers
npx cap sync
```

## 📱 Tester l'application

### Option A : Sur émulateur (recommandé pour débuter)

```bash
# Ouvrir Android Studio
npx cap open android

# Dans Android Studio :
# 1. Cliquez sur "Device Manager" (icône de téléphone)
# 2. Cliquez sur "Create Device"
# 3. Sélectionnez "Pixel 6" > Next > R (API 30) > Next > Finish
# 4. Lancez l'émulateur (triangle vert)
# 5. Cliquez sur Run (triangle vert en haut)
```

### Option B : Sur votre téléphone Android

```bash
# 1. Sur votre téléphone :
#    - Paramètres > À propos du téléphone
#    - Tapez 7 fois sur "Numéro de build"
#    - Retour > Options pour les développeurs
#    - Activez "Débogage USB"

# 2. Connectez le téléphone en USB à votre ordinateur

# 3. Lancez :
npx cap open android

# 4. Dans Android Studio, sélectionnez votre téléphone en haut
# 5. Cliquez sur Run (triangle vert)
```

## ✨ Modifier le code

### Après chaque modification dans www/

```bash
# Synchroniser les changements
npx cap sync

# Dans Android Studio : Run (ou Ctrl+R / Cmd+R)
```

### Fichiers principaux à modifier

```
www/
├── index.html          # Structure HTML
├── css/main.css        # Styles (et composants CSS)
├── androidMode.js      # Logique Android (stockage fichiers)
├── main.js            # Logique principale
├── renderApp.js       # Interface principale
└── render*.js         # Autres écrans
```

## 🔥 Commandes utiles

```bash
# Synchroniser après modifications
npx cap sync

# Ouvrir Android Studio
npx cap open android

# Lancer directement sur appareil connecté
npx cap run android

# Voir les logs en temps réel
adb logcat | grep Capacitor
```

## 🎯 Premiers tests à faire

1. **Mode Local** :
   - Choisissez "Mode Local" au démarrage
   - Ajoutez une découverte
   - Fermez et rouvrez l'app → Les données doivent être là

2. **Mode Cloud** :
   - Choisissez "Mode Cloud"
   - Connectez-vous avec Firebase
   - Vérifiez la synchronisation

3. **Bouton Retour** :
   - Testez le bouton retour Android sur différents écrans
   - Doit revenir à la liste, puis quitter l'app

## 🐛 Problèmes courants

### "SDK location not found"

Dans `android/local.properties`, ajoutez :
```
sdk.dir=/Users/VOTRE_NOM/Library/Android/sdk  # macOS
# ou
sdk.dir=C\:\\Users\\VOTRE_NOM\\AppData\\Local\\Android\\Sdk  # Windows
```

### "capacitor.js not found"

```bash
npx cap sync
```

### L'app crash au démarrage

1. Ouvrez Android Studio
2. Allez dans Logcat (en bas)
3. Cherchez les erreurs en rouge
4. Vérifiez que tous les fichiers .js sont bien dans www/

### Les modifications ne s'appliquent pas

```bash
# Nettoyage complet
npx cap sync
# Dans Android Studio : Build > Clean Project
# Puis Run
```

## 📦 Générer un APK pour partager

```bash
# 1. Ouvrir Android Studio
npx cap open android

# 2. Dans Android Studio :
#    Build > Build Bundle(s) / APK(s) > Build APK(s)

# 3. Le fichier APK sera dans :
#    android/app/build/outputs/apk/debug/app-debug.apk

# 4. Transférez ce fichier APK sur votre téléphone et installez-le
```

## 🎨 Personnaliser l'icône

1. Créez une icône PNG 512x512px
2. Utilisez [Icon Generator](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
3. Téléchargez le zip
4. Extrayez dans `android/app/src/main/res/`

## 🚀 Prochaines étapes

- [ ] Tester toutes les fonctionnalités
- [ ] Personnaliser l'icône
- [ ] Créer un compte Google Play Developer (25$)
- [ ] Générer une clé de signature (keystore)
- [ ] Compiler un AAB pour le Play Store
- [ ] Publier !

## 📚 Besoin d'aide ?

- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Guide Android Studio](https://developer.android.com/studio/intro)
- Consultez le README.md pour plus de détails

---

**Temps estimé de la première compilation : 10-15 minutes**

Bonne chance ! 🎉
