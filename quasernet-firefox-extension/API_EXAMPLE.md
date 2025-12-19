# Exemple d'API Backend pour Quasernet Capture

Ce document fournit des exemples d'implémentation backend pour recevoir les données de l'extension.

## 🔍 Format de la requête

### En-têtes HTTP

```
POST /capture HTTP/1.1
Host: api.quasernet.com
Content-Type: application/json
Authorization: Bearer VOTRE_CLE_API
```

### Corps de la requête (JSON)

```json
{
  "title": "Titre de l'œuvre",
  "creator": "Nom du créateur/artiste/auteur",
  "url": "https://example.com/page",
  "capturedAt": "2024-12-19T10:30:00.000Z",
  "siteName": "YouTube",
  "type": "video",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "description": "Description de l'œuvre",
  "releaseDate": "2024",
  "publishDate": "2024-01-15"
}
```

### Champs obligatoires

- `title` : string
- `url` : string (URL complète)
- `capturedAt` : string (ISO 8601 date)

### Champs optionnels

- `creator` : string
- `siteName` : string
- `type` : "video" | "music" | "book" | "other"
- `thumbnail` : string (URL)
- `description` : string
- `releaseDate` : string
- `publishDate` : string

## 🚀 Implémentations

### Node.js + Express

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Validation de la clé API
const API_KEY = process.env.API_KEY || 'votre-cle-secrete';

function authenticateAPI(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token manquant'
    });
  }

  const token = authHeader.replace('Bearer ', '');

  if (token !== API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }

  next();
}

