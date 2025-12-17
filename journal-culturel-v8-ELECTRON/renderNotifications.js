function renderNotificationsContenu() {
    var html = '';

    if (state.notificationsLoading) {
        html += '<div class="loading-section">' +
            '<div class="loading-spinner">🔔</div>' +
            '<p>Chargement des notifications...</p>' +
        '</div>';
    } else if (state.notifications.length === 0) {
        html += '<div class="vide">' +
            '<div class="vide-icone">🔔</div>' +
            '<h3>Aucune notification</h3>' +
            '<p>Quand vos amis aimeront ou commenteront vos decouvertes, vous le verrez ici.</p>' +
        '</div>';
    } else {
        html += '<div class="notifications-liste">';
        
        state.notifications.forEach(function(notif) {
            var dateAffichee = notif.date ? formatDateRelative(notif.date) : '';
            var onclick = "ouvrirNotificationCatalogueDetail('" + notif.entreeId + "')";
            var notifId = notif.type + '_' + notif.entreeId + '_' + (notif.pseudo || '');
            var nonVu = !estVu('notifications', notifId);

            if (notif.type === 'like') {
                html += '<div class="notif-item notif-like' + (nonVu ? ' non-vu' : '') + '" style="cursor:pointer" onclick="' + onclick + '">' +
                    '<div class="notif-icon">❤️</div>' +
                    '<div class="notif-content">' +
                        '<p class="notif-texte"><strong>' + escapeHtml(notif.pseudo) + '</strong> a aime votre decouverte <strong>"' + escapeHtml(notif.entreeTitre) + '"</strong></p>' +
                        '<span class="notif-date">' + dateAffichee + '</span>' +
                    '</div>' +
                    '<button class="btn-epingler' + (nonVu ? '' : ' actif') + '" onclick="event.stopPropagation(); epinglerElement(\'notifications\', \'' + notifId + '\')" title="' + (nonVu ? 'Marqu\u00e9 comme non vu' : '\u00c9pingler (marquer comme non vu)') + '">📌</button>' +
                '</div>';
            } else if (notif.type === 'commentaire') {
                html += '<div class="notif-item notif-commentaire' + (nonVu ? ' non-vu' : '') + '" style="cursor:pointer" onclick="' + onclick + '">' +
                    '<div class="notif-icon">💬</div>' +
                    '<div class="notif-content">' +
                        '<p class="notif-texte"><strong>' + escapeHtml(notif.pseudo) + '</strong> a commente votre decouverte <strong>"' + escapeHtml(notif.entreeTitre) + '"</strong></p>' +
                        '<p class="notif-commentaire-texte">"' + escapeHtml(notif.texte.substring(0, 100)) + (notif.texte.length > 100 ? '...' : '') + '"</p>' +
                        '<span class="notif-date">' + dateAffichee + '</span>' +
                    '</div>' +
                    '<button class="btn-epingler' + (nonVu ? '' : ' actif') + '" onclick="event.stopPropagation(); epinglerElement(\'notifications\', \'' + notifId + '\')" title="' + (nonVu ? 'Marqu\u00e9 comme non vu' : '\u00c9pingler (marquer comme non vu)') + '">📌</button>' +
                '</div>';
            }
        });
        
        html += '</div>';
    }

    return html;
}

// Ajout de la fonction globale pour ouvrir la fiche sociale depuis une notification
window.ouvrirNotificationCatalogueDetail = async function(entreeId) {
    // Aller dans le menu Amis, puis charger le catalogue de soi-même, puis ouvrir la fiche sociale (detailAmi)
    state.vue = 'amis';
    render();
    // Charger le catalogue et attendre qu'il soit prêt avant d'ouvrir la fiche
    await chargerCatalogueAmi(state.user.uid, state.userPseudo);
    state.entreeAmiSelectionnee = state.catalogueAmi.entrees.find(function(e) { return e.id === entreeId; });
    state.vue = 'detailAmi';
    render();
    setTimeout(function() {
        var section = document.querySelector('.social-section');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
};
