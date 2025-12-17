function renderAlertes() {
    var entreesDueSoon = getEntreesDueSoon();

    var html = '<div class="alertes-container">' +
        '<div class="alertes-header">' +
            '<h2 class="alertes-titre">⏰ Emprunts à rendre bientôt</h2>' +
            '<button class="btn-retour" onclick="retourListe()">← Retour</button>' +
        '</div>';

    if (entreesDueSoon.length === 0) {
        html += '<div class="vide">' +
            '<div class="vide-icone">✅</div>' +
            '<h3>Aucun emprunt urgent</h3>' +
            '<p>Vous n\'avez aucun emprunt à rendre dans les 7 prochains jours</p>' +
        '</div>';
    } else {
        html += '<div class="alertes-liste">';

        entreesDueSoon.forEach(function(e) {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var dateRetour = new Date(e.dateRetour);
            dateRetour.setHours(0, 0, 0, 0);
            var jours = Math.floor((dateRetour - today) / (1000 * 60 * 60 * 24));

            var urgence = jours === 0 ? 'urgent' : jours <= 2 ? 'warning' : 'normal';

            html += '<div class="alerte-card alerte-' + urgence + '" onclick="voirDetail(\'' + e.id + '\')">' +
                '<div class="alerte-couverture">' +
                    (e.couverture
                        ? '<img src="' + escapeHtml(e.couverture) + '" alt="Couverture de ' + escapeHtml(e.titre) + '">'
                        : '<div class="alerte-placeholder">' + (CATEGORIES[e.categorie]?.icone || '✨') + '</div>'
                    ) +
                '</div>' +
                '<div class="alerte-info">' +
                    '<h3 class="alerte-titre">' + escapeHtml(e.titre) + '</h3>' +
                    (e.auteur ? '<p class="alerte-auteur">' + escapeHtml(e.auteur) + '</p>' : '') +
                    '<div class="alerte-date">' +
                        '<span class="alerte-icone-date">📅</span>' +
                        '<span>À rendre le ' + formatDate(e.dateRetour) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="alerte-countdown">' +
                    '<div class="alerte-countdown-number">' + jours + '</div>' +
                    '<div class="alerte-countdown-label">jour' + (jours > 1 ? 's' : '') + '</div>' +
                    (jours === 0 ? '<div class="alerte-countdown-urgent">AUJOURD\'HUI !</div>' : '') +
                '</div>' +
            '</div>';
        });

        html += '</div>';
    }

    html += '</div>';
    return html;
}
