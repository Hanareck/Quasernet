# Guide d'installation - Quasernet Capture

## Installation rapide (Développement)

### 1. Préparer l'extension

```bash
cd quasernet-firefox-extension
```

### 2. Ajouter les icônes

Avant de charger l'extension, vous devez ajouter des icônes dans le dossier `icons/`. Vous pouvez :

**Option A : Copier les icônes existantes**
```bash
# Si vous avez déjà des icônes dans le projet
cp ../journal-culturel-v8-HTML-améliorationCSS/logo/favicon.ico icons/
# Puis convertir en PNG aux différentes tailles requises
```

**Option B : Créer des icônes temporaires**

Créez des fichiers PNG simples de 16x16, 32x32, 48x48 et 128x128 pixels en utilisant un éditeur d'images comme GIMP ou Photoshop.

**Option C : Télécharger des placeholders**

Pour tester rapidement, vous pouvez temporairement commenter les lignes des icônes dans `manifest.json`.

### 3. Charger dans Firefox

1. Ouvrez Firefox
2. Naviguez vers `about:debugging`
3. Cliquez sur "Ce Firefox" dans le menu de gauche
4. Cliquez sur "Charger un module complémentaire temporaire"
5. Sélectionnez le fichier `manifest.json`

### 4. Configurer l'extension

1. Cliquez sur l'icône de l'extension dans la barre d'outils
2. Allez dans l'onglet "Paramètres"
3. Configurez votre URL d'API et votre clé API

## Test de l'extension

### Test sur YouTube

1. Ouvrez une vidéo YouTube : https://www.youtube.com/watch?v=dQw4w9WgXcQ
2. Cliquez sur l'icône Quasernet
3. Cliquez sur "Capturer cette page"
4. Vérifiez que le titre et l'auteur sont correctement extraits

### Test sur d'autres sites

- **Qobuz** : Naviguez vers un album
- **Netflix** : Ouvrez une page de série ou film
- **Open Library** : Visitez une page de livre
- **Spotify** : Ouvrez un album ou une playlist
- **IMDb** : Visitez une page de film

## Configuration de l'API (Backend)

### Créer un endpoint simple

Voici un exemple d'endpoint Node.js/Express :

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Middleware CORS pour l'extension
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.post('/capture', (req, res) => {
  const { title, creator, url, capturedAt, type, siteName } = req.body;

  // Vérifier l'authentification
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer VOTRE_CLE_API') {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  // Sauvegarder dans votre base de données
  console.log('Nouvelle capture:', { title, creator, url, type });

  // Répondre avec succès
  res.json({
    success: true,
    id: Date.now().toString(),
    message: 'Capture enregistrée avec succès'
  });
});

app.listen(3000, () => {
  console.log('API en écoute sur le port 3000');
});
```

### Intégration avec Firestore (comme dans Quasernet)

Si vous utilisez déjà Firestore pour Quasernet, vous pouvez utiliser le même système :

```javascript
const admin = require('firebase-admin');

app.post('/capture', async (req, res) => {
  try {
    const { title, creator, url, capturedAt, type } = req.body;

    // Vérifier l'authentification Firebase
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Ajouter à Firestore
    const docRef = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('items')
      .add({
        title,
        creator,
        url,
        capturedAt: new Date(capturedAt),
        type,
        addedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      id: docRef.id,
      message: 'Ajouté à votre journal'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Mode hors-ligne uniquement

Si vous ne souhaitez pas configurer d'API immédiatement :

1. Dans les paramètres de l'extension
2. Cochez "Mode hors-ligne uniquement"
3. Les captures seront stockées localement
4. Vous pourrez les exporter plus tard

## Dépannage

### L'extension ne se charge pas

- Vérifiez que toutes les icônes sont présentes
- Ou commentez les lignes d'icônes dans `manifest.json`

### Erreur CORS

Assurez-vous que votre API autorise les requêtes depuis l'extension :

```javascript
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### Les données ne sont pas extraites

- Ouvrez la console de la page (F12)
- Vérifiez les erreurs dans la console
- Le site a peut-être changé sa structure HTML

### L'extension ne s'affiche pas dans la barre d'outils

- Cliquez sur l'icône de puzzle dans la barre d'outils
- Épinglez "Quasernet Capture"

## Développement

### Recharger l'extension après modification

1. Allez sur `about:debugging`
2. Cliquez sur "Recharger" à côté de l'extension

### Voir les logs

- **Background script** : Dans la page de debugging (`about:debugging`)
- **Content script** : Dans la console de la page web (F12)
- **Popup** : Clic droit sur le popup > Inspecter

## Prochaines étapes

1. Personnalisez les icônes avec votre logo
2. Ajoutez vos sites préférés dans `sites-config.json`
3. Configurez votre API backend
4. Testez sur différents sites
5. Partagez vos configurations avec la communauté !

---

Pour toute question, consultez le [README.md](README.md) ou ouvrez une issue.
