// MODE LOCAL - Gestion des données en localStorage

var LOCAL_STORAGE_KEYS = {
    ENTREES: 'journal-culturel-local-entrees',
    PSEUDO: 'journal-culturel-local-pseudo',
    MODE: 'journal-culturel-mode'
};

// Charger toutes les entrées depuis localStorage
function chargerEntreesLocal() {
    try {
        var stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ENTREES);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Erreur chargement entrées locales:', e);
        return [];
    }
}

// Sauvegarder toutes les entrées dans localStorage
function sauvegarderEntreesLocal(entrees) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.ENTREES, JSON.stringify(entrees));
        return true;
    } catch (e) {
        console.error('Erreur sauvegarde entrées locales:', e);
        if (e.name === 'QuotaExceededError') {
            afficherToast('Espace de stockage local plein ! Exportez vos données.');
        }
        return false;
    }
}

// Créer une nouvelle entrée en mode local
function creerEntreeLocal(entree) {
    var entrees = chargerEntreesLocal();
    entree.id = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    entree.dateCreation = new Date().toISOString();
    entrees.push(entree);
    sauvegarderEntreesLocal(entrees);
    return entree;
}

// Mettre à jour une entrée en mode local
function modifierEntreeLocal(entree) {
    var entrees = chargerEntreesLocal();
    var index = entrees.findIndex(function(e) { return e.id === entree.id; });
    if (index > -1) {
        entrees[index] = entree;
        sauvegarderEntreesLocal(entrees);
        return true;
    }
    return false;
}

// Supprimer une entrée en mode local
function supprimerEntreeLocal(entreeId) {
    var entrees = chargerEntreesLocal();
    var filtered = entrees.filter(function(e) { return e.id !== entreeId; });
    sauvegarderEntreesLocal(filtered);
    return true;
}

// Charger le pseudo en mode local
function chargerPseudoLocal() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.PSEUDO) || 'Utilisateur';
}

// Sauvegarder le pseudo en mode local
function sauvegarderPseudoLocal(pseudo) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PSEUDO, pseudo);
}

// Définir le mode (local ou cloud)
function setMode(mode) {
    if (mode === null) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.MODE);
        state.mode = null;
    } else {
        localStorage.setItem(LOCAL_STORAGE_KEYS.MODE, mode);
        state.mode = mode;
    }
}

// Effacer toutes les données locales
function effacerDonneesLocales() {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes vos données locales ? Cette action est irréversible.')) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ENTREES);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.PSEUDO);
        state.entrees = [];
        state.userPseudo = 'Utilisateur';
        afficherToast('Données locales effacées');
        render();
        return true;
    }
    return false;
}

// Exporter les données locales en JSON
function exporterDonneesLocales() {
    var data = {
        entrees: chargerEntreesLocal(),
        pseudo: chargerPseudoLocal(),
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'quasernet-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    afficherToast('Backup téléchargé');
}

// Importer des données locales depuis JSON
function importerDonneesLocales(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = JSON.parse(e.target.result);
            if (data.entrees && Array.isArray(data.entrees)) {
                if (confirm('Importer ' + data.entrees.length + ' entrée(s) ? Cela écrasera vos données actuelles.')) {
                    sauvegarderEntreesLocal(data.entrees);
                    if (data.pseudo) sauvegarderPseudoLocal(data.pseudo);
                    state.entrees = data.entrees;
                    state.userPseudo = data.pseudo || 'Utilisateur';
                    afficherToast('Import réussi : ' + data.entrees.length + ' entrée(s)');
                    render();
                }
            } else {
                afficherToast('Fichier JSON invalide');
            }
        } catch (err) {
            console.error('Erreur import:', err);
            afficherToast('Erreur lors de l\'import');
        }
    };
    reader.readAsText(file);
}

// Initialiser le mode local
function initialiserModeLocal() {
    state.authLoading = false;
    state.user = null;
    state.entrees = chargerEntreesLocal();
    state.userPseudo = chargerPseudoLocal();
    state.vue = 'liste';
}

// ===== WRAPPERS POUR COMPATIBILITE AVEC LE CODE EXISTANT =====

// Sauvegarder une entree : delegue au mode local ou cloud
var sauvegarderEntreeOriginal = window.sauvegarderEntree;

async function sauvegarderEntreeWrapper(entree) {
    if (state.mode === 'local') {
        // Mode local
        state.syncing = true;
        render();

        try {
            if (entree.id) {
                // Modification
                modifierEntreeLocal(entree);
                var index = state.entrees.findIndex(function(e) { return e.id === entree.id; });
                if (index !== -1) state.entrees[index] = entree;
                afficherToast('Modifie');
            } else {
                // Creation
                var nouvelleEntree = creerEntreeLocal(entree);
                state.entrees.push(nouvelleEntree);
                afficherToast('Ajoute');
            }
        } catch (error) {
            console.error('Erreur sauvegarde locale:', error);
            afficherToast('Erreur de sauvegarde');
        }

        state.syncing = false;
        render();
    } else {
        // Mode cloud : utiliser la fonction Firestore originale
        return sauvegarderEntreeOriginal(entree);
    }
}

// Supprimer une entree
var supprimerEntreeOriginal = window.supprimerEntree;

async function supprimerEntreeWrapper(entreeId) {
    if (state.mode === 'local') {
        if (!confirm('Supprimer cette entree ?')) return;

        state.syncing = true;
        render();

        try {
            supprimerEntreeLocal(entreeId);
            state.entrees = state.entrees.filter(function(e) { return e.id !== entreeId; });
            afficherToast('Supprimee');
            state.vue = 'liste';
            state.entreeSelectionnee = null;
        } catch (error) {
            console.error('Erreur suppression locale:', error);
            afficherToast('Erreur de suppression');
        }

        state.syncing = false;
        render();
    } else {
        // Mode cloud
        return supprimerEntreeOriginal(entreeId);
    }
}

// Deconnexion en mode local
var deconnexionOriginal = window.deconnexion;

function deconnexionWrapper() {
    if (state.mode === 'local') {
        // Mode local : effacer le mode et retourner au choix de mode
        if (confirm('Revenir au choix de mode ? (Vos donnees locales seront conservees)')) {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.MODE);
            state.mode = null;
            state.entrees = [];
            state.userPseudo = 'Utilisateur';
            state.vue = 'liste';
            render();
        }
    } else {
        // Mode cloud : utiliser la deconnexion Firebase originale
        return deconnexionOriginal();
    }
}

// Remplacer les fonctions globales
window.sauvegarderEntree = sauvegarderEntreeWrapper;
window.supprimerEntree = supprimerEntreeWrapper;
window.deconnexion = deconnexionWrapper;
