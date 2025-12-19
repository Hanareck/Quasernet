// CONFIGURATION

var CATEGORIES = {
    livre: { nom: 'Livres', icone: '📚', genres: ['Roman', 'Science-Fiction', 'Fantasy', 'Policier', 'Thriller', 'Biographie', 'Histoire', 'Philosophie', 'Science', 'Poesie', 'BD/Manga', 'Dev. perso', 'Autre'] },
    film: { nom: 'Films', icone: '🎬', genres: ['Action', 'Comedie', 'Drame', 'SF', 'Horreur', 'Thriller', 'Animation', 'Documentaire', 'Romance', 'Aventure', 'Fantastique', 'Autre'] },
    musique: { nom: 'Musique', icone: '🎵', genres: ['Pop', 'Rock', 'Jazz', 'Classique', 'Electro', 'Hip-Hop', 'R&B', 'Metal', 'Folk', 'Indie', 'World','Variete francaise', 'Autre'] },
    youtube: { nom: 'YouTube', icone: '📺', genres: ['Tutoriel', 'Documentaire', 'Gaming', 'Musique', 'Vlog', 'Science', 'Tech', 'Cuisine', 'Sport', 'Politique', 'Divertissement', 'Autre'] },
    actualite: { nom: 'Actus', icone: '📰', genres: ['Politique', 'Economie', 'Science', 'Tech', 'Culture', 'Sport', 'Environnement', 'Societe', 'International', 'Autre'] },
    lieu: { nom: 'Lieux & Activites', icone: '📍', genres: ['Restaurant', 'Bar/Cafe', 'Musee', 'Parc', 'Monument', 'Randonnee', 'Sport', 'Spa/Bien-etre', 'Shopping', 'Spectacle', 'Festival', 'Voyage','Librairie', 'Autre'] },
    autre: { nom: 'Autres', icone: '✨', genres: ['Podcast', 'Serie TV', 'Jeu video', 'Exposition', 'Spectacle', 'Conference', 'Autre'] }
};

var STATUTS_LECTURE = ['Decouvert', 'En cours de decouverte', 'A decouvrir', 'A redecouvrir'];
var STATUTS_LECTURE_LABELS = {
    'Decouvert': 'Découvert',
    'En cours de decouverte': 'En cours de découverte',
    'A decouvrir': 'À découvrir',
    'A redecouvrir': 'À redécouvrir'
};
var STATUTS_POSSESSION = ['Possedé', ' A acheter', 'A vendre', 'Vendu', 'Emprunté', 'Streaming'];

// GLOBALS

window.handleAuthSubmit = function(e) { 
    e.preventDefault(); 
    var email = document.getElementById('auth-email').value; 
    var pwd = document.getElementById('auth-password').value; 
    if (state.authMode === 'login') {
        connexion(email, pwd);
    } else {
        var pseudo = document.getElementById('auth-pseudo').value;
        inscription(email, pwd, pseudo);
    }
};

window.toggleAuthMode = function() { 
    state.authMode = state.authMode === 'login' ? 'register' : 'login'; 
    state.authError = null; 
    render(); 
};

window.togglePasswordVisibility = function() {
    var input = document.getElementById('auth-password');
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
};

window.toggleTheme = toggleTheme;
window.deconnexion = deconnexion;
window.rechercherCouverture = rechercherCouverture;
window.supprimerEntree = supprimerEntree;

// FONCTIONS YOUTUBE

function extraireIdYoutube(url) {
    if (!url) return null;

    // Formats supportes :
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID
    // https://www.youtube.com/embed/VIDEO_ID

    var regexLong = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    var match = url.match(regexLong);

    return match ? match[1] : null;
}

window.extraireIdYoutube = extraireIdYoutube;