// Endpoint de capture
app.post('/capture', authenticateAPI, async (req, res) => {
  try {
    const { title, creator, url, capturedAt, type, siteName, thumbnail, description } = req.body;

    // Validation
    if (!title || !url || !capturedAt) {
      return res.status(400).json({
        success: false,
        error: 'Champs obligatoires manquants (title, url, capturedAt)'
      });
    }

    // Sauvegarder dans votre base de données
    const capture = {
      id: Date.now().toString(),
      title,
      creator,
      url,
      capturedAt: new Date(capturedAt),
      type: type || 'other',
      siteName,
      thumbnail,
      description,
      createdAt: new Date()
    };

    // TODO: Sauvegarder dans votre DB
    console.log('Nouvelle capture:', capture);

    // Réponse
    res.json({
      success: true,
      id: capture.id,
      message: 'Capture enregistrée avec succès'
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API en écoute sur le port ${PORT}`);
});
```

### Node.js + Firebase/Firestore

```javascript
const admin = require('firebase-admin');
const express = require('express');
const app = express();

// Initialiser Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

app.use(express.json());

// Authentification avec Firebase Auth
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
}

app.post('/capture', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const captureData = req.body;

    // Validation
    if (!captureData.title || !captureData.url) {
      return res.status(400).json({
        success: false,
        error: 'Titre et URL obligatoires'
      });
    }

    // Ajouter à Firestore
    const docRef = await db
      .collection('users')
      .doc(userId)
      .collection('captures')
      .add({
        ...captureData,
        capturedAt: admin.firestore.Timestamp.fromDate(new Date(captureData.capturedAt)),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      id: docRef.id,
      message: 'Ajouté à votre journal Quasernet'
    });

  } catch (error) {
    console.error('Erreur Firestore:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000);
```

### Python + Flask

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv('API_KEY', 'votre-cle-secrete')

def authenticate():
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith('Bearer '):
        return False

    token = auth_header.replace('Bearer ', '')
    return token == API_KEY

@app.route('/capture', methods=['POST'])
def capture():
    # Authentification
    if not authenticate():
        return jsonify({
            'success': False,
            'error': 'Non autorisé'
        }), 401

    # Récupérer les données
    data = request.get_json()

    # Validation
    required_fields = ['title', 'url', 'capturedAt']
    if not all(field in data for field in required_fields):
        return jsonify({
            'success': False,
            'error': 'Champs obligatoires manquants'
        }), 400

    # Traitement
    capture_id = str(int(datetime.now().timestamp() * 1000))

    # TODO: Sauvegarder dans votre base de données
    print(f"Nouvelle capture: {data['title']}")

    # Réponse
    return jsonify({
        'success': True,
        'id': capture_id,
        'message': 'Capture enregistrée'
    })

if __name__ == '__main__':
    app.run(port=3000)
```

### Supabase (PostgreSQL)

```javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.post('/capture', async (req, res) => {
  try {
    // Authentification Supabase
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    // Insérer dans la base de données
    const { data, error } = await supabase
      .from('captures')
      .insert([
        {
          user_id: user.id,
          title: req.body.title,
          creator: req.body.creator,
          url: req.body.url,
          captured_at: req.body.capturedAt,
          type: req.body.type,
          site_name: req.body.siteName,
          thumbnail: req.body.thumbnail,
          description: req.body.description
        }
      ])
      .select();

    if (error) throw error;

    res.json({
      success: true,
      id: data[0].id,
      message: 'Capture enregistrée'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000);
```

#### Schéma SQL pour Supabase

```sql
CREATE TABLE captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  creator TEXT,
  url TEXT NOT NULL,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT,
  site_name TEXT,
  thumbnail TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes
CREATE INDEX idx_captures_user_id ON captures(user_id);
CREATE INDEX idx_captures_created_at ON captures(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own captures"
  ON captures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own captures"
  ON captures FOR SELECT
  USING (auth.uid() = user_id);
```

## 🔒 Sécurité

### CORS

Configurez CORS pour autoriser uniquement les requêtes de l'extension :

```javascript
const cors = require('cors');

app.use(cors({
  origin: '*', // En production, limitez aux origines Firefox
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting

Limitez le nombre de requêtes par utilisateur :

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requêtes
});

app.use('/capture', limiter);
```

### Validation des données

```javascript
const { body, validationResult } = require('express-validator');

app.post('/capture',
  [
    body('title').notEmpty().trim().escape(),
    body('url').isURL(),
    body('capturedAt').isISO8601(),
    body('type').optional().isIn(['video', 'music', 'book', 'other'])
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... suite du traitement
  }
);
```

## 📊 Exemples de réponses

### Succès

```json
{
  "success": true,
  "id": "1234567890",
  "message": "Capture enregistrée avec succès"
}
```

### Erreur de validation

```json
{
  "success": false,
  "error": "Champs obligatoires manquants",
  "fields": ["title", "url"]
}
```

### Erreur d'authentification

```json
{
  "success": false,
  "error": "Token invalide ou expiré"
}
```

### Erreur serveur

```json
{
  "success": false,
  "error": "Erreur interne du serveur"
}
```

## 🧪 Test de l'API

### Avec cURL

```bash
curl -X POST https://api.quasernet.com/capture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -d '{
    "title": "Test Capture",
    "creator": "Test Artist",
    "url": "https://example.com/test",
    "capturedAt": "2024-12-19T10:30:00.000Z",
    "type": "music"
  }'
```

### Avec HTTPie

```bash
http POST https://api.quasernet.com/capture \
  Authorization:"Bearer VOTRE_CLE_API" \
  title="Test Capture" \
  creator="Test Artist" \
  url="https://example.com/test" \
  capturedAt="2024-12-19T10:30:00.000Z" \
  type="music"
```

### Avec Postman

1. Méthode : POST
2. URL : `https://api.quasernet.com/capture`
3. Headers :
   - `Content-Type: application/json`
   - `Authorization: Bearer VOTRE_CLE_API`
4. Body (raw JSON) : voir exemple ci-dessus

## 🚀 Déploiement

### Vercel (Serverless)

```javascript
// api/capture.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // ... votre logique ici

  res.json({ success: true });
};
```

### AWS Lambda

```javascript
exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  // ... votre logique ici

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ success: true })
  };
};
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 📝 Notes

- L'extension envoie toujours du JSON
- L'authentification peut utiliser JWT, API Key, ou OAuth
- Pensez à logger les erreurs pour le debugging
- Utilisez HTTPS en production

---

Pour plus d'informations, consultez le [README.md](README.md).
