function renderFormulaire() {
    var f = state.formulaire;
    var estADecouvrir = f.statutLecture === 'A decouvrir';
    var estEnCours = f.statutLecture === 'En cours de decouverte';
    var cacherDates = estADecouvrir || estEnCours;
    var statutsPossession = Array.isArray(f.statutPossession) ? f.statutPossession : (f.statutPossession ? [f.statutPossession] : []);
    var estEmprunte = statutsPossession.indexOf('Emprunte') !== -1;
    var modeRapide = state.modeAjoutRapide && !state.modeEdition;

    // Liens streaming condensés pour musique + bouton de recherche automatique
    var liensStreaming = '';
    if (f.categorie === 'musique') {
        liensStreaming = '<div class="streaming-links-form">' +
            '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.3rem;">' +
                '<span style="font-weight:600;">Liens streaming</span>' +
                '<button type="button" class="btn-streaming-search" title="Trouver automatiquement les liens streaming" onclick="rechercherLiensStreaming()" aria-label="Trouver automatiquement les liens streaming">🔎</button>' +
            '</div>' +
            '<label class="label" for="form-lien-spotify">Spotify</label>' +
            '<input id="form-lien-spotify" type="url" class="input" placeholder="https://open.spotify.com/..." value="' + escapeHtml(f.lienSpotify || '') + '" onchange="updateForm(\'lienSpotify\',this.value)" autocomplete="off">' +
            '<label class="label" for="form-lien-deezer">Deezer</label>' +
            '<input id="form-lien-deezer" type="url" class="input" placeholder="https://www.deezer.com/..." value="' + escapeHtml(f.lienDeezer || '') + '" onchange="updateForm(\'lienDeezer\',this.value)" autocomplete="off">' +
            '<label class="label" for="form-lien-qobuz">Qobuz</label>' +
            '<input id="form-lien-qobuz" type="url" class="input" placeholder="https://www.qobuz.com/..." value="' + escapeHtml(f.lienQobuz || '') + '" onchange="updateForm(\'lienQobuz\',this.value)" autocomplete="off">' +
        '</div>';
    }

    return '<form class="formulaire-container" aria-label="' + (state.modeEdition ? 'Modifier une découverte' : 'Nouvelle découverte') + '">' +
        '<div class="formulaire-header">' +
            '<h2 class="formulaire-titre" id="form-titre">' + (state.modeEdition ? 'Modifier' : (modeRapide ? 'Ajout rapide' : 'Nouvelle découverte')) + '</h2>' +
            '<div class="formulaire-header-actions">' +
                '<button class="btn-fermer" type="button" aria-label="Fermer le formulaire" onclick="fermerFormulaire()">✕</button>' +
            '</div>' +
        '</div>' +
        '<div class="formulaire-grid">' +
            '<div class="couverture-section">' +
                '<div class="couverture-preview">' +
                    (f.couverture
                        ? '<img src="' + escapeHtml(f.couverture) + '" class="couverture-image" alt="Couverture de ' + escapeHtml(f.titre || '') + (f.auteur ? ' de ' + escapeHtml(f.auteur) : '') + '" onerror="this.style.display=\'none\'">'
                        : '<div class="couverture-placeholder" aria-hidden="true"><span>' + (CATEGORIES[f.categorie]?.icone || '✨') + '</span><span>Couverture</span></div>'
                    ) +
                '</div>' +
                '<button class="btn-recherche-couverture" type="button" onclick="rechercherCouverture()" aria-label="Chercher une couverture"' + (state.rechercheCouverture ? ' disabled' : '') + '>' + (state.rechercheCouverture ? 'Recherche...' : '🔍 Chercher') + '</button>' +
                '<label for="form-couverture" class="sr-only">URL de l\'image de couverture</label>' +
                '<input id="form-couverture" type="text" class="input-url" placeholder="URL image..." value="' + escapeHtml(f.couverture) + '" onchange="updateForm(\'couverture\',this.value)" autocomplete="off">' +
                liensStreaming +
            '</div>' +
            '<div class="champs-section">' +
                '<div class="champ-groupe">' +
                    '<label class="label" id="label-categorie">Catégorie</label>' +
                    '<div class="categorie-buttons" role="group" aria-labelledby="label-categorie">' +
                        Object.entries(CATEGORIES).map(function(entry) {
                            var k = entry[0];
                            var v = entry[1];
                            return '<button type="button" class="categorie-btn ' + (f.categorie === k ? 'actif' : '') + '" aria-pressed="' + (f.categorie === k ? 'true' : 'false') + '" onclick="updateForm(\'categorie\',\'' + k + '\');updateForm(\'genre\',\'\');render()"><span class="icone" aria-hidden="true">' + v.icone + '</span>' + v.nom + '</button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                '<div class="champ-groupe">' +
                    '<label class="label" for="form-titre-input">Titre *</label>' +
                    '<div style="display:flex;align-items:center;gap:0.5rem;">' +
                        '<input id="form-titre-input" type="text" class="input" style="flex:1" value="' + escapeHtml(f.titre) + '" placeholder="Titre..." onchange="updateForm(\'titre\',this.value)" required autocomplete="off">' +
                        (f.categorie === 'livre' ?
                            '<button type="button" class="btn-openlibrary-search" title="Rechercher dans Open Library" onclick="rechercherDansOpenLibrary()" aria-label="Rechercher dans Open Library" ' + (state.rechercheOpenLibrary ? 'disabled' : '') + '>' + (state.rechercheOpenLibrary ? '...' : '🔍') + '</button>'
                        : '') +
                        (f.categorie === 'film' || f.categorie === 'autre' ?
                            '<button type="button" class="btn-openlibrary-search" title="Rechercher dans OMDB" onclick="rechercherDansOMDB()" aria-label="Rechercher dans OMDB" ' + (state.rechercheOMDB ? 'disabled' : '') + '>' + (state.rechercheOMDB ? '...' : '🔍') + '</button>'
                        : '') +
                        (f.categorie === 'musique' ?
                            '<button type="button" class="btn-openlibrary-search" title="Rechercher dans iTunes" onclick="rechercherDansItunes()" aria-label="Rechercher dans iTunes" ' + (state.rechercheItunes ? 'disabled' : '') + '>' + (state.rechercheItunes ? '...' : '🔍') + '</button>'
                        : '') +
                        (f.categorie === 'youtube' ?
                            '<button type="button" class="btn-openlibrary-search" title="Rechercher sur YouTube" onclick="rechercherDansYoutube()" aria-label="Rechercher sur YouTube" ' + (state.rechercheYoutube ? 'disabled' : '') + '>' + (state.rechercheYoutube ? '...' : '🔍') + '</button>'
                        : '') +
                    '</div>' +
                '</div>' +
                '<div class="champ-groupe">' +
                    '<label class="label" for="form-auteur-input">' + (f.categorie === 'youtube' ? 'Chaîne YouTube' : 'Auteur / Artiste') + '</label>' +
                    '<input id="form-auteur-input" type="text" class="input" value="' + escapeHtml(f.auteur) + '" placeholder="' + (f.categorie === 'youtube' ? 'Nom de la chaîne...' : 'Auteur...') + '" onchange="updateForm(\'auteur\',this.value)" autocomplete="off">' +
                '</div>' +
                (f.categorie === 'livre' && state.dropdownOpenLibraryVisible && state.resultatsOpenLibrary.length > 0 ?
                    '<div class="openlibrary-dropdown">' +
                        state.resultatsOpenLibrary.map(function(result, index) {
                            return '<div class="openlibrary-result-item" onclick="selectionnerResultatOpenLibrary(' + index + ')" tabindex="0" role="button">' +
                                '<div class="openlibrary-result-cover">' +
                                    (result.cover_url
                                        ? '<img src="' + escapeHtml(result.cover_url) + '" alt="Couverture" onerror="this.style.display=\'none\'">'
                                        : '<div class="openlibrary-result-placeholder">📚</div>'
                                    ) +
                                '</div>' +
                                '<div class="openlibrary-result-info">' +
                                    '<div class="openlibrary-result-title">' + escapeHtml(result.title) + '</div>' +
                                    (result.author ? '<div class="openlibrary-result-author">' + escapeHtml(result.author) + '</div>' : '') +
                                    (result.year ? '<div class="openlibrary-result-year">' + result.year + '</div>' : '') +
                                '</div>' +
                            '</div>';
                        }).join('') +
                    '</div>'
                : '') +
                (f.categorie === 'livre' && state.dropdownOpenLibraryVisible && state.resultatsOpenLibrary.length === 0 && !state.rechercheOpenLibrary ?
                    '<div class="openlibrary-dropdown-empty">Aucun resultat trouve</div>'
                : '') +
                ((f.categorie === 'film' || f.categorie === 'autre') && state.dropdownOMDBVisible && state.resultatsOMDB.length > 0 ?
                    '<div class="openlibrary-dropdown">' +
                        state.resultatsOMDB.map(function(result, index) {
                            return '<div class="openlibrary-result-item" onclick="selectionnerResultatOMDB(' + index + ')" tabindex="0" role="button">' +
                                '<div class="openlibrary-result-cover">' +
                                    (result.cover_url
                                        ? '<img src="' + escapeHtml(result.cover_url) + '" alt="Poster" onerror="this.style.display=\'none\'">'
                                        : '<div class="openlibrary-result-placeholder">🎬</div>'
                                    ) +
                                '</div>' +
                                '<div class="openlibrary-result-info">' +
                                    '<div class="openlibrary-result-title">' + escapeHtml(result.title) + '</div>' +
                                    (result.author ? '<div class="openlibrary-result-author">' + escapeHtml(result.author) + '</div>' : '') +
                                    (result.year ? '<div class="openlibrary-result-year">' + result.year + '</div>' : '') +
                                '</div>' +
                            '</div>';
                        }).join('') +
                    '</div>'
                : '') +
                ((f.categorie === 'film' || f.categorie === 'autre') && state.dropdownOMDBVisible && state.resultatsOMDB.length === 0 && !state.rechercheOMDB ?
                    '<div class="openlibrary-dropdown-empty">Aucun resultat trouve</div>'
                : '') +
                (f.categorie === 'musique' && state.dropdownItunesVisible && state.resultatsItunes.length > 0 ?
                    '<div class="openlibrary-dropdown">' +
                        state.resultatsItunes.map(function(result, index) {
                            return '<div class="openlibrary-result-item" onclick="selectionnerResultatItunes(' + index + ')" tabindex="0" role="button">' +
                                '<div class="openlibrary-result-cover">' +
                                    (result.cover_url
                                        ? '<img src="' + escapeHtml(result.cover_url) + '" alt="Artwork" onerror="this.style.display=\'none\'">'
                                        : '<div class="openlibrary-result-placeholder">🎵</div>'
                                    ) +
                                '</div>' +
                                '<div class="openlibrary-result-info">' +
                                    '<div class="openlibrary-result-title">' + escapeHtml(result.title) + '</div>' +
                                    (result.author ? '<div class="openlibrary-result-author">' + escapeHtml(result.author) + '</div>' : '') +
                                    (result.year ? '<div class="openlibrary-result-year">' + result.year + '</div>' : '') +
                                '</div>' +
                            '</div>';
                        }).join('') +
                    '</div>'
                : '') +
                (f.categorie === 'musique' && state.dropdownItunesVisible && state.resultatsItunes.length === 0 && !state.rechercheItunes ?
                    '<div class="openlibrary-dropdown-empty">Aucun resultat trouve</div>'
                : '') +
                (f.categorie === 'youtube' && state.dropdownYoutubeVisible && state.resultatsYoutube.length > 0 ?
                    '<div class="openlibrary-dropdown">' +
                        state.resultatsYoutube.map(function(result, index) {
                            return '<div class="openlibrary-result-item" onclick="selectionnerResultatYoutube(' + index + ')" tabindex="0" role="button">' +
                                '<div class="openlibrary-result-cover">' +
                                    (result.cover_url
                                        ? '<img src="' + escapeHtml(result.cover_url) + '" alt="Miniature" onerror="this.style.display=\'none\'">'
                                        : '<div class="openlibrary-result-placeholder">📹</div>'
                                    ) +
                                '</div>' +
                                '<div class="openlibrary-result-info">' +
                                    '<div class="openlibrary-result-title">' + escapeHtml(result.title) + '</div>' +
                                    (result.author ? '<div class="openlibrary-result-author">' + escapeHtml(result.author) + '</div>' : '') +
                                    (result.year ? '<div class="openlibrary-result-year">' + result.year + '</div>' : '') +
                                '</div>' +
                            '</div>';
                        }).join('') +
                    '</div>'
                : '') +
                (f.categorie === 'youtube' && state.dropdownYoutubeVisible && state.resultatsYoutube.length === 0 && !state.rechercheYoutube ?
                    '<div class="openlibrary-dropdown-empty">Aucun resultat trouve</div>'
                : '') +
                (f.categorie === 'youtube' ?
                    '<div class="champ-groupe">' +
                        '<label class="label" for="form-lien-youtube">Lien YouTube *</label>' +
                        '<input id="form-lien-youtube" type="url" class="input" placeholder="https://www.youtube.com/watch?v=..." value="' + escapeHtml(f.lienYoutube || '') + '" onchange="updateForm(\'lienYoutube\',this.value);extraireInfosYoutube()" required autocomplete="off">' +
                    '</div>'
                : '') +
                (modeRapide ? '' :
                    (f.categorie === 'musique' ?
                        '<div class="champ-groupe">' +
                            '<label class="label" for="form-type-musique">Type</label>' +
                            '<select id="form-type-musique" class="select" onchange="updateForm(\'typeMusique\',this.value)">' +
                                '<option value="album"' + (f.typeMusique === 'album' ? ' selected' : '') + '>Album</option>' +
                                '<option value="morceau"' + (f.typeMusique === 'morceau' ? ' selected' : '') + '>Morceau</option>' +
                                '<option value="artiste"' + (f.typeMusique === 'artiste' ? ' selected' : '') + '>Artiste</option>' +
                            '</select>' +
                        '</div>'
                    : '')
                ) +
                (modeRapide ? '' :
                '<div class="ligne-double">' +
                    '<div class="champ-groupe">' +
                        '<label class="label" id="label-genres">Genres <span style="color:var(--text-muted);font-size:0.75rem">(plusieurs choix possibles)</span></label>' +
                        '<div class="genres-container" role="group" aria-labelledby="label-genres">' +
                            (CATEGORIES[f.categorie]?.genres || []).map(function(g) {
                                var genres = Array.isArray(f.genres) ? f.genres : (f.genre ? [f.genre] : []);
                                var isSelected = genres.indexOf(g) !== -1;
                                return '<button type="button" class="genre-btn ' + (isSelected ? 'actif' : '') + '" onclick="toggleGenre(\'' + g + '\')">' + g + '</button>';
                            }).join('') +
                        '</div>' +
                    '</div>' +
                    '<div class="champ-groupe">' +
                        '<label class="label" id="label-statut">Statut</label>' +
                        '<div class="statut-buttons" role="group" aria-labelledby="label-statut">' +
                            STATUTS_LECTURE.map(function(s) {
                                return '<button type="button" class="statut-btn ' + (f.statutLecture === s ? 'actif' : '') + '" aria-pressed="' + (f.statutLecture === s ? 'true' : 'false') + '" onclick="setStatutLecture(\'' + s + '\')">' + STATUTS_LECTURE_LABELS[s] + '</button>';
                            }).join('') +
                        '</div>' +
                    '</div>' +
                '</div>'
                ) +
                (modeRapide ? '' :
                '<div class="champ-groupe">' +
                    '<label class="label" id="label-tags">Tags personnalisés</label>' +
                    (Array.isArray(f.tags) && f.tags.length > 0 ?
                        '<div class="tags-actifs" style="margin-bottom:0.5rem;">' +
                            f.tags.map(function(tag) {
                                return '<span class="tag-badge">' + escapeHtml(tag) + ' <button type="button" class="tag-remove" onclick="retirerTag(\'' + escapeHtml(tag) + '\')" aria-label="Retirer ' + escapeHtml(tag) + '">×</button></span>';
                            }).join('') +
                        '</div>'
                    : '') +
                    '<div style="display:flex;gap:0.5rem;margin-bottom:0.5rem;">' +
                        '<input id="nouveau-tag-input" type="text" class="input" placeholder="Nouveau tag (séparez par des virgules)..." style="flex:1" onkeydown="if(event.key===\'Enter\'){event.preventDefault();ajouterNouveauTag();}" autocomplete="off">' +
                        '<button type="button" class="btn-ajouter-tag" onclick="ajouterNouveauTag()" aria-label="Ajouter le tag">+</button>' +
                    '</div>' +
                    (function() {
                        var tagsExistants = getTagsDisponibles().filter(function(t) {
                            var formTags = Array.isArray(f.tags) ? f.tags : [];
                            return formTags.indexOf(t) === -1;
                        });
                        if (tagsExistants.length > 0) {
                            return '<div class="tags-suggestions"><span style="font-size:0.75rem;color:var(--text-muted);">Tags existants :</span> ' +
                                tagsExistants.slice(0, 10).map(function(t) {
                                    return '<button type="button" class="tag-suggestion-btn" onclick="toggleTag(\'' + escapeHtml(t) + '\')">' + escapeHtml(t) + '</button>';
                                }).join(' ') +
                                (tagsExistants.length > 10 ? ' <span style="font-size:0.75rem;color:var(--text-muted);">+' + (tagsExistants.length - 10) + ' autres</span>' : '') +
                            '</div>';
                        }
                        return '';
                    })() +
                '</div>'
                ) +
                (modeRapide ? '' :
                (f.categorie === 'livre' ?
                    '<div class="champ-groupe' + (cacherDates ? ' hidden' : '') + '">' +
                        '<label class="label" for="form-date-debut-lecture">Date de début de lecture</label>' +
                        '<input id="form-date-debut-lecture" type="date" class="input" value="' + (f.dateDebutLecture || '') + '" onchange="updateForm(\'dateDebutLecture\',this.value)">' +
                    '</div>'
                : '') +
                '<div class="champ-groupe' + (cacherDates ? ' hidden' : '') + '">' +
                    '<label class="label" for="form-date-decouverte">' + (f.categorie === 'livre' ? 'Date de fin de lecture' : 'Date de découverte') + '</label>' +
                    '<input id="form-date-decouverte" type="date" class="input" value="' + f.dateDecouverte + '" onchange="updateForm(\'dateDecouverte\',this.value)">' +
                '</div>' +
                '<div class="champ-groupe' + (estADecouvrir ? ' hidden' : '') + '">' +
                    '<label class="label">Ma note</label>' +
                    '<div class="etoiles" aria-label="Votre note">' + renderEtoiles(f.note, true) + '</div>' +
                '</div>'
                ) +
                (modeRapide ? '' :
                '<div class="champ-groupe">' +
                    '<label class="label" id="label-possession">Possession <span style="color:var(--text-muted);font-size:0.75rem">(plusieurs choix possibles)</span></label>' +
                    '<div class="statut-buttons" role="group" aria-labelledby="label-possession">' +
                        STATUTS_POSSESSION.map(function(s) {
                            return '<button type="button" class="statut-btn ' + (statutsPossession.indexOf(s) !== -1 ? 'actif' : '') + '" aria-pressed="' + (statutsPossession.indexOf(s) !== -1 ? 'true' : 'false') + '" onclick="setStatutPossession(\'' + s + '\')">' + s + '</button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                '<div class="champ-groupe' + (estEmprunte ? '' : ' hidden') + '">' +
                    '<label class="label" for="form-date-retour">Date de retour (rappel)</label>' +
                    '<input id="form-date-retour" type="date" class="input" value="' + (f.dateRetour || '') + '" onchange="updateForm(\'dateRetour\',this.value)">' +
                '</div>' +
                '<div class="champ-groupe">' +
                    '<label class="label" for="form-prive">Visibilité</label>' +
                    '<button id="form-prive" type="button" class="btn-prive ' + (f.prive ? 'prive' : 'public') + '" aria-pressed="' + (f.prive ? 'true' : 'false') + '" onclick="togglePrive()">' +
                        (f.prive ? '🔒 Privé (visible que par vous)' : '🌐 Public (visible par vos amis)') +
                    '</button>' +
                '</div>' +
                '<div class="champ-groupe">' +
                    '<label class="label" for="form-critique">Critique / Notes</label>' +
                    '<textarea id="form-critique" class="textarea" rows="3" placeholder="Vos impressions..." onchange="updateForm(\'critique\',this.value)">' + escapeHtml(f.critique) + '</textarea>' +
                '</div>'
                ) +
                '<button class="btn-soumettre" type="submit" onclick="event.preventDefault();soumettreFormulaire()"' + (state.syncing ? ' disabled' : '') + '>' + (state.modeEdition ? 'Enregistrer' : (modeRapide ? '+ Ajouter et continuer' : 'Ajouter')) + '</button>' +
                (modeRapide && state.vueSource === 'pile' && state.entreesAjouteesRapide.length > 0 ?
                    '<button class="btn-terminer-ajout-rapide" type="button" onclick="terminerAjoutRapide()">✓ Terminer (' + state.entreesAjouteesRapide.length + ' ajout' + (state.entreesAjouteesRapide.length > 1 ? 's' : '') + ')</button>'
                : '') +
            '</div>' +
        '</div>' +
        (modeRapide && state.vueSource === 'pile' && state.entreesAjouteesRapide.length > 0 ?
            '<div class="recap-ajouts-rapides">' +
                '<h3 class="recap-titre">Futures decouvertes ajoutees (' + state.entreesAjouteesRapide.length + ')</h3>' +
                '<div class="recap-liste">' +
                    state.entreesAjouteesRapide.map(function(e) {
                        return '<div class="recap-item">' +
                            '<div class="recap-couverture">' +
                                (e.couverture
                                    ? '<img src="' + escapeHtml(e.couverture) + '" alt="Couverture de ' + escapeHtml(e.titre) + '">'
                                    : '<div class="recap-placeholder">' + (CATEGORIES[e.categorie]?.icone || '✨') + '</div>'
                                ) +
                            '</div>' +
                            '<div class="recap-info">' +
                                '<div class="recap-titre-item">' + escapeHtml(e.titre) + '</div>' +
                                (e.auteur ? '<div class="recap-auteur">' + escapeHtml(e.auteur) + '</div>' : '') +
                            '</div>' +
                        '</div>';
                    }).join('') +
                '</div>' +
            '</div>'
        : '') +
    '</form>';
}

    // Fonction globale à ajouter pour la recherche automatique (à compléter selon ton backend ou API)
    window.rechercherLiensStreaming = async function() {
        // Récupère titre et auteur/artiste du formulaire
        var titre = (state.formulaire.titre || '').trim();
        var artiste = (state.formulaire.auteur || '').trim();

        if (!titre) {
            afficherToast("Veuillez renseigner le titre pour la recherche.");
            return;
        }

        afficherToast("Recherche des liens streaming...");

        // Recherche Spotify
        try {
            var q = encodeURIComponent(titre + (artiste ? " " + artiste : ""));
            // Lien de recherche Spotify
            state.formulaire.lienSpotify = "https://open.spotify.com/search/" + q;
        } catch (e) {
            // Ne rien faire
        }

        // Recherche Deezer
        try {
            var q = encodeURIComponent(titre + (artiste ? " " + artiste : ""));
            // Lien de recherche Deezer
            state.formulaire.lienDeezer = "https://www.deezer.com/search/" + q;
        } catch (e) {
            // Ne rien faire
        }

        // Recherche Qobuz (store -> ID -> URL streaming)
    try {
        var q = encodeURIComponent(titre + (artiste ? " " + artiste : ""));
        var searchUrl = "https://www.qobuz.com/fr-fr/search/albums/" + q;

        // On récupère le HTML via un proxy CORS
        var proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(searchUrl);

        var res = await fetch(proxyUrl);
        var html = await res.text();

        // On parse le HTML
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        // On récupère le premier résultat album
        var first = doc.querySelector("a.ReleaseCardInfosTitle");

        if (first) {
            // href du type : /fr-fr/album/more-pulp/h20z9j8aootqa
            var href = first.getAttribute("href");

            // On extrait l'ID : dernier segment après le dernier "/"
            var parts = href.split("/");
            var albumId = parts[parts.length - 1];

            // On construit l'URL streaming
            state.formulaire.lienQobuz = "https://play.qobuz.com/album/" + albumId;
        } else {
            // fallback
            state.formulaire.lienQobuz = searchUrl;
        }
    } catch (e) {
        // fallback
        var q = encodeURIComponent(titre + (artiste ? " " + artiste : ""));
        state.formulaire.lienQobuz = "https://www.qobuz.com/fr-fr/search/albums/" + q;
    }


afficherToast("Liens de recherche générés.");
render();
};