async function extraireInfosYoutube() {
    var lien = state.formulaire.lienYoutube;
    if (!lien) return;

    var videoId = extraireIdYoutube(lien);
    if (!videoId) {
        afficherToast('Lien YouTube invalide');
        return;
    }

    // Miniature haute resolution
    state.formulaire.couverture = 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg';

    // Recuperer le titre via l'API oEmbed de YouTube (pas besoin de cle API)
    try {
        var res = await fetch('https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + videoId + '&format=json');
        var data = await res.json();

        if (data.title && !state.formulaire.titre) {
            state.formulaire.titre = data.title;
        }
        if (data.author_name && !state.formulaire.auteur) {
            state.formulaire.auteur = data.author_name;
        }

        afficherToast('Informations recuperees !');
    } catch (e) {
        // Si l'API echoue, on garde au moins la miniature
        afficherToast('Miniature recuperee');
    }

    render();
}

window.extraireInfosYoutube = extraireInfosYoutube;

window.ouvrirAjout = function() {
    state.formulaire = {
        titre:'', auteur:'',
        categorie: state.categorieActive !== 'tous' ? state.categorieActive : 'livre',
        genre:'',
        dateDecouverte: new Date().toISOString().split('T')[0],
        dateDebutLecture: '',
        note: 0, critique:'', couverture:'',
        statutLecture:'Decouvert',
        statutPossession: [],
        dateRetour: '',
        prive: true,
        lienYoutube: '',
        typeMusique: 'album',
        lienSpotify: '',
        lienDeezer: '',
        lienQobuz: '',
        tags: [],
        ordre: 0
    };
    state.modeEdition = false;
    state.entreeSelectionnee = null;
    state.modeAjoutRapide = false;
    state.vueSource = null;
    state.entreesAjouteesRapide = [];
    state.vue = 'formulaire';
    render();
};

window.ouvrirAjoutRapideDecouvrir = function() {
    state.formulaire = {
        titre:'', auteur:'',
        categorie: 'livre',
        genre:'',
        dateDecouverte: '',
        dateDebutLecture: '',
        note: 0, critique:'', couverture:'',
        statutLecture:'A decouvrir',
        statutPossession: [],
        dateRetour: '',
        prive: true,
        lienYoutube: '',
        typeMusique: 'album',
        lienSpotify: '',
        lienDeezer: '',
        lienQobuz: '',
        tags: [],
        ordre: 0
    };
    state.modeEdition = false;
    state.entreeSelectionnee = null;
    state.modeAjoutRapide = true;
    state.vueSource = 'pile';
    state.entreesAjouteesRapide = [];
    state.vue = 'formulaire';
    render();
};

window.terminerAjoutRapide = function() {
    state.modeAjoutRapide = false;
    state.entreesAjouteesRapide = [];
    state.vue = 'pile';
    state.vueSource = null;
    render();
};

window.ouvrirModification = function(id) {
    var e = state.entrees.find(function(x) { return x.id === id; });
    if (e) {
        var statutPossession = Array.isArray(e.statutPossession)
            ? e.statutPossession
            : (e.statutPossession ? [e.statutPossession] : []);

        var tags = Array.isArray(e.tags) ? e.tags : [];

        state.formulaire = Object.assign({}, e, {
            dateRetour: e.dateRetour || '',
            statutPossession: statutPossession,
            prive: e.prive || false,
            tags: tags
        });
        state.entreeSelectionnee = e;
        state.modeEdition = true;
        state.vue = 'formulaire';
        render();
    }
};

window.fermerFormulaire = function() {
    state.vue = 'liste';
    state.vueSource = null;
    state.modeEdition = false;
    state.modeAjoutRapide = false;
    state.entreesAjouteesRapide = [];
    render();
};
window.retourListe = function() {
    state.entreeSelectionnee = null;
    state.catalogueAmi = null;
    state.entreeAmiSelectionnee = null;
    state.modeAjoutRapide = false;
    state.entreesAjouteesRapide = [];

    // Retourner a la vue source si elle existe, sinon liste par defaut
    if (state.vueSource) {
        state.vue = state.vueSource;
        state.vueSource = null;
    } else {
        state.vue = 'liste';
    }

    render();
};

window.setCategorie = function(c) {
    state.categorieActive = c;
    state.filtreGenre = 'tous';
    state.vue = 'liste';
    state.vueSource = null;
    state.entreeSelectionnee = null;
    render();
};

window.toggleCategoriesDropdown = function() {
    var menu = document.getElementById('categories-menu');
    var btn = document.getElementById('categories-btn');
    if (!menu || !btn) return;

    var isOpen = menu.classList.contains('open');
    if (isOpen) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    } else {
        // Calculer la position du bouton
        var rect = btn.getBoundingClientRect();
        menu.style.top = (rect.bottom + 8) + 'px';
        menu.style.left = rect.left + 'px';

        menu.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
    }
};

window.selectCategorie = function(c) {
    var menu = document.getElementById('categories-menu');
    var btn = document.getElementById('categories-btn');
    if (menu) menu.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');

    state.categorieActive = c;
    state.filtreGenre = 'tous';
    state.vue = 'liste';
    state.vueSource = null;
    state.entreeSelectionnee = null;
    render();
};

// Fermer le dropdown en cliquant en dehors
document.addEventListener('click', function(e) {
    var menu = document.getElementById('categories-menu');
    var btn = document.getElementById('categories-btn');
    if (!menu || !btn) return;

    if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    }
});

// Fermer les dropdowns de recherche quand on clique en dehors
document.addEventListener('click', function(e) {
    var titleInput = document.getElementById('form-titre-input');
    var auteurInput = document.getElementById('form-auteur-input');

    // Fermer dropdown Open Library
    if (state.dropdownOpenLibraryVisible) {
        var clickedInsideOL = e.target.closest('.openlibrary-dropdown') ||
                             e.target.closest('.openlibrary-dropdown-empty') ||
                             (titleInput && titleInput.contains(e.target)) ||
                             (auteurInput && auteurInput.contains(e.target)) ||
                             (e.target.title && e.target.title.indexOf('Open Library') !== -1);
        if (!clickedInsideOL) {
            fermerDropdownOpenLibrary();
        }
    }

    // Fermer dropdown OMDB
    if (state.dropdownOMDBVisible) {
        var clickedInsideOMDB = e.target.closest('.openlibrary-dropdown') ||
                               e.target.closest('.openlibrary-dropdown-empty') ||
                               (titleInput && titleInput.contains(e.target)) ||
                               (e.target.title && e.target.title.indexOf('OMDB') !== -1);
        if (!clickedInsideOMDB) {
            fermerDropdownOMDB();
        }
    }

    // Fermer dropdown iTunes
    if (state.dropdownItunesVisible) {
        var clickedInsideItunes = e.target.closest('.openlibrary-dropdown') ||
                                 e.target.closest('.openlibrary-dropdown-empty') ||
                                 (titleInput && titleInput.contains(e.target)) ||
                                 (auteurInput && auteurInput.contains(e.target)) ||
                                 (e.target.title && e.target.title.indexOf('iTunes') !== -1);
        if (!clickedInsideItunes) {
            fermerDropdownItunes();
        }
    }

    // Fermer dropdown YouTube
    if (state.dropdownYoutubeVisible) {
        var clickedInsideYoutube = e.target.closest('.openlibrary-dropdown') ||
                                  e.target.closest('.openlibrary-dropdown-empty') ||
                                  (titleInput && titleInput.contains(e.target)) ||
                                  (e.target.title && e.target.title.indexOf('YouTube') !== -1);
        if (!clickedInsideYoutube) {
            fermerDropdownYoutube();
        }
    }
});

window.setVue = function(v) {
    state.vue = v;
    state.vueSource = null;
    // Si on ouvre la vue social, initialiser et charger les donnees
    if (v === 'social') {
        if (!state.vueSociale) state.vueSociale = 'fil';
        // Charger le fil si pas encore charge
        if (state.vueSociale === 'fil' && !state.fil.length) {
            chargerFil();
            return; // chargerFil() appellera render()
        }
        // Charger les notifications si sur cet onglet et pas encore charge
        if (state.vueSociale === 'notifications' && !state.notifications.length) {
            chargerNotifications();
            return; // chargerNotifications() appellera render()
        }
    }
    render();
};

