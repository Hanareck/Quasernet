# Recherche de Livres Open Library

Une application web simple pour rechercher des livres sur Open Library avec suggestions en temps réel, affichage des couvertures, auteurs et titres.

## Fonctionnalités

✅ **Recherche en temps réel** - Suggestions qui apparaissent au fur et à mesure que vous tapez
✅ **Sélection intuitive** - Cliquez sur une suggestion ou utilisez les flèches du clavier + Entrée
✅ **Affichage complet** - Titre, auteur(s), couverture du livre
✅ **Navigation fluide** - Interface responsive qui s'adapte à tous les écrans
✅ **Actions pratiques** - Boutons pour voir sur Open Library ou copier les informations
✅ **Mise en évidence** - Les correspondances de recherche sont surlignées dans les suggestions

## Technologies utilisées

- **HTML5** - Structure de la page
- **CSS3** - Styles modernes avec variables CSS et animations
- **JavaScript** - Logique de recherche et manipulation du DOM
- **Open Library API** - Source des données des livres
- **Font Awesome** - Icônes pour une meilleure UX

## Comment utiliser

### Version Standalone (sans serveur)

1. **Téléchargez les fichiers** : Clonez ce dépôt ou téléchargez les fichiers
2. **Ouvrez index.html** : Double-cliquez sur le fichier `index.html` ou ouvrez-le dans votre navigateur
3. **Commencez à rechercher** :
   - Tapez au moins 2 caractères dans la barre de recherche
   - Des suggestions apparaissent automatiquement
   - Sélectionnez une suggestion en cliquant dessus ou avec les flèches du clavier + Entrée
   - Ou cliquez sur le bouton de recherche pour voir plus de résultats

### Fonctionnalités avancées

- **Copier les informations** : Cliquez sur "Copier" pour copier les détails du livre (titre, auteur, URL de la couverture) dans votre presse-papiers
- **Voir sur Open Library** : Cliquez sur "Voir" pour ouvrir la page du livre sur Open Library
- **Navigation clavier** : Utilisez les flèches haut/bas pour naviguer dans les suggestions
- **Recherche étendue** : Appuyez sur Entrée dans le champ de recherche pour lancer une recherche complète

## Structure des fichiers

```
.
├── index.html          # Page principale
├── styles.css          # Styles CSS
├── script.js           # Logique JavaScript
└── README.md           # Documentation
```

## API Open Library

Cette application utilise l'API publique de [Open Library](https://openlibrary.org/developers/api) :

- **Endpoint de recherche** : `https://openlibrary.org/search.json`
- **Endpoint des couvertures** : `https://covers.openlibrary.org/b/id/`

### Exemple de requête API

```
GET https://openlibrary.org/search.json?q=harry+potter&limit=5
```

### Exemple de réponse

```json
{
  "docs": [
    {
      "title": "Harry Potter and the Philosopher's Stone",
      "author_name": ["J. K. Rowling"],
      "cover_i": 123456,
      "key": "/works/OL12345W"
    }
  ]
}
```

## Personnalisation

Vous pouvez facilement personnaliser l'application :

### Couleurs
Modifiez les variables CSS dans `styles.css` :
```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    /* ... */
}
```

### Nombre de résultats
Modifiez le paramètre `limit` dans les requêtes API dans `script.js` :
```javascript
// Pour les suggestions (ligne ~15)
`https://openlibrary.org/search.json?q=${query}&limit=5`

// Pour la recherche complète (ligne ~60)
`https://openlibrary.org/search.json?q=${query}&limit=12`
```

### Disposition
Modifiez la grille CSS dans `styles.css` :
```css
.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
}
```

## Exemples de recherche

Essayez ces recherches pour voir l'application en action :
- "Harry Potter"
- "Le Petit Prince"
- "Sherlock Holmes"
- "Science fiction"
- "Philosophie"

## Problèmes connus et limitations

1. **CORS** : Certains navigateurs peuvent bloquer les requêtes directes à l'API Open Library. Si cela se produit, vous pouvez :
   - Utiliser une extension pour désactiver CORS
   - Déployer l'application sur un serveur web
   - Créer un proxy backend (voir la version Flask dans ce dépôt)

2. **Couvertures manquantes** : Certains livres n'ont pas de couverture disponible

3. **Données incomplètes** : Certains livres peuvent avoir des informations manquantes (auteur, année, etc.)

## Prochaines étapes d'amélioration

- [ ] Ajouter un système de favoris avec localStorage
- [ ] Implémenter un historique de recherche
- [ ] Ajouter des filtres (par année, langue, etc.)
- [ ] Intégrer d'autres APIs (films, musique)
- [ ] Ajouter un mode sombre
- [ ] Implémenter la pagination
- [ ] Ajouter des tests unitaires

## Licence

Ce projet est open source et peut être utilisé librement. L'API Open Library est fournie par [Internet Archive](https://archive.org/) et est soumise à leurs conditions d'utilisation.

## Crédits

- Icônes : [Font Awesome](https://fontawesome.com/)
- API : [Open Library](https://openlibrary.org/)
- Design inspiré des meilleures pratiques UX/UI modernes

---

**Bonnes recherches et bonnes lectures ! 📚**