function renderImportExport() {
    var entreesFiltrees = getEntreesFiltrees();
    var tagsDisponibles = getTagsDisponibles();
    var genres = getGenresDisponibles();

    var html = '<div class="import-export-container">' +
        '<div class="import-export-header">' +
            '<h2 class="import-export-titre">📤 Import / Export CSV</h2>' +
            '<button class="btn-retour" onclick="retourListe()" aria-label="Retour à la liste">← Retour</button>' +
        '</div>' +

        // Section Export
        '<div class="import-export-section">' +
            '<h3 class="section-titre">📤 Exporter mes découvertes</h3>' +
            '<p class="section-description">Exportez vos découvertes au format CSV. Vous pouvez filtrer les entrées avant l\'export.</p>' +

            '<div class="export-filtres">' +
                '<h4 class="filtres-titre">Filtres d\'export</h4>' +
                '<div class="filtres-grid">' +
                    '<div class="filtre-groupe">' +
                        '<label class="filtre-label">Catégorie</label>' +
                        '<select class="export-select" id="export-filtre-categorie">' +
                            '<option value="tous">Toutes les catégories</option>' +
                            Object.entries(CATEGORIES).map(function(entry) {
                                var k = entry[0];
                                var v = entry[1];
                                return '<option value="' + k + '">' + v.nom + '</option>';
                            }).join('') +
                        '</select>' +
                    '</div>' +
                    '<div class="filtre-groupe">' +
                        '<label class="filtre-label">Note</label>' +
                        '<select class="export-select" id="export-filtre-note">' +
                            '<option value="tous">Toutes les notes</option>' +
                            [5,4,3,2,1].map(function(n) {
                                return '<option value="' + n + '">' + '★'.repeat(n) + '</option>';
                            }).join('') +
                        '</select>' +
                    '</div>' +
                    '<div class="filtre-groupe">' +
                        '<label class="filtre-label">Statut de lecture</label>' +
                        '<select class="export-select" id="export-filtre-statut">' +
                            '<option value="tous">Tous les statuts</option>' +
                            STATUTS_LECTURE.map(function(s) {
                                return '<option value="' + s + '">' + STATUTS_LECTURE_LABELS[s] + '</option>';
                            }).join('') +
                        '</select>' +
                    '</div>' +
                    '<div class="filtre-groupe">' +
                        '<label class="filtre-label">Date (depuis)</label>' +
                        '<input type="date" class="export-input" id="export-filtre-date-debut" />' +
                    '</div>' +
                    '<div class="filtre-groupe">' +
                        '<label class="filtre-label">Date (jusqu\'à)</label>' +
                        '<input type="date" class="export-input" id="export-filtre-date-fin" />' +
                    '</div>' +
                '</div>' +

                (tagsDisponibles.length > 0 ?
                    '<div class="filtre-groupe-tags">' +
                        '<div class="export-tags-header">' +
                            '<label class="filtre-label">Tags</label>' +
                            (tagsDisponibles.length > 10 ?
                                '<div class="recherche-tag recherche-tag-export">' +
                                    '<span class="recherche-icone">🔍</span>' +
                                    '<input type="text" class="recherche-tag-export-input" placeholder="Rechercher un tag..." value="' + escapeHtml(state.rechercheTagExport) + '" oninput="setRechercheTagExport(this.value)">' +
                                    (state.rechercheTagExport ?
                                        '<button class="btn-clear-recherche-tag" onclick="setRechercheTagExport(\'\');render()" title="Effacer la recherche">✕</button>'
                                    : '') +
                                '</div>'
                            : '') +
                        '</div>' +
                        '<div class="export-tags-liste">' +
                            (function() {
                                var tagsFiltres = tagsDisponibles;
                                var limiteAffichage = 30;

                                // Si plus de 10 tags et pas de recherche, on n'affiche rien
                                if (tagsDisponibles.length > 10 && !state.rechercheTagExport) {
                                    return '<div class="export-tags-info">Utilisez la recherche ci-dessus pour sélectionner des tags (' + tagsDisponibles.length + ' tags disponibles)</div>';
                                }

                                if (state.rechercheTagExport) {
                                    tagsFiltres = tagsDisponibles.filter(function(tag) {
                                        return tag.toLowerCase().includes(state.rechercheTagExport.toLowerCase());
                                    });
                                }

                                if (tagsFiltres.length === 0) {
                                    return '<div class="aucun-tag-trouve">Aucun tag trouvé pour "' + escapeHtml(state.rechercheTagExport) + '"</div>';
                                }

                                var tagsAfficher = tagsFiltres.slice(0, limiteAffichage);
                                var html = tagsAfficher.map(function(tag) {
                                    return '<label class="export-tag-checkbox">' +
                                        '<input type="checkbox" class="export-tag-check" value="' + escapeHtml(tag) + '" />' +
                                        '<span>' + escapeHtml(tag) + '</span>' +
                                    '</label>';
                                }).join('');

                                if (tagsFiltres.length > limiteAffichage) {
                                    html += '<div class="tags-limite-info">... et ' + (tagsFiltres.length - limiteAffichage) + ' autres tags. Affinez votre recherche pour les voir.</div>';
                                }

                                return html;
                            })() +
                        '</div>' +
                    '</div>'
                : '') +

                '<div class="export-actions">' +
                    '<button class="btn-apercu-export" onclick="afficherApercuExport()">👁️ Aperçu des entrées à exporter</button>' +
                '</div>' +
            '</div>' +

            '<div id="export-apercu" style="display:none;"></div>' +

            '<div class="export-buttons">' +
                '<button class="btn-exporter" onclick="exporterToutesLesEntrees()">📥 Exporter toutes les entrées filtrées</button>' +
            '</div>' +
        '</div>' +

        // Section Import
        '<div class="import-export-section">' +
            '<h3 class="section-titre">📥 Importer des découvertes</h3>' +
            '<p class="section-description">Importez plusieurs découvertes en une fois depuis un fichier CSV.</p>' +

            '<div class="import-zone">' +
                '<input type="file" id="import-file-input" accept=".csv" style="display:none" onchange="traiterFichierCSV(this)" />' +
                '<button class="btn-choisir-fichier" onclick="document.getElementById(\'import-file-input\').click()">📁 Choisir un fichier CSV</button>' +
                '<div class="import-info">Format accepté : .csv (séparateur de colonnes : virgule)</div>' +
            '</div>' +

            '<div class="import-exemple">' +
                '<h4 class="exemple-titre">📄 Fichier exemple</h4>' +
                '<p class="exemple-description">Téléchargez un fichier CSV vierge pour voir le format attendu :</p>' +
                '<button class="btn-telecharger-exemple" onclick="telechargerCSVExemple()">⬇️ Télécharger le fichier exemple</button>' +
                '<div class="import-notes">' +
                    '<p class="note-titre">💡 Notes importantes :</p>' +
                    '<ul class="notes-liste">' +
                        '<li>Dans le CSV : utilisez des <strong>point-virgules (;)</strong> pour séparer les <strong>genres, tags et statuts de possession</strong><br>' +
                            '<small style="color:var(--text-muted);">La virgule est le séparateur de colonnes du CSV</small></li>' +
                        '<li>Dans le formulaire manuel : utilisez des <strong>virgules (,)</strong> pour ajouter plusieurs tags en une fois</li>' +
                        '<li>Les <strong>doublons</strong> (même titre et auteur) seront automatiquement détectés et ignorés</li>' +
                        '<li>Exemple CSV : <code>"classique;incontournable;must-read"</code></li>' +
                        '<li>Exemple formulaire : <code>classique, incontournable, must-read</code></li>' +
                    '</ul>' +
                '</div>' +
            '</div>' +
        '</div>' +

    '</div>';

    return html;
}
