function renderModeChoice() {
    return '<div class="mode-choice-container">' +
        '<div class="mode-choice-header">' +
            '<h1 class="mode-choice-titre">Bienvenue sur Quasernet</h1>' +
            '<p class="mode-choice-subtitle">Choisissez votre mode de fonctionnement</p>' +
        '</div>' +
        '<div class="mode-choice-options">' +
            '<div class="mode-card mode-local" onclick="choisirMode(\'local\')">' +
                '<div class="mode-icon">📁</div>' +
                '<h2 class="mode-titre">Mode Local</h2>' +
                '<ul class="mode-features">' +
                    '<li>✅ Gratuit et illimité</li>' +
                    '<li>🔒 Données privées chez vous</li>' +
                    '<li>💾 Fonctionne hors-ligne</li>' +
                    '<li>📤 Import/Export facile</li>' +
                    '<li>❌ Pas de social</li>' +
                '</ul>' +
                '<button class="btn-mode">Choisir Local</button>' +
            '</div>' +
            '<div class="mode-card mode-cloud" onclick="choisirMode(\'cloud\')">' +
                '<div class="mode-icon">☁️</div>' +
                '<h2 class="mode-titre">Mode Cloud</h2>' +
                '<ul class="mode-features">' +
                    '<li>🔄 Synchronisation auto</li>' +
                    '<li>👥 Fonctionnalités sociales</li>' +
                    '<li>📱 Multi-appareils</li>' +
                    '<li>💾 Backup automatique</li>' +
                    '<li>🔑 Nécessite un compte</li>' +
                '</ul>' +
                '<button class="btn-mode">Choisir Cloud</button>' +
            '</div>' +
        '</div>' +
        '<div class="mode-choice-footer">' +
            '<p class="mode-note">💡 Vous devrez choisir votre mode à chaque démarrage</p>' +
        '</div>' +
    '</div>';
}

window.choisirMode = function(mode) {
    setMode(mode);
    if (mode === 'local') {
        // Mode local : vérifier si on est en Electron
        if (typeof window.electron !== 'undefined') {
            // Mode Electron : initialiser et vérifier le dossier
            initialiserModeElectron();
        } else {
            // Mode local sans Electron (navigateur)
            initialiserModeLocal();
            render();
        }
    } else {
        // Mode cloud : continuer avec l'écran d'auth normal
        state.authLoading = false;
        render();
    }
};