window.setRecherche = function(v) {
    state.recherche = v;
    clearTimeout(window._rt);
    window._rt = setTimeout(function() {
        render();
        var i = document.querySelector('.recherche-input');
        if (i) { i.focus(); i.setSelectionRange(v.length, v.length); }
    }, 300);
};

window.setRechercheTag = function(v) {
    state.rechercheTag = v;
    clearTimeout(window._rtt);
    window._rtt = setTimeout(function() {
        render();
        var i = document.querySelector('.recherche-tag-input');
        if (i) { i.focus(); i.setSelectionRange(v.length, v.length); }
    }, 300);
};

window.setRechercheTagExport = function(v) {
    state.rechercheTagExport = v;
    clearTimeout(window._rtte);
    window._rtte = setTimeout(function() {
        render();
        var i = document.querySelector('.recherche-tag-export-input');
        if (i) { i.focus(); i.setSelectionRange(v.length, v.length); }
    }, 300);
};

window.setTri = function(v) { state.tri = v; render(); };
window.setModeAffichage = function(m) { state.modeAffichage = m; localStorage.setItem('journal-mode-affichage', m); render(); };

// Toggle panneau de filtres
window.togglePanneauFiltres = function() {
    state.panneauFiltresOuvert = !state.panneauFiltresOuvert;
    render();
};

// Filtres multi-selection
window.toggleFiltreNote = function(note) {
    var index = state.filtreNotes.indexOf(note);
    if (index > -1) {
        state.filtreNotes.splice(index, 1);
    } else {
        state.filtreNotes.push(note);
    }
    render();
};

window.toggleFiltreGenre = function(genre) {
    var index = state.filtreGenres.indexOf(genre);
    if (index > -1) {
        state.filtreGenres.splice(index, 1);
    } else {
        state.filtreGenres.push(genre);
    }
    render();
};

window.toggleFiltreStatutLecture = function(statut) {
    var index = state.filtreStatutsLecture.indexOf(statut);
    if (index > -1) {
        state.filtreStatutsLecture.splice(index, 1);
    } else {
        state.filtreStatutsLecture.push(statut);
    }
    render();
};

window.toggleFiltreStatutPossession = function(statut) {
    var index = state.filtreStatutsPossession.indexOf(statut);
    if (index > -1) {
        state.filtreStatutsPossession.splice(index, 1);
    } else {
        state.filtreStatutsPossession.push(statut);
    }
    render();
};

// Reinitialiser tous les filtres
window.reinitialiserFiltres = function() {
    state.filtreNotes = [];
    state.filtreGenres = [];
    state.filtreTags = [];
    state.filtreStatutsLecture = [];
    state.filtreStatutsPossession = [];
    render();
};

// Retirer un filtre specifique
window.retirerFiltre = function(type, valeur) {
    if (type === 'note') {
        var index = state.filtreNotes.indexOf(valeur);
        if (index > -1) state.filtreNotes.splice(index, 1);
    } else if (type === 'genre') {
        var index = state.filtreGenres.indexOf(valeur);
        if (index > -1) state.filtreGenres.splice(index, 1);
    } else if (type === 'statutLecture') {
        var index = state.filtreStatutsLecture.indexOf(valeur);
        if (index > -1) state.filtreStatutsLecture.splice(index, 1);
    } else if (type === 'statutPossession') {
        var index = state.filtreStatutsPossession.indexOf(valeur);
        if (index > -1) state.filtreStatutsPossession.splice(index, 1);
    } else if (type === 'tag') {
        var index = state.filtreTags.indexOf(valeur);
        if (index > -1) state.filtreTags.splice(index, 1);
    }
    render();
};

window.toggleFiltreTag = function(tag) {
    if (!Array.isArray(state.filtreTags)) {
        state.filtreTags = [];
    }

    var index = state.filtreTags.indexOf(tag);

    if (index > -1) {
        state.filtreTags.splice(index, 1);
    } else {
        state.filtreTags.push(tag);
    }

    render();
};

// Toggle mode ET/OU pour les tags
window.toggleFiltreTagsMode = function() {
    state.filtreTagsMode = state.filtreTagsMode === 'ET' ? 'OU' : 'ET';
    render();
};

// Pagination des tags
window.voirPlusTags = function() {
    state.tagsPage++;
    render();
};

window.resetTagsPage = function() {
    state.tagsPage = 0;
    render();
};

window.resetFiltreTags = function() {
    state.filtreTags = [];
    state.rechercheTag = '';
    render();
};

window.updateForm = function(k, v) { state.formulaire[k] = v; };
window.setNote = function(n) { state.formulaire.note = n; render(); };
window.voirDetail = function(id) {
    state.entreeSelectionnee = state.entrees.find(function(e) { return e.id === id; });
    // Capturer la vue actuelle avant de passer en detail
    state.vueSource = state.vue;
    state.vue = 'detail';
    render();
};

window.setStatutLecture = function(s) {
    var ancienStatut = state.formulaire.statutLecture;
    state.formulaire.statutLecture = s;

    if (s === 'A decouvrir') {
        state.formulaire.note = 0;
        state.formulaire.dateDecouverte = '';
        state.formulaire.dateDebutLecture = '';
    } else if (s === 'En cours de decouverte') {
        // Si on passe de "A decouvrir" a "En cours", mettre la date de debut automatiquement
        if (ancienStatut === 'A decouvrir' && !state.formulaire.dateDebutLecture) {
            state.formulaire.dateDebutLecture = new Date().toISOString().split('T')[0];
        }
    } else if (!state.formulaire.dateDecouverte && (s === 'Decouvert' || s === 'A redecouvrir')) {
        state.formulaire.dateDecouverte = new Date().toISOString().split('T')[0];
    }
    render();
};

window.setStatutPossession = function(s) {
    if (!Array.isArray(state.formulaire.statutPossession)) {
        state.formulaire.statutPossession = [];
    }

    var index = state.formulaire.statutPossession.indexOf(s);

    if (index > -1) {
        state.formulaire.statutPossession.splice(index, 1);
        if (s === 'Emprunte') {
            state.formulaire.dateRetour = '';
        }
    } else {
        state.formulaire.statutPossession.push(s);
    }

    if (state.formulaire.statutPossession.indexOf('Emprunte') === -1) {
        state.formulaire.dateRetour = '';
    }

    render();
};

