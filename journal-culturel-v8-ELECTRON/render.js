function render() {
    var c = document.getElementById('app');
    if (state.authLoading) {
        c.innerHTML = '<div class="loading-screen"><div class="loading-spinner">📚</div><p class="loading-text">Chargement...</p></div>';
        return;
    }

    // MODE LOCAL : pas besoin d'auth
    if (state.mode === 'local') {
        // Si Electron et besoin de sélectionner un dossier
        if (state.needsFolderSelection) {
            c.innerHTML = renderFolderSelection();
            return;
        }
        if (state.vue === 'settings') {
            c.innerHTML = renderSettings();
            return;
        }
        c.innerHTML = renderApp();
        return;
    }

    // Si pas de mode choisi et pas de user Firebase → afficher choix de mode
    if (!state.mode && !state.user) {
        c.innerHTML = renderModeChoice();
        return;
    }

    // MODE CLOUD (comportement actuel)
    if (!firebaseInitialized) {
        c.innerHTML = '<div class="auth-container"><div class="auth-card"><div class="auth-logo">⚙️</div><h1 class="auth-title">Configuration requise</h1><p class="auth-subtitle">Firebase non configure</p></div></div>';
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
}
