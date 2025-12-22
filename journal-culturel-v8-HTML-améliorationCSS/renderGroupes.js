// renderGroupes.js - Rendu des groupes et composants associés

/**
 * Rendre la liste des groupes
 */
function renderGroupesContenu() {
    var totalPostsNonLus = state.groupes.reduce(function(total, g) {
        return total + (g.postsNonLus || 0);
    }, 0);

    var html = '<div class="section-content">';

    // En-tête avec actions
    html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">';
    html += '<h2 style="margin: 0;">Mes groupes</h2>';
    html += '<div style="display: flex; gap: 0.75rem;">';
    html += '<button class="btn-primary" onclick="ouvrirModalCreerGroupe()">Créer un groupe</button>';
    html += '<button class="btn-secondary" onclick="ouvrirModalRejoindreGroupe()">Rejoindre un groupe</button>';
    html += '</div>';
    html += '</div>';

    if (state.groupes.length === 0) {
        html += '<div class="carte-vide">';
        html += '<p>Vous ne faites partie d\'aucun groupe.</p>';
        html += '<p style="margin-top: 0.5rem; color: var(--text-secondary);">Créez votre premier groupe ou rejoignez-en un avec l\'ID et le mot de passe fournis par un ami.</p>';
        html += '</div>';
    } else {
        html += '<div class="grille-groupes">';

        state.groupes.forEach(function(groupe) {
            var badgeNonLus = groupe.postsNonLus && groupe.postsNonLus > 0
                ? '<span class="badge-notif">' + groupe.postsNonLus + '</span>'
                : '';

            html += '<div class="carte-groupe" onclick="ouvrirDetailGroupe(\'' + escapeHtml(groupe.id) + '\')">';
            html += '<div class="carte-groupe-header">';
            html += '<h3>' + escapeHtml(groupe.nom) + badgeNonLus + '</h3>';
            html += '</div>';
            html += '<div class="carte-groupe-info">';
            html += '<p style="color: var(--text-secondary); font-size: 0.85rem;">Membre depuis ' + formatDate(groupe.dateAjout) + '</p>';
            html += '</div>';
            html += '</div>';
        });

        html += '</div>';
    }

    html += '</div>';

    return html;
}

/**
 * Rendre le détail d'un groupe
 */
function renderDetailGroupe() {
    if (!state.groupeActif) {
        if (state.groupeActifLoading) {
            return '<div class="section-content"><div class="spinner-container"><div class="spinner"></div></div></div>';
        }
        return '<div class="section-content"><p>Groupe introuvable</p></div>';
    }

    var groupe = state.groupeActif;
    var estAdmin = groupe.createur === state.user.uid;

    var html = '<div class="section-content">';

    // En-tête du groupe
    html += '<div class="header-detail-groupe">';
    html += '<div>';
    html += '<button class="btn-retour" onclick="retourGroupes()">← Retour aux groupes</button>';
    html += '<h2 style="margin: 0.5rem 0;">' + escapeHtml(groupe.nom) + '</h2>';
    html += '<p style="color: var(--text-secondary); margin: 0;">' + groupe.membres.length + ' membre' + (groupe.membres.length > 1 ? 's' : '') + ' • ' + (groupe.nombrePosts || 0) + ' post' + (groupe.nombrePosts > 1 ? 's' : '') + '</p>';
    html += '</div>';
    html += '<div style="display: flex; gap: 0.75rem;">';
    html += '<button class="btn-secondary" onclick="ouvrirModalMembresGroupe()">Voir les membres</button>';
    if (estAdmin) {
        html += '<button class="btn-secondary" onclick="ouvrirModalGestionGroupe()">Gérer le groupe</button>';
    }
    html += '</div>';
    html += '</div>';

    // Info pour copier l'ID
    html += '<div class="info-partage-groupe">';
    html += '<p style="margin: 0 0 0.5rem 0; font-weight: 500;">ID du groupe (à partager avec vos amis) :</p>';
    html += '<div style="display: flex; gap: 0.5rem; align-items: center;">';
    html += '<code style="padding: 0.5rem; background: var(--bg-secondary); border-radius: 8px; font-family: monospace; font-size: 0.85rem; flex: 1;">' + escapeHtml(groupe.id) + '</code>';
    html += '<button class="btn-secondary" onclick="copierIdGroupe(\'' + escapeHtml(groupe.id) + '\')">Copier</button>';
    html += '</div>';
    html += '</div>';

    // Posts du groupe
    if (!groupe.posts || groupe.posts.length === 0) {
        html += '<div class="carte-vide">';
        html += '<p>Aucun post dans ce groupe.</p>';
        html += '<p style="margin-top: 0.5rem; color: var(--text-secondary);">Partagez vos découvertes depuis la fiche détaillée d\'une entrée.</p>';
        html += '</div>';
    } else {
        html += '<div class="fil-posts-groupe">';

        groupe.posts.forEach(function(post) {
            html += renderPostGroupe(groupe, post, estAdmin);
        });

        html += '</div>';
    }

    html += '</div>';

    return html;
}