window.toggleGenre = function(genre) {
    if (!Array.isArray(state.formulaire.genres)) {
        state.formulaire.genres = state.formulaire.genre ? [state.formulaire.genre] : [];
    }

    var index = state.formulaire.genres.indexOf(genre);

    if (index > -1) {
        state.formulaire.genres.splice(index, 1);
    } else {
        state.formulaire.genres.push(genre);
    }

    render();
};

window.togglePrive = function() {
    state.formulaire.prive = !state.formulaire.prive;
    render();
};

window.togglePriveEntree = function(entreeId) {
    var entree = state.entrees.find(function(e) { return e.id === entreeId; });
    if (!entree) return;

    entree.prive = !entree.prive;
    state.syncing = true;
    render();

    sauvegarderEntree(entree).then(function() {
        state.syncing = false;
        if (state.entreeSelectionnee && state.entreeSelectionnee.id === entreeId) {
            state.entreeSelectionnee = entree;
        }
        afficherToast(entree.prive ? 'Marque comme prive' : 'Marque comme public');
        render();
    }).catch(function(error) {
        console.error('Erreur sauvegarde:', error);
        entree.prive = !entree.prive;
        state.syncing = false;
        afficherToast('Erreur de sauvegarde');
        render();
    });
};

window.setNoteDetail = function(entreeId, nouvelleNote) {
    var entree = state.entrees.find(function(e) { return e.id === entreeId; });
    if (!entree) return;

    var ancienneNote = entree.note;
    entree.note = nouvelleNote;
    state.syncing = true;
    render();

    sauvegarderEntree(entree).then(function() {
        state.syncing = false;
        if (state.entreeSelectionnee && state.entreeSelectionnee.id === entreeId) {
            state.entreeSelectionnee = entree;
        }
        afficherToast('Note mise a jour');
        render();
    }).catch(function(error) {
        console.error('Erreur sauvegarde:', error);
        entree.note = ancienneNote;
        state.syncing = false;
        afficherToast('Erreur de sauvegarde');
        render();
    });
};

window.toggleModeAjoutRapide = function() {
    state.modeAjoutRapide = !state.modeAjoutRapide;
    render();
};

window.toggleModeSelection = function() {
    state.modeSelection = !state.modeSelection;
    if (!state.modeSelection) {
        state.entreesSelectionnees = [];
    }
    render();
};

window.toggleSelectionEntree = function(entreeId) {
    var index = state.entreesSelectionnees.indexOf(entreeId);
    if (index > -1) {
        state.entreesSelectionnees.splice(index, 1);
    } else {
        state.entreesSelectionnees.push(entreeId);
    }
    render();
};

window.retirerDeLaSelection = function(entreeId) {
    var index = state.entreesSelectionnees.indexOf(entreeId);
    if (index > -1) {
        state.entreesSelectionnees.splice(index, 1);
    }
    render();
};

window.selectionnerTout = function() {
    var entreesVisibles = getEntreesFiltrees();
    state.entreesSelectionnees = entreesVisibles.map(function(e) { return e.id; });
    render();
};

window.deselectionnerTout = function() {
    state.entreesSelectionnees = [];
    render();
};

window.appliquerTagsSelection = function(tagsAjoutes) {
    if (state.entreesSelectionnees.length === 0) {
        afficherToast('Aucune entree selectionnee');
        return;
    }

    var promises = state.entreesSelectionnees.map(function(id) {
        var entree = state.entrees.find(function(e) { return e.id === id; });
        if (!entree) return Promise.resolve();

        var tagsExistants = Array.isArray(entree.tags) ? entree.tags : [];
        tagsAjoutes.forEach(function(tag) {
            if (tagsExistants.indexOf(tag) === -1) {
                tagsExistants.push(tag);
            }
        });
        entree.tags = tagsExistants;

        return sauvegarderEntree(entree);
    });

    state.syncing = true;
    render();

    Promise.all(promises).then(function() {
        state.syncing = false;
        afficherToast(state.entreesSelectionnees.length + ' entree(s) mise(s) a jour');
        state.entreesSelectionnees = [];
        state.modeSelection = false;
        render();
    }).catch(function(error) {
        console.error('Erreur batch:', error);
        state.syncing = false;
        afficherToast('Erreur lors de la mise a jour');
        render();
    });
};

window.ouvrirDialogueTagsSelection = function() {
    var tags = prompt('Entrez les tags a ajouter (separes par des virgules) :');
    if (!tags) return;

    var tagsArray = tags.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t; });
    if (tagsArray.length === 0) return;

    appliquerTagsSelection(tagsArray);
};

// Changer le statut de lecture en masse
window.ouvrirMenuStatutSelection = function() {
    var message = 'Choisissez le nouveau statut de lecture :\n\n';
    STATUTS_LECTURE.forEach(function(s, i) {
        message += (i + 1) + '. ' + s + '\n';
    });
    var choix = prompt(message);
    if (!choix) return;

    var index = parseInt(choix) - 1;
    if (index >= 0 && index < STATUTS_LECTURE.length) {
        appliquerStatutSelection(STATUTS_LECTURE[index]);
    }
};

// Modifier le statut de possession en masse
window.ouvrirMenuPossessionSelection = function() {
    var message = 'Choisissez le statut de possession a ajouter/retirer :\n\n';
    STATUTS_POSSESSION.forEach(function(s, i) {
        message += (i + 1) + '. ' + s + '\n';
    });
    var choix = prompt(message);
    if (!choix) return;

    var index = parseInt(choix) - 1;
    if (index >= 0 && index < STATUTS_POSSESSION.length) {
        appliquerPossessionSelection(STATUTS_POSSESSION[index]);
    }
};

