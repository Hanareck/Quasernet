// RENDER SOCIAL

function renderSocial() {
    var vueSociale = state.vueSociale || 'fil';

    return '<div class="social-container">' +
        '<div class="social-nav">' +
            '<button class="social-tab ' + (vueSociale === 'fil' ? 'actif' : '') + '" onclick="setVueSociale(\'fil\')">📰 Fil</button>' +
            '<button class="social-tab ' + (vueSociale === 'amis' ? 'actif' : '') + '" onclick="setVueSociale(\'amis\')">👥 Amis</button>' +
            '<button class="social-tab ' + (vueSociale === 'notifications' ? 'actif' : '') + '" onclick="setVueSociale(\'notifications\')">🔔 Notifications</button>' +
        '</div>' +
        '<div class="social-contenu">' +
            (vueSociale === 'fil' ? renderFilContenu() :
             vueSociale === 'amis' ? renderAmisContenu() :
             renderNotificationsContenu()) +
        '</div>' +
    '</div>';
}
