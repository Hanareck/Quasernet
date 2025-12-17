function renderAmisContenu() {
    var amis = state.amis || [];

    return '<div class="mon-profil-section">' +
            '<h3 class="section-titre">👤 Mon profil</h3>' +
            '<div class="profil-info">' +
                '<div class="profil-item">' +
                    '<span class="profil-label">Pseudo :</span>' +
                    '<span class="profil-value">' + escapeHtml(state.userPseudo || '') + '</span>' +
                '</div>' +
                '<div class="profil-item">' +
                    '<span class="profil-label">Email :</span>' +
                    '<span class="profil-value">' + escapeHtml(state.user?.email || '') + '</span>' +
                '</div>' +
            '</div>' +
            '<p class="code-description">Vos amis peuvent vous trouver avec votre pseudo ou email</p>' +
        '</div>' +
        
        '<div class="ajouter-ami-section">' +
            '<h3 class="section-titre">➕ Ajouter un ami</h3>' +
            '<div class="ajouter-ami-form">' +
                '<input type="text" id="ami-recherche-input" class="input input-ami" placeholder="Pseudo ou email de l\'ami">' +
                '<button class="btn-ajouter-ami" onclick="ajouterAmi()">Ajouter</button>' +
            '</div>' +
        '</div>' +
        
        '<div class="liste-amis-section">' +
            '<h3 class="section-titre">📋 Liste de mes amis (' + amis.length + ')</h3>' +
            (amis.length ? 
                '<div class="amis-liste">' +
                    amis.map(function(ami) {
                        var isSelf = ami.uid === state.user.uid;
                        return '<div class="ami-item">' +
                            '<div class="ami-info">' +
                                '<div class="ami-pseudo">' + escapeHtml(ami.pseudo) + (isSelf ? ' <span style="color:var(--accent-green);font-size:0.85em">(vous)</span>' : '') + '</div>' +
                                '<div class="ami-email">' + escapeHtml(ami.email) + '</div>' +
                            '</div>' +
                            '<div class="ami-actions">' +
                                '<button class="btn-voir-catalogue" onclick="voirCatalogueAmi(\'' + ami.uid + '\', \'' + escapeHtml(ami.pseudo) + '\')">📚 Voir catalogue</button>' +
                                (isSelf ? '' : '<button class="btn-retirer" onclick="retirerAmi(\'' + ami.uid + '\')">❌</button>') +
                            '</div>' +
                        '</div>';
                    }).join('') +
                '</div>'
            : 
                '<div class="vide">' +
                    '<div class="vide-icone">👥</div>' +
                    '<h3>Aucun ami pour le moment</h3>' +
                    '<p>Ajoutez des amis avec leur pseudo ou email pour voir leurs decouvertes !</p>' +
                '</div>'
            ) +
        '</div>';
}

window._paginationCatalogueAmi = {
    limit: 8,
    step: 100
};

window.voirPlusCatalogueAmi = function() {
    window._paginationCatalogueAmi.limit += window._paginationCatalogueAmi.step;
    render();
};

function getCatalogueEntreesFiltrees() {
    if (!state.catalogueAmi) return [];
    
    var entrees = state.catalogueAmi.entrees.slice();
    
    if (state.catalogueFiltreCategorie !== 'tous') {
        entrees = entrees.filter(function(e) {
            return e.categorie === state.catalogueFiltreCategorie;
        });
    }
    
    entrees.sort(function(a, b) {
        switch (state.catalogueTri) {
            case 'date-desc': 
                return new Date(b.dateDecouverte || b.dateCreation) - new Date(a.dateDecouverte || a.dateCreation);
            case 'date-asc': 
                return new Date(a.dateDecouverte || a.dateCreation) - new Date(b.dateDecouverte || b.dateCreation);
            case 'note-desc': 
                return (b.note || 0) - (a.note || 0);
            case 'titre': 
                return a.titre.localeCompare(b.titre);
            case 'likes': 
                return (b.likesCount || 0) - (a.likesCount || 0);
            default: 
                return 0;
        }
    });
    
    return entrees.slice(0, window._paginationCatalogueAmi.limit);
}

