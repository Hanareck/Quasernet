// MODE ANDROID - Gestion des données via Capacitor Filesystem

// Vérifier si Capacitor est disponible
var isAndroid = typeof window.Capacitor !== 'undefined';

if (!isAndroid) {
    console.log('Mode Android non disponible, utilisation du mode local');
}

// Import des plugins Capacitor (chargés depuis index.html)
var Filesystem, Directory, Encoding;

if (isAndroid) {
    Filesystem = window.Capacitor.Plugins.Filesystem;
    Directory = window.Capacitor.Plugins.Filesystem.Directory;
    Encoding = window.Capacitor.Plugins.Filesystem.Encoding;
}

// ===== FONCTIONS ANDROID =====

// Charger toutes les entrées depuis le fichier
async function chargerEntreesAndroid() {
    if (!isAndroid) return [];
    try {
        const result = await Filesystem.readFile({
            path: 'quasernet/entrees.json',
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });

        var data = JSON.parse(result.data);
        return data || [];
    } catch (e) {
        // Fichier n'existe pas encore, c'est normal au premier démarrage
        if (e.message && e.message.includes('does not exist')) {
            return [];
        }
        console.error('Erreur chargement entrées Android:', e);
        return [];
    }
}

// Sauvegarder toutes les entrées dans le fichier
async function sauvegarderEntreesAndroid(entrees) {
    if (!isAndroid) return false;
    try {
        // Créer le dossier s'il n'existe pas
        try {
            await Filesystem.mkdir({
                path: 'quasernet',
                directory: Directory.Documents,
                recursive: true
            });
        } catch (e) {
            // Le dossier existe déjà, c'est ok
        }

        await Filesystem.writeFile({
            path: 'quasernet/entrees.json',
            data: JSON.stringify(entrees, null, 2),
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });

        return true;
    } catch (e) {
        console.error('Erreur sauvegarde entrées Android:', e);
        return false;
    }
}

// Créer une nouvelle entrée en mode Android
function creerEntreeAndroid(entree) {
    entree.id = 'android_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    entree.dateCreation = new Date().toISOString();
    return entree;
}

// Charger les paramètres
async function chargerSettingsAndroid() {
    if (!isAndroid) return { pseudo: 'Utilisateur', theme: 'dark' };
    try {
        const result = await Filesystem.readFile({
            path: 'quasernet/settings.json',
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });

        var settings = JSON.parse(result.data);
        return settings || { pseudo: 'Utilisateur', theme: 'dark' };
    } catch (e) {
        return { pseudo: 'Utilisateur', theme: 'dark' };
    }
}

// Sauvegarder les paramètres
async function sauvegarderSettingsAndroid(settings) {
    if (!isAndroid) return false;
    try {
        await Filesystem.writeFile({
            path: 'quasernet/settings.json',
            data: JSON.stringify(settings, null, 2),
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });
        return true;
    } catch (e) {
        console.error('Erreur sauvegarde settings Android:', e);
        return false;
    }
}

// Charger le pseudo
async function chargerPseudoAndroid() {
    var settings = await chargerSettingsAndroid();
    return settings.pseudo || 'Utilisateur';
}

// Sauvegarder le pseudo
async function sauvegarderPseudoAndroid(pseudo) {
    var settings = await chargerSettingsAndroid();
    settings.pseudo = pseudo;
    return await sauvegarderSettingsAndroid(settings);
}

