document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const searchInput = document.getElementById('movie-search-input');
    const searchButton = document.getElementById('movie-search-button');
    const suggestionsContainer = document.getElementById('movie-suggestions');
    const resultsContainer = document.getElementById('movie-results');
    const filterOptions = document.querySelectorAll('input[name="media-type"]');

    // Variables globales
    let debounceTimer;
    let currentSuggestions = [];
    let selectedSuggestionIndex = -1;
    let currentMediaType = '';

    // Fonction pour obtenir le type de média sélectionné
    function getSelectedMediaType() {
        const selected = document.querySelector('input[name="media-type"]:checked');
        return selected ? selected.value : '';
    }

    // Fonction pour rechercher des suggestions
    async function fetchSuggestions(query) {
        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        try {
            // Utilisation de l'API OMDb (nécessite une clé, mais nous allons utiliser une approche alternative)
            // Pour une vraie implémentation, il faudrait une clé API
            // Voici comment cela fonctionnerait avec une clé :
            // const response = await fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=${currentMediaType}&apikey=VOTRE_CLE`);
            
            // Pour cette démo sans clé, nous allons simuler des données ou utiliser une alternative
            // Voici une simulation de données pour la démo :
            const mockData = getMockSuggestions(query);
            
            if (mockData && mockData.Search && mockData.Search.length > 0) {
                currentSuggestions = mockData.Search;
                displaySuggestions(mockData.Search);
            } else {
                hideSuggestions();
            }
        } catch (error) {
            console.error('Erreur lors de la recherche de suggestions:', error);
            hideSuggestions();
        }
    }

    // Fonction pour obtenir des suggestions simulées (pour la démo sans clé API)
    function getMockSuggestions(query) {
        const mockDatabase = {
            'harry': [
                {Title: 'Harry Potter and the Sorcerer\'s Stone', Year: '2001', Type: 'movie', imdbID: 'tt0241527', Poster: 'https://m.media-amazon.com/images/M/MV5BNjQ3NWNlNmQtMTE5ZS00MDdmLTlkZWUtZTBlM2UwMGFlMTU0XkEyXkFqcGdeQXVyNTIzOTk5ODM@._V1_SX300.jpg'},
                {Title: 'Harry Potter and the Chamber of Secrets', Year: '2002', Type: 'movie', imdbID: 'tt0295297', Poster: 'https://m.media-amazon.com/images/M/MV5BMjE0YjUzNDUtMjc0YS00MWJhLTkyZmYtYmRhM2U4YmM2Njc2XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg'}
            ],
            'star': [
                {Title: 'Star Wars: Episode IV - A New Hope', Year: '1977', Type: 'movie', imdbID: 'tt0076759', Poster: 'https://m.media-amazon.com/images/M/MV5BOTA5NjhiOTAtZWM0ZC00MWNhLThiMzEtZDFkOTk2OTU1ZDJkXkEyXkFqcGdeQXVyMTA4NDI1NTQx._V1_SX300.jpg'},
                {Title: 'Star Trek', Year: '2009', Type: 'movie', imdbID: 'tt0796366', Poster: 'https://m.media-amazon.com/images/M/MV5BMjE5NDQ5OTE4Ml5BMl5BanBnXkFtZTcwOTE3NDIzMw@@._V1_SX300.jpg'}
            ],
            'game': [
                {Title: 'Game of Thrones', Year: '2011–2019', Type: 'series', imdbID: 'tt0944947', Poster: 'https://m.media-amazon.com/images/M/MV5BMjA5MTc1MDUxNF5BMl5BanBnXkFtZTgwOTM2ODgxMTE@._V1_SX300.jpg'}
            ],
            'matrix': [
                {Title: 'The Matrix', Year: '1999', Type: 'movie', imdbID: 'tt0133093', Poster: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg'}
            ]
        };

        const queryLower = query.toLowerCase();
        
        // Rechercher dans les clés du mock
        for (const key in mockDatabase) {
            if (queryLower.includes(key)) {
                return {Search: mockDatabase[key]};
            }
        }
        
        // Si aucune correspondance exacte, retourner quelques résultats populaires
        return {
            Search: [
                {Title: `Résultat pour: ${query}`, Year: '2023', Type: 'movie', imdbID: 'mock1', Poster: 'https://via.placeholder.com/300x450?text=Movie+Poster'},
                {Title: `Autre résultat pour: ${query}`, Year: '2022', Type: 'series', imdbID: 'mock2', Poster: 'https://via.placeholder.com/300x450?text=Series+Poster'}
            ]
        };
    }

    // Fonction pour afficher les suggestions
    function displaySuggestions(movies) {
        suggestionsContainer.innerHTML = '';
        
        movies.forEach((movie, index) => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion-item';
            suggestion.dataset.index = index;
            
            const title = movie.Title || 'Titre inconnu';
            const year = movie.Year || 'Année inconnue';
            const type = movie.Type || 'type inconnu';
            
            suggestion.innerHTML = `
                <div class="suggestion-title">${highlightMatch(title, searchInput.value)}</div>
                <div class="suggestion-author">
                    ${year} • <span class="movie-type">${type}</span>
                </div>
            `;
            
            suggestion.addEventListener('click', () => selectSuggestion(movie));
            suggestionsContainer.appendChild(suggestion);
        });
        
        suggestionsContainer.classList.add('show');
    }

    // Fonction pour masquer les suggestions
    function hideSuggestions() {
        suggestionsContainer.classList.remove('show');
        selectedSuggestionIndex = -1;
    }

    // Fonction pour sélectionner une suggestion
    function selectSuggestion(movie) {
        hideSuggestions();
        searchInput.value = movie.Title || '';
        searchMovies(movie.Title || '');
    }

    // Fonction pour rechercher des films
    async function searchMovies(query) {
        if (query.trim() === '') {
            return;
        }

        currentMediaType = getSelectedMediaType();
        showLoading();

        try {
            // Avec une vraie clé API, cela serait :
            // const response = await fetch(`http://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=${currentMediaType}&apikey=VOTRE_CLE`);
            
            // Pour cette démo, nous utilisons des données simulées
            const mockData = getMockSearchResults(query);
            
            if (mockData && mockData.Search && mockData.Search.length > 0) {
                displayResults(mockData.Search);
            } else {
                showEmptyResults();
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            showError();
        }
    }

    // Fonction pour obtenir des résultats de recherche simulés
    function getMockSearchResults(query) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        // Ajouter quelques résultats basés sur la requête
        for (let i = 1; i <= 8; i++) {
            results.push({
                Title: `${query} - Partie ${i}`,
                Year: `202${Math.floor(Math.random() * 3) + 0}`,
                Type: i % 2 === 0 ? 'movie' : 'series',
                imdbID: `mock${i}`,
                Poster: `https://via.placeholder.com/300x450?text=${encodeURIComponent(query)}+${i}`
            });
        }
        
        return {Search: results};
    }

    // Fonction pour afficher les résultats
    function displayResults(movies) {
        resultsContainer.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            resultsContainer.appendChild(movieCard);
        });
    }

    // Fonction pour créer une carte de film
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.className = 'book-card movie-card';
        
        const title = movie.Title || 'Titre inconnu';
        const year = movie.Year || 'Année inconnue';
        const type = movie.Type || 'type inconnu';
        const imdbID = movie.imdbID || '';
        const poster = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster';
        
        // Note aléatoire pour la démo
        const rating = (Math.random() * 8 + 2).toFixed(1);
        
        movieCard.innerHTML = `
            <div class="book-cover-container">
                <img src="${poster}" alt="Affiche de ${title}" class="book-cover">
                <div class="movie-rating">★ ${rating}</div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${title}</h3>
                <p class="book-author">
                    ${year}
                    <span class="movie-type">${type}</span>
                </p>
                <div class="book-actions">
                    <button class="btn btn-primary" onclick="window.open('https://www.imdb.com/title/${imdbID}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Voir
                    </button>
                    <button class="btn btn-secondary" onclick="copyMovieInfo('${title}', '${year}', '${type}', '${poster}')">
                        <i class="fas fa-copy"></i> Copier
                    </button>
                </div>
            </div>
        `;
        
        return movieCard;
    }

    // Fonction pour mettre en évidence les correspondances
    function highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(query, 'gi');
        return text.replace(regex, match => `<span style="background-color: #ffeb3b;">${match}</span>`);
    }

    // Fonction pour afficher le chargement
    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Recherche en cours...</p>
            </div>
        `;
    }

    // Fonction pour afficher aucun résultat
    function showEmptyResults() {
        resultsContainer.innerHTML = `
            <div class="empty-results">
                <i class="fas fa-film"></i>
                <p>Aucun film ou série trouvé pour cette recherche.</p>
            </div>
        `;
    }

    // Fonction pour afficher une erreur
    function showError() {
        resultsContainer.innerHTML = `
            <div class="empty-results">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Une erreur est survenue lors de la recherche.</p>
                <p>Veuillez réessayer plus tard.</p>
            </div>
        `;
    }

    // Fonction pour copier les informations du film
    window.copyMovieInfo = function(title, year, type, poster) {
        const movieInfo = {
            title: title,
            year: year,
            type: type,
            posterUrl: poster
        };
        
        navigator.clipboard.writeText(JSON.stringify(movieInfo, null, 2))
            .then(() => {
                alert('Informations du film/série copiées dans le presse-papiers !');
            })
            .catch(err => {
                console.error('Erreur lors de la copie:', err);
                alert('Impossible de copier les informations.');
            });
    };

    // Gestion des événements
    searchInput.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentMediaType = getSelectedMediaType();
            fetchSuggestions(e.target.value);
        }, 300);
    });

    searchInput.addEventListener('focus', function() {
        if (searchInput.value.length >= 2) {
            fetchSuggestions(searchInput.value);
        }
    });

    searchButton.addEventListener('click', function() {
        searchMovies(searchInput.value.trim());
    });

    // Gestion des filtres
    filterOptions.forEach(filter => {
        filter.addEventListener('change', function() {
            if (searchInput.value.length >= 2) {
                fetchSuggestions(searchInput.value);
            }
        });
    });

    searchInput.addEventListener('keydown', function(e) {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (suggestions.length === 0) return;
        
        // Navigation avec les flèches
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
            updateSuggestionSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = (selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
            updateSuggestionSelection();
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            selectSuggestion(currentSuggestions[selectedSuggestionIndex]);
        }
    });

    // Masquer les suggestions quand on clique ailleurs
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            hideSuggestions();
        }
    });

    // Mettre à jour la sélection des suggestions
    function updateSuggestionSelection() {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        suggestions.forEach((suggestion, index) => {
            if (index === selectedSuggestionIndex) {
                suggestion.classList.add('selected');
                suggestion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                suggestion.classList.remove('selected');
            }
        });
    }

    // Recherche lors de la pression sur Entrée dans le champ de recherche
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && suggestionsContainer.classList.contains('show') === false) {
            searchMovies(searchInput.value.trim());
        }
    });
});