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
