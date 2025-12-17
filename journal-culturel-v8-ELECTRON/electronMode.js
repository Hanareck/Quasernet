// MODE ELECTRON - Gestion des données via système de fichiers

// Vérifier si nous sommes dans Electron
var isElectron = typeof window.electron !== 'undefined';

if (!isElectron) {
    console.log('Mode Electron non disponible, utilisation du mode local');
}

// ===== FONCTIONS ELECTRON =====

// Charger toutes les entrées depuis le fichier
async function chargerEntreesElectron() {
    if (!isElectron) return [];
    try {
        var entrees = await window.electron.loadEntrees();
        return entrees || [];
    } catch (e) {
        console.error('Erreur chargement entrées Electron:', e);
        return [];
    }
}

// Sauvegarder toutes les entrées dans le fichier
async function sauvegarderEntreesElectron(entrees) {
    if (!isElectron) return false;
    try {
        var success = await window.electron.saveEntrees(entrees);
        return success;
    } catch (e) {
        console.error('Erreur sauvegarde entrées Electron:', e);
        return false;
    }
}

// Créer une nouvelle entrée en mode Electron
function creerEntreeElectron(entree) {
    entree.id = 'electron_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    entree.dateCreation = new Date().toISOString();
    return entree;
}

// Charger les paramètres
async function chargerSettingsElectron() {
    if (!isElectron) return { pseudo: 'Utilisateur', theme: 'light' };
    try {
        var settings = await window.electron.loadSettings();
        return settings || { pseudo: 'Utilisateur', theme: 'light' };
    } catch (e) {
        console.error('Erreur chargement settings Electron:', e);
        return { pseudo: 'Utilisateur', theme: 'light' };
    }
}

// Sauvegarder les paramètres
async function sauvegarderSettingsElectron(settings) {
    if (!isElectron) return false;
    try {
        return await window.electron.saveSettings(settings);
    } catch (e) {
        console.error('Erreur sauvegarde settings Electron:', e);
        return false;
    }
}

// Charger le pseudo
async function chargerPseudoElectron() {
    var settings = await chargerSettingsElectron();
    return settings.pseudo || 'Utilisateur';
}

// Sauvegarder le pseudo
async function sauvegarderPseudoElectron(pseudo) {
    var settings = await chargerSettingsElectron();
    settings.pseudo = pseudo;
    return await sauvegarderSettingsElectron(settings);
}

// Choisir le dossier de données
async function choisirDossierElectron() {
    if (!isElectron) return null;
    try {
        var folder = await window.electron.chooseDataFolder();
        return folder;
    } catch (e) {
        console.error('Erreur choix dossier:', e);
        return null;
    }
}

// Vérifier si un dossier est configuré
async function hasDossierElectron() {
    if (!isElectron) return false;
    try {
        return await window.electron.hasDataFolder();
    } catch (e) {
        return false;
    }
}

// Obtenir le dossier actuel
async function getDossierElectron() {
    if (!isElectron) return null;
    try {
        return await window.electron.getDataFolder();
    } catch (e) {
        return null;
    }
}

// Réinitialiser le dossier (changer de dossier)
async function resetDossierElectron() {
    if (!isElectron) return false;
    try {
        return await window.electron.resetDataFolder();
    } catch (e) {
        return false;
    }
}

// Exporter les données Electron
async function exporterDonneesElectron() {
    if (!isElectron) return false;
    try {
        var success = await window.electron.exportData();
        if (success) {
            afficherToast('Données exportées');
        } else {
            afficherToast('Export annulé');
        }
        return success;
    } catch (e) {
        console.error('Erreur export:', e);
        afficherToast('Erreur d\'export');
        return false;
    }
}

// Importer des données Electron
async function importerDonneesElectron() {
    if (!isElectron) return false;
    try {
        var data = await window.electron.importData();
        if (!data) {
            afficherToast('Import annulé');
            return false;
        }

        if (data.entrees && Array.isArray(data.entrees)) {
            if (confirm('Importer ' + data.entrees.length + ' entrée(s) ? Cela écrasera vos données actuelles.')) {
                await sauvegarderEntreesElectron(data.entrees);

                if (data.pseudo) {
                    await sauvegarderPseudoElectron(data.pseudo);
                    state.userPseudo = data.pseudo;
                }

                state.entrees = data.entrees;
                afficherToast('Import réussi : ' + data.entrees.length + ' entrée(s)');
                render();
                return true;
            }
        } else {
            afficherToast('Fichier JSON invalide');
        }
        return false;
    } catch (e) {
        console.error('Erreur import:', e);
        afficherToast('Erreur d\'import');
        return false;
    }
}