/**
 * Rendre un post de groupe
 */
function renderPostGroupe(groupe, post, estAdmin) {
    var estAuteur = post.auteurUid === state.user.uid;
    var aLike = post.likes && post.likes.some(function(like) {
        return like.id === state.user.uid;
    });

    var html = '<div class="carte-post-groupe">';

    // En-tête du post
    html += '<div class="post-header">';
    html += '<div>';
    html += '<p style="font-weight: 600; margin: 0;">' + escapeHtml(post.auteurPseudo) + '</p>';
    html += '<p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.25rem 0 0 0;">' + formatDate(post.datePartage) + '</p>';
    html += '</div>';

    if (estAuteur || estAdmin) {
        html += '<button class="btn-icon" onclick="supprimerPostGroupe(\'' + escapeHtml(groupe.id) + '\', \'' + escapeHtml(post.id) + '\')" title="Supprimer">';
        html += '🗑️';
        html += '</button>';
    }

    html += '</div>';

    // Contenu du post
    html += '<div class="post-contenu" onclick="ouvrirDetailPostGroupe(\'' + escapeHtml(groupe.id) + '\', \'' + escapeHtml(post.id) + '\')" style="cursor: pointer;">';

    // Couverture si disponible
    if (post.couverture) {
        html += '<div style="margin-bottom: 1rem;">';
        html += '<img src="' + escapeHtml(post.couverture) + '" alt="Couverture" style="max-width: 150px; border-radius: 8px; box-shadow: var(--shadow-sm);">';
        html += '</div>';
    }

    html += '<h3 style="margin: 0 0 0.5rem 0;">' + escapeHtml(post.titre || 'Sans titre') + '</h3>';

    if (post.auteur) {
        html += '<p style="color: var(--text-secondary); margin: 0 0 0.5rem 0;">Par ' + escapeHtml(post.auteur) + '</p>';
    }

    html += '<div style="display: flex; align-items: center; gap: 1rem; margin: 0.5rem 0;">';
    html += '<span class="badge-categorie">' + escapeHtml(getCategorieLabel(post.categorie)) + '</span>';
    if (post.note > 0) {
        html += '<span>' + renderEtoiles(post.note) + '</span>';
    }
    html += '</div>';

    if (post.critique) {
        var critiqueApercu = post.critique.length > 150
            ? post.critique.substring(0, 150) + '...'
            : post.critique;
        html += '<p style="margin-top: 0.75rem; color: var(--text-secondary);">' + escapeHtml(critiqueApercu) + '</p>';
    }

    html += '</div>';

    // Actions du post
    html += '<div class="post-actions">';

    var likeBtnClass = aLike ? 'btn-like-actif' : 'btn-like';
    var likesCount = post.likesCount || 0;
    html += '<button class="' + likeBtnClass + '" onclick="event.stopPropagation(); likerPostGroupe(\'' + escapeHtml(groupe.id) + '\', \'' + escapeHtml(post.id) + '\')">';
    html += '❤️ ' + likesCount;
    html += '</button>';

    var commentsCount = post.commentsCount || 0;
    html += '<button class="btn-comment" onclick="event.stopPropagation(); ouvrirDetailPostGroupe(\'' + escapeHtml(groupe.id) + '\', \'' + escapeHtml(post.id) + '\')">';
    html += '💬 ' + commentsCount;
    html += '</button>';

    html += '</div>';

    html += '</div>';

    return html;
}

/**
 * Rendre le détail d'un post de groupe
 */
