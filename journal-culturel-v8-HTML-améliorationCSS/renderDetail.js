function renderDetail() {
    var e = state.entreeSelectionnee;
    if (!e) return '';

    var estADecouvrir = e.statutLecture === 'A decouvrir';
    var statutsPossession = Array.isArray(e.statutPossession) ? e.statutPossession : (e.statutPossession ? [e.statutPossession] : []);
    var estEmprunte = statutsPossession.indexOf('Emprunte') !== -1;
    var genres = Array.isArray(e.genres) ? e.genres : (e.genre ? [e.genre] : []);
    var tags = Array.isArray(e.tags) ? e.tags : [];

    // Calculer les jours restants pour les emprunts
    var jours = null;
    if (estEmprunte && e.dateRetour) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var dateRetour = new Date(e.dateRetour);
        dateRetour.setHours(0, 0, 0, 0);
        jours = Math.floor((dateRetour - today) / (1000 * 60 * 60 * 24));
    }

    // Liens streaming pour musique
    var liensStreaming = '';
    if (e.categorie === 'musique' && (e.lienSpotify || e.lienDeezer || e.lienQobuz)) {
        liensStreaming = '<div class="streaming-links-synth">' +
            (e.lienSpotify ? '<a href="' + escapeHtml(e.lienSpotify) + '" class="btn-streaming btn-spotify" target="_blank" rel="noopener" aria-label="Écouter sur Spotify">Spotify</a>' : '') +
            (e.lienDeezer ? '<a href="' + escapeHtml(e.lienDeezer) + '" class="btn-streaming btn-deezer" target="_blank" rel="noopener" aria-label="Écouter sur Deezer">Deezer</a>' : '') +
            (e.lienQobuz ? '<a href="' + escapeHtml(e.lienQobuz) + '" class="btn-streaming btn-qobuz" target="_blank" rel="noopener" aria-label="Écouter sur Qobuz">Qobuz</a>' : '') +
        '</div>';
    }

    // Lien YouTube
    var lienYoutube = '';
    if (e.categorie === 'youtube' && e.lienYoutube) {
        lienYoutube = '<div class="streaming-links-synth">' +
            '<a href="' + escapeHtml(e.lienYoutube) + '" class="btn-streaming btn-youtube" target="_blank" rel="noopener" aria-label="Regarder sur YouTube">▶ YouTube</a>' +
        '</div>';
    }

    return '<div class="detail-container">' +
        '<div class="detail-header">' +
            '<button class="btn-retour" onclick="retourListe()">← Retour</button>' +
            '<div class="detail-actions">' +
                '<button class="btn-modifier" onclick="ouvrirModification(\'' + e.id + '\')">✏️ Modifier</button>' +
                (state.groupes && state.groupes.length > 0 ?
                    '<button class="btn-partager" onclick="ouvrirModalPartagerGroupe(' + JSON.stringify(e) + ')">📤 Partager</button>' :
                    '') +
                '<button class="btn-supprimer-header" onclick="supprimerEntree(\'' + e.id + '\')">🗑️ Supprimer</button>' +
            '</div>' +
        '</div>' +
        '<div class="detail-content">' +
            '<div class="detail-couverture">' +
                (e.couverture
                    ? '<img src="' + escapeHtml(e.couverture) + '" class="detail-image" alt="Couverture de ' + escapeHtml(e.titre || '') + (e.auteur ? ' de ' + escapeHtml(e.auteur) : '') + '">'
                    : '<div class="detail-placeholder" aria-hidden="true">' + (CATEGORIES[e.categorie]?.icone || '✨') + '</div>'
                ) +
            '</div>' +
            '<div class="detail-info">' +
                '<div class="detail-badges">' +
                    '<span class="badge">' + (CATEGORIES[e.categorie]?.icone || '✨') + ' ' + (CATEGORIES[e.categorie]?.nom || 'Autre') + '</span>' +
                    genres.map(function(g) { return '<span class="badge">' + escapeHtml(g) + '</span>'; }).join('') +
                    tags.map(function(t) { return '<span class="badge badge-tag">' + escapeHtml(t) + '</span>'; }).join('') +
                    (estADecouvrir ? '<span class="badge a-decouvrir">À découvrir</span>' : '') +
                    (e.statutLecture === 'A redecouvrir' ? '<span class="badge a-redecouvrir">↻ À redécouvrir</span>' : '') +
                    (e.statutLecture === 'En cours de decouverte' ? '<span class="badge en-cours">📖 En cours</span>' : '') +
                    statutsPossession.map(function(s) {
                        if (s === 'A acheter') return '<span class="badge a-acheter">A acheter</span>';
                        if (s === 'Streaming') return '<span class="badge streaming">🎧 Streaming</span>';
                        if (s === 'Emprunte') return '<span class="badge emprunte">Emprunté</span>';
                        return '';
                    }).join('') +
                    // Liens streaming juste après les badges
                    liensStreaming +
                    lienYoutube +
                '</div>' +
                '<h2 class="detail-titre">' + escapeHtml(e.titre) + '</h2>' +
                (e.auteur ? '<p class="detail-auteur">par ' + escapeHtml(e.auteur) + '</p>' : '') +
                (!estADecouvrir ?
                    '<div class="detail-meta">' +
                        '<div class="etoiles">' + renderEtoilesInteractives(e.note || 0, e.id) + '</div>' +
                        (e.dateDecouverte ? '<span class="detail-date">' + formatDate(e.dateDecouverte) + '</span>' : '') +
                    '</div>'
                : '') +
                (e.critique ?
                    '<div class="detail-critique">' +
                        '<h3 class="critique-label">Critique</h3>' +
                        '<p class="critique-texte">' + escapeHtml(e.critique) + '</p>' +
                    '</div>'
                : '') +
                (estEmprunte && e.dateRetour ?
                    '<div class="detail-rappel">' +
                        '📅 A rendre le ' + formatDate(e.dateRetour) +
                        (jours !== null ? (jours < 0 ? ' (En retard de ' + Math.abs(jours) + ' jour' + (Math.abs(jours) > 1 ? 's' : '') + ')' : jours === 0 ? ' (Aujourd\'hui !)' : ' (dans ' + jours + ' jour' + (jours > 1 ? 's' : '') + ')') : '') +
                    '</div>'
                : '') +
                // Selecteur de statut
                '<div class="detail-statut-section">' +
                    '<h3 class="detail-section-titre">Statut de lecture</h3>' +
                    '<div class="statut-selector">' +
                        STATUTS_LECTURE.map(function(s) {
                            return '<button class="statut-btn ' + (e.statutLecture === s ? 'actif' : '') + '" ' +
                                'onclick="changerStatutDetail(\'' + e.id + '\', \'' + s + '\')">' +
                                STATUTS_LECTURE_LABELS[s] +
                            '</button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                // Section visibilite
                '<div class="detail-section">' +
                    '<h3 class="detail-section-titre">Visibilite</h3>' +
                    '<button class="btn-prive-toggle ' + (e.prive ? 'prive' : 'public') + '" onclick="togglePriveEntree(\'' + e.id + '\')">' +
                        (e.prive ? '🔒 Prive (visible que par vous)' : '🌐 Public (visible par vos amis)') +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
}
