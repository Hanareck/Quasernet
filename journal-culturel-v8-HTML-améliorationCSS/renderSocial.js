// RENDER SOCIAL

function renderSocial() {
    var vueSociale = state.vueSociale || 'fil';

    // Calculer le nombre total de posts non lus dans les groupes
    var totalPostsNonLus = state.groupes.reduce(function(total, g) {
        return total + (g.postsNonLus || 0);
    }, 0);

    var badgeGroupes = totalPostsNonLus > 0
        ? '<span class="badge-notif">' + totalPostsNonLus + '</span>'
        : '';

    return '<div class="social-container">' +
        '<div class="social-nav">' +
            '<button class="social-tab ' + (vueSociale === 'fil' ? 'actif' : '') + '" onclick="setVueSociale(\'fil\')">📰 Fil</button>' +
            '<button class="social-tab ' + (vueSociale === 'amis' ? 'actif' : '') + '" onclick="setVueSociale(\'amis\')">👥 Amis</button>' +
            '<button class="social-tab ' + (vueSociale === 'groupes' ? 'actif' : '') + '" onclick="setVueSociale(\'groupes\')">🔰 Groupes' + badgeGroupes + '</button>' +
            '<button class="social-tab ' + (vueSociale === 'notifications' ? 'actif' : '') + '" onclick="setVueSociale(\'notifications\')">🔔 Notifications</button>' +
        '</div>' +
        '<div class="social-contenu">' +
            (vueSociale === 'fil' ? renderFilContenu() :
             vueSociale === 'amis' ? renderAmisContenu() :
             vueSociale === 'groupes' ? renderGroupesContenu() :
             renderNotificationsContenu()) +
        '</div>' +
    '</div>';
}