function renderDetailPostGroupe() {
    if (!state.groupeActif || !state.postGroupeSelectionne) {
        return '<div class="section-content"><p>Post introuvable</p></div>';
    }

    var groupe = state.groupeActif;
    var post = state.postGroupeSelectionne;
    var estAdmin = groupe.createur === state.user.uid;
    var estAuteur = post.auteurUid === state.user.uid;
    var aLike = post.likes && post.likes.some(function(like) {
        return like.id === state.user.uid;
    });

    var html = '<div class="section-content">';

    html += '<button class="btn-retour" onclick="retourDetailGroupe()">← Retour au groupe</button>';

    html += '<div class="detail-post-groupe">';

    // En-tête
    html += '<div class="post-header" style="margin-bottom: 1.5rem;">';
    html += '<div>';
    html += '<p style="font-weight: 600; margin: 0;">' + escapeHtml(post.auteurPseudo) + '</p>';
    html += '<p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.25rem 0 0 0;">Partagé le ' + formatDate(post.datePartage) + '</p>';
    html += '</div>';
    html += '</div>';

    // Contenu complet
    html += '<div class="carte-detail-entree">';

    if (post.couverture) {
        html += '<div style="text-align: center; margin-bottom: 1.5rem;">';
        html += '<img src="' + escapeHtml(post.couverture) + '" alt="Couverture" style="max-width: 200px; border-radius: 12px; box-shadow: var(--shadow-md);">';
        html += '</div>';
    }

    html += '<h2 style="margin: 0 0 0.5rem 0;">' + escapeHtml(post.titre || 'Sans titre') + '</h2>';

    if (post.auteur) {
        html += '<p style="color: var(--text-secondary); margin: 0 0 1rem 0; font-size: 1.05rem;">Par ' + escapeHtml(post.auteur) + '</p>';
    }

    html += '<div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">';
    html += '<span class="badge-categorie">' + escapeHtml(getCategorieLabel(post.categorie)) + '</span>';
    if (post.genre) {
        html += '<span class="badge-genre">' + escapeHtml(post.genre) + '</span>';
    }
    if (post.note > 0) {
        html += '<span>' + renderEtoiles(post.note) + '</span>';
    }
    html += '</div>';

    if (post.critique) {
        html += '<div style="margin-bottom: 1.5rem;">';
        html += '<h3 style="font-size: 0.95rem; margin: 0 0 0.5rem 0; color: var(--text-secondary);">Critique</h3>';
        html += '<p style="white-space: pre-wrap;">' + escapeHtml(post.critique) + '</p>';
        html += '</div>';
    }

    if (post.citation) {
        html += '<div style="margin-bottom: 1.5rem;">';
        html += '<h3 style="font-size: 0.95rem; margin: 0 0 0.5rem 0; color: var(--text-secondary);">Citation</h3>';
        html += '<blockquote style="border-left: 3px solid var(--accent-primary); padding-left: 1rem; font-style: italic; color: var(--text-secondary);">';
        html += escapeHtml(post.citation);
        html += '</blockquote>';
        html += '</div>';
    }

    if (post.lienYoutube) {
        html += '<div style="margin-bottom: 1.5rem;">';
        html += '<a href="' + escapeHtml(post.lienYoutube) + '" target="_blank" class="btn-secondary" style="text-decoration: none; display: inline-block;">📺 Voir sur YouTube</a>';
        html += '</div>';
    }

    if (post.lienMusique) {
        html += '<div style="margin-bottom: 1.5rem;">';
        html += '<a href="' + escapeHtml(post.lienMusique) + '" target="_blank" class="btn-secondary" style="text-decoration: none; display: inline-block;">🎵 Écouter</a>';
        html += '</div>';
    }

    html += '</div>';

    // Actions
    var likeBtnClass = aLike ? 'btn-like-actif' : 'btn-like';
    var likesCount = post.likesCount || 0;
    html += '<div style="margin: 1.5rem 0; display: flex; gap: 0.75rem;">';
    html += '<button class="' + likeBtnClass + '" onclick="likerPostGroupe(\'' + escapeHtml(groupe.id) + '\', \'' + escapeHtml(post.id) + '\')">';
    html += '❤️ ' + likesCount + ' J\'aime';
    html += '</button>';
    html += '</div>';

    // Section commentaires
    html += '<div class="section-commentaires">';
    html += '<h3>Commentaires (' + (post.commentsCount || 0) + ')</h3>';

    html += '<div class="formulaire-commentaire">';
    html += '<textarea id="textarea-commentaire-groupe" placeholder="Ajouter un commentaire..." rows="3" style="width: 100%; padding: 0.75rem; border: 2px solid var(--border-color); border-radius: 8px; font-family: inherit; resize: vertical;"></textarea>';
    html += '<button class="btn-primary" style="margin-top: 0.5rem;" onclick="ajouterCommentaireGroupe(\'' + escapeHtml(groupe.id) + '\', \'' + escapeHtml(post.id) + '\')">Publier</button>';
    html += '</div>';

    if (post.commentaires && post.commentaires.length > 0) {
        html += '<div class="liste-commentaires">';

        post.commentaires.forEach(function(comment) {
            var estAuteurComment = comment.auteurUid === state.user.uid;

            html += '<div class="commentaire">';
            html += '<div class="commentaire-header">';
            html += '<p style="font-weight: 600; margin: 0;">' + escapeHtml(comment.auteur) + '</p>';

            if (estAuteurComment || estAdmin) {
                html += '<button class="btn-icon-small" onclick="supprimerCommentaireGroupe(\'' + escapeHtml(groupe.id) + '\', \'' + escapeHtml(post.id) + '\', \'' + escapeHtml(comment.id) + '\')" title="Supprimer">';
                html += '🗑️';
                html += '</button>';
            }

            html += '</div>';
            html += '<p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.25rem 0 0.5rem 0;">' + formatDate(comment.date) + '</p>';
            html += '<p style="white-space: pre-wrap; margin: 0;">' + escapeHtml(comment.texte) + '</p>';
            html += '</div>';
        });

        html += '</div>';
    }

    html += '</div>';

    html += '</div>';

    html += '</div>';

    return html;
}

