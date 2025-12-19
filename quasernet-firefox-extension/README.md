# Quasernet Capture - Extension Firefox

Extension Firefox (Manifest V3) pour capturer facilement vos découvertes culturelles et les envoyer à votre journal Quasernet.

## 🎯 Fonctionnalités

- **Capture en un clic** : Extrait automatiquement le titre, créateur, URL et date de capture
- **Configuration extensible** : Ajoutez de nouveaux sites via JSON sans toucher au code
- **Sites supportés** : YouTube, Qobuz, Netflix, Open Library, Spotify, IMDb
- **Compatible pages dynamiques** : Gestion intelligente du chargement asynchrone
- **Mode hors-ligne** : Stockage local avec synchronisation ultérieure
- **API personnalisable** : Configurez votre propre endpoint

## 📦 Installation

### Installation pour développement

1. Clonez ce dépôt ou téléchargez les fichiers
2. Ouvrez Firefox et naviguez vers `about:debugging`
3. Cliquez sur "Ce Firefox" dans le menu de gauche
4. Cliquez sur "Charger un module complémentaire temporaire"
5. Sélectionnez le fichier `manifest.json` dans le dossier de l'extension

### Installation depuis le store (à venir)

L'extension sera bientôt disponible sur le Firefox Add-ons Store.

## 🚀 Utilisation

### Capture simple

1. Naviguez vers une page supportée (YouTube, Netflix, Qobuz, etc.)
2. Cliquez sur l'icône Quasernet dans la barre d'outils
3. Cliquez sur "Capturer cette page"
4. Les données sont automatiquement extraites et envoyées à votre API

### Raccourci clavier

Utilisez `Ctrl + Shift + C` pour capturer rapidement la page active.

### Configuration de l'API

1. Cliquez sur l'icône de l'extension
2. Allez dans l'onglet "Paramètres"
3. Configurez :
   - **URL de l'API** : L'endpoint qui recevra les données
   - **Clé API** : Votre token d'authentification (optionnel)
   - **Sauvegarde automatique locale** : Conserve une copie locale même après envoi
   - **Mode hors-ligne uniquement** : Stocke uniquement en local

### Gestion de l'historique

L'onglet "Historique" vous permet de :
- Voir toutes vos captures locales
- Identifier les captures non synchronisées
- Synchroniser manuellement avec l'API
- Supprimer des captures individuelles
- Effacer tout l'historique local

## 🔧 Configuration avancée

### Ajouter un nouveau site

Éditez le fichier `sites-config.json` :

```json
{
  "sites": [
    {
      "name": "Nom du site",
      "domains": ["example.com", "www.example.com"],
      "type": "video|music|book|other",
      "selectors": {
        "title": ["h1.title", "meta[property='og:title']"],
        "creator": ["a.author", "span.artist"],
        "thumbnail": ["meta[property='og:image']"],
        "description": ["meta[property='og:description']"]
      },
      "urlPattern": "^https?://(www\\.)?example\\.com/",
      "waitForSelector": "h1.title",
      "dynamicContent": true
    }
  ]
}
```

### Structure des sélecteurs

Chaque sélecteur peut être :
- **Un tableau de sélecteurs CSS** : Testés dans l'ordre jusqu'à trouver une correspondance
- **Compatibles avec les attributs** : Pour les balises `<meta>`, `<img>`, etc.

#### Champs supportés

- `title` : Titre de l'œuvre **(obligatoire)**
- `creator` : Créateur/artiste/auteur/réalisateur
- `thumbnail` : URL de l'image de couverture
- `description` : Description ou synopsis
- `releaseDate` : Date de sortie
- `publishDate` : Date de publication

### Options de configuration

- **domains** : Liste des domaines supportés
- **type** : Type de contenu (video, music, book, other)
- **urlPattern** : Regex pour filtrer les URLs spécifiques
- **waitForSelector** : Sélecteur à attendre avant l'extraction
- **dynamicContent** : `true` pour les sites avec chargement asynchrone

## 📡 Format de l'API

### Requête envoyée