function renderCatalogueAmi() {
    if (state.catalogueLoading) {
        return '<div class="catalogue-container">' +
            '<div class="loading-section">' +
                '<div class="loading-spinner">📚</div>' +
                '<p>Chargement du catalogue...</p>' +
            '</div>' +
        '</div>';
    }

    if (!state.catalogueAmi) {
        return '<div class="catalogue-container">' +
            '<div class="vide">' +
                '<div class="vide-icone">❌</div>' +
                '<h3>Catalogue non disponible</h3>' +
                '<button class="btn-action" onclick="setVueSociale(\'amis\')">← Retour aux amis</button>' +
            '</div>' +
        '</div>';
    }
    
    var entrees = getCatalogueEntreesFiltrees();
    var totalEntrees = state.catalogueAmi.entrees.length;
    
    var parCategorie = {};
    state.catalogueAmi.entrees.forEach(function(e) {
        parCategorie[e.categorie] = (parCategorie[e.categorie] || 0) + 1;
    });
    
    var voirPlusBtn = '';
    if (window._paginationCatalogueAmi.limit < totalEntrees) {
        voirPlusBtn = '<button class="btn-ajouter" style="margin:2rem auto 0;display:block;background:var(--accent-blue);" onclick="voirPlusCatalogueAmi()">Voir plus (' + Math.min(window._paginationCatalogueAmi.step, totalEntrees - window._paginationCatalogueAmi.limit) + ')</button>';
    }

    return '<div class="catalogue-container">' +
        '<div class="catalogue-header">' +
            '<div>' +
                '<h2 class="catalogue-titre">📚 Catalogue de ' + escapeHtml(state.catalogueAmi.pseudo) + '</h2>' +
                '<p class="catalogue-subtitle">' + totalEntrees + ' decouverte' + (totalEntrees > 1 ? 's' : '') + ' publique' + (totalEntrees > 1 ? 's' : '') + '</p>' +
            '</div>' +
            '<button class="btn-retour" onclick="setVueSociale(\'amis\')">← Retour aux amis</button>' +
        '</div>' +
        
        (totalEntrees > 0 ? 
            '<div class="catalogue-stats">' +
                Object.entries(CATEGORIES).map(function(entry) {
                    var k = entry[0];
                    var v = entry[1];
                    return parCategorie[k] ? '<span class="catalogue-stat">' + v.icone + ' ' + parCategorie[k] + '</span>' : '';
                }).join('') +
            '</div>' +
            
            '<div class="catalogue-filtres">' +
                '<select class="select-filtre" onchange="setCatalogueFiltreCategorie(this.value)">' +
                    '<option value="tous"' + (state.catalogueFiltreCategorie === 'tous' ? ' selected' : '') + '>Toutes categories</option>' +
                    Object.entries(CATEGORIES).map(function(entry) {
                        var k = entry[0];
                        var v = entry[1];
                        return '<option value="' + k + '"' + (state.catalogueFiltreCategorie === k ? ' selected' : '') + '>' + v.icone + ' ' + v.nom + '</option>';
                    }).join('') +
                '</select>' +
                '<select class="select-filtre" onchange="setCatalogueTri(this.value)">' +
                    '<option value="date-desc"' + (state.catalogueTri === 'date-desc' ? ' selected' : '') + '>Plus recent</option>' +
                    '<option value="date-asc"' + (state.catalogueTri === 'date-asc' ? ' selected' : '') + '>Plus ancien</option>' +
                    '<option value="note-desc"' + (state.catalogueTri === 'note-desc' ? ' selected' : '') + '>Meilleures notes</option>' +
                    '<option value="likes"' + (state.catalogueTri === 'likes' ? ' selected' : '') + '>Plus likes</option>' +
                    '<option value="titre"' + (state.catalogueTri === 'titre' ? ' selected' : '') + '>A - Z</option>' +
                '</select>' +
            '</div>' +
            
            '<div class="catalogue-grille">' +
                entrees.map(function(e) {
                    var estADecouvrir = e.statutLecture === 'A decouvrir';
                    var isLiked = e.likes && e.likes.indexOf(state.user.uid) !== -1;
                    
                    return '<article class="carte carte-ami" onclick="voirDetailAmi(\'' + e.id + '\')">' +
                        '<div class="carte-couverture">' +
                            (e.couverture ? '<img src="' + escapeHtml(e.couverture) + '" class="carte-image">' : '<div class="carte-placeholder">' + (CATEGORIES[e.categorie]?.icone || '✨') + '</div>') +
                            '<div class="carte-badges">' +
                                '<span class="carte-badge">' + (CATEGORIES[e.categorie]?.icone || '✨') + '</span>' +
                                (estADecouvrir ? '<span class="carte-badge a-decouvrir">A decouvrir</span>' : '') +
                            '</div>' +
                        '</div>' +
                        '<div class="carte-contenu">' +
                            '<h3 class="carte-titre">' + escapeHtml(e.titre) + '</h3>' +
                            (e.auteur ? '<p class="carte-auteur">' + escapeHtml(e.auteur) + '</p>' : '') +
                            (e.genre ? '<p class="carte-genre">' + escapeHtml(e.genre) + '</p>' : '') +
                            '<div class="carte-meta">' +
                                (!estADecouvrir ? '<div class="etoiles etoiles-small">' + renderEtoiles(e.note || 0) + '</div>' : '<span></span>') +
                                (!estADecouvrir && e.dateDecouverte ? '<span class="carte-date">' + formatDateCourte(e.dateDecouverte) + '</span>' : '') +
                            '</div>' +
                            '<div class="carte-social">' +
                                '<span class="carte-likes' + (isLiked ? ' liked' : '') + '">❤️ ' + (e.likesCount || 0) + '</span>' +
                                '<span class="carte-comments">💬 ' + (e.commentaires?.length || 0) + '</span>' +
                            '</div>' +
                        '</div>' +
                    '</article>';
                }).join('') +
                voirPlusBtn +
            '</div>'
        : 
            '<div class="vide">' +
                '<div class="vide-icone">📭</div>' +
                '<h3>Aucune decouverte publique</h3>' +
                '<p>Cet ami n\'a pas encore publie de decouvertes ou elles sont toutes privees.</p>' +
            '</div>'
        ) +
    '</div>';
}