// Appliquer un statut de lecture en masse
window.appliquerStatutSelection = function(statut) {
    if (state.entreesSelectionnees.length === 0) {
        afficherToast('Aucune entree selectionnee');
        return;
    }

    var promises = state.entreesSelectionnees.map(function(id) {
        var entree = state.entrees.find(function(e) { return e.id === id; });
        if (!entree) return Promise.resolve();
        entree.statutLecture = statut;
        return sauvegarderEntree(entree);
    });

    state.syncing = true;
    render();

    Promise.all(promises).then(function() {
        state.syncing = false;
        afficherToast(state.entreesSelectionnees.length + ' entree(s) mise(s) a jour');
        state.entreesSelectionnees = [];
        state.modeSelection = false;
        render();
    }).catch(function(error) {
        console.error('Erreur batch:', error);
        state.syncing = false;
        afficherToast('Erreur lors de la mise a jour');
        render();
    });
};

// Appliquer un statut de possession en masse (toggle)
window.appliquerPossessionSelection = function(statut) {
    if (state.entreesSelectionnees.length === 0) {
        afficherToast('Aucune entree selectionnee');
        return;
    }

    var promises = state.entreesSelectionnees.map(function(id) {
        var entree = state.entrees.find(function(e) { return e.id === id; });
        if (!entree) return Promise.resolve();

        var statutsPossession = Array.isArray(entree.statutPossession)
            ? entree.statutPossession
            : (entree.statutPossession ? [entree.statutPossession] : []);

        var index = statutsPossession.indexOf(statut);
        if (index > -1) {
            statutsPossession.splice(index, 1);
        } else {
            statutsPossession.push(statut);
        }

        entree.statutPossession = statutsPossession;
        return sauvegarderEntree(entree);
    });

    state.syncing = true;
    render();

    Promise.all(promises).then(function() {
        state.syncing = false;
        afficherToast(state.entreesSelectionnees.length + ' entree(s) mise(s) a jour');
        state.entreesSelectionnees = [];
        state.modeSelection = false;
        render();
    }).catch(function(error) {
        console.error('Erreur batch:', error);
        state.syncing = false;
        afficherToast('Erreur lors de la mise a jour');
        render();
    });
};

// Supprimer les entrees selectionnees
window.supprimerSelection = function() {
    if (state.entreesSelectionnees.length === 0) {
        afficherToast('Aucune entree selectionnee');
        return;
    }

    if (!confirm('Voulez-vous vraiment supprimer ' + state.entreesSelectionnees.length + ' entree(s) ? Cette action est irreversible.')) {
        return;
    }

    var promises = state.entreesSelectionnees.map(function(id) {
        return supprimerEntree(id);
    });

    state.syncing = true;
    render();

    Promise.all(promises).then(function() {
        state.syncing = false;
        afficherToast(state.entreesSelectionnees.length + ' entree(s) supprimee(s)');
        state.entreesSelectionnees = [];
        state.modeSelection = false;
        render();
    }).catch(function(error) {
        console.error('Erreur suppression:', error);
        state.syncing = false;
        afficherToast('Erreur lors de la suppression');
        render();
    });
};

window.toggleTag = function(tag) {
    if (!Array.isArray(state.formulaire.tags)) {
        state.formulaire.tags = [];
    }

    var index = state.formulaire.tags.indexOf(tag);

    if (index > -1) {
        state.formulaire.tags.splice(index, 1);
    } else {
        state.formulaire.tags.push(tag);
    }

    render();
};

window.ajouterNouveauTag = function() {
    var input = document.getElementById('nouveau-tag-input');
    if (!input) return;

    var valeur = input.value.trim();
    if (!valeur) return;

    if (!Array.isArray(state.formulaire.tags)) {
        state.formulaire.tags = [];
    }

    var tags = valeur.split(',').map(function(t) { return t.trim(); }).filter(function(t) { return t; });

    tags.forEach(function(tag) {
        if (state.formulaire.tags.indexOf(tag) === -1) {
            state.formulaire.tags.push(tag);
        }
    });

    input.value = '';
    render();
};

window.retirerTag = function(tag) {
    if (!Array.isArray(state.formulaire.tags)) return;

    var index = state.formulaire.tags.indexOf(tag);
    if (index > -1) {
        state.formulaire.tags.splice(index, 1);
    }

    render();
};

window.confirmerAjoutMalgreDoublons = function() {
    var entree = state.modalDoublons ? state.modalDoublons.entree : null;
    state.modalDoublons = null;

    if (state.modeImport && state.importResolve) {
        state.importResolve(true);
        state.importResolve = null;
        state.importReject = null;
    } else {
        render();
        soumettreFormulaire(true);
    }
};

window.annulerAjoutDoublon = function() {
    state.modalDoublons = null;

    if (state.modeImport && state.importReject) {
        state.importReject(false);
        state.importResolve = null;
        state.importReject = null;
    } else {
        render();
    }
};

