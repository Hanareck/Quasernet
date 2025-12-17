function renderListe(entrees) {
    var genres = getGenresDisponibles();
    var tagsDisponibles = getTagsDisponibles();

    // Compter les filtres actifs
    var nbFiltresActifs = state.filtreNotes.length + state.filtreGenres.length +
                          state.filtreTags.length + state.filtreStatutsLecture.length +
                          state.filtreStatutsPossession.length;

    // NIVEAU 1 : Barre d'outils principale
    var html = '<div class="barre-outils-principale">' +
        '<div class="recherche"><span class="recherche-icone">🔍</span><input type="text" class="recherche-input" placeholder="Rechercher..." value="' + escapeHtml(state.recherche) + '" oninput="setRecherche(this.value)"></div>' +
        '<button class="btn-filtres ' + (state.panneauFiltresOuvert ? 'actif' : '') + '" onclick="togglePanneauFiltres()">' +
            '🎯 Filtres' + (nbFiltresActifs > 0 ? ' <span class="badge-count">' + nbFiltresActifs + '</span>' : '') +
        '</button>' +
        '<select class="select-tri" onchange="setTri(this.value)">' +
            '<option value="date-desc"' + (state.tri === 'date-desc' ? ' selected' : '') + '>⬇️ Récent</option>' +
            '<option value="date-asc"' + (state.tri === 'date-asc' ? ' selected' : '') + '>⬆️ Ancien</option>' +
            '<option value="note-desc"' + (state.tri === 'note-desc' ? ' selected' : '') + '>⭐ Note ↓</option>' +
            '<option value="titre"' + (state.tri === 'titre' ? ' selected' : '') + '>🔤 A-Z</option>' +
        '</select>' +
        '<button class="btn-mode-selection ' + (state.modeSelection ? 'actif' : '') + '" onclick="toggleModeSelection()">' +
            (state.modeSelection ? '✓ Terminer' : '✏️ Édition') +
        '</button>' +
        '<button class="btn-vue ' + (state.modeAffichage === 'grille' ? 'actif' : '') + '" onclick="setModeAffichage(\'grille\')">▦</button>' +
        '<button class="btn-vue ' + (state.modeAffichage === 'liste' ? 'actif' : '') + '" onclick="setModeAffichage(\'liste\')">☰</button>' +
    '</div>';

    // NIVEAU 2 : Panneau de filtres (collapsible)
    if (state.panneauFiltresOuvert) {
        html += '<div class="panneau-filtres">' +
            '<div class="panneau-filtres-content">' +
                // Section Notes
                '<div class="filtre-section">' +
                    '<div class="filtre-section-titre">Note</div>' +
                    '<div class="filtre-section-options">' +
                        [5, 4, 3, 2, 1].map(function(n) {
                            var isActive = state.filtreNotes.indexOf(n) !== -1;
                            return '<button class="filtre-option-btn ' + (isActive ? 'actif' : '') + '" onclick="toggleFiltreNote(' + n + ')">' +
                                '★'.repeat(n) +
                            '</button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                // Section Genres
                (genres.length > 0 ?
                '<div class="filtre-section">' +
                    '<div class="filtre-section-titre">Genre</div>' +
                    '<div class="filtre-section-options">' +
                        genres.map(function(g) {
                            var isActive = state.filtreGenres.indexOf(g) !== -1;
                            return '<button class="filtre-option-btn ' + (isActive ? 'actif' : '') + '" onclick="toggleFiltreGenre(\'' + escapeHtml(g) + '\')">' +
                                escapeHtml(g) +
                            '</button>';
                        }).join('') +
                    '</div>' +
                '</div>'
                : '') +
                // Section Statut de lecture
                '<div class="filtre-section">' +
                    '<div class="filtre-section-titre">Statut</div>' +
                    '<div class="filtre-section-options">' +
                        STATUTS_LECTURE.map(function(s) {
                            var isActive = state.filtreStatutsLecture.indexOf(s) !== -1;
                            return '<button class="filtre-option-btn ' + (isActive ? 'actif' : '') + '" onclick="toggleFiltreStatutLecture(\'' + escapeHtml(s) + '\')">' +
                                escapeHtml(s) +
                            '</button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                // Section Possession
                '<div class="filtre-section">' +
                    '<div class="filtre-section-titre">Possession</div>' +
                    '<div class="filtre-section-options">' +
                        STATUTS_POSSESSION.map(function(s) {
                            var isActive = state.filtreStatutsPossession.indexOf(s) !== -1;
                            return '<button class="filtre-option-btn ' + (isActive ? 'actif' : '') + '" onclick="toggleFiltreStatutPossession(\'' + escapeHtml(s) + '\')">' +
                                escapeHtml(s) +
                            '</button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                // Section Tags
                (tagsDisponibles.length > 0 ?
                '<div class="filtre-section">' +
                    '<div class="filtre-section-header">' +
                        '<div class="filtre-section-titre">Tags</div>' +
                        (state.filtreTags.length > 0 ?
                            '<div class="toggle-tags-mode">' +
                                '<button class="toggle-mode-btn ' + (state.filtreTagsMode === 'ET' ? 'actif' : '') + '" onclick="toggleFiltreTagsMode()" title="Filtrer les entrées qui ont TOUS les tags sélectionnés">ET</button>' +
                                '<button class="toggle-mode-btn ' + (state.filtreTagsMode === 'OU' ? 'actif' : '') + '" onclick="toggleFiltreTagsMode()" title="Filtrer les entrées qui ont AU MOINS UN des tags sélectionnés">OU</button>' +
                            '</div>'
                        : '') +
                    '</div>' +
                    '<div class="recherche-tag-panneau">' +
                        '<span class="recherche-icone">🔍</span>' +
                        '<input type="text" class="recherche-tag-input" placeholder="Rechercher un tag..." value="' + escapeHtml(state.rechercheTag) + '" oninput="setRechercheTag(this.value);resetTagsPage()">' +
                    '</div>' +
                    '<div class="filtre-section-options">' +
                        (function() {
                            var tagsFiltres = state.rechercheTag ?
                                tagsDisponibles.filter(function(tag) {
                                    return tag.toLowerCase().includes(state.rechercheTag.toLowerCase());
                                }) : tagsDisponibles;
                            var tagsParPage = 20;
                            var debut = state.tagsPage * tagsParPage;
                            var fin = debut + tagsParPage;
                            var tagsAffichees = tagsFiltres.slice(debut, fin);
                            var restants = tagsFiltres.length - fin;

                            return tagsAffichees.map(function(tag) {
                                var isActive = state.filtreTags.indexOf(tag) !== -1;
                                return '<button class="filtre-option-btn ' + (isActive ? 'actif' : '') + '" onclick="toggleFiltreTag(\'' + escapeHtml(tag) + '\')">' +
                                    escapeHtml(tag) +
                                '</button>';
                            }).join('') +
                            (restants > 0 ? '<button class="btn-voir-plus-tags" onclick="voirPlusTags()">Voir ' + restants + ' tag' + (restants > 1 ? 's' : '') + ' de plus...</button>' : '') +
                            (state.tagsPage > 0 ? '<button class="btn-voir-moins-tags" onclick="resetTagsPage()">Retour au début</button>' : '');
                        })() +
                    '</div>' +
                '</div>'
                : '') +
                // Bouton réinitialiser
                (nbFiltresActifs > 0 ?
                    '<button class="btn-reinitialiser-filtres" onclick="reinitialiserFiltres()">Réinitialiser tous les filtres</button>'
                : '') +
            '</div>' +
        '</div>';
    }

    // NIVEAU 3 : Filtres actifs (badges)
    if (nbFiltresActifs > 0) {
        html += '<div class="filtres-actifs">' +
            '<span class="filtres-actifs-label">Filtres actifs :</span>' +
            state.filtreNotes.map(function(n) {
                return '<span class="filtre-actif-badge" onclick="retirerFiltre(\'note\', ' + n + ')">' +
                    '★'.repeat(n) + ' ×' +
                '</span>';
            }).join('') +
            state.filtreGenres.map(function(g) {
                return '<span class="filtre-actif-badge" onclick="retirerFiltre(\'genre\', \'' + escapeHtml(g) + '\')">' +
                    escapeHtml(g) + ' ×' +
                '</span>';
            }).join('') +
            state.filtreStatutsLecture.map(function(s) {
                return '<span class="filtre-actif-badge" onclick="retirerFiltre(\'statutLecture\', \'' + escapeHtml(s) + '\')">' +
                    escapeHtml(s) + ' ×' +
                '</span>';
            }).join('') +
            state.filtreStatutsPossession.map(function(s) {
                return '<span class="filtre-actif-badge" onclick="retirerFiltre(\'statutPossession\', \'' + escapeHtml(s) + '\')">' +
                    escapeHtml(s) + ' ×' +
                '</span>';
            }).join('') +
            state.filtreTags.map(function(t) {
                return '<span class="filtre-actif-badge" onclick="retirerFiltre(\'tag\', \'' + escapeHtml(t) + '\')">' +
                    escapeHtml(t) + ' ×' +
                '</span>';
            }).join('') +
            '<button class="btn-tout-effacer" onclick="reinitialiserFiltres()">Tout effacer</button>' +
        '</div>';
    }

    // Barre d'actions en mode edition
    if (state.modeSelection && state.entreesSelectionnees.length > 0) {
        html += '<div class="barre-actions-selection">' +
            '<div class="selection-header">' +
                '<span class="selection-count">' + state.entreesSelectionnees.length + ' entree(s) selectionnee(s)</span>' +
                '<div class="actions-edition-group">' +
                    '<button class="btn-action-edition" onclick="ouvrirMenuStatutSelection()">📋 Changer statut</button>' +
                    '<button class="btn-action-edition" onclick="ouvrirMenuPossessionSelection()">📦 Modifier possession</button>' +
                    '<button class="btn-action-edition" onclick="ouvrirDialogueTagsSelection()">🏷️ Ajouter des tags</button>' +
                    '<button class="btn-action-edition btn-action-danger" onclick="supprimerSelection()">🗑️ Supprimer</button>' +
                '</div>' +
                '<button class="btn-annuler-selection" onclick="deselectionnerTout()">Annuler</button>' +
            '</div>' +
            '<div class="selection-liste-preview">' +
                state.entreesSelectionnees.map(function(id) {
                    var entree = state.entrees.find(function(e) { return e.id === id; });
                    if (!entree) return '';
                    return '<div class="selection-preview-item">' +
                        '<div class="preview-content">' +
                            '<span class="preview-titre">' + escapeHtml(entree.titre) + '</span>' +
                            (entree.auteur ? '<span class="preview-auteur">' + escapeHtml(entree.auteur) + '</span>' : '') +
                        '</div>' +
                        '<button class="preview-remove" onclick="retirerDeLaSelection(\'' + id + '\')" title="Retirer de la sélection">×</button>' +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>';
    }

    if (!entrees.length) {
        html += '<div class="vide"><div class="vide-icone">🔭</div><h3>Aucune entree</h3><p>' + (state.recherche || nbFiltresActifs > 0 ? 'Modifiez vos filtres' : 'Ajoutez votre premiere decouverte !') + '</p></div>';
    } else if (state.modeAffichage === 'liste') {
        html += '<div class="liste">' + entrees.map(function(e) {
            var estADecouvrir = e.statutLecture === 'A decouvrir';
            var statutsPossession = Array.isArray(e.statutPossession) ? e.statutPossession : (e.statutPossession ? [e.statutPossession] : []);
            var estSelectionnee = state.entreesSelectionnees.indexOf(e.id) > -1;

            return '<article class="liste-item ' + (estSelectionnee ? 'selectionnee' : '') + '" tabindex="0" aria-label="Voir la fiche de ' + escapeHtml(e.titre) + (e.auteur ? ' de ' + escapeHtml(e.auteur) : '') + '" onclick="voirDetail(\'' + e.id + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();voirDetail(\'' + e.id + '\');}">' +
                (state.modeSelection ?
                    '<div class="checkbox-container" onclick="event.stopPropagation();toggleSelectionEntree(\'' + e.id + '\')">' +
                        '<input type="checkbox" ' + (estSelectionnee ? 'checked' : '') + '>' +
                    '</div>'
                : '') +
                '<div class="liste-couverture">' +
                    (e.couverture ? '<img src="' + escapeHtml(e.couverture) + '" alt="Couverture de ' + escapeHtml(e.titre) + (e.auteur ? ' de ' + escapeHtml(e.auteur) : '') + '">' : '<div class="liste-couverture-placeholder" aria-hidden="true">' + (CATEGORIES[e.categorie]?.icone || '✨') + '</div>') +
                '</div>' +
                '<div class="liste-info"><div class="liste-titre">' + escapeHtml(e.titre) + '</div><div class="liste-auteur">' + (e.auteur ? escapeHtml(e.auteur) : '—') + '</div>' +
                // Liens streaming pour musique
                (e.categorie === 'musique' && (e.lienSpotify || e.lienDeezer || e.lienQobuz) ?
                    '<div class="streaming-links-synth">' +
                        (e.lienSpotify ? '<a href="' + escapeHtml(e.lienSpotify) + '" class="btn-streaming btn-spotify" target="_blank" rel="noopener" aria-label="Écouter sur Spotify" onclick="event.stopPropagation()">Spotify</a>' : '') +
                        (e.lienDeezer ? '<a href="' + escapeHtml(e.lienDeezer) + '" class="btn-streaming btn-deezer" target="_blank" rel="noopener" aria-label="Écouter sur Deezer" onclick="event.stopPropagation()">Deezer</a>' : '') +
                        (e.lienQobuz ? '<a href="' + escapeHtml(e.lienQobuz) + '" class="btn-streaming btn-qobuz" target="_blank" rel="noopener" aria-label="Écouter sur Qobuz" onclick="event.stopPropagation()">Qobuz</a>' : '') +
                    '</div>' : ''
                ) +
                '</div>' +
                (e.prive
                    ? '<button class="carte-badge prive clickable liste-badge-prive" onclick="event.stopPropagation();togglePriveEntree(\'' + e.id + '\')" title="Cliquer pour rendre public">🔒</button>'
                    : '<button class="carte-badge public clickable liste-badge-public" onclick="event.stopPropagation();togglePriveEntree(\'' + e.id + '\')" title="Cliquer pour rendre prive">🌐</button>') +
                (!estADecouvrir ? '<div class="liste-note"><div class="etoiles etoiles-small">' + renderEtoiles(e.note || 0) + '</div></div>' : '<div class="liste-note"></div>') +
                (e.statutLecture === 'A decouvrir' ? '<span class="carte-badge a-decouvrir">A decouvrir</span>' : '') +
                (e.statutLecture === 'A redecouvrir' ? '<span class="carte-badge a-redecouvrir">↻ A redecouvrir</span>' : '') +
                (e.statutLecture === 'En cours de decouverte' ? '<span class="carte-badge en-cours">📖 En cours</span>' : '') +
                statutsPossession.map(function(s) {
                    if (s === 'Emprunte') return '<span class="liste-badge emprunte">Emprunte</span>';
                    if (s === 'Streaming') return '<span class="carte-badge streaming">🎧</span>';
                    if (s === 'Possede') return '';
                    return '<span class="liste-badge statut-possession">' + s + '</span>';
                }).join('') +
                (!estADecouvrir && e.dateDecouverte ? '<span class="liste-date">' + formatDateCourte(e.dateDecouverte) + '</span>' : '<span></span>') +
            '</article>';
        }).join('') + '</div>';

        // Pagination
        var totalEntrees = getEntreesFiltrees().length;
        if (totalEntrees > window._pagination.limit) {
            html += '<div style="text-align:center;margin-top:1.5rem;"><button class="btn-voir-plus" onclick="voirPlusEntrees()">Voir plus (' + (totalEntrees - window._pagination.limit) + ' restantes)</button></div>';
        }
    } else {
        html += '<div class="grille">' + entrees.map(function(e) {
            var estADecouvrir = e.statutLecture === 'A decouvrir';
            var statutsPossession = Array.isArray(e.statutPossession) ? e.statutPossession : (e.statutPossession ? [e.statutPossession] : []);
            var genres = Array.isArray(e.genres) ? e.genres : (e.genre ? [e.genre] : []);
            var tags = Array.isArray(e.tags) ? e.tags : [];
            var genresEtTags = genres.concat(tags);
            var estSelectionnee = state.entreesSelectionnees.indexOf(e.id) > -1;

            return '<article class="carte ' + (estSelectionnee ? 'selectionnee' : '') + '" tabindex="0" aria-label="Voir la fiche de ' + escapeHtml(e.titre) + (e.auteur ? ' de ' + escapeHtml(e.auteur) : '') + '" onclick="voirDetail(\'' + e.id + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();voirDetail(\'' + e.id + '\');}">' +
                (state.modeSelection ?
                    '<div class="checkbox-container" onclick="event.stopPropagation();toggleSelectionEntree(\'' + e.id + '\')">' +
                        '<input type="checkbox" ' + (estSelectionnee ? 'checked' : '') + '>' +
                    '</div>'
                : '') +
                '<div class="carte-couverture">' +
                    (e.couverture ? '<img src="' + escapeHtml(e.couverture) + '" class="carte-image" alt="Couverture de ' + escapeHtml(e.titre) + (e.auteur ? ' de ' + escapeHtml(e.auteur) : '') + '">' : '<div class="carte-placeholder" aria-hidden="true">' + (CATEGORIES[e.categorie]?.icone || '✨') + '</div>') +
                    (e.prive
                        ? '<button class="carte-badge prive clickable" onclick="event.stopPropagation();togglePriveEntree(\'' + e.id + '\')" title="Cliquer pour rendre public">🔒</button>'
                        : '<button class="carte-badge public clickable" onclick="event.stopPropagation();togglePriveEntree(\'' + e.id + '\')" title="Cliquer pour rendre prive">🌐</button>') +
                    '<div class="carte-badges">' +
                        (e.statutLecture === 'A decouvrir' ? '<span class="carte-badge a-decouvrir">A decouvrir</span>' : '') +
                        (e.statutLecture === 'A redecouvrir' ? '<span class="carte-badge a-redecouvrir">↻</span>' : '') +
                        (e.statutLecture === 'En cours de decouverte' ? '<span class="carte-badge en-cours">📖</span>' : '') +
                        statutsPossession.map(function(s) {
                            if (s === 'A acheter') return '<span class="carte-badge a-acheter">A acheter</span>';
                            if (s === 'A vendre') return '<span class="carte-badge a-vendre">A vendre</span>';
                            if (s === 'Emprunte') return '<span class="carte-badge emprunte">Emprunte</span>';
                            if (s === 'Streaming') return '<span class="carte-badge streaming">🎧</span>';
                            return '';
                        }).join('') +
                    '</div>' +
                '</div>' +
                '<div class="carte-contenu">' +
                    '<h3 class="carte-titre">' + escapeHtml(e.titre) + '</h3>' +
                    (e.auteur ? '<p class="carte-auteur">' + escapeHtml(e.auteur) + '</p>' : '') +
                    (genresEtTags.length > 0 ? '<div class="carte-genres">' +
                        genres.slice(0, 4).map(function(g) { return '<span class="carte-genre-tag">' + escapeHtml(g) + '</span>'; }).join(' ') +
                        (genres.length < 4 ? tags.slice(0, 4 - genres.length).map(function(t) { return '<span class="carte-tag-tag">' + escapeHtml(t) + '</span>'; }).join(' ') : '') +
                        (genresEtTags.length > 4 ? ' <span class="carte-genre-tag">+' + (genresEtTags.length - 4) + '</span>' : '') +
                    '</div>' : '') +
                    // Liens streaming pour musique
                    (e.categorie === 'musique' && (e.lienSpotify || e.lienDeezer || e.lienQobuz) ?
                        '<div class="streaming-links-synth">' +
                            (e.lienSpotify ? '<a href="' + escapeHtml(e.lienSpotify) + '" class="btn-streaming btn-spotify" target="_blank" rel="noopener" aria-label="Écouter sur Spotify" onclick="event.stopPropagation()">Spotify</a>' : '') +
                            (e.lienDeezer ? '<a href="' + escapeHtml(e.lienDeezer) + '" class="btn-streaming btn-deezer" target="_blank" rel="noopener" aria-label="Écouter sur Deezer" onclick="event.stopPropagation()">Deezer</a>' : '') +
                            (e.lienQobuz ? '<a href="' + escapeHtml(e.lienQobuz) + '" class="btn-streaming btn-qobuz" target="_blank" rel="noopener" aria-label="Écouter sur Qobuz" onclick="event.stopPropagation()">Qobuz</a>' : '') +
                        '</div>' : ''
                    ) +
                    '<div class="carte-meta">' +
                        (!estADecouvrir ? '<div class="etoiles etoiles-small">' + renderEtoiles(e.note || 0) + '</div>' : '<span></span>') +
                        (!estADecouvrir && e.dateDecouverte ? '<span class="carte-date">' + formatDateCourte(e.dateDecouverte) + '</span>' : '') +
                    '</div>' +
                '</div>' +
            '</article>';
        }).join('') + '</div>';

        // Pagination
        var totalEntrees = getEntreesFiltrees().length;
        if (totalEntrees > window._pagination.limit) {
            html += '<div style="text-align:center;margin-top:1.5rem;"><button class="btn-voir-plus" onclick="voirPlusEntrees()">Voir plus (' + (totalEntrees - window._pagination.limit) + ' restantes)</button></div>';
        }
    }
    return html;
}

// Pas de modification nécessaire ici, le paramètre "entrees" est déjà paginé.
