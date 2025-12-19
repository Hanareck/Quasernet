// RECHERCHE COUVERTURE

async function rechercherCouverture() {
    if (!state.formulaire.titre) return;
    state.rechercheCouverture = true;
    render();

    // Pour YouTube, utiliser extraireInfosYoutube() a la place
    if (state.formulaire.categorie === 'youtube') {
        await extraireInfosYoutube();
        state.rechercheCouverture = false;
        render();
        return;
    }

    var url = '';
    try {
        if (state.formulaire.categorie === 'livre') {
            var q = encodeURIComponent(state.formulaire.titre + ' ' + (state.formulaire.auteur || ''));
            var res = await fetch('https://openlibrary.org/search.json?q=' + q + '&limit=1');
            var data = await res.json();
            if (data.docs && data.docs[0] && data.docs[0].cover_i) {
                url = 'https://covers.openlibrary.org/b/id/' + data.docs[0].cover_i + '-L.jpg';
            }
        } else if (state.formulaire.categorie === 'film' || state.formulaire.categorie === 'autre') {
            var res = await fetch('https://www.omdbapi.com/?t=' + encodeURIComponent(state.formulaire.titre) + '&apikey=4a3b711b');
            var data = await res.json();
            if (data.Poster && data.Poster !== 'N/A') url = data.Poster;
        } else if (state.formulaire.categorie === 'musique') {
            var q = encodeURIComponent(state.formulaire.titre + ' ' + (state.formulaire.auteur || ''));
            var res = await fetch('https://itunes.apple.com/search?term=' + q + '&media=music&limit=1');
            var data = await res.json();
            if (data.results && data.results[0]) {
                url = data.results[0].artworkUrl100.replace('100x100', '600x600');
            }
        }
        if (url) { 
            state.formulaire.couverture = url; 
            afficherToast('Couverture trouvee !'); 
        } else {
            afficherToast('Pas de couverture trouvee');
        }
    } catch (e) { 
        afficherToast('Erreur de recherche'); 
    }
    state.rechercheCouverture = false;
    render();
}

// RECHERCHE OPEN LIBRARY
async function rechercherDansOpenLibrary() {
    var titre = (state.formulaire.titre || '').trim();
    var auteur = (state.formulaire.auteur || '').trim();

    if (!titre) {
        afficherToast('Veuillez renseigner le titre pour la recherche');
        return;
    }

    state.rechercheOpenLibrary = true;
    state.resultatsOpenLibrary = [];
    state.dropdownOpenLibraryVisible = true;
    render();

    try {
        var query = encodeURIComponent(titre + (auteur ? ' ' + auteur : ''));
        var url = 'https://openlibrary.org/search.json?q=' + query + '&fields=key,title,author_name,cover_i,first_publish_year&limit=10';

        var res = await fetch(url);
        var data = await res.json();

        if (data.docs && data.docs.length > 0) {
            state.resultatsOpenLibrary = data.docs.map(function(doc) {
                return {
                    title: doc.title || '',
                    author: doc.author_name ? doc.author_name.join(', ') : '',
                    year: doc.first_publish_year || '',
                    cover_url: doc.cover_i ? 'https://covers.openlibrary.org/b/id/' + doc.cover_i + '-M.jpg' : ''
                };
            });
            afficherToast(state.resultatsOpenLibrary.length + ' resultat(s) trouve(s)');
        } else {
            afficherToast('Aucun resultat trouve');
        }
    } catch (e) {
        console.error('Erreur recherche Open Library:', e);
        afficherToast('Erreur de recherche');
    }

    state.rechercheOpenLibrary = false;
    render();
}

window.rechercherDansOpenLibrary = rechercherDansOpenLibrary;

function selectionnerResultatOpenLibrary(index) {
    var result = state.resultatsOpenLibrary[index];
    if (!result) return;

    state.formulaire.titre = result.title;
    if (result.author && !state.formulaire.auteur) {
        state.formulaire.auteur = result.author;
    }
    if (result.cover_url) {
        state.formulaire.couverture = result.cover_url;
    }

    state.dropdownOpenLibraryVisible = false;
    state.resultatsOpenLibrary = [];

    afficherToast('Informations remplies !');
    render();
}

window.selectionnerResultatOpenLibrary = selectionnerResultatOpenLibrary;

function fermerDropdownOpenLibrary() {
    if (state.dropdownOpenLibraryVisible) {
        state.dropdownOpenLibraryVisible = false;
        state.resultatsOpenLibrary = [];
        render();
    }
}

window.fermerDropdownOpenLibrary = fermerDropdownOpenLibrary;

// RECHERCHE OMDB (Films/Series)
async function rechercherDansOMDB() {
    var titre = (state.formulaire.titre || '').trim();

    if (!titre) {
        afficherToast('Veuillez renseigner le titre pour la recherche');
        return;
    }

    state.rechercheOMDB = true;
    state.resultatsOMDB = [];
    state.dropdownOMDBVisible = true;
    render();

    try {
        var query = encodeURIComponent(titre);
        var url = 'https://www.omdbapi.com/?s=' + query + '&apikey=4a3b711b';

        var res = await fetch(url);
        var data = await res.json();

        if (data.Search && data.Search.length > 0) {
            state.resultatsOMDB = data.Search.slice(0, 10).map(function(item) {
                return {
                    title: item.Title || '',
                    author: item.Type ? (item.Type === 'movie' ? 'Film' : item.Type === 'series' ? 'Serie TV' : item.Type) : '',
                    year: item.Year || '',
                    cover_url: item.Poster && item.Poster !== 'N/A' ? item.Poster : ''
                };
            });
            afficherToast(state.resultatsOMDB.length + ' resultat(s) trouve(s)');
        } else {
            afficherToast('Aucun resultat trouve');
        }
    } catch (e) {
        console.error('Erreur recherche OMDB:', e);
        afficherToast('Erreur de recherche');
    }

    state.rechercheOMDB = false;
    render();
}