window.soumettreFormulaire = async function(ignorerDoublons) {
    if (!state.formulaire.titre.trim()) { afficherToast('Titre requis'); return; }

    var entree = Object.assign({}, state.formulaire, {
        dateCreation: state.modeEdition && state.entreeSelectionnee ? state.entreeSelectionnee.dateCreation : new Date().toISOString()
    });

    if (state.modeEdition && state.entreeSelectionnee) entree.id = state.entreeSelectionnee.id;

    // Vérifier les doublons (seulement pour les nouveaux ajouts ou si pas déjà ignoré)
    if (!ignorerDoublons && !state.modeEdition) {
        var doublons = detecterDoublons(entree);
        var totalDoublons = doublons.exacts.length + doublons.probables.length + doublons.possibles.length;

        if (totalDoublons > 0) {
            state.modalDoublons = {
                entree: entree,
                doublons: doublons
            };
            render();
            return;
        }
    }

    // Si c'est un nouvel ajout "A decouvrir", calculer l'ordre pour qu'il aille en bas de la liste
    if (!state.modeEdition && entree.statutLecture === 'A decouvrir') {
        var maxOrdre = 0;
        state.entrees.forEach(function(e) {
            if (e.statutLecture === 'A decouvrir' && e.categorie === entree.categorie) {
                var ordre = (e.ordre !== undefined && e.ordre !== null) ? e.ordre : 0;
                if (ordre > maxOrdre) maxOrdre = ordre;
            }
        });
        entree.ordre = maxOrdre + 1;
    }

    await sauvegarderEntree(entree);

    // MODE RAPIDE : comportement different selon la source
    if (state.modeAjoutRapide && !state.modeEdition) {
        // Si on vient de la pile, ajouter au recap et continuer
        if (state.vueSource === 'pile') {
            // Ajouter l'entree au recap des ajouts rapides
            state.entreesAjouteesRapide.push({
                id: entree.id,
                titre: entree.titre,
                auteur: entree.auteur,
                categorie: entree.categorie,
                couverture: entree.couverture
            });

            // Reinitialiser le formulaire mais garder le mode
            var categoriePreservee = state.formulaire.categorie;
            state.formulaire = {
                titre:'', auteur:'',
                categorie: categoriePreservee,
                genre:'',
                dateDecouverte: '',
                dateDebutLecture: '',
                note: 0, critique:'', couverture:'',
                statutLecture:'A decouvrir',
                statutPossession: [],
                dateRetour: '',
                prive: true,
                lienYoutube: '',
                typeMusique: 'album',
                lienSpotify: '',
                lienDeezer: '',
                lienQobuz: '',
                tags: [],
                ordre: 0
            };
            state.modeEdition = false;
            state.entreeSelectionnee = null;
            // Reste en vue formulaire
            render();
            setTimeout(function() {
                var input = document.getElementById('form-titre-input');
                if (input) input.focus();
            }, 100);
        } else {
            // Sinon, rester dans le formulaire (ancien comportement)
            var categoriePreservee = state.formulaire.categorie;
            state.formulaire = {
                titre:'', auteur:'',
                categorie: categoriePreservee,
                genre:'',
                dateDecouverte: new Date().toISOString().split('T')[0],
                dateDebutLecture: '',
                note: 0, critique:'', couverture:'',
                statutLecture:'Decouvert',
                statutPossession: [],
                dateRetour: '',
                prive: true,
                lienYoutube: '',
                typeMusique: 'album',
                lienSpotify: '',
                lienDeezer: '',
                lienQobuz: '',
                tags: [],
                ordre: 0
            };
            state.modeEdition = false;
            state.entreeSelectionnee = null;
            // Reste en vue formulaire
            render();
            setTimeout(function() {
                var input = document.getElementById('form-titre-input');
                if (input) input.focus();
            }, 100);
        }
    } else {
        // MODE NORMAL : retour a la liste
        state.formulaire = {
            titre:'', auteur:'', categorie:'livre', genre:'',
            dateDecouverte: new Date().toISOString().split('T')[0],
            dateDebutLecture: '',
            note: 0, critique:'', couverture:'',
            statutLecture:'Decouvert',
            statutPossession: [],
            dateRetour: '',
            prive: true,
            lienYoutube: '',
            typeMusique: 'album',
            lienSpotify: '',
            lienDeezer: '',
            lienQobuz: '',
            tags: [],
            ordre: 0
        };
        state.modeEdition = false;
        state.entreeSelectionnee = null;
        state.vue = 'liste';
        render();
    }
};

// Vue sociale et settings
window.setVueSociale = function(v) {
    state.vue = 'social';
    state.vueSociale = v;

    // Charger les donnees si necessaire
    if (v === 'fil' && !state.fil.length) chargerFil();
    else if (v === 'notifications' && !state.notifications.length) chargerNotifications();
    else render();

    // Marquer automatiquement les elements comme vus après 2 secondes
    clearTimeout(window._marquerVuTimeout);
    window._marquerVuTimeout = setTimeout(function() {
        if (state.vueSociale === 'fil' && state.fil.length > 0) {
            var filIds = state.fil.map(function(post) {
                return post.ownerId + '_' + post.id;
            });
            marquerTousCommeVus('fil', filIds);
        } else if (state.vueSociale === 'notifications' && state.notifications.length > 0) {
            var notifIds = state.notifications.map(function(notif) {
                return notif.type + '_' + notif.entreeId + '_' + (notif.pseudo || '');
            });
            marquerTousCommeVus('notifications', notifIds);
        }
    }, 2000);
};

window.setVueSettings = function() { state.vue = 'settings'; render(); };

window.ajouterAmi = ajouterAmi;
window.retirerAmi = retirerAmi;
window.voirCatalogueAmi = voirCatalogueAmi;
window.changerPseudo = changerPseudo;
window.changerMotDePasse = changerMotDePasse;
window.supprimerCompte = supprimerCompte;

// Catalogue ami - filtres et tri
window.setCatalogueFiltreCategorie = function(c) { state.catalogueFiltreCategorie = c; render(); };
window.setCatalogueTri = function(t) { state.catalogueTri = t; render(); };

// Detail entree ami
window.voirDetailAmi = function(entreeId) {
    if (state.catalogueAmi) {
        state.entreeAmiSelectionnee = state.catalogueAmi.entrees.find(function(e) { return e.id === entreeId; });
        state.vue = 'detailAmi';
        render();
    }
};

window.voirDetailDepuisFil = function(ownerId, ownerPseudo, entreeId) {
    // Charger le catalogue de cet ami puis aller au detail
    chargerCatalogueAmi(ownerId, ownerPseudo).then(function() {
        state.entreeAmiSelectionnee = state.catalogueAmi.entrees.find(function(e) { return e.id === entreeId; });
        state.vue = 'detailAmi';
        render();
    });
};

window.retourCatalogue = function() {
    state.entreeAmiSelectionnee = null;
    if (state.catalogueAmi) {
        state.vue = 'catalogueAmi';
    } else {
        state.vue = 'fil';
    }
    render();
};

// Likes et commentaires
window.likerEntreeAmi = function(ownerId, entreeId) {
    likerEntree(ownerId, entreeId);
};

window.envoyerCommentaireAmi = function(ownerId, entreeId) {
    var input = document.getElementById('commentaire-input-' + entreeId);
    if (input && input.value.trim()) {
        commenterEntree(ownerId, entreeId, input.value);
        input.value = '';
    }
};

