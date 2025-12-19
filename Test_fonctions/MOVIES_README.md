# Recherche de Films & Séries

Une application web pour rechercher des films et séries avec suggestions en temps réel, affichage des affiches, années et types.

## ⚠️ Important : À propos des APIs

Cette version utilise des **données simulées** pour démontrer le fonctionnement sans nécessiter de clé API. Pour une version complète avec des données réelles, vous aurez besoin d'une clé API.

### Options d'API pour les films et séries

#### 1. OMDb API (Open Movie Database)
- **Site** : [http://www.omdbapi.com/](http://www.omdbapi.com/)
- **Clé requise** : Oui (gratuite avec limitations)
- **Avantages** : Simple, bien documentée, couvre films et séries
- **Limites** : 1000 requêtes/jour gratuitement

#### 2. TMDB API (The Movie Database)
- **Site** : [https://www.themoviedb.org/](https://www.themoviedb.org/)
- **Clé requise** : Oui (gratuite)
- **Avantages** : Très complète, images haute qualité, base de données énorme
- **Limites** : Nécessite une inscription

#### 3. TVMaze API (pour les séries)
- **Site** : [https://www.tvmaze.com/api](https://www.tvmaze.com/api)
- **Clé requise** : Non
- **Avantages** : Pas besoin de clé, bonne pour les séries
- **Limites** : Moins complète pour les films

## Comment obtenir une clé API OMDb (recommandé)

1. **Allez sur** [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
2. **Remplissez le formulaire** avec votre email et un mot de passe
3. **Validez votre email** en cliquant sur le lien reçu
4. **Vous recevrez une clé API** gratuite par email
5. **Remplacez dans le code** :
   ```javascript
   // Dans movie-script.js, remplacez la ligne de fetch par :
   const response = await fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=${currentMediaType}&apikey=VOTRE_CLE_ICI`);
   ```

## Fonctionnalités de cette version

✅ **Recherche en temps réel** - Suggestions après 2 caractères
✅ **Filtres par type** - Films, Séries, Épisodes ou Tous
✅ **Navigation clavier** - Flèches haut/bas + Entrée
✅ **Affichage complet** - Titre, année, type, affiche, note
✅ **Actions pratiques** - Voir sur IMDb, Copier les infos
✅ **Design responsive** - Adapté mobile, tablette, desktop
✅ **Mise en évidence** - Correspondances surlignées

## Comment utiliser (version démo)

1. **Ouvrez `movies.html`** dans votre navigateur
2. **Commencez à taper** un titre de film ou série (ex: "Harry Potter", "Star Wars", "Game of Thrones")
3. **Sélectionnez une suggestion** ou lancez une recherche complète
4. **Filtrez par type** si vous voulez seulement des films ou séries
5. **Utilisez les boutons** pour voir sur IMDb ou copier les infos

## Structure des fichiers

```
.
├── movies.html          # Page principale pour films/séries
├── movie-script.js      # Logique JavaScript spécifique
├── styles.css           # Styles partagés (avec livres)
└── MOVIES_README.md     # Documentation spécifique
```

## Exemples de recherche

Essayez ces recherches pour voir la démo en action :
- "Harry Potter"
- "Star Wars"
- "Game of Thrones"
- "Matrix"
- "Inception"
- "Friends"
- "Breaking Bad"

## Comment passer à la version réelle avec API

1. **Obtenez une clé API** (OMDb ou TMDB)
2. **Modifiez `movie-script.js`** :
   - Remplacez la fonction `getMockSuggestions()` par un vrai appel API
   - Remplacez la fonction `getMockSearchResults()` par un vrai appel API
   - Mettez à jour la création des cartes pour utiliser les vrais données

3. **Exemple de code pour OMDb** :
```javascript
// Remplacez la fonction fetchSuggestions par :
async function fetchSuggestions(query) {
    if (query.length < 2) {
        hideSuggestions();
        return;
    }

    try {
        const response = await fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=${currentMediaType}&apikey=VOTRE_CLE`);
        const data = await response.json();
        
        if (data.Search && data.Search.length > 0) {
            currentSuggestions = data.Search;
            displaySuggestions(data.Search);
        } else {
            hideSuggestions();
        }
    } catch (error) {
        console.error('Erreur:', error);
        hideSuggestions();
    }
}
```

## Différences entre cette version et la version livres

| Fonctionnalité          | Version Livres | Version Films/Séries |
|-------------------------|---------------|---------------------|
| **API utilisée**        | Open Library   | OMDb (simulée)      |
| **Filtres**             | Aucun          | Films/Séries/Tous   |
| **Notes**               | Non            | Oui (simulées)      |
| **Année**               | Non            | Oui                 |
| **Type de média**       | Livre          | Film/Série          |
| **Site externe**        | Open Library   | IMDb                |

## Prochaines étapes d'amélioration

- [ ] **Intégrer une vraie API** (OMDb ou TMDB)
- [ ] **Ajouter plus de détails** (réalisateur, acteurs, synopsis)
- [ ] **Système de favoris** avec localStorage
- [ ] **Historique de recherche**
- [ ] **Pagination** pour les résultats
- [ ] **Recherche avancée** (par année, genre, etc.)
- [ ] **Mode sombre**
- [ ] **Intégration avec la version livres**

## Problèmes connus (version démo)

1. **Données simulées** : Les résultats ne sont pas réels
2. **Pas de vraie recherche** : Les suggestions sont basées sur un petit jeu de données simulé
3. **Liens IMDb non fonctionnels** : Les IDs sont simulés
4. **Notes aléatoires** : Les notes sont générées aléatoirement

## Alternative sans clé API : TVMaze

Si vous voulez une vraie API sans clé pour les séries, vous pouvez utiliser TVMaze :

```javascript
// Exemple d'appel API TVMaze (sans clé)
async function searchTVMaze(query) {
    const response = await fetch(`http://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    // Traiter les données...
    const shows = data.map(item => ({
        Title: item.show.name,
        Year: item.show.premiered ? item.show.premiered.split('-')[0] : 'N/A',
        Type: 'series',
        imdbID: item.show.externals?.imdb || '',
        Poster: item.show.image?.medium || 'https://via.placeholder.com/300x450?text=No+Poster',
        Rating: item.show.rating?.average || 'N/A'
    }));
    
    return {Search: shows};
}
```

## Ressources utiles

- **Documentation OMDb** : [http://www.omdbapi.com/](http://www.omdbapi.com/)
- **Documentation TMDB** : [https://developers.themoviedb.org/3](https://developers.themoviedb.org/3)
- **Documentation TVMaze** : [https://www.tvmaze.com/api](https://www.tvmaze.com/api)
- **IMDb** : [https://www.imdb.com/](https://www.imdb.com/)

---

**Bonnes recherches cinématographiques ! 🎬🍿**