window.rechercherDansOMDB = rechercherDansOMDB;

function selectionnerResultatOMDB(index) {
    var result = state.resultatsOMDB[index];
    if (!result) return;

    state.formulaire.titre = result.title;
    if (result.cover_url) {
        state.formulaire.couverture = result.cover_url;
    }

    state.dropdownOMDBVisible = false;
    state.resultatsOMDB = [];

    afficherToast('Informations remplies !');
    render();
}

window.selectionnerResultatOMDB = selectionnerResultatOMDB;

function fermerDropdownOMDB() {
    if (state.dropdownOMDBVisible) {
        state.dropdownOMDBVisible = false;
        state.resultatsOMDB = [];
        render();
    }
}

window.fermerDropdownOMDB = fermerDropdownOMDB;

// RECHERCHE ITUNES (Musique)
async function rechercherDansItunes() {
    var titre = (state.formulaire.titre || '').trim();
    var auteur = (state.formulaire.auteur || '').trim();

    if (!titre) {
        afficherToast('Veuillez renseigner le titre pour la recherche');
        return;
    }

    state.rechercheItunes = true;
    state.resultatsItunes = [];
    state.dropdownItunesVisible = true;
    render();

    try {
        var query = encodeURIComponent(titre + (auteur ? ' ' + auteur : ''));
        var url = 'https://itunes.apple.com/search?term=' + query + '&media=music&limit=10';

        var res = await fetch(url);
        var data = await res.json();

        if (data.results && data.results.length > 0) {
            state.resultatsItunes = data.results.map(function(item) {
                return {
                    title: item.trackName || item.collectionName || '',
                    author: item.artistName || '',
                    year: item.releaseDate ? item.releaseDate.substring(0, 4) : '',
                    cover_url: item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '300x300') : ''
                };
            });
            afficherToast(state.resultatsItunes.length + ' resultat(s) trouve(s)');
        } else {
            afficherToast('Aucun resultat trouve');
        }
    } catch (e) {
        console.error('Erreur recherche iTunes:', e);
        afficherToast('Erreur de recherche');
    }

    state.rechercheItunes = false;
    render();
}

window.rechercherDansItunes = rechercherDansItunes;

function selectionnerResultatItunes(index) {
    var result = state.resultatsItunes[index];
    if (!result) return;

    state.formulaire.titre = result.title;
    if (result.author && !state.formulaire.auteur) {
        state.formulaire.auteur = result.author;
    }
    if (result.cover_url) {
        state.formulaire.couverture = result.cover_url;
    }

    state.dropdownItunesVisible = false;
    state.resultatsItunes = [];

    afficherToast('Informations remplies !');
    render();
}

window.selectionnerResultatItunes = selectionnerResultatItunes;

function fermerDropdownItunes() {
    if (state.dropdownItunesVisible) {
        state.dropdownItunesVisible = false;
        state.resultatsItunes = [];
        render();
    }
}

window.fermerDropdownItunes = fermerDropdownItunes;

// RECHERCHE YOUTUBE
async function rechercherDansYoutube() {
    var titre = (state.formulaire.titre || '').trim();

    if (!titre) {
        afficherToast('Veuillez renseigner le titre pour la recherche');
        return;
    }

    if (!YOUTUBE_API_KEY) {
        afficherToast('Veuillez configurer votre cle API YouTube dans config.js');
        return;
    }

    state.rechercheYoutube = true;
    state.resultatsYoutube = [];
    state.dropdownYoutubeVisible = true;
    render();

    try {
        var query = encodeURIComponent(titre);
        var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + query + '&type=video&key=' + YOUTUBE_API_KEY + '&maxResults=10';

        var res = await fetch(url);
        var data = await res.json();

        if (data.items && data.items.length > 0) {
            state.resultatsYoutube = data.items.map(function(item) {
                return {
                    title: item.snippet.title || '',
                    author: item.snippet.channelTitle || '',
                    year: item.snippet.publishedAt ? item.snippet.publishedAt.substring(0, 4) : '',
                    cover_url: item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : '',
                    video_id: item.id.videoId || ''
                };
            });
            afficherToast(state.resultatsYoutube.length + ' resultat(s) trouve(s)');
        } else {
            afficherToast('Aucun resultat trouve');
        }
    } catch (e) {
        console.error('Erreur recherche YouTube:', e);
        afficherToast('Erreur de recherche YouTube');
    }

    state.rechercheYoutube = false;
    render();
}

window.rechercherDansYoutube = rechercherDansYoutube;

function selectionnerResultatYoutube(index) {
    var result = state.resultatsYoutube[index];
    if (!result) return;

    state.formulaire.titre = result.title;
    if (result.author && !state.formulaire.auteur) {
        state.formulaire.auteur = result.author;
    }
    if (result.cover_url) {
        state.formulaire.couverture = result.cover_url;
    }
    if (result.video_id) {
        state.formulaire.lienYoutube = 'https://www.youtube.com/watch?v=' + result.video_id;
    }

    state.dropdownYoutubeVisible = false;
    state.resultatsYoutube = [];

    afficherToast('Informations remplies !');
    render();
}

window.selectionnerResultatYoutube = selectionnerResultatYoutube;

function fermerDropdownYoutube() {
    if (state.dropdownYoutubeVisible) {
        state.dropdownYoutubeVisible = false;
        state.resultatsYoutube = [];
        render();
    }
}

window.fermerDropdownYoutube = fermerDropdownYoutube;
