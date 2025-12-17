// CONFIGURATION

var CATEGORIES = {
    livre: { nom: 'Livres', icone: '📚', genres: ['Roman', 'Science-Fiction', 'Fantasy', 'Policier', 'Thriller', 'Biographie', 'Histoire', 'Philosophie', 'Science', 'Poesie', 'BD/Manga', 'Dev. perso', 'Autre'] },
    film: { nom: 'Films', icone: '🎬', genres: ['Action', 'Comedie', 'Drame', 'SF', 'Horreur', 'Thriller', 'Animation', 'Documentaire', 'Romance', 'Aventure', 'Fantastique','Western', 'Autre'] },
    musique: { nom: 'Musique', icone: '🎵', genres: ['Pop', 'Rock', 'Jazz', 'Classique', 'Electro', 'Hip-Hop', 'R&B', 'Metal', 'Folk', 'Indie', 'World','Variete francaise', 'Autre'] },
    actualite: { nom: 'Actus', icone: '📰', genres: ['Politique', 'Economie', 'Science', 'Tech', 'Culture', 'Sport', 'Environnement', 'Societe', 'International', 'Autre'] },
    autre: { nom: 'Autres', icone: '✨', genres: ['Podcast', 'Serie TV', 'Jeu video', 'Exposition', 'Spectacle', 'Conference', 'Autre'] }
};

var STATUTS_LECTURE = ['Decouvert', 'A decouvrir'];
var STATUTS_POSSESSION = ['Possede', 'A acheter', 'A vendre', 'Vendu', 'Emprunte', 'Streaming'];

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

window.ouvrirAjout = function() {
    state.formulaire = { 
        titre:'', auteur:'', 
        categorie: state.categorieActive !== 'tous' ? state.categorieActive : 'livre', 
        genre:'', 
        dateDecouverte: new Date().toISOString().split('T')[0], 
        note: 0, critique:'', couverture:'', 
        statutLecture:'Decouvert', 
        statutPossession: [],
        dateRetour: '',
        prive: false
    };
    state.modeEdition = false;
    state.entreeSelectionnee = null;
    state.vue = 'formulaire';
    render();
};

window.ouvrirModification = function(id) {
    var e = state.entrees.find(function(x) { return x.id === id; });
    if (e) { 
        var statutPossession = Array.isArray(e.statutPossession) 
            ? e.statutPossession 
            : (e.statutPossession ? [e.statutPossession] : []);
        
        state.formulaire = Object.assign({}, e, {
            dateRetour: e.dateRetour || '',
            statutPossession: statutPossession,
            prive: e.prive || false
        }); 
        state.entreeSelectionnee = e; 
        state.modeEdition = true; 
        state.vue = 'formulaire'; 
        render(); 
    }
};

window.fermerFormulaire = function() { state.vue = 'liste'; state.modeEdition = false; render(); };
window.retourListe = function() { state.vue = 'liste'; state.entreeSelectionnee = null; state.catalogueAmi = null; state.entreeAmiSelectionnee = null; render(); };

window.setCategorie = function(c) { 
    state.categorieActive = c; 
    state.filtreGenre = 'tous'; 
    state.vue = 'liste';
    state.entreeSelectionnee = null;
    render(); 
};

window.setVue = function(v) { state.vue = v; render(); };

window.setRecherche = function(v) { 
    state.recherche = v; 
    clearTimeout(window._rt); 
    window._rt = setTimeout(function() {
        render(); 
        var i = document.querySelector('.recherche-input'); 
        if (i) { i.focus(); i.setSelectionRange(v.length, v.length); }
    }, 300); 
};

window.setTri = function(v) { state.tri = v; render(); };
window.setFiltreNote = function(v) { state.filtreNote = v; render(); };
window.setFiltreGenre = function(v) { state.filtreGenre = v; render(); };
window.setFiltreStatutLecture = function(v) { state.filtreStatutLecture = v; render(); };
window.setFiltreStatutPossession = function(v) { state.filtreStatutPossession = v; render(); };
window.setModeAffichage = function(m) { state.modeAffichage = m; localStorage.setItem('journal-mode-affichage', m); render(); };

window.updateForm = function(k, v) { state.formulaire[k] = v; };
window.setNote = function(n) { state.formulaire.note = n; render(); };
window.voirDetail = function(id) { state.entreeSelectionnee = state.entrees.find(function(e) { return e.id === id; }); state.vue = 'detail'; render(); };

window.setStatutLecture = function(s) {
    state.formulaire.statutLecture = s;
    if (s === 'A decouvrir') {
        state.formulaire.note = 0;
        state.formulaire.dateDecouverte = '';
    } else if (!state.formulaire.dateDecouverte) {
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

window.togglePrive = function() {
    state.formulaire.prive = !state.formulaire.prive;
    render();
};

window.soumettreFormulaire = async function() {
    if (!state.formulaire.titre.trim()) { afficherToast('Titre requis'); return; }
    
    var entree = Object.assign({}, state.formulaire, {
        dateCreation: state.modeEdition && state.entreeSelectionnee ? state.entreeSelectionnee.dateCreation : new Date().toISOString()
    });
    
    if (state.modeEdition && state.entreeSelectionnee) entree.id = state.entreeSelectionnee.id;
    
    await sauvegarderEntree(entree);
    
    state.formulaire = { 
        titre:'', auteur:'', categorie:'livre', genre:'', 
        dateDecouverte: new Date().toISOString().split('T')[0], 
        note: 0, critique:'', couverture:'', 
        statutLecture:'Decouvert', 
        statutPossession: [],
        dateRetour: '',
        prive: false
    };
    state.modeEdition = false;
    state.entreeSelectionnee = null;
    state.vue = 'liste';
    render();
};

// Amis et catalogue
window.setVueAmis = function() { state.vue = 'amis'; state.catalogueAmi = null; state.entreeAmiSelectionnee = null; render(); };
window.setVueSettings = function() { state.vue = 'settings'; render(); };
window.setVueFil = function() { state.vue = 'fil'; chargerFil(); };
window.setVueNotifications = function() { state.vue = 'notifications'; chargerNotifications(); };

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
                    if (!data.pseudoLower && data.pseudo) {
                        await db.collection('users').doc(user.uid).update({
                            pseudoLower: data.pseudo.toLowerCase()
                        });
                    }
                } else {
                    state.userPseudo = user.email.split('@')[0];
                }
                await loadJournalStatsFirestore();
            } catch (e) {
                state.userPseudo = user.email.split('@')[0];
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