/**
 * Rendre la modal de création de groupe
 */
function renderModalCreerGroupe() {
    if (!state.modalCreerGroupe) return '';

    var html = '<div class="modal-overlay" onclick="fermerModalCreerGroupe()">';
    html += '<div class="modal-contenu" onclick="event.stopPropagation()">';
    html += '<h2>Créer un groupe</h2>';

    html += '<div class="champ-groupe">';
    html += '<label class="label" for="modal-nom-groupe">Nom du groupe</label>';
    html += '<input id="modal-nom-groupe" type="text" class="input" maxlength="50" placeholder="Mon super groupe">';
    html += '</div>';

    html += '<div class="champ-groupe">';
    html += '<label class="label" for="modal-password-groupe">Mot de passe</label>';
    html += '<input id="modal-password-groupe" type="password" class="input" placeholder="Mot de passe secret">';
    html += '<p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;">Partagez ce mot de passe avec les personnes que vous souhaitez inviter.</p>';
    html += '</div>';

    html += '<div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">';
    html += '<button class="btn-secondary" onclick="fermerModalCreerGroupe()">Annuler</button>';
    html += '<button class="btn-primary" onclick="validerCreationGroupe()">Créer</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    return html;
}

/**
 * Rendre la modal de rejoindre un groupe
 */
function renderModalRejoindreGroupe() {
    if (!state.modalRejoindreGroupe) return '';

    var html = '<div class="modal-overlay" onclick="fermerModalRejoindreGroupe()">';
    html += '<div class="modal-contenu" onclick="event.stopPropagation()">';
    html += '<h2>Rejoindre un groupe</h2>';

    html += '<div class="champ-groupe">';
    html += '<label class="label" for="modal-id-groupe">ID du groupe</label>';
    html += '<input id="modal-id-groupe" type="text" class="input" placeholder="Collez l\'ID du groupe ici">';
    html += '</div>';

    html += '<div class="champ-groupe">';
    html += '<label class="label" for="modal-password-rejoindre">Mot de passe</label>';
    html += '<input id="modal-password-rejoindre" type="password" class="input" placeholder="Mot de passe du groupe">';
    html += '</div>';

    html += '<div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">';
    html += '<button class="btn-secondary" onclick="fermerModalRejoindreGroupe()">Annuler</button>';
    html += '<button class="btn-primary" onclick="validerRejoindreGroupe()">Rejoindre</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    return html;
}

/**
 * Rendre la modal des membres du groupe
 */