window.supprimerCommentaireAmi = function(ownerId, entreeId, commentaireId) {
    supprimerCommentaire(ownerId, entreeId, commentaireId);
};

window.togglePasswordVisibilitySettings = function(id) {
    var input = document.getElementById(id);
    if (input) input.type = input.type === 'password' ? 'text' : 'password';
};

// Pagination des entrées personnelles
window._pagination = {
    limit: 12,
    step: 50
};

window.voirPlusEntrees = function() {
    window._pagination.limit += window._pagination.step;
    render();
};

function getEntreesFiltreesPaginated() {
    var all = getEntreesFiltrees();
    return all.slice(0, window._pagination.limit);
}

// Remplacer dans renderApp.js : var entrees = getEntreesFiltrees(); par :
window.getEntreesFiltreesPaginated = getEntreesFiltreesPaginated;

// Demarrage
render();

// AUTH STATE CHANGE
if (firebaseInitialized) {
    auth.onAuthStateChanged(async function(user) {
        state.user = user;
        state.authLoading = false;
        state.authError = null;
        if (user) {
            try {
                var userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    var data = userDoc.data();
                    state.userPseudo = data.pseudo || user.email.split('@')[0];
                    state.dernierChangementPseudo = data.dernierChangementPseudo || null;
                    if (!data.pseudoLower && data.pseudo) {
                        await db.collection('users').doc(user.uid).update({
                            pseudoLower: data.pseudo.toLowerCase()
                        });
                    }
                } else {
                    state.userPseudo = user.email.split('@')[0];
                    state.dernierChangementPseudo = null;
                }
                // Charger les stats du journal AVANT de render
                await loadJournalStatsFirestore();
            } catch (e) {
                state.userPseudo = user.email.split('@')[0];
                state.journalStats = {};
            }
            chargerEntrees();
            chargerAmis();
        } else {
            state.entrees = [];
            state.amis = [];
            state.fil = [];
            state.notifications = [];
            state.userPseudo = null;
            state.catalogueAmi = null;
            state.entreeAmiSelectionnee = null;
            state.journalStats = {};
        }
        render();
    });
} else {
    state.authLoading = false;
    render();
}

// ========== DRAG & DROP PILE ==========

window.handleDragStart = function(event) {
    var target = event.target;
    if (!target.classList.contains('pile-item')) return;

    var entreeId = target.getAttribute('data-entree-id');
    var section = target.getAttribute('data-section');
    var colonne = target.getAttribute('data-colonne');

    state.dragState.draggingId = entreeId;
    state.dragState.draggingSection = section;
    state.dragState.draggingColonne = colonne;

    target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', target.innerHTML);
};

window.handleDragEnd = function(event) {
    var target = event.target;
    if (!target.classList.contains('pile-item')) return;

    target.classList.remove('dragging');

    var items = document.querySelectorAll('.pile-item');
    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('drag-over');
    }

    state.dragState.draggingId = null;
    state.dragState.draggingSection = null;
    state.dragState.draggingColonne = null;
    state.dragState.overEntreeId = null;
    state.dragState.overSection = null;
    state.dragState.overColonne = null;
};

window.handleDragOver = function(event) {
    event.preventDefault();
    event.stopPropagation();

    var target = event.target;

    while (target && !target.classList.contains('pile-item')) {
        target = target.parentElement;
    }

    if (!target || !target.classList.contains('pile-item')) return;

    var entreeId = target.getAttribute('data-entree-id');
    var section = target.getAttribute('data-section');
    var colonne = target.getAttribute('data-colonne');

    if (entreeId === state.dragState.draggingId) {
        event.dataTransfer.dropEffect = 'none';
        return;
    }

    if (colonne !== state.dragState.draggingColonne) {
        event.dataTransfer.dropEffect = 'none';
        return;
    }

    event.dataTransfer.dropEffect = 'move';
    target.classList.add('drag-over');

    state.dragState.overEntreeId = entreeId;
    state.dragState.overSection = section;
    state.dragState.overColonne = colonne;
};

window.handleDragLeave = function(event) {
    var target = event.target;

    while (target && !target.classList.contains('pile-item')) {
        target = target.parentElement;
    }

    if (!target || !target.classList.contains('pile-item')) return;

    target.classList.remove('drag-over');
};

window.handleDrop = function(event) {
    event.preventDefault();
    event.stopPropagation();

    var target = event.target;

    while (target && !target.classList.contains('pile-item')) {
        target = target.parentElement;
    }

    if (!target || !target.classList.contains('pile-item')) return;

    target.classList.remove('drag-over');

    var draggingId = state.dragState.draggingId;
    var draggingSection = state.dragState.draggingSection;
    var overEntreeId = target.getAttribute('data-entree-id');
    var overSection = target.getAttribute('data-section');
    var overColonne = target.getAttribute('data-colonne');

    if (!draggingId || draggingId === overEntreeId) return;
    if (overColonne !== state.dragState.draggingColonne) return;

    executerDrop(draggingId, draggingSection, overEntreeId, overSection, overColonne);
};

function executerDrop(draggingId, draggingSection, overEntreeId, overSection, overColonne) {
    var entreeDragged = state.entrees.find(function(e) { return e.id === draggingId; });
    var entreeOver = state.entrees.find(function(e) { return e.id === overEntreeId; });

    if (!entreeDragged || !entreeOver) return;

    var colonnes = {
        livres: function(e) {
            return e.categorie === 'livre';
        },
        films: function(e) {
            if (e.categorie === 'film') return true;
            if (e.categorie === 'autre') {
                var genres = Array.isArray(e.genres) ? e.genres : (e.genre ? [e.genre] : []);
                return genres.indexOf('Serie TV') !== -1;
            }
            return false;
        },
        videos: function(e) {
            return e.categorie === 'youtube';
        },
        musiques: function(e) {
            return e.categorie === 'musique';
        }
    };

    var filtreColonne = colonnes[overColonne];
    if (!filtreColonne) return;

    if (draggingSection !== overSection) {
        changerSectionEtReordonner(entreeDragged, overSection, entreeOver, filtreColonne);
    } else {
        reordonnerDansMemeSection(entreeDragged, entreeOver, overSection, filtreColonne);
    }
}

