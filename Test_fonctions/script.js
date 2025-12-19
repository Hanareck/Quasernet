document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const suggestionsContainer = document.getElementById('suggestions');
    const resultsContainer = document.getElementById('results');

    // Variables globales
    let debounceTimer;
    let currentSuggestions = [];
    let selectedSuggestionIndex = -1;

    // Fonction pour rechercher des suggestions
    async function fetchSuggestions(query) {
        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            
            if (data.docs && data.docs.length > 0) {
                currentSuggestions = data.docs;
                displaySuggestions(data.docs);
            } else {
                hideSuggestions();
            }
        } catch (error) {
            console.error('Erreur lors de la recherche de suggestions:', error);
            hideSuggestions();
        }
    }

    // Fonction pour afficher les suggestions
    function displaySuggestions(books) {
        suggestionsContainer.innerHTML = '';
        
        books.forEach((book, index) => {
            const suggestion = document.createElement('div');
            suggestion.className = 'suggestion-item';
            suggestion.dataset.index = index;
            
            const title = book.title || 'Titre inconnu';
            const author = book.author_name ? book.author_name[0] : 'Auteur inconnu';
            
            suggestion.innerHTML = `
                <div class="suggestion-title">${highlightMatch(title, searchInput.value)}</div>
                <div class="suggestion-author">${author}</div>
            `;
            
            suggestion.addEventListener('click', () => selectSuggestion(book));
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
    function selectSuggestion(book) {
        hideSuggestions();
        searchInput.value = book.title || '';
        searchBooks(book.title || '');
    }

    // Fonction pour rechercher des livres
    async function searchBooks(query) {
        if (query.trim() === '') {
            return;
        }

        showLoading();

        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`);
            const data = await response.json();
            
            if (data.docs && data.docs.length > 0) {
                displayResults(data.docs);
            } else {
                showEmptyResults();
            }
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
            showError();
        }
    }

    // Fonction pour afficher les résultats
    function displayResults(books) {
        resultsContainer.innerHTML = '';
        
        books.forEach(book => {
            const bookCard = createBookCard(book);
            resultsContainer.appendChild(bookCard);
        });
    }

    // Fonction pour créer une carte de livre
    function createBookCard(book) {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        const title = book.title || 'Titre inconnu';
        const author = book.author_name ? book.author_name.join(', ') : 'Auteur inconnu';
        const key = book.key || '';
        
        // Génération de l'URL de la couverture
        let coverUrl = '';
        if (book.cover_i) {
            coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
        } else if (book.cover_edition_key) {
            coverUrl = `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`;
        }

        bookCard.innerHTML = `
            <div class="book-cover-container">
                ${coverUrl ? `<img src="${coverUrl}" alt="Couverture de ${title}" class="book-cover">` : ''}
            </div>
            <div class="book-info">
                <h3 class="book-title">${title}</h3>
                <p class="book-author">${author}</p>
                <div class="book-actions">
                    <button class="btn btn-primary" onclick="window.open('https://openlibrary.org${key}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Voir
                    </button>
                    <button class="btn btn-secondary" onclick="copyBookInfo('${title}', '${author}', '${coverUrl}')">
                        <i class="fas fa-copy"></i> Copier
                    </button>
                </div>
            </div>
        `;
        
        return bookCard;
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
                <i class="fas fa-book-open"></i>
                <p>Aucun livre trouvé pour cette recherche.</p>
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

    // Fonction pour copier les informations du livre
    window.copyBookInfo = function(title, author, coverUrl) {
        const bookInfo = {
            title: title,
            author: author,
            coverUrl: coverUrl
        };
        
        navigator.clipboard.writeText(JSON.stringify(bookInfo, null, 2))
            .then(() => {
                alert('Informations du livre copiées dans le presse-papiers !');
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
            fetchSuggestions(e.target.value);
        }, 300);
    });

    searchInput.addEventListener('focus', function() {
        if (searchInput.value.length >= 2) {
            fetchSuggestions(searchInput.value);
        }
    });

    searchButton.addEventListener('click', function() {
        searchBooks(searchInput.value.trim());
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
            searchBooks(searchInput.value.trim());
        }
    });
});