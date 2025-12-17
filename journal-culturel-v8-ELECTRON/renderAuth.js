function renderAuth() {
    return '<div class="auth-container"><div class="auth-card">' +
        '<div class="auth-header">' +
            '<div class="auth-logo">📖</div>' +
            '<div class="auth-text">' +
                '<h1 class="auth-title">Quasernet</h1>' +
                '<p class="auth-slogan">Mon Journal Culturel</p>' +
            '</div>' +
        '</div>' +
        '<p class="auth-subtitle">' + (state.authMode === 'login' ? 'Connectez-vous' : 'Creez votre compte') + '</p>' +
        (state.authError ? '<div class="auth-error">' + state.authError + '</div>' : '') +
        '<form class="auth-form" onsubmit="handleAuthSubmit(event)">' +
            (state.authMode === 'register' ? '<input type="text" id="auth-pseudo" class="auth-input" placeholder="Pseudo (unique, affiche publiquement)" required minlength="2" maxlength="20">' : '') +
            '<input type="email" id="auth-email" class="auth-input" placeholder="Email" required>' +
            '<div class="password-wrapper">' +
                '<input type="password" id="auth-password" class="auth-input" style="padding-right: 3rem" placeholder="Mot de passe" required minlength="6">' +
                '<button type="button" class="password-toggle" onclick="togglePasswordVisibility()">👁️</button>' +
            '</div>' +
            '<button type="submit" class="auth-btn auth-btn-primary">' + (state.authMode === 'login' ? 'Connexion' : 'Creer mon compte') + '</button>' +
        '</form>' +
        '<div class="auth-divider"><span>ou</span></div>' +
        '<button class="auth-btn auth-btn-secondary" onclick="toggleAuthMode()">' + (state.authMode === 'login' ? "Creer un compte" : "J\'ai un compte") + '</button>' +
        '<button class="auth-btn auth-btn-secondary" onclick="toggleTheme()" style="margin-top:1rem">' + (state.theme === 'light' ? '🌙' : '☀️') + ' Theme</button>' +
    '</div></div>';
}