function renderModalMembresGroupe() {
    if (!state.modalMembresGroupe || !state.groupeActif) return '';

    var groupe = state.groupeActif;
    var estAdmin = groupe.createur === state.user.uid;

    var html = '<div class="modal-overlay" onclick="fermerModalMembresGroupe()">';
    html += '<div class="modal-contenu" onclick="event.stopPropagation()">';
    html += '<h2>Membres du groupe (' + groupe.membres.length + ')</h2>';

    html += '<div class="liste-membres">';

    groupe.membres.forEach(function(membre) {
        var estCreateur = membre.uid === groupe.createur;
        var estMoi = membre.uid === state.user.uid;

        html += '<div class="membre-item">';
        html += '<div>';
        html += '<p style="font-weight: 600; margin: 0;">' + escapeHtml(membre.pseudo) + '</p>';

        if (estCreateur) {
            html += '<span class="badge-admin">Admin</span>';
        }

        if (estMoi) {
            html += '<span class="badge-moi">Vous</span>';
        }

        html += '<p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.25rem 0 0 0;">Membre depuis ' + formatDate(membre.dateAjout) + '</p>';
        html += '</div>';

        if (estAdmin && !estCreateur && !estMoi) {
            html += '<button class="btn-danger-small" onclick="expulserMembreGroupe(\'' + escapeHtml(groupe.id) + '\', \'' + escapeHtml(membre.uid) + '\')">Expulser</button>';
        }

        html += '</div>';
    });

    html += '</div>';

    html += '<div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">';
    html += '<button class="btn-secondary" onclick="fermerModalMembresGroupe()">Fermer</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    return html;
}

/**
 * Rendre la modal de gestion du groupe
 */
function renderModalGestionGroupe() {
    if (!state.modalGestionGroupe || !state.groupeActif) return '';

    var groupe = state.groupeActif;

    var html = '<div class="modal-overlay" onclick="fermerModalGestionGroupe()">';
    html += '<div class="modal-contenu" onclick="event.stopPropagation()">';
    html += '<h2>Gérer le groupe</h2>';

    html += '<div style="margin-bottom: 1.5rem;">';
    html += '<h3 style="font-size: 1rem; margin-bottom: 0.5rem;">Informations</h3>';
    html += '<p style="margin: 0.25rem 0;"><strong>Nom :</strong> ' + escapeHtml(groupe.nom) + '</p>';
    html += '<p style="margin: 0.25rem 0;"><strong>Créé le :</strong> ' + formatDate(groupe.dateCreation) + '</p>';
    html += '<p style="margin: 0.25rem 0;"><strong>Membres :</strong> ' + groupe.membres.length + '</p>';
    html += '<p style="margin: 0.25rem 0;"><strong>Posts :</strong> ' + (groupe.nombrePosts || 0) + '</p>';
    html += '</div>';

    html += '<div style="margin-bottom: 1.5rem;">';
    html += '<h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: #ff4444;">Zone de danger</h3>';
    html += '<button class="btn-danger" onclick="supprimerGroupe(\'' + escapeHtml(groupe.id) + '\')">Supprimer le groupe</button>';
    html += '<p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">Cette action est irréversible. Tous les posts et commentaires seront supprimés.</p>';
    html += '</div>';

    html += '<div style="display: flex; justify-content: flex-end;">';
    html += '<button class="btn-secondary" onclick="fermerModalGestionGroupe()">Fermer</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    return html;
}

/**
 * Rendre la modal de partage dans un groupe
 */
function renderModalPartagerGroupe() {
    if (!state.modalPartagerGroupe || !state.entreeAPartager) return '';

    var html = '<div class="modal-overlay" onclick="fermerModalPartagerGroupe()">';
    html += '<div class="modal-contenu" onclick="event.stopPropagation()">';
    html += '<h2>Partager dans un groupe</h2>';

    if (state.groupes.length === 0) {
        html += '<p>Vous ne faites partie d\'aucun groupe.</p>';
        html += '<p style="color: var(--text-secondary); margin-top: 0.5rem;">Créez ou rejoignez un groupe pour partager vos découvertes.</p>';
    } else {
        html += '<p style="margin-bottom: 1rem;">Sélectionnez le groupe dans lequel partager <strong>' + escapeHtml(state.entreeAPartager.titre || 'cette entrée') + '</strong> :</p>';

        html += '<div class="liste-selection-groupes">';

        state.groupes.forEach(function(groupe) {
            html += '<div class="groupe-selectionnable" onclick="validerPartageGroupe(\'' + escapeHtml(groupe.id) + '\')">';
            html += '<p style="font-weight: 600; margin: 0;">' + escapeHtml(groupe.nom) + '</p>';
            html += '</div>';
        });

        html += '</div>';
    }

    html += '<div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">';
    html += '<button class="btn-secondary" onclick="fermerModalPartagerGroupe()">Annuler</button>';
    html += '</div>';

    html += '</div>';
    html += '</div>';

    return html;
}

