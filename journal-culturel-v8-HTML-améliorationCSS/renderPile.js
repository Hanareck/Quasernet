function renderPile() {
    // Initialiser l'onglet actif si pas defini
    if (!state.pileSectionActive) state.pileSectionActive = 'tous';

    // Definir les colonnes mapping
    var colonnes = {
        livres: {
            nom: 'Livres',
            icone: '📚',
            filtre: function(e) {
                return e.categorie === 'livre';
            }
        },
        films: {
            nom: 'Films/Series',
            icone: '🎬',
            filtre: function(e) {
                if (e.categorie === 'film') return true;
                if (e.categorie === 'autre') {
                    var genres = Array.isArray(e.genres) ? e.genres : (e.genre ? [e.genre] : []);
                    return genres.indexOf('Serie TV') !== -1;
                }
                return false;
            }
        },
        videos: {
            nom: 'Videos',
            icone: '📺',
            filtre: function(e) {
                return e.categorie === 'youtube';
            }
        },
        musiques: {
            nom: 'Musiques',
            icone: '🎵',
            filtre: function(e) {
                return e.categorie === 'musique';
            }
        }
    };

    // Generer les colonnes
    var html = '<div class="pile-container">' +
        '<div class="pile-header">' +
            '<div class="pile-header-left">' +
                '<h2 class="pile-titre">📚 Pile a decouvrir</h2>' +
                '<p class="pile-subtitle">Organisez vos decouvertes en cours et a venir</p>' +
            '</div>' +
            '<div class="pile-header-right">' +
                '<button class="btn-retour" onclick="retourListe()">← Retour</button>' +
            '</div>' +
        '</div>' +

        // Onglets de section (tous / par colonne)
        '<div class="pile-tabs">' +
            '<button class="pile-tab ' + (state.pileSectionActive === 'tous' ? 'active' : '') + '" onclick="setPileSectionActive(\'tous\')">📋 Vue d\'ensemble</button>' +
            Object.entries(colonnes).map(function(entry) {
                var k = entry[0];
                var v = entry[1];
                return '<button class="pile-tab ' + (state.pileSectionActive === k ? 'active' : '') + '" onclick="setPileSectionActive(\'' + k + '\')">' + v.icone + ' ' + v.nom + '</button>';
            }).join('') +
        '</div>' +

        '<div class="pile-colonnes' + (state.pileSectionActive === 'tous' ? ' pile-colonnes-overview' : ' pile-colonnes-detail') + '">';

    // Afficher soit toutes les colonnes, soit une seule
    var colonnesAAfficher = state.pileSectionActive === 'tous'
        ? Object.entries(colonnes)
        : [[state.pileSectionActive, colonnes[state.pileSectionActive]]];

    colonnesAAfficher.forEach(function(entry) {
        var k = entry[0];
        var v = entry[1];

        // Filtrer les entrees pour cette colonne
        var enCours = state.entrees.filter(function(e) {
            return e.statutLecture === 'En cours de decouverte' && v.filtre(e);
        }).sort(function(a, b) {
            var ordreA = (a.ordre !== undefined && a.ordre !== null) ? a.ordre : 0;
            var ordreB = (b.ordre !== undefined && b.ordre !== null) ? b.ordre : 0;
            return ordreA - ordreB;
        });

        var aDecouvrir = state.entrees.filter(function(e) {
            return e.statutLecture === 'A decouvrir' && v.filtre(e);
        }).sort(function(a, b) {
            var ordreA = (a.ordre !== undefined && a.ordre !== null) ? a.ordre : 0;
            var ordreB = (b.ordre !== undefined && b.ordre !== null) ? b.ordre : 0;
            return ordreA - ordreB;
        });

        html += '<div class="pile-colonne">' +
            '<div class="pile-colonne-header">' +
                '<h3 class="pile-colonne-titre">' + v.icone + ' ' + v.nom + '</h3>' +
                '<div class="pile-colonne-stats">' +
                    '<span class="pile-stat-en-cours">' + enCours.length + ' en cours</span>' +
                    '<span class="pile-stat-separator">•</span>' +
                    '<span class="pile-stat-a-decouvrir">' + aDecouvrir.length + ' a decouvrir</span>' +
                '</div>' +
            '</div>';

        // Section "En cours de decouverte"
        html += '<div class="pile-section">' +
            '<div class="pile-section-label-with-action">' +
                '<div class="pile-section-label">En cours de decouverte</div>';

        // Bouton pour ajouter si des items "A decouvrir" existent
        if (aDecouvrir.length > 0) {
            html += '<button class="btn-ajout-rapide" onclick="ouvrirModalSelection(\'' + k + '\', true)" title="Ajouter un element">+ Ajouter</button>';
        }

        html += '</div>' +
            '<div class="pile-items" ' +
                'data-drop-section="En cours de decouverte" ' +
                'data-drop-colonne="' + k + '" ' +
                'ondragover="handleSectionDragOver(event)" ' +
                'ondrop="handleSectionDrop(event)" ' +
                'ondragleave="handleSectionDragLeave(event)">';

        if (enCours.length > 0) {
            enCours.forEach(function(e) {
                html += renderPileItem(e, true, k);
            });
        } else {
            // Zone de drop vide visible
            html += '<div class="pile-drop-zone">' +
                'Glissez un element ici';

            // Bouton pour selectionner si des items "A decouvrir" existent
            if (aDecouvrir.length > 0) {
                html += '<br><button class="btn-selection-pile" onclick="event.stopPropagation();ouvrirModalSelection(\'' + k + '\', false)">+ Selectionner un element</button>';
            }

            html += '</div>';
        }

        html += '</div></div>';

        // Section "A decouvrir"
        var estExpanded = state.pileExpandedSections[k] || false;

        html += '<div class="pile-section pile-section-secondaire">' +
            '<div class="pile-section-header-collapsible" onclick="togglePileSection(\'' + k + '\')">' +
                '<div class="pile-section-label">' +
                    'A decouvrir (' + aDecouvrir.length + ')' +
                '</div>' +
                '<button class="pile-section-toggle">' +
                    (estExpanded ? '▼' : '▶') +
                '</button>' +
            '</div>';

        if (estExpanded) {
            html += '<div class="pile-items" ' +
                'data-drop-section="A decouvrir" ' +
                'data-drop-colonne="' + k + '" ' +
                'ondragover="handleSectionDragOver(event)" ' +
                'ondrop="handleSectionDrop(event)" ' +
                'ondragleave="handleSectionDragLeave(event)">';

            if (aDecouvrir.length > 0) {
                aDecouvrir.forEach(function(e) {
                    html += renderPileItem(e, false, k);
                });
            } else {
                // Zone de drop vide visible
                html += '<div class="pile-drop-zone">Glissez un element ici</div>';
            }

            html += '</div>';
        }

        html += '</div>';

        // Message si colonne vide
        if (enCours.length === 0 && aDecouvrir.length === 0) {
            html += '<div class="pile-vide">' +
                '<div class="pile-vide-icone">' + v.icone + '</div>' +
                '<p>Aucun element dans cette pile</p>' +
            '</div>';
        }

        html += '</div>';
    });

    html += '</div></div>';

    // Modal de selection si active
    if (state.modalPile) {
        html += renderModalPile();
    }

    // Modal de note si active
    if (state.modalNote) {
        html += renderModalNote();
    }

    return html;
}

