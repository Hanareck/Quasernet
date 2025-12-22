function render() {
    var c = document.getElementById('app');
    if (state.authLoading) {
        c.innerHTML = '<div class="loading-screen"><div class="loading-spinner">📚</div><p class="loading-text">Chargement...</p></div>';
        return;
    }
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

    // Initialiser le comportement du scroll header après le rendu
    if (typeof initScrollHeader === 'function') {
        setTimeout(function() {
            initScrollHeader();
        }, 0);
    }
}
