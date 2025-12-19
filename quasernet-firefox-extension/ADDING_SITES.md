# Guide : Ajouter un nouveau site

Ce guide vous explique comment ajouter le support d'un nouveau site à l'extension Quasernet Capture.

## 📋 Prérequis

- Connaissance de base en sélecteurs CSS
- Accès aux DevTools du navigateur (F12)
- Le site que vous voulez ajouter

## 🔍 Étape 1 : Analyser la page

### 1.1 Ouvrir la page cible

Naviguez vers une page typique du site (ex: une vidéo, un album, un livre).

### 1.2 Identifier les éléments

Ouvrez les DevTools (F12) et identifiez les sélecteurs CSS pour :

**Obligatoire :**
- **Titre** de l'œuvre

**Optionnel :**
- **Créateur** (auteur, artiste, réalisateur)
- **Miniature** (image de couverture)
- **Description**
- **Date de sortie/publication**

### 1.3 Utiliser l'inspecteur

1. Cliquez sur l'icône de sélection (flèche) dans les DevTools
2. Cliquez sur l'élément à identifier
3. Dans le panneau Elements, notez :
   - Les classes CSS
   - Les IDs
   - Les balises `<meta>` (souvent plus fiables)

## 🎯 Étape 2 : Trouver les sélecteurs

### Exemple pratique : Deezer

Prenons l'exemple d'une page album sur Deezer.

#### Titre de l'album

```html
<h1 class="naboo-heading-title">Album Title</h1>
<!-- OU -->
<meta property="og:title" content="Album Title">
```

**Sélecteurs possibles :**
- `h1.naboo-heading-title`
- `meta[property='og:title']`

#### Artiste

```html
<a class="naboo-link-secondary" href="/artist/123">Artist Name</a>
<!-- OU -->
<meta name="music:musician" content="Artist Name">
```

**Sélecteurs possibles :**
- `a.naboo-link-secondary`
- `meta[name='music:musician']`

#### Image de couverture

```html
<meta property="og:image" content="https://...cover.jpg">
<!-- OU -->
<img class="album-cover" src="https://...cover.jpg">
```

**Sélecteurs possibles :**
- `meta[property='og:image']`
- `img.album-cover`

### 💡 Astuces pour les sélecteurs

1. **Privilégiez les balises `<meta>`** : Plus stables que les classes CSS
   ```css
   meta[property='og:title']
   meta[property='og:description']
   meta[property='og:image']
   ```

2. **Utilisez les attributs sémantiques** : `itemprop`, `data-*`, etc.
   ```css
   [itemprop='name']
   [data-testid='title']
   ```

3. **Évitez les classes génériques** : `class="text"`, `class="btn"`

4. **Testez plusieurs pages** : Les sélecteurs doivent fonctionner partout

## ✍️ Étape 3 : Éditer la configuration

Ouvrez `sites-config.json` et ajoutez votre site dans le tableau `sites` :

```json
{
  "sites": [
    // ... sites existants ...
    {
      "name": "Deezer",
      "domains": ["www.deezer.com", "deezer.com"],
      "type": "music",
      "selectors": {
        "title": [
          "h1.naboo-heading-title",
          "meta[property='og:title']"
        ],
        "creator": [
          "a.naboo-link-secondary",
          "meta[name='music:musician']"
        ],
        "thumbnail": [
          "meta[property='og:image']",
          "img.album-cover"
        ],
        "description": [
          "meta[property='og:description']"
        ]
      },
      "urlPattern": "^https?://(www\\.)?deezer\\.com/(album|track|playlist)/",
      "waitForSelector": "h1.naboo-heading-title",
      "dynamicContent": true
    }
  ]
}
```

## 📝 Structure détaillée

### Champs obligatoires

```json
{
  "name": "Nom du site",           // Nom affiché
  "domains": ["example.com"],      // Liste des domaines
  "selectors": {
    "title": ["h1.title"]          // Au moins un sélecteur de titre
  }
}
```

### Champs optionnels

```json
{
  "type": "video|music|book|other",
  "urlPattern": "^https?://...",
  "waitForSelector": "h1.title",
  "dynamicContent": true
}
```

### Détail des options

| Champ | Description | Exemple |
|-------|-------------|---------|
| `name` | Nom du site | `"YouTube"` |
| `domains` | Domaines supportés | `["youtube.com", "m.youtube.com"]` |
| `type` | Type de contenu | `"video"`, `"music"`, `"book"` |
| `selectors` | Objet avec les sélecteurs | Voir ci-dessous |
| `urlPattern` | Regex pour filtrer les URLs | `"^https://youtube.com/watch"` |
| `waitForSelector` | Sélecteur à attendre | `"h1.title"` |
| `dynamicContent` | Page avec chargement async | `true` ou `false` |

### Types de sélecteurs

```json
{
  "selectors": {
    "title": ["h1", "meta[property='og:title']"],
    "creator": ["a.author", "span.artist"],
    "thumbnail": ["meta[property='og:image']"],
    "description": ["p.description"],
    "releaseDate": ["span.date"],
    "publishDate": ["time[datetime]"]
  }
}
```

## 🧪 Étape 4 : Tester

### 4.1 Recharger l'extension

1. Allez sur `about:debugging`
2. Cliquez sur "Recharger" à côté de l'extension

### 4.2 Tester la capture

1. Naviguez vers le site
2. Cliquez sur l'icône Quasernet
3. Cliquez sur "Capturer cette page"
4. Vérifiez les données extraites