function renderDetailAmi() {
    var e = state.entreeAmiSelectionnee;
    if (!e) return '';
    
    var estADecouvrir = e.statutLecture === 'A decouvrir';
    var isLiked = e.likes && e.likes.indexOf(state.user.uid) !== -1;
    var ownerId = state.catalogueAmi ? state.catalogueAmi.uid : e.ownerId;
    var ownerPseudo = state.catalogueAmi ? state.catalogueAmi.pseudo : e.ownerPseudo;
    
    var statutsPossession = Array.isArray(e.statutPossession) ? e.statutPossession : (e.statutPossession ? [e.statutPossession] : []);
    
    return '<div class="detail-container">' +
        '<div class="detail-header">' +
            '<button class="btn-retour" onclick="retourCatalogue()">← Retour</button>' +
            '<div class="detail-owner">Catalogue de ' + escapeHtml(ownerPseudo || '') + '</div>' +
        '</div>' +
        '<div class="detail-content">' +
            '<div class="detail-couverture">' +
                (e.couverture ? '<img src="' + escapeHtml(e.couverture) + '" class="detail-image">' : '<div class="detail-placeholder">' + (CATEGORIES[e.categorie]?.icone || '✨') + '</div>') +
            '</div>' +
            '<div class="detail-info">' +
                '<div class="detail-badges">' +
                    '<span class="badge">' + (CATEGORIES[e.categorie]?.icone || '✨') + ' ' + (CATEGORIES[e.categorie]?.nom || 'Autre') + '</span>' +
                    (e.genre ? '<span class="badge">' + escapeHtml(e.genre) + '</span>' : '') +
                    (estADecouvrir ? '<span class="badge a-decouvrir">A decouvrir</span>' : '') +
                    statutsPossession.map(function(s) {
                        if (s === 'A acheter') return '<span class="badge a-acheter">A acheter</span>';
                        if (s === 'Streaming') return '<span class="badge streaming">🎧 Streaming</span>';
                        return '';
                    }).join('') +
                '</div>' +
                
                '<h2 class="detail-titre">' + escapeHtml(e.titre) + '</h2>' +
                (e.auteur ? '<p class="detail-auteur">par ' + escapeHtml(e.auteur) + '</p>' : '') +
                
                (!estADecouvrir ? 
                    '<div class="detail-meta">' +
                        '<div class="etoiles">' + renderEtoiles(e.note || 0) + '</div>' +
                        (e.dateDecouverte ? '<span class="detail-date">' + formatDate(e.dateDecouverte) + '</span>' : '') +
                    '</div>'
                : '') +
                
                (e.critique ? 
                    '<div class="detail-critique">' +
                        '<h3 class="critique-label">Critique de ' + escapeHtml(ownerPseudo || '') + '</h3>' +
                        '<p class="critique-texte">' + escapeHtml(e.critique) + '</p>' +
                    '</div>'
                : '') +
                
                '<div class="social-section">' +
                    '<div class="like-section">' +
                        '<button class="btn-like' + (isLiked ? ' liked' : '') + '" onclick="event.stopPropagation(); likerEntreeAmi(\'' + ownerId + '\', \'' + e.id + '\')">' +
                            (isLiked ? '❤️' : '🤍') + ' ' + (e.likesCount || 0) + ' like' + ((e.likesCount || 0) > 1 ? 's' : '') +
                        '</button>' +
                    '</div>' +
                    
                    '<div class="commentaires-section">' +
                        '<h3 class="commentaires-titre">💬 Commentaires (' + (e.commentaires?.length || 0) + ')</h3>' +
                        '<div class="commentaire-form">' +
                            '<input type="text" id="commentaire-input-' + e.id + '" class="commentaire-input" placeholder="Ajouter un commentaire...">' +
                            '<button class="commentaire-btn" onclick="envoyerCommentaireAmi(\'' + ownerId + '\', \'' + e.id + '\')">Envoyer</button>' +
                        '</div>' +
                        '<div class="commentaires-liste">' +
                            (e.commentaires && e.commentaires.length > 0 ? 
                                e.commentaires.map(function(c) {
                                    var canDelete = c.userId === state.user.uid;
                                    return '<div class="commentaire">' +
                                        '<div class="commentaire-header">' +
                                            '<span class="commentaire-pseudo">' + escapeHtml(c.pseudo) + '</span>' +
                                            '<span class="commentaire-date">' + formatDateCourte(c.date) + '</span>' +
                                            (canDelete ? '<button class="commentaire-btn" style="margin-left:1rem;background:var(--danger-bg);color:var(--danger-text);border:none;padding:0.2rem 0.7rem;border-radius:6px;cursor:pointer;" onclick="supprimerCommentaireAmi(\'' + ownerId + '\', \'' + e.id + '\', \'' + c.id + '\')">Supprimer</button>' : '') +
                                        '</div>' +
                                        '<p class="commentaire-texte">' + escapeHtml(c.texte) + '</p>' +
                                    '</div>';
                                }).join('')
                            : '<p class="no-commentaires">Aucun commentaire. Soyez le premier !</p>') +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
}