// Exporter les données Android
async function exporterDonneesAndroid() {
    if (!isAndroid) return false;
    try {
        var entrees = await chargerEntreesAndroid();
        var settings = await chargerSettingsAndroid();

        var data = {
            entrees: entrees,
            pseudo: settings.pseudo,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        var fileName = 'quasernet-backup-' + new Date().toISOString().split('T')[0] + '.json';

        await Filesystem.writeFile({
            path: 'quasernet/backups/' + fileName,
            data: JSON.stringify(data, null, 2),
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });

        // Utiliser le plugin Share pour partager le fichier
        if (window.Capacitor.Plugins.Share) {
            const Share = window.Capacitor.Plugins.Share;
            await Share.share({
                title: 'Export Quasernet',
                text: 'Backup de vos données Quasernet',
                dialogTitle: 'Partager le backup'
            });
        }

        afficherToast('Backup créé : ' + fileName);
        return true;
    } catch (e) {
        console.error('Erreur export:', e);
        afficherToast('Erreur d\'export');
        return false;
    }
}

// Importer des données Android
async function importerDonneesAndroid() {
    if (!isAndroid) return false;

    // Note: L'import de fichier nécessiterait un sélecteur de fichier
    // Pour simplifier, on peut utiliser le partage vers l'app
    afficherToast('Utilisez "Partager vers Quasernet" pour importer un fichier');
    return false;
}

// Créer un backup automatique
async function creerBackupAndroid() {
    if (!isAndroid) return false;
    try {
        var entrees = await chargerEntreesAndroid();
        var settings = await chargerSettingsAndroid();

        var data = {
            entrees: entrees,
            pseudo: settings.pseudo,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        var fileName = 'auto-backup-' + Date.now() + '.json';

        // Créer le dossier backups s'il n'existe pas
        try {
            await Filesystem.mkdir({
                path: 'quasernet/backups',
                directory: Directory.Documents,
                recursive: true
            });
        } catch (e) {
            // Le dossier existe déjà
        }

        await Filesystem.writeFile({
            path: 'quasernet/backups/' + fileName,
            data: JSON.stringify(data, null, 2),
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });

        return true;
    } catch (e) {
        console.error('Erreur backup:', e);
        return false;
    }
}

// Initialiser le mode Android
async function initialiserModeAndroid() {
    state.authLoading = true;
    render();

    // Charger les données
    try {
        state.entrees = await chargerEntreesAndroid();
        state.userPseudo = await chargerPseudoAndroid();
        state.user = null;
        state.vue = 'liste';
    } catch (error) {
        console.error('Erreur initialisation Android:', error);
        state.entrees = [];
        state.userPseudo = 'Utilisateur';
    }

    state.authLoading = false;
    render();
}

// ===== WRAPPERS POUR COMPATIBILITE =====

if (isAndroid) {
    var sauvegarderEntreeOriginal = window.sauvegarderEntree;

    window.sauvegarderEntree = async function(entree) {
        if (state.mode === 'local' && isAndroid) {
            // Mode Android
            state.syncing = true;
            render();

            try {
                if (entree.id) {
                    // Modification
                    var index = state.entrees.findIndex(function(e) { return e.id === entree.id; });
                    if (index !== -1) {
                        state.entrees[index] = entree;
                    }
                    afficherToast('Modifié');
                } else {
                    // Création
                    var nouvelleEntree = creerEntreeAndroid(entree);
                    Object.assign(entree, nouvelleEntree);
                    state.entrees.push(entree);
                    afficherToast('Ajouté');
                }

                // Sauvegarder dans le fichier
                await sauvegarderEntreesAndroid(state.entrees);

                // Backup automatique tous les 10 ajouts
                if (state.entrees.length % 10 === 0) {
                    await creerBackupAndroid();
                }

            } catch (error) {
                console.error('Erreur sauvegarde Android:', error);
                afficherToast('Erreur de sauvegarde');
            }

            state.syncing = false;
            render();
        } else {
            // Mode cloud
            return sauvegarderEntreeOriginal(entree);
        }
    };

    // Supprimer une entrée
    var supprimerEntreeOriginal = window.supprimerEntree;

    window.supprimerEntree = async function(entreeId) {
        if (state.mode === 'local' && isAndroid) {
            if (!confirm('Supprimer cette entrée ?')) return;

            state.syncing = true;
            render();

            try {
                state.entrees = state.entrees.filter(function(e) { return e.id !== entreeId; });
                await sauvegarderEntreesAndroid(state.entrees);
                afficherToast('Supprimée');
                state.vue = 'liste';
                state.entreeSelectionnee = null;
            } catch (error) {
                console.error('Erreur suppression Android:', error);
                afficherToast('Erreur de suppression');
            }

            state.syncing = false;
            render();
        } else {
            // Mode cloud
            return supprimerEntreeOriginal(entreeId);
        }
    };

    // Déconnexion en mode Android
    var deconnexionOriginal = window.deconnexion;

    window.deconnexion = async function() {
        if (state.mode === 'local' && isAndroid) {
            // Mode Android : revenir au choix de mode
            if (confirm('Revenir au choix de mode ? (Vos données locales seront conservées)')) {
                setMode(null);
                state.entrees = [];
                state.userPseudo = 'Utilisateur';
                state.vue = 'liste';
                render();
            }
        } else {
            // Mode cloud
            return deconnexionOriginal();
        }
    };

    // Gérer le bouton retour Android
    if (window.Capacitor && window.Capacitor.Plugins.App) {
        const App = window.Capacitor.Plugins.App;

        App.addListener('backButton', function() {
            if (state.vue === 'detail' || state.vue === 'stats' || state.vue === 'pile' ||
                state.vue === 'social' || state.vue === 'settings' || state.vue === 'importExport') {
                // Retour à la liste
                setVue('liste');
            } else if (state.vue === 'liste' && state.categorieActive !== 'tous') {
                // Retour à toutes les catégories
                setCategorie('tous');
            } else if (!state.mode) {
                // Sur l'écran de choix de mode, quitter l'app
                App.exitApp();
            } else if (!state.user && state.mode === 'cloud') {
                // Sur l'écran de connexion, revenir au choix de mode
                setMode(null);
                render();
            } else {
                // Sinon, quitter l'app
                App.exitApp();
            }
        });
    }
}