### 4.3 Déboguer

Si ça ne fonctionne pas :

1. Ouvrez la console de la page (F12)
2. Cherchez les messages d'erreur
3. Vérifiez que les sélecteurs correspondent
4. Ajustez `waitForSelector` si nécessaire

## 🎨 Exemples de configurations

### Site statique (Open Library)

```json
{
  "name": "Open Library",
  "domains": ["openlibrary.org"],
  "type": "book",
  "selectors": {
    "title": ["h1[itemprop='name']"],
    "creator": ["a[itemprop='author']"],
    "thumbnail": ["img.bookcover"]
  },
  "dynamicContent": false
}
```

### Site dynamique (React/Vue)

```json
{
  "name": "Spotify",
  "domains": ["open.spotify.com"],
  "type": "music",
  "selectors": {
    "title": ["h1[data-encore-id='text']"],
    "creator": ["a[href*='/artist/']"]
  },
  "waitForSelector": "h1[data-encore-id='text']",
  "dynamicContent": true
}
```

### Site avec URL spécifique

```json
{
  "name": "Reddit Posts",
  "domains": ["reddit.com"],
  "type": "other",
  "selectors": {
    "title": ["h1"],
    "creator": ["[data-testid='post-author']"]
  },
  "urlPattern": "^https?://(www\\.)?reddit\\.com/r/[^/]+/comments/",
  "dynamicContent": true
}
```

## 🔧 Cas particuliers

### Sites avec plusieurs types de pages

Si un site a différentes structures selon le type de page :

```json
{
  "name": "Amazon",
  "domains": ["amazon.com", "amazon.fr"],
  "type": "book",
  "selectors": {
    "title": [
      "span#productTitle",           // Page produit
      "h1.product-title",           // Page alternative
      "meta[property='og:title']"   // Fallback
    ],
    "creator": [
      "span.author a",
      "a.contributorNameID"
    ]
  },
  "urlPattern": "^https?://[^/]*amazon\\.[^/]+/.*/(dp|gp/product)/",
  "dynamicContent": true
}
```

### Extraction d'attributs multiples

Pour les images, vous pouvez extraire `src`, `content`, ou `href` :

```json
{
  "thumbnail": [
    "meta[property='og:image']",  // Cherche l'attribut 'content'
    "img.cover",                 // Cherche l'attribut 'src'
    "link[rel='image_src']"      // Cherche l'attribut 'href'
  ]
}
```

### Pages avec délai de chargement

Pour les sites très lents ou avec beaucoup de JavaScript :

```json
{
  "waitForSelector": "h1.loaded",
  "dynamicContent": true
}
```

L'extension attend jusqu'à 5 secondes que le sélecteur apparaisse.

## 📤 Partager votre configuration

Une fois testée, vous pouvez :

1. Créer une Pull Request avec votre ajout
2. Partager dans les issues GitHub
3. Documenter les spécificités du site

### Template de Pull Request

```markdown
## Nouveau site : [Nom du site]

### Informations
- **Site** : example.com
- **Type** : music/video/book/other
- **Difficulté** : Facile/Moyen/Difficile

### Sélecteurs testés sur
- [ ] Page type 1
- [ ] Page type 2
- [ ] Version mobile

### Notes
- Le site utilise du chargement dynamique
- Les sélecteurs sont stables depuis X temps
- Particularités : ...
```

## 🐛 Problèmes courants

### Le titre n'est pas extrait

- Vérifiez que le sélecteur correspond
- Essayez d'utiliser `meta[property='og:title']`
- Augmentez le délai avec `waitForSelector`

### Le créateur est vide

- Certains sites ne mentionnent pas le créateur
- Cherchez dans les balises `<meta>`
- Vérifiez les attributs `itemprop`, `data-*`

### Extraction partielle

- Les sélecteurs trop spécifiques peuvent échouer
- Utilisez plusieurs sélecteurs de fallback
- Testez sur différentes pages du site

## 📚 Ressources

- [MDN : Sélecteurs CSS](https://developer.mozilla.org/fr/docs/Web/CSS/CSS_Selectors)
- [Open Graph Protocol](https://ogp.me/)
- [Schema.org](https://schema.org/)
- [Firefox DevTools](https://firefox-source-docs.mozilla.org/devtools-user/)

## 🎓 Exercice pratique

Essayez d'ajouter le support de **SoundCloud** :

1. Naviguez vers : https://soundcloud.com/
2. Ouvrez une piste
3. Identifiez les sélecteurs pour :
   - Titre de la piste
   - Nom de l'artiste
   - Image de couverture
4. Créez la configuration
5. Testez !

<details>
<summary>Solution</summary>

```json
{
  "name": "SoundCloud",
  "domains": ["soundcloud.com"],
  "type": "music",
  "selectors": {
    "title": [
      "h1[itemprop='name']",
      "meta[property='og:title']"
    ],
    "creator": [
      "a[itemprop='author']",
      "meta[property='soundcloud:author']"
    ],
    "thumbnail": [
      "meta[property='og:image']"
    ]
  },
  "urlPattern": "^https?://soundcloud\\.com/[^/]+/[^/]+$",
  "waitForSelector": "h1[itemprop='name']",
  "dynamicContent": true
}
```
</details>

---

Bon ajout de sites ! 🚀

Si vous rencontrez des difficultés, n'hésitez pas à ouvrir une issue avec :
- L'URL de la page
- Les sélecteurs que vous avez essayés
- Le message d'erreur
