function renderContact() {
    return '<div class="contact-container">' +
        '<div class="contact-header">' +
            '<h2 class="contact-titre">📧 Nous contacter</h2>' +
            '<button class="btn-fermer" type="button" onclick="retourListe()">✕</button>' +
        '</div>' +
        '<div class="contact-content">' +
            '<p class="contact-intro">Une question, une suggestion ou un problème ? Envoyez-nous un message !</p>' +
            '<form class="contact-form" onsubmit="event.preventDefault(); envoyerContact()">' +
                '<div class="champ-groupe">' +
                    '<label class="label" for="contact-nom">Votre nom *</label>' +
                    '<input type="text" id="contact-nom" class="input" placeholder="Prénom Nom" required>' +
                '</div>' +
                '<div class="champ-groupe">' +
                    '<label class="label" for="contact-email">Votre email *</label>' +
                    '<input type="email" id="contact-email" class="input" placeholder="votre@email.com" value="' + escapeHtml(state.userEmail || '') + '" required>' +
                '</div>' +
                '<div class="champ-groupe">' +
                    '<label class="label" for="contact-sujet">Sujet *</label>' +
                    '<select id="contact-sujet" class="select" required>' +
                        '<option value="">-- Choisissez un sujet --</option>' +
                        '<option value="bug">🐛 Signaler un bug</option>' +
                        '<option value="suggestion">💡 Suggestion d\'amélioration</option>' +
                        '<option value="question">❓ Question</option>' +
                        '<option value="autre">💬 Autre</option>' +
                    '</select>' +
                '</div>' +
                '<div class="champ-groupe">' +
                    '<label class="label" for="contact-message">Message *</label>' +
                    '<textarea id="contact-message" class="textarea" rows="6" placeholder="Décrivez votre demande..." required></textarea>' +
                '</div>' +
                '<div class="contact-actions">' +
                    '<button type="button" class="btn-annuler" onclick="retourListe()">Annuler</button>' +
                    '<button type="submit" class="btn-envoyer" id="btn-contact-submit">' +
                        '<span id="btn-contact-text">📤 Envoyer</span>' +
                    '</button>' +
                '</div>' +
            '</form>' +
            '<div class="contact-info">' +
                '<p class="contact-info-text">Vous pouvez aussi nous écrire directement à <a href="mailto:gaelpoumai@tutamail.com">gaelpoumai@tutamail.com</a></p>' +
            '</div>' +
        '</div>' +
    '</div>';
}

window.envoyerContact = function() {
    var nom = document.getElementById('contact-nom').value;
    var email = document.getElementById('contact-email').value;
    var sujet = document.getElementById('contact-sujet').value;
    var message = document.getElementById('contact-message').value;

    var btnSubmit = document.getElementById('btn-contact-submit');
    var btnText = document.getElementById('btn-contact-text');

    // Désactiver le bouton
    btnSubmit.disabled = true;
    btnText.textContent = '⏳ Envoi...';

    // Construction du corps de l'email
    var corps = 'Nom: ' + nom + '\n' +
                'Email: ' + email + '\n' +
                'Sujet: ' + sujet + '\n\n' +
                'Message:\n' + message + '\n\n' +
                '---\n' +
                'Envoyé depuis Carnet Culturel\n' +
                'User ID: ' + (state.userId || 'non connecté');

    // Utiliser mailto comme fallback simple
    var mailtoLink = 'mailto:gaelpoumai@tutamail.com' +
        '?subject=' + encodeURIComponent('[Carnet Culturel] ' + sujet) +
        '&body=' + encodeURIComponent(corps);

    // Ouvrir le client mail
    window.location.href = mailtoLink;

    // Réactiver le bouton après 2 secondes
    setTimeout(function() {
        btnSubmit.disabled = false;
        btnText.textContent = '📤 Envoyer';
        afficherToast('✅ Votre client mail s\'est ouvert. N\'oubliez pas d\'envoyer le message !');
    }, 2000);
};
