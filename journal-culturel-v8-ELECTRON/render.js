function render() {
    var c = document.getElementById('app');

    // Écran de chargement
    if (state.authLoading) {
        c.innerHTML = '<div class="loading-screen"><div class="loading-spinner">📚</div><p class="loading-text">Chargement...</p></div>';
        return;
    }

    // Vérifier si un mode a été choisi
    if (!state.mode) {
        c.innerHTML = renderModeChoice();
        return;
    }

    // Mode Local (Electron)
    if (state.mode === 'local') {
        // Si en attente de sélection de dossier
        if (state.needsFolderSelection) {
            c.innerHTML = renderFolderSelection();
            return;
        }

        // Sinon, afficher l'app en mode local
        if (state.vue === 'settings') {
            c.innerHTML = renderSettings();
            return;
        }
        c.innerHTML = renderApp();
        return;
    }

    // Mode Cloud (Firebase)
    if (state.mode === 'cloud') {
        if (!firebaseInitialized) {
            c.innerHTML = '<div class="auth-container"><div class="auth-card"><div class="auth-logo">⚙️</div><h1 class="auth-title">Configuration requise</h1><p class="auth-subtitle">Firebase non configuré</p></div></div>';
            return;
        }
        if (!state.user) {
            c.innerHTML = renderAuth();
            return;
        }
        if (state.vue === 'settings') {
            c.innerHTML = renderSettings();
            return;
        }
        c.innerHTML = renderApp();
        return;
    }
}