// ========== Fonctions d'événements ==========

window.ouvrirDetailGroupe = function(groupeId) {
    state.vue = 'detailGroupe';
    chargerDetailGroupe(groupeId);
};

window.retourGroupes = function() {
    state.vue = 'social';
    state.vueSociale = 'groupes';
    state.groupeActif = null;
    render();
};

window.ouvrirDetailPostGroupe = function(groupeId, postId) {
    var post = state.groupeActif.posts.find(function(p) { return p.id === postId; });
    if (post) {
        state.postGroupeSelectionne = post;
        state.vue = 'detailPostGroupe';
        render();
    }
};

window.retourDetailGroupe = function() {
    state.vue = 'detailGroupe';
    state.postGroupeSelectionne = null;
    render();
};

window.copierIdGroupe = function(groupeId) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(groupeId).then(function() {
            afficherToast('ID copié dans le presse-papiers !');
        }).catch(function() {
            afficherToast('Erreur lors de la copie');
        });
    } else {
        afficherToast('Copie non supportée par votre navigateur');
    }
};

window.ouvrirModalCreerGroupe = function() {
    state.modalCreerGroupe = true;
    render();
    setTimeout(function() {
        var input = document.getElementById('modal-nom-groupe');
        if (input) input.focus();
    }, 100);
};

window.fermerModalCreerGroupe = function() {
    state.modalCreerGroupe = false;
    render();
};

window.validerCreationGroupe = function() {
    var nom = document.getElementById('modal-nom-groupe').value;
    var password = document.getElementById('modal-password-groupe').value;

    creerGroupe(nom, password).then(function(groupeId) {
        state.modalCreerGroupe = false;
        ouvrirDetailGroupe(groupeId);
    }).catch(function() {
        // Erreur déjà gérée dans creerGroupe
    });
};

window.ouvrirModalRejoindreGroupe = function() {
    state.modalRejoindreGroupe = true;
    render();
    setTimeout(function() {
        var input = document.getElementById('modal-id-groupe');
        if (input) input.focus();
    }, 100);
};

window.fermerModalRejoindreGroupe = function() {
    state.modalRejoindreGroupe = false;
    render();
};

window.validerRejoindreGroupe = function() {
    var groupeId = document.getElementById('modal-id-groupe').value;
    var password = document.getElementById('modal-password-rejoindre').value;

    rejoindreGroupe(groupeId, password).then(function() {
        state.modalRejoindreGroupe = false;
        ouvrirDetailGroupe(groupeId.trim());
    }).catch(function() {
        // Erreur déjà gérée dans rejoindreGroupe
    });
};

window.ouvrirModalMembresGroupe = function() {
    state.modalMembresGroupe = true;
    render();
};

window.fermerModalMembresGroupe = function() {
    state.modalMembresGroupe = false;
    render();
};

window.ouvrirModalGestionGroupe = function() {
    state.modalGestionGroupe = true;
    render();
};

window.fermerModalGestionGroupe = function() {
    state.modalGestionGroupe = false;
    render();
};

window.ouvrirModalPartagerGroupe = function(entree) {
    state.entreeAPartager = entree;
    state.modalPartagerGroupe = true;
    render();
};

window.fermerModalPartagerGroupe = function() {
    state.modalPartagerGroupe = false;
    state.entreeAPartager = null;
    render();
};

window.validerPartageGroupe = function(groupeId) {
    if (state.entreeAPartager) {
        partagerDansGroupe(state.entreeAPartager, groupeId);
    }
};

window.ajouterCommentaireGroupe = function(groupeId, postId) {
    var textarea = document.getElementById('textarea-commentaire-groupe');
    if (textarea && textarea.value.trim()) {
        commenterPostGroupe(groupeId, postId, textarea.value.trim());
    }
};

// Fonction helper pour obtenir le label de catégorie
function getCategorieLabel(categorie) {
    if (!categorie) return 'Autre';
    var labels = {
        'livre': 'Livre',
        'film': 'Film',
        'serie': 'Série',
        'musique': 'Musique',
        'jeu': 'Jeu Vidéo',
        'manga': 'Manga',
        'bd': 'BD',
        'autre': 'Autre'
    };
    return labels[categorie] || categorie;
}