async function changerSectionEtReordonner(entreeDragged, nouvelleSection, entreeOver, filtreColonne) {
    entreeDragged.statutLecture = nouvelleSection;

    var entreesSection = state.entrees.filter(function(e) {
        return e.statutLecture === nouvelleSection && filtreColonne(e);
    }).sort(function(a, b) {
        var ordreA = (a.ordre !== undefined && a.ordre !== null) ? a.ordre : 0;
        var ordreB = (b.ordre !== undefined && b.ordre !== null) ? b.ordre : 0;
        return ordreA - ordreB;
    });

    var indexOver = -1;
    for (var i = 0; i < entreesSection.length; i++) {
        if (entreesSection[i].id === entreeOver.id) {
            indexOver = i;
            break;
        }
    }

    var nouvelOrdre = [];
    for (var i = 0; i < entreesSection.length; i++) {
        if (i === indexOver) {
            nouvelOrdre.push(entreeDragged.id);
        }
        if (entreesSection[i].id !== entreeDragged.id) {
            nouvelOrdre.push(entreesSection[i].id);
        }
    }

    if (indexOver === entreesSection.length - 1) {
        nouvelOrdre.push(entreeDragged.id);
    }

    state.syncing = true;
    render();

    try {
        await sauvegarderEntree(entreeDragged);
        await reordonnerSection(nouvelOrdre);
        afficherToast('Element deplace');
    } catch (error) {
        console.error('Erreur drop:', error);
        afficherToast('Erreur');
    }

    state.syncing = false;
    render();
}

async function reordonnerDansMemeSection(entreeDragged, entreeOver, section, filtreColonne) {
    var entreesSection = state.entrees.filter(function(e) {
        return e.statutLecture === section && filtreColonne(e);
    }).sort(function(a, b) {
        var ordreA = (a.ordre !== undefined && a.ordre !== null) ? a.ordre : 0;
        var ordreB = (b.ordre !== undefined && b.ordre !== null) ? b.ordre : 0;
        return ordreA - ordreB;
    });

    var entreesFiltered = [];
    for (var i = 0; i < entreesSection.length; i++) {
        if (entreesSection[i].id !== entreeDragged.id) {
            entreesFiltered.push(entreesSection[i]);
        }
    }

    var indexOver = -1;
    for (var i = 0; i < entreesFiltered.length; i++) {
        if (entreesFiltered[i].id === entreeOver.id) {
            indexOver = i;
            break;
        }
    }

    var nouvelOrdre = [];
    for (var i = 0; i < entreesFiltered.length; i++) {
        if (i === indexOver) {
            nouvelOrdre.push(entreeDragged.id);
        }
        nouvelOrdre.push(entreesFiltered[i].id);
    }

    if (indexOver === entreesFiltered.length - 1 || indexOver === -1) {
        if (nouvelOrdre.indexOf(entreeDragged.id) === -1) {
            nouvelOrdre.push(entreeDragged.id);
        }
    }

    await reordonnerSection(nouvelOrdre);
}

// === Handlers pour drop zones de section vide ===

window.handleSectionDragOver = function(event) {
    event.preventDefault();
    var target = event.currentTarget;
    if (target.classList.contains('pile-items')) {
        target.classList.add('section-drag-over');
    }
};

window.handleSectionDragLeave = function(event) {
    var target = event.currentTarget;
    if (target.classList.contains('pile-items')) {
        target.classList.remove('section-drag-over');
    }
};

window.handleSectionDrop = function(event) {
    event.preventDefault();
    event.stopPropagation();

    var target = event.currentTarget;
    target.classList.remove('section-drag-over');

    var dropSection = target.getAttribute('data-drop-section');
    var dropColonne = target.getAttribute('data-drop-colonne');

    var draggingId = state.dragState.draggingId;
    var draggingSection = state.dragState.draggingSection;

    if (!draggingId) return;
    if (dropColonne !== state.dragState.draggingColonne) return;
    if (draggingSection === dropSection) return; // Meme section, rien a faire

    // Changer de section
    var entreeDragged = state.entrees.find(function(e) { return e.id === draggingId; });
    if (!entreeDragged) return;

    entreeDragged.statutLecture = dropSection;
    entreeDragged.ordre = 0; // Premier de la nouvelle section

    state.syncing = true;
    render();

    sauvegarderEntree(entreeDragged).then(function() {
        state.syncing = false;
        afficherToast('Element deplace');
        render();
    }).catch(function(error) {
        console.error('Erreur:', error);
        state.syncing = false;
        afficherToast('Erreur');
        render();
    });
};

// === Changer statut depuis la vue detail ===

window.changerStatutDetail = function(entreeId, nouveauStatut) {
    var entree = state.entrees.find(function(e) { return e.id === entreeId; });
    if (!entree) return;

    var ancienStatut = entree.statutLecture;
    entree.statutLecture = nouveauStatut;

    // Si on passe a "Decouvert" ou "A redecouvrir", ajouter la date de decouverte
    if ((nouveauStatut === 'Decouvert' || nouveauStatut === 'A redecouvrir') && !entree.dateDecouverte) {
        entree.dateDecouverte = new Date().toISOString().split('T')[0];
    }

    // Si on passe a "A decouvrir", retirer la date et la note
    if (nouveauStatut === 'A decouvrir') {
        entree.dateDecouverte = '';
        entree.note = 0;
    }

    state.syncing = true;
    render();

    sauvegarderEntree(entree).then(function() {
        state.syncing = false;
        afficherToast('Statut mis a jour : ' + nouveauStatut);

        // Mettre a jour l'entree selectionnee
        state.entreeSelectionnee = entree;
        render();
    }).catch(function(error) {
        console.error('Erreur sauvegarde:', error);
        // Rollback
        entree.statutLecture = ancienStatut;
        state.syncing = false;
        afficherToast('Erreur de sauvegarde');
        render();
    });
};
