function renderSettings() {
    return '<div class="settings-container">' +
        '<div class="settings-header">' +
            '<div>' +
                '<h2 class="settings-titre">⚙️ Parametres</h2>' +
                '<p class="settings-subtitle">Gerez votre compte</p>' +
            '</div>' +
            '<button class="btn-retour" onclick="retourListe()">← Retour</button>' +
        '</div>' +
        
        (state.settingsError ? '<div class="auth-error">' + state.settingsError + '</div>' : '') +
        (state.settingsSuccess ? '<div class="settings-success">' + state.settingsSuccess + '</div>' : '') +
        
        '<div class="settings-section">' +
            '<h3 class="section-titre">👤 Changer mon pseudo</h3>' +
            '<p class="section-description">Votre pseudo actuel : <strong>' + escapeHtml(state.userPseudo || '') + '</strong></p>' +
            (state.dernierChangementPseudo ?
                (function() {
                    var dernierChangement = new Date(state.dernierChangementPseudo);
                    var maintenant = new Date();
                    var joursEcoules = Math.floor((maintenant - dernierChangement) / (1000 * 60 * 60 * 24));
                    var joursRestants = 30 - joursEcoules;
                    if (joursRestants > 0) {
                        var prochainChangement = new Date(dernierChangement);
                        prochainChangement.setDate(prochainChangement.getDate() + 30);
                        return '<p class="section-warning">⚠️ Vous pourrez modifier votre pseudo le ' + formatDate(prochainChangement.toISOString()) + ' (dans ' + joursRestants + ' jour' + (joursRestants > 1 ? 's' : '') + ')</p>';
                    } else {
                        return '<p class="section-info">✓ Vous pouvez modifier votre pseudo</p>';
                    }
                })()
            : '<p class="section-info">✓ Vous pouvez modifier votre pseudo</p>') +
            '<div class="settings-form">' +
                '<input type="text" id="new-pseudo" class="input" placeholder="Nouveau pseudo" minlength="2" maxlength="20" value="" autocomplete="off">' +
                '<button class="btn-settings" onclick="changerPseudo()">Modifier le pseudo</button>' +
            '</div>' +
        '</div>' +
        
        '<div class="settings-section">' +
            '<h3 class="section-titre">🔑 Changer mon mot de passe</h3>' +
            '<div class="settings-form">' +
                '<div class="password-wrapper">' +
                    '<input type="password" id="current-password" class="input" placeholder="Mot de passe actuel" style="padding-right: 3rem">' +
                    '<button type="button" class="password-toggle" onclick="togglePasswordVisibilitySettings(\'current-password\')">👁️</button>' +
                '</div>' +
                '<div class="password-wrapper">' +
                    '<input type="password" id="new-password" class="input" placeholder="Nouveau mot de passe (min. 6 caracteres)" minlength="6" style="padding-right: 3rem">' +
                    '<button type="button" class="password-toggle" onclick="togglePasswordVisibilitySettings(\'new-password\')">👁️</button>' +
                '</div>' +
                '<div class="password-wrapper">' +
                    '<input type="password" id="confirm-password" class="input" placeholder="Confirmer le nouveau mot de passe" minlength="6" style="padding-right: 3rem">' +
                    '<button type="button" class="password-toggle" onclick="togglePasswordVisibilitySettings(\'confirm-password\')">👁️</button>' +
                '</div>' +
                '<button class="btn-settings btn-settings-warning" onclick="changerMotDePasse()">Modifier le mot de passe</button>' +
            '</div>' +
        '</div>' +
        
        '<div class="settings-section settings-danger">' +
            '<h3 class="section-titre">Zone dangereuse</h3>' +
            '<p class="section-description">Ces actions sont irreversibles</p>' +
            '<button class="btn-settings btn-settings-danger" onclick="supprimerCompte()">Supprimer mon compte</button>' +
        '</div>' +
    '</div>';
}
