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
    else if (state.vue === 'detailGroupe') contenu = renderDetailGroupe();
    else if (state.vue === 'detailPostGroupe') contenu = renderDetailPostGroupe();
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
            <button class="btn-icon" onclick="toggleModalRaccourcis()" title="Raccourcis clavier (?)" aria-label="Raccourcis clavier">⌨️</button>
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
        renderModalDoublons() +
        renderModalRaccourcis() +
        renderModalCreerGroupe() +
        renderModalRejoindreGroupe() +
        renderModalMembresGroupe() +
        renderModalGestionGroupe() +
        renderModalPartagerGroupe() +
        (state.toast ? '<div class="toast" role="status" aria-live="polite">' + state.toast + '</div>' : '') +
        footer;
}

function renderModalDoublons() {
    if (!state.modalDoublons) return '';

    var doublons = state.modalDoublons.doublons;
    var entree = state.modalDoublons.entree;
    var totalDoublons = doublons.exacts.length + doublons.probables.length + doublons.possibles.length;

    var html = '<div class="modal-overlay" onclick="annulerAjoutDoublon()">' +
        '<div class="modal-doublons" onclick="event.stopPropagation()">' +
            '<div class="modal-doublons-header">' +
                '<h2>⚠️ Attention : produits similaires détectés</h2>' +
                '<button class="modal-close" onclick="annulerAjoutDoublon()" aria-label="Fermer">✕</button>' +
            '</div>' +
            '<div class="modal-doublons-body">' +
                '<p class="modal-doublons-message">Nous avons trouvé <strong>' + totalDoublons + ' produit' + (totalDoublons > 1 ? 's' : '') + ' similaire' + (totalDoublons > 1 ? 's' : '') + '</strong> dans votre collection :</p>' +
                '<div class="modal-doublons-nouveau">' +
                    '<div class="modal-doublons-label">Produit que vous souhaitez ajouter :</div>' +
                    '<div class="doublon-item doublon-nouveau">' +
                        '<div class="doublon-couverture">' +
                            (entree.couverture ? '<img src="' + escapeHtml(entree.couverture) + '" alt="Couverture">' : '<div class="doublon-placeholder">' + (CATEGORIES[entree.categorie]?.icone || '✨') + '</div>') +
                        '</div>' +
                        '<div class="doublon-info">' +
                            '<div class="doublon-titre">' + escapeHtml(entree.titre) + '</div>' +
                            (entree.auteur ? '<div class="doublon-auteur">' + escapeHtml(entree.auteur) + '</div>' : '') +
                            '<div class="doublon-categorie"><span class="badge">' + (CATEGORIES[entree.categorie]?.nom || entree.categorie) + '</span></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="modal-doublons-liste">' +
                    '<div class="modal-doublons-label">Produits déjà dans votre collection :</div>';

    // Doublons exacts
    if (doublons.exacts.length > 0) {
        html += '<div class="doublons-section">' +
            '<div class="doublons-section-titre">🔴 Doublons exacts (' + doublons.exacts.length + ')</div>';
        doublons.exacts.forEach(function(d) {
            html += renderDoublonItem(d);
        });
        html += '</div>';
    }

    // Doublons probables
    if (doublons.probables.length > 0) {
        html += '<div class="doublons-section">' +
            '<div class="doublons-section-titre">🟠 Très similaires (' + doublons.probables.length + ')</div>';
        doublons.probables.forEach(function(d) {
            html += renderDoublonItem(d);
        });
        html += '</div>';
    }

    // Doublons possibles
    if (doublons.possibles.length > 0) {
        html += '<div class="doublons-section">' +
            '<div class="doublons-section-titre">🟡 Similaires (' + doublons.possibles.length + ')</div>';
        doublons.possibles.forEach(function(d) {
            html += renderDoublonItem(d);
        });
        html += '</div>';
    }

    html += '</div>' +
            '</div>' +
            '<div class="modal-doublons-footer">' +
                '<button class="btn-modal btn-annuler" onclick="annulerAjoutDoublon()">Annuler</button>' +
                '<button class="btn-modal btn-confirmer" onclick="confirmerAjoutMalgreDoublons()">Ajouter quand même</button>' +
            '</div>' +
        '</div>' +
    '</div>';

    return html;
}