function renderPileItem(entree, enCours, colonneKey) {
    var categorieInfo = CATEGORIES[entree.categorie];
    var section = enCours ? 'En cours de decouverte' : 'A decouvrir';
    var estLivre = entree.categorie === 'livre';

    return '<div class="pile-item ' + (enCours ? 'en-cours' : '') + '" ' +
        'draggable="true" ' +
        'data-entree-id="' + entree.id + '" ' +
        'data-section="' + escapeHtml(section) + '" ' +
        'data-colonne="' + colonneKey + '" ' +
        'onclick="voirDetail(\'' + entree.id + '\')" ' +
        'ondragstart="handleDragStart(event)" ' +
        'ondragend="handleDragEnd(event)" ' +
        'ondragover="handleDragOver(event)" ' +
        'ondrop="handleDrop(event)" ' +
        'ondragleave="handleDragLeave(event)">' +
        '<div class="pile-item-couverture">' +
            (entree.couverture
                ? '<img src="' + escapeHtml(entree.couverture) + '" alt="Couverture de ' + escapeHtml(entree.titre) + '" draggable="false">'
                : '<div class="pile-item-placeholder">' + (categorieInfo ? categorieInfo.icone : '✨') + '</div>'
            ) +
        '</div>' +
        '<div class="pile-item-info">' +
            '<div class="pile-item-titre">' + escapeHtml(entree.titre) + '</div>' +
            (entree.auteur ? '<div class="pile-item-auteur">' + escapeHtml(entree.auteur) + '</div>' : '') +
            (enCours && estLivre && entree.dateDebutLecture ?
                '<div class="pile-item-date-debut">Debut : ' + formatDate(entree.dateDebutLecture) + '</div>'
            : '') +
            (enCours ? '<span class="pile-item-badge en-cours">En cours</span>' : '') +
        '</div>' +
        (enCours ?
            '<button class="pile-item-action" onclick="event.stopPropagation();changerStatutEnCours(\'' + entree.id + '\')" title="Marquer comme decouvert">✓</button>'
            : ''
        ) +
    '</div>';
}