// Créer un backup automatique
async function creerBackupElectron() {
    if (!isElectron) return false;
    try {
        return await window.electron.createBackup();
    } catch (e) {
        console.error('Erreur backup:', e);
        return false;
    }
}

// Initialiser le mode Electron
async function initialiserModeElectron() {
    state.authLoading = true;
    render();

    // Vérifier si un dossier est configuré
    var hasFolder = await hasDossierElectron();

    if (!hasFolder) {
        // Demander à l'utilisateur de choisir un dossier
        state.authLoading = false;
        state.needsFolderSelection = true;
        render();
        return;
    }

    // Charger les données
    try {
        state.entrees = await chargerEntreesElectron();
        state.userPseudo = await chargerPseudoElectron();
        state.user = null;
        state.vue = 'liste';
        state.needsFolderSelection = false;
    } catch (error) {
        console.error('Erreur initialisation Electron:', error);
        state.entrees = [];
        state.userPseudo = 'Utilisateur';
    }

    state.authLoading = false;
    render();
}

// Sélectionner un dossier (appelé depuis l'UI)
window.selectionnerDossierElectron = async function() {
    var folder = await choisirDossierElectron();
    if (folder) {
        afficherToast('Dossier configuré : ' + folder);
        await initialiserModeElectron();
    }
};

// Changer de dossier (appelé depuis les paramètres)
window.changerDossierElectron = async function() {
    if (!confirm('Changer de dossier ? Vos données actuelles ne seront pas supprimées.')) return;

    await resetDossierElectron();
    state.needsFolderSelection = true;
    state.entrees = [];
    state.userPseudo = 'Utilisateur';
    render();
};

// ===== WRAPPERS POUR COMPATIBILITE =====

// Sauvegarder une entree
if (isElectron) {
    var sauvegarderEntreeOriginal = window.sauvegarderEntree;

    window.sauvegarderEntree = async function(entree) {
        if (state.mode === 'local' && isElectron) {
            // Mode Electron
            state.syncing = true;
            render();

            try {
                if (entree.id) {
                    // Modification
                    var index = state.entrees.findIndex(function(e) { return e.id === entree.id; });
                    if (index !== -1) {
                        state.entrees[index] = entree;
                    }
                    afficherToast('Modifie');
                } else {
                    // Creation
                    var nouvelleEntree = creerEntreeElectron(entree);
                    Object.assign(entree, nouvelleEntree);
                    state.entrees.push(entree);
                    afficherToast('Ajoute');
                }

                // Sauvegarder dans le fichier
                await sauvegarderEntreesElectron(state.entrees);

                // Backup automatique tous les 10 ajouts
                if (state.entrees.length % 10 === 0) {
                    await creerBackupElectron();
                }

            } catch (error) {
                console.error('Erreur sauvegarde Electron:', error);
                afficherToast('Erreur de sauvegarde');
            }

            state.syncing = false;
            render();
        } else {
            // Mode cloud
            return sauvegarderEntreeOriginal(entree);
        }
    };

    // Supprimer une entree
    var supprimerEntreeOriginal = window.supprimerEntree;

    window.supprimerEntree = async function(entreeId) {
        if (state.mode === 'local' && isElectron) {
            if (!confirm('Supprimer cette entree ?')) return;

            state.syncing = true;
            render();

            try {
                state.entrees = state.entrees.filter(function(e) { return e.id !== entreeId; });
                await sauvegarderEntreesElectron(state.entrees);
                afficherToast('Supprimee');
                state.vue = 'liste';
                state.entreeSelectionnee = null;
            } catch (error) {
                console.error('Erreur suppression Electron:', error);
                afficherToast('Erreur de suppression');
            }

            state.syncing = false;
            render();
        } else {
            // Mode cloud
            return supprimerEntreeOriginal(entreeId);
        }
    };

    // Déconnexion en mode Electron
    var deconnexionOriginal = window.deconnexion;

    window.deconnexion = async function() {
        if (state.mode === 'local' && isElectron) {
            // Mode Electron : proposer de changer de dossier ou revenir au choix de mode
            var choix = confirm('Voulez-vous changer de dossier ?\n\nOK = Changer de dossier\nAnnuler = Revenir au choix de mode');
            if (choix) {
                await changerDossierElectron();
            } else {
                // Revenir au choix de mode
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
}