```json
{
  "title": "Titre de l'œuvre",
  "creator": "Nom du créateur",
  "url": "https://example.com/page",
  "capturedAt": "2024-01-15T10:30:00.000Z",
  "siteName": "YouTube",
  "type": "video",
  "thumbnail": "https://example.com/thumb.jpg",
  "description": "Description de l'œuvre"
}
```

### En-têtes

```
Content-Type: application/json
Authorization: Bearer VOTRE_CLE_API
```

### Réponse attendue

```json
{
  "success": true,
  "id": "unique-id",
  "message": "Capture enregistrée"
}
```

## 🏗️ Architecture

```
quasernet-firefox-extension/
├── manifest.json           # Configuration Manifest V3
├── background.js          # Service worker (orchestration + API)
├── content.js            # Script d'extraction
├── popup.html           # Interface utilisateur
├── popup.js            # Logique du popup
├── popup.css          # Styles du popup
├── sites-config.json # Configuration des sites
├── icons/           # Icônes de l'extension
└── README.md       # Documentation
```

### Flux de données

1. **Utilisateur** clique sur "Capturer"
2. **Popup** envoie un message au background script
3. **Background** envoie un message au content script
4. **Content script** extrait les données de la page
5. **Content script** renvoie les données au background
6. **Background** envoie les données à l'API
7. **Background** sauvegarde localement (si configuré)
8. **Popup** affiche le résultat

## 🛠️ Développement

### Prérequis

- Firefox Developer Edition (recommandé) ou Firefox stable
- Éditeur de code (VS Code, etc.)

### Structure du code

#### background.js
- Gestion de l'API et de la synchronisation
- Stockage local
- Orchestration des messages

#### content.js
- Extraction déclarative basée sur la config JSON
- Gestion des sites dynamiques (MutationObserver)
- Support multi-sélecteurs avec fallback

#### popup.js
- Interface utilisateur
- Gestion des onglets et de l'historique
- Configuration des paramètres

### Debugging

1. Dans Firefox, allez sur `about:debugging`
2. Cliquez sur "Inspecter" sous l'extension
3. Console disponible pour les logs

Pour débugger le content script :
1. Ouvrez les DevTools sur la page web
2. Les logs du content script apparaîtront dans cette console

## 🔒 Sécurité

- Aucune donnée n'est envoyée sans votre action explicite
- La clé API est stockée localement et chiffrée par Firefox
- Aucune collecte de données par l'extension elle-même
- Code open-source et auditable

## 🐛 Dépannage

### La capture ne fonctionne pas

1. Vérifiez que le site est dans `sites-config.json`
2. Ouvrez la console (F12) pour voir les erreurs
3. Le site a peut-être changé sa structure HTML

### Les données extraites sont vides

1. Les sélecteurs CSS ont peut-être changé
2. La page est peut-être trop dynamique (augmentez le délai)
3. Vérifiez avec l'inspecteur d'éléments

### L'API ne répond pas

1. Vérifiez l'URL de l'API dans les paramètres
2. Vérifiez votre clé API
3. Vérifiez les CORS de votre API
4. Consultez la console background script

## 📝 Changelog

### v1.0.0 (2024-12-19)
- Version initiale
- Support de 6 sites : YouTube, Qobuz, Netflix, Open Library, Spotify, IMDb
- Configuration JSON extensible
- Mode hors-ligne avec synchronisation
- Interface utilisateur complète

## 🤝 Contribution

Les contributions sont bienvenues !

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

### Ajouter un nouveau site

Pour ajouter un site supporté :
1. Éditez `sites-config.json`
2. Testez sur plusieurs pages du site
3. Documentez les sélecteurs utilisés
4. Soumettez une PR

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🙏 Remerciements

- [Firefox Add-ons](https://addons.mozilla.org/)
- Tous les contributeurs

## 📧 Contact

Pour toute question ou suggestion :
- Ouvrez une issue sur GitHub
- Email : contact@quasernet.com

---

**Note** : Cette extension nécessite Firefox 109+ pour le support complet de Manifest V3.