function renderModalPile() {
    var modal = state.modalPile;
    var estModeAjoutDirect = modal.modeAjoutDirect === true;

    // Adapter le titre et les boutons selon le mode
    var titre = estModeAjoutDirect ? 'Ajouter une decouverte en cours' : 'Selectionner la prochaine decouverte';
    var subtitle = estModeAjoutDirect
        ? 'Choisissez un element a mettre en cours de decouverte dans ' + modal.colonneNom
        : 'Choisissez votre prochain element a decouvrir dans ' + modal.colonneNom;

    return '<div class="modal-overlay" onclick="fermerModalPile()">' +
        '<div class="modal-pile" onclick="event.stopPropagation()">' +
            '<div class="modal-pile-header">' +
                '<h3 class="modal-pile-titre">' + titre + '</h3>' +
                '<button class="btn-fermer-modal" onclick="fermerModalPile()">✕</button>' +
            '</div>' +
            '<div class="modal-pile-subtitle">' + subtitle + '</div>' +
            '<div class="modal-pile-actions">' +
                '<button class="btn-aleatoire" onclick="' + (estModeAjoutDirect ? 'ajouterAleatoireModal()' : 'selectionnerEntreeAleatoire()') + '">🎲 Selection aleatoire</button>' +
                (estModeAjoutDirect
                    ? '<button class="btn-ne-rien-selectionner" onclick="fermerModalPile()">✕ Annuler</button>'
                    : '<button class="btn-ne-rien-selectionner" onclick="neRienSelectionner()">✕ Ne rien selectionner</button>'
                ) +
            '</div>' +
            '<div class="modal-pile-liste">' +
                modal.entreesDisponibles.map(function(e) {
                    var categorieInfo = CATEGORIES[e.categorie];
                    var onclickHandler = estModeAjoutDirect ? 'selectionnerEntreeAjoutModal(\'' + e.id + '\')' : 'selectionnerEntreePile(\'' + e.id + '\')';
                    return '<div class="modal-pile-item" onclick="' + onclickHandler + '">' +
                        '<div class="modal-pile-item-couverture">' +
                            (e.couverture
                                ? '<img src="' + escapeHtml(e.couverture) + '" alt="Couverture de ' + escapeHtml(e.titre) + '">'
                                : '<div class="modal-pile-item-placeholder">' + (categorieInfo ? categorieInfo.icone : '✨') + '</div>'
                            ) +
                        '</div>' +
                        '<div class="modal-pile-item-info">' +
                            '<div class="modal-pile-item-titre">' + escapeHtml(e.titre) + '</div>' +
                            (e.auteur ? '<div class="modal-pile-item-auteur">' + escapeHtml(e.auteur) + '</div>' : '') +
                        '</div>' +
                        '<div class="modal-pile-item-select">→</div>' +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>' +
    '</div>';
}

function renderModalNote() {
    var modal = state.modalNote;
    var entree = modal.entree;
    var noteSelectionnee = modal.noteSelectionnee || 0;

    return '<div class="modal-overlay" onclick="fermerModalNote()">' +
        '<div class="modal-note" onclick="event.stopPropagation()">' +
            '<div class="modal-note-header">' +
                '<h3 class="modal-note-titre">🎯 Quelle note donnez-vous ?</h3>' +
            '</div>' +
            '<div class="modal-note-entree">' +
                '<div class="modal-note-entree-couverture">' +
                    (entree.couverture
                        ? '<img src="' + escapeHtml(entree.couverture) + '" alt="Couverture">'
                        : '<div class="modal-note-placeholder">' + (CATEGORIES[entree.categorie]?.icone || '✨') + '</div>'
                    ) +
                '</div>' +
                '<div class="modal-note-entree-info">' +
                    '<div class="modal-note-entree-titre">' + escapeHtml(entree.titre) + '</div>' +
                    (entree.auteur ? '<div class="modal-note-entree-auteur">' + escapeHtml(entree.auteur) + '</div>' : '') +
                '</div>' +
            '</div>' +
            '<div class="modal-note-selecteur">' +
                [1, 2, 3, 4, 5].map(function(note) {
                    return '<button class="modal-note-etoile ' + (note <= noteSelectionnee ? 'active' : '') + '" onclick="selectionnerNote(' + note + ')" title="' + note + ' etoile' + (note > 1 ? 's' : '') + '">⭐</button>';
                }).join('') +
            '</div>' +
            '<div class="modal-note-actions">' +
                '<button class="btn-modal-note-valider" onclick="validerNote()" ' + (noteSelectionnee === 0 ? 'disabled' : '') + '>✓ Valider la note</button>' +
                '<button class="btn-modal-note-passer" onclick="passerNote()">Passer sans noter</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

// Fonctions globales

window.setPileSectionActive = function(section) {
    state.pileSectionActive = section;
    render();
};

window.changerStatutEnCours = function(entreeId) {
    // Trouver l'entree
    var entree = state.entrees.find(function(e) { return e.id === entreeId; });
    if (!entree) return;

    // Determiner la colonne de cette entree
    var colonnes = {
        livres: {
            nom: 'Livres',
            filtre: function(e) {
                return e.categorie === 'livre';
            }
        },
        films: {
            nom: 'Films/Series',
            filtre: function(e) {
                if (e.categorie === 'film') return true;
                if (e.categorie === 'autre') {
                    var genres = Array.isArray(e.genres) ? e.genres : (e.genre ? [e.genre] : []);
                    return genres.indexOf('Serie TV') !== -1;
                }
                return false;
            }
        },
        videos: {
            nom: 'Videos',
            filtre: function(e) {
                return e.categorie === 'youtube';
            }
        },
        musiques: {
            nom: 'Musiques',
            filtre: function(e) {
                return e.categorie === 'musique';
            }
        }
    };

    var colonneKey = null;
    Object.entries(colonnes).forEach(function(entry) {
        if (entry[1].filtre(entree)) {
            colonneKey = entry[0];
        }
    });

    if (!colonneKey) return;

    // Recuperer les entrees "A decouvrir" de la meme colonne
    var entreesADecouvrir = state.entrees.filter(function(e) {
        return e.statutLecture === 'A decouvrir' && colonnes[colonneKey].filtre(e);
    });

    // Ouvrir d'abord la modal de note
    state.modalNote = {
        entree: entree,
        noteSelectionnee: entree.note || 0,
        entreesADecouvrir: entreesADecouvrir,
        colonneKey: colonneKey,
        colonneNom: colonnes[colonneKey].nom
    };
    render();
};

window.fermerModalPile = function() {
    state.modalPile = null;
    render();
};

// === Fonctions pour la modal de note ===

window.fermerModalNote = function() {
    state.modalNote = null;
    render();
};

window.selectionnerNote = function(note) {
    if (!state.modalNote) return;
    state.modalNote.noteSelectionnee = note;
    render();
};

window.validerNote = function() {
    if (!state.modalNote || state.modalNote.noteSelectionnee === 0) return;

    var entree = state.modalNote.entree;
    var entreesADecouvrir = state.modalNote.entreesADecouvrir;
    var colonneKey = state.modalNote.colonneKey;
    var colonneNom = state.modalNote.colonneNom;

    // Mettre a jour la note et le statut
    entree.note = state.modalNote.noteSelectionnee;
    entree.statutLecture = 'Decouvert';
    if (!entree.dateDecouverte) {
        entree.dateDecouverte = new Date().toISOString().split('T')[0];
    }

    // Sauvegarder l'entree
    state.syncing = true;
    state.modalNote = null;
    render();

    sauvegarderEntree(entree).then(function() {
        state.syncing = false;

        // Maintenant demander si on veut selectionner un prochain produit
        if (entreesADecouvrir.length > 0) {
            state.modalPile = {
                entreeFinale: entree,
                entreesDisponibles: entreesADecouvrir,
                colonneNom: colonneNom
            };
        } else {
            afficherToast('Note enregistree !');
        }
        render();
    }).catch(function(error) {
        console.error('Erreur sauvegarde:', error);
        state.syncing = false;
        afficherToast('Erreur de sauvegarde');
        render();
    });
};

window.passerNote = function() {
    if (!state.modalNote) return;

    var entree = state.modalNote.entree;
    var entreesADecouvrir = state.modalNote.entreesADecouvrir;
    var colonneKey = state.modalNote.colonneKey;
    var colonneNom = state.modalNote.colonneNom;

    // Passer a Decouvert sans note
    entree.statutLecture = 'Decouvert';
    if (!entree.dateDecouverte) {
        entree.dateDecouverte = new Date().toISOString().split('T')[0];
    }

    // Sauvegarder l'entree
    state.syncing = true;
    state.modalNote = null;
    render();

    sauvegarderEntree(entree).then(function() {
        state.syncing = false;

        // Maintenant demander si on veut selectionner un prochain produit
        if (entreesADecouvrir.length > 0) {
            state.modalPile = {
                entreeFinale: entree,
                entreesDisponibles: entreesADecouvrir,
                colonneNom: colonneNom
            };
        } else {
            afficherToast('Marque comme decouvert');
        }
        render();
    }).catch(function(error) {
        console.error('Erreur sauvegarde:', error);
        state.syncing = false;
        afficherToast('Erreur de sauvegarde');
        render();
    });
};

window.selectionnerEntreeAleatoire = function() {
    if (!state.modalPile || !state.modalPile.entreesDisponibles.length) return;
    var random = Math.floor(Math.random() * state.modalPile.entreesDisponibles.length);
    var entreeSelectionnee = state.modalPile.entreesDisponibles[random];
    validerSelectionPile(entreeSelectionnee.id);
};

window.selectionnerEntreePile = function(entreeId) {
    validerSelectionPile(entreeId);
};

function validerSelectionPile(entreeId) {
    if (!state.modalPile) return;

    var entreeSelectionnee = state.entrees.find(function(e) { return e.id === entreeId; });
    if (!entreeSelectionnee) return;

    // Mettre a jour le statut de l'entree selectionnee
    entreeSelectionnee.statutLecture = 'En cours de decouverte';

    // Si c'est un livre et qu'il n'a pas de date de debut, mettre la date du jour
    if (entreeSelectionnee.categorie === 'livre' && !entreeSelectionnee.dateDebutLecture) {
        entreeSelectionnee.dateDebutLecture = new Date().toISOString().split('T')[0];
    }

    // Sauvegarder l'entree
    state.syncing = true;
    render();

    sauvegarderEntree(entreeSelectionnee).then(function() {
        state.modalPile = null;
        state.syncing = false;
        afficherToast('Pile mise a jour !');
        render();
    }).catch(function(error) {
        console.error('Erreur sauvegarde:', error);
        state.syncing = false;
        afficherToast('Erreur de sauvegarde');
        render();
    });
}

window.neRienSelectionner = function() {
    if (!state.modalPile) return;

    // L'entree a deja ete marquee comme "Decouvert" dans la modal de note
    // On ferme juste la modal sans rien faire de plus
    state.modalPile = null;
    afficherToast('Aucune selection');
    render();
};

// === Fonctions pour sections pliables ===

window.togglePileSection = function(colonneKey) {
    if (!state.pileExpandedSections[colonneKey]) {
        state.pileExpandedSections[colonneKey] = true;
    } else {
        state.pileExpandedSections[colonneKey] = false;
    }
    render();
};

// === Fonctions pour modal de selection ===

window.ouvrirModalSelection = function(colonneKey, estAjoutRapide) {
    // Definir les colonnes (extraire du renderPile pour reutilisation)
    var colonnes = {
        livres: {
            nom: 'Livres',
            filtre: function(e) {
                return e.categorie === 'livre';
            }
        },
        films: {
            nom: 'Films/Series',
            filtre: function(e) {
                if (e.categorie === 'film') return true;
                if (e.categorie === 'autre') {
                    var genres = Array.isArray(e.genres) ? e.genres : (e.genre ? [e.genre] : []);
                    return genres.indexOf('Serie TV') !== -1;
                }
                return false;
            }
        },
        videos: {
            nom: 'Videos',
            filtre: function(e) {
                return e.categorie === 'youtube';
            }
        },
        musiques: {
            nom: 'Musiques',
            filtre: function(e) {
                return e.categorie === 'musique';
            }
        }
    };

    var entreesADecouvrir = state.entrees.filter(function(e) {
        return e.statutLecture === 'A decouvrir' && colonnes[colonneKey].filtre(e);
    });

    if (entreesADecouvrir.length === 0) {
        afficherToast('Aucun element a decouvrir dans cette pile');
        return;
    }

    // Ouvrir modal en mode ajout direct (pas de completion d'item)
    state.modalPile = {
        entreeFinale: null,  // Pas d'item a marquer comme decouvert
        entreesDisponibles: entreesADecouvrir,
        colonneNom: colonnes[colonneKey].nom,
        modeAjoutDirect: true  // Flag pour ce mode
    };
    render();
};

// === Fonctions pour ajout direct ===

window.ajouterAleatoireModal = function() {
    if (!state.modalPile || !state.modalPile.entreesDisponibles.length) return;
    var random = Math.floor(Math.random() * state.modalPile.entreesDisponibles.length);
    var entreeSelectionnee = state.modalPile.entreesDisponibles[random];
    ajouterEnCoursModal(entreeSelectionnee.id);
};

window.selectionnerEntreeAjoutModal = function(entreeId) {
    ajouterEnCoursModal(entreeId);
};

function ajouterEnCoursModal(entreeId) {
    if (!state.modalPile) return;

    var entreeSelectionnee = state.entrees.find(function(e) { return e.id === entreeId; });
    if (!entreeSelectionnee) return;

    // Passer l'item en "En cours de decouverte"
    entreeSelectionnee.statutLecture = 'En cours de decouverte';

    // Si c'est un livre et qu'il n'a pas de date de debut, mettre la date du jour
    if (entreeSelectionnee.categorie === 'livre' && !entreeSelectionnee.dateDebutLecture) {
        entreeSelectionnee.dateDebutLecture = new Date().toISOString().split('T')[0];
    }

    state.syncing = true;
    render();

    sauvegarderEntree(entreeSelectionnee).then(function() {
        state.modalPile = null;
        state.syncing = false;
        afficherToast('Element ajoute en cours de decouverte');
        render();
    }).catch(function(error) {
        console.error('Erreur sauvegarde:', error);
        state.syncing = false;
        afficherToast('Erreur de sauvegarde');
        render();
    });
}
