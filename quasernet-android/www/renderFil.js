function renderFilContenu() {
    var html = '';

    if (state.filLoading) {
        html += '<div class="loading-section">' +
            '<div class="loading-spinner">📚</div>' +
            '<p>Chargement du fil...</p>' +
        '</div>';
    } else if (state.amis.length === 0) {
        html += '<div class="vide">' +
            '<div class="vide-icone">👥</div>' +
            '<h3>Aucun ami</h3>' +
            '<p>Ajoutez des amis pour voir leurs decouvertes ici !</p>' +
            '<button class="btn-action" onclick="setVueSociale(\'amis\')">Ajouter des amis</button>' +
        '</div>';
    } else if (state.fil.length === 0) {
        html += '<div class="vide">' +
            '<div class="vide-icone">📭</div>' +
            '<h3>Aucune nouveaute</h3>' +
            '<p>Vos amis n\'ont pas encore publie de decouvertes.</p>' +
        '</div>';
    } else {
        html += '<div class="fil-liste">';
        
        state.fil.forEach(function(item) {
            var estADecouvrir = item.statutLecture === 'A decouvrir';
            var dateAffichee = item.dateCreation ? formatDateRelative(item.dateCreation) : '';
            var postId = item.ownerId + '_' + item.id;
            var nonVu = !estVu('fil', postId);

            html += '<article class="fil-item' + (nonVu ? ' non-vu' : '') + '" onclick="voirDetailDepuisFil(\'' + item.ownerId + '\', \'' + escapeHtml(item.ownerPseudo) + '\', \'' + item.id + '\')">' +
                '<div class="fil-item-header">' +
                    '<span class="fil-item-user">@' + escapeHtml(item.ownerPseudo) + '</span>' +
                    '<div class="fil-item-header-right">' +
                        '<span class="fil-item-date">' + dateAffichee + '</span>' +
                        '<button class="btn-epingler' + (nonVu ? '' : ' actif') + '" onclick="event.stopPropagation(); epinglerElement(\'fil\', \'' + postId + '\')" title="' + (nonVu ? 'Marqu\u00e9 comme non vu' : '\u00c9pingler (marquer comme non vu)') + '">📌</button>' +
                    '</div>' +
                '</div>' +
                '<div class="fil-item-content">' +
                    '<div class="fil-item-cover">' +
                        (item.couverture ? '<img src="' + escapeHtml(item.couverture) + '">' : '<div class="fil-item-cover-placeholder">' + (CATEGORIES[item.categorie]?.icone || '✨') + '</div>') +
                    '</div>' +
                    '<div class="fil-item-info">' +
                        '<div class="fil-item-badges">' +
                            '<span class="badge">' + (CATEGORIES[item.categorie]?.icone || '✨') + ' ' + (CATEGORIES[item.categorie]?.nom || 'Autre') + '</span>' +
                            (item.genre ? '<span class="badge">' + escapeHtml(item.genre) + '</span>' : '') +
                            (estADecouvrir ? '<span class="badge a-decouvrir">À découvrir</span>' : '') +
                        '</div>' +
                        '<h3 class="fil-item-titre">' + escapeHtml(item.titre) + '</h3>' +
                        (item.auteur ? '<p class="fil-item-auteur">par ' + escapeHtml(item.auteur) + '</p>' : '') +
                        (!estADecouvrir ? '<div class="etoiles etoiles-small">' + renderEtoiles(item.note || 0) + '</div>' : '') +
                        (item.critique ? '<p class="fil-item-critique">"' + escapeHtml(item.critique.substring(0, 150)) + (item.critique.length > 150 ? '...' : '') + '"</p>' : '') +
                    '</div>' +
                '</div>' +
            '</article>';
        });
        
        html += '</div>';
    }

    return html;
}

function formatDateRelative(dateStr) {
    var date = new Date(dateStr);
    var now = new Date();
    var diff = now - date;
    var minutes = Math.floor(diff / 60000);
    var hours = Math.floor(diff / 3600000);
    var days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'A l\'instant';
    if (minutes < 60) return 'Il y a ' + minutes + ' min';
    if (hours < 24) return 'Il y a ' + hours + 'h';
    if (days < 7) return 'Il y a ' + days + ' jour' + (days > 1 ? 's' : '');
    return formatDateCourte(dateStr);
}
