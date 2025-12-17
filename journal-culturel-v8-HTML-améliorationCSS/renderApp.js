function renderApp() {
    // Header français, plus foncé et accessible
    var appName = "Quasernet";
    var appSlogan = "Gardez la mémoire de vos découvertes";
    var stats = getStats();
    var entrees = getEntreesFiltreesPaginated();
    var socialCount = getElementsNonVus();
    var dueSoonCount = getEntreesDueSoon().length;

    var contenu = '';
    if (state.vue === 'formulaire') contenu = renderFormulaire();
    else if (state.vue === 'detail' && state.entreeSelectionnee) contenu = renderDetail();
    else if (state.vue === 'stats') contenu = renderStats(stats);
    else if (state.vue === 'pile') contenu = renderPile();
    else if (state.vue === 'social') contenu = renderSocial();
    else if (state.vue === 'catalogueAmi') contenu = renderCatalogueAmi();
    else if (state.vue === 'detailAmi' && state.entreeAmiSelectionnee) contenu = renderDetailAmi();
    else if (state.vue === 'alertes') contenu = renderAlertes();
    else if (state.vue === 'contact') contenu = renderContact();
    else if (state.vue === 'importExport') contenu = renderImportExport();
    else contenu = renderListe(entrees);

    // Header français, plus foncé et accessible
    var header = `
    <header class="header header-fr">
        <div class="header-logo-zone">
            <img src="logo/logo5.png" alt="${appName} - Journal Culturel" class="header-logo-img">
        </div>
        <div class="header-user-zone">
            <span class="header-user-pseudo">${escapeHtml(state.userPseudo || '')}</span>
            ${dueSoonCount > 0 ? '<button class="btn-icon btn-alerte" onclick="setVue(\'alertes\')" title="' + dueSoonCount + ' emprunt(s) à rendre sous 7 jours" aria-label="Alertes emprunts"><span class="alerte-icone">⏰</span><span class="badge-notif-alerte">' + dueSoonCount + '</span></button>' : ''}
            <button class="btn-icon" onclick="toggleTheme()" title="Thème" aria-label="Changer le thème">${state.theme === 'light' ? '🌙' : '☀️'}</button>
            <button class="btn-icon" onclick="setVueSettings()" title="Paramètres" aria-label="Paramètres">⚙️</button>
            <button class="btn-icon" onclick="deconnexion()" title="Déconnexion" aria-label="Déconnexion">🚪</button>
        </div>
    </header>
    `;

    // Footer légal (inchangé)
    var footer = `
        <footer class="footer-legal">
            <div class="footer-legal-content">
                <div>
                    <strong>Contact :</strong> <a href="mailto:gaelpoumai@tutamail.com">gaelpoumai@tutamail.com</a> · <button class="btn-link-footer" onclick="setVue('contact')">📧 Formulaire de contact</button>
                </div>
                <div>
                    <strong>Mentions légales :</strong> Ce site est un carnet personnel de découvertes culturelles. Aucune donnée n'est exploitée à des fins commerciales.
                </div>
                <div>
                    &copy; ${new Date().getFullYear()} ${appName}. Tous droits réservés.
                </div>
                <div>
                    Hébergement : Google Firebase et netlify
                </div>
            </div>
        </footer>
    `;

    return (state.syncing ? '<div class="sync-indicator"><span class="sync-spinner">🔄</span> Sync...</div>' : '') +
        header +
        '<nav class="navigation" role="navigation" aria-label="Navigation principale">' +
            '<button class="onglet ' + (state.categorieActive === 'tous' && state.vue === 'liste' ? 'actif' : '') + '" onclick="setCategorie(\'tous\')" tabindex="0">📋 Tout</button>' +
            Object.entries(CATEGORIES).map(function(entry) {
                var k = entry[0];
                var v = entry[1];
                return '<button class="onglet ' + (state.categorieActive === k && state.vue === 'liste' ? 'actif' : '') + '" onclick="setCategorie(\'' + k + '\')" tabindex="0">' + v.icone + ' ' + v.nom + '</button>';
            }).join('') +
            '<button class="onglet onglet-special ' + (state.vue === 'pile' ? 'actif' : '') + '" onclick="setVue(\'pile\')" tabindex="0">📚 Pile</button>' +
            '<button class="onglet onglet-special push-right ' + (state.vue === 'stats' ? 'actif' : '') + '" onclick="setVue(\'stats\')" tabindex="0">📊 Stats</button>' +
            '<button class="onglet onglet-special ' + (state.vue === 'social' ? 'actif' : '') + '" onclick="setVue(\'social\')" tabindex="0">🌐 Social' + (socialCount > 0 ? '<span class="badge-notif">' + socialCount + '</span>' : '') + '</button>' +
            '<button class="onglet onglet-special ' + (state.vue === 'importExport' ? 'actif' : '') + '" onclick="setVue(\'importExport\')" tabindex="0">📤 Import/Export</button>' +
        '</nav>' +
        '<main class="main" id="main-content">' + contenu + '</main>' +
        (state.vue === 'liste' ? '<button class="btn-ajouter btn-ajouter-fixed" onclick="ouvrirAjout()" tabindex="0"><span style="font-size:1.25rem">+</span> Ajouter</button>' : '') +
        (state.vue === 'pile' ? '<button class="btn-ajouter btn-ajouter-fixed" onclick="ouvrirAjoutRapideDecouvrir()" tabindex="0"><span style="font-size:1.25rem">+</span> Ajout rapide</button>' : '') +
        (state.toast ? '<div class="toast" role="status" aria-live="polite">' + state.toast + '</div>' : '') +
        footer;
}