function renderDoublonItem(doublon) {
    var e = doublon.entree;
    return '<div class="doublon-item" onclick="voirDetail(\'' + e.id + '\');annulerAjoutDoublon();" style="cursor:pointer" title="Cliquer pour voir la fiche">' +
        '<div class="doublon-couverture">' +
            (e.couverture ? '<img src="' + escapeHtml(e.couverture) + '" alt="Couverture">' : '<div class="doublon-placeholder">' + (CATEGORIES[e.categorie]?.icone || '✨') + '</div>') +
        '</div>' +
        '<div class="doublon-info">' +
            '<div class="doublon-titre">' + escapeHtml(e.titre) + '</div>' +
            (e.auteur ? '<div class="doublon-auteur">' + escapeHtml(e.auteur) + '</div>' : '') +
            '<div class="doublon-meta">' +
                '<span class="badge">' + (CATEGORIES[e.categorie]?.nom || e.categorie) + '</span>' +
                (e.dateDecouverte ? ' <span class="doublon-date">' + formatDate(e.dateDecouverte) + '</span>' : '') +
            '</div>' +
            '<div class="doublon-raison">' + doublon.raison + ' (' + doublon.score + '% similaire)</div>' +
        '</div>' +
    '</div>';
}

function renderModalRaccourcis() {
    if (!state.modalRaccourcis) return '';

    return '<div class="modal-overlay" onclick="toggleModalRaccourcis()">' +
        '<div class="modal-raccourcis" onclick="event.stopPropagation()">' +
            '<div class="modal-raccourcis-header">' +
                '<h2>⌨️ Raccourcis clavier</h2>' +
                '<button class="modal-close" onclick="toggleModalRaccourcis()" aria-label="Fermer">✕</button>' +
            '</div>' +
            '<div class="modal-raccourcis-body">' +
                '<div class="raccourcis-section">' +
                    '<h3 class="raccourcis-section-titre">Navigation</h3>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">L</span>' +
                        '<span class="raccourci-description">Retour à la liste</span>' +
                    '</div>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">S</span>' +
                        '<span class="raccourci-description">Ouvrir les Stats</span>' +
                    '</div>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">P</span>' +
                        '<span class="raccourci-description">Ouvrir la Pile</span>' +
                    '</div>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">O</span>' +
                        '<span class="raccourci-description">Ouvrir Social</span>' +
                    '</div>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">I</span>' +
                        '<span class="raccourci-description">Ouvrir Import/Export</span>' +
                    '</div>' +
                '</div>' +
                '<div class="raccourcis-section">' +
                    '<h3 class="raccourcis-section-titre">Actions</h3>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">+</span>' +
                        '<span class="raccourci-ou">ou</span>' +
                        '<span class="raccourci-touche">A</span>' +
                        '<span class="raccourci-description">Ajouter un produit</span>' +
                    '</div>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">/</span>' +
                        '<span class="raccourci-description">Focus sur la recherche</span>' +
                    '</div>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">Échap</span>' +
                        '<span class="raccourci-description">Fermer / Retour / Annuler</span>' +
                    '</div>' +
                '</div>' +
                '<div class="raccourcis-section">' +
                    '<h3 class="raccourcis-section-titre">Filtres & Affichage</h3>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">F</span>' +
                        '<span class="raccourci-description">Ouvrir/Fermer les filtres</span>' +
                    '</div>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">1</span>' +
                        '<span class="raccourci-touche">2</span>' +
                        '<span class="raccourci-touche">3</span>' +
                        '<span class="raccourci-touche">4</span>' +
                        '<span class="raccourci-touche">5</span>' +
                        '<span class="raccourci-description">Filtrer par note (toggle)</span>' +
                    '</div>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">G</span>' +
                        '<span class="raccourci-description">Basculer Grille/Liste</span>' +
                    '</div>' +
                '</div>' +
                '<div class="raccourcis-section">' +
                    '<h3 class="raccourcis-section-titre">Aide</h3>' +
                    '<div class="raccourci-item">' +
                        '<span class="raccourci-touche">?</span>' +
                        '<span class="raccourci-description">Afficher cette aide</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
}
