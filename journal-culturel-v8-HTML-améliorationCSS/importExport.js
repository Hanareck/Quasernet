// FONCTIONS IMPORT/EXPORT CSV

// Fonction pour obtenir les entrées filtrées pour l'export
function getEntreesExportFiltrees() {
    var categorie = document.getElementById('export-filtre-categorie')?.value || 'tous';
    var note = document.getElementById('export-filtre-note')?.value || 'tous';
    var statut = document.getElementById('export-filtre-statut')?.value || 'tous';
    var dateDebut = document.getElementById('export-filtre-date-debut')?.value || '';
    var dateFin = document.getElementById('export-filtre-date-fin')?.value || '';

    var tagsSelectionnes = [];
    var checkboxes = document.querySelectorAll('.export-tag-check:checked');
    checkboxes.forEach(function(cb) {
        tagsSelectionnes.push(cb.value);
    });

    return state.entrees.filter(function(e) {
        if (categorie !== 'tous' && e.categorie !== categorie) return false;
        if (note !== 'tous' && e.note !== parseInt(note)) return false;
        if (statut !== 'tous' && e.statutLecture !== statut) return false;

        if (dateDebut) {
            var dateEntree = e.dateDecouverte || e.dateCreation;
            if (dateEntree && dateEntree < dateDebut) return false;
        }

        if (dateFin) {
            var dateEntree = e.dateDecouverte || e.dateCreation;
            if (dateEntree && dateEntree > dateFin) return false;
        }

        if (tagsSelectionnes.length > 0) {
            var entreeTags = Array.isArray(e.tags) ? e.tags : [];
            var hasAllTags = tagsSelectionnes.every(function(tag) {
                return entreeTags.indexOf(tag) !== -1;
            });
            if (!hasAllTags) return false;
        }

        return true;
    });
}

// Afficher l'aperçu des entrées à exporter
window.afficherApercuExport = function() {
    var entrees = getEntreesExportFiltrees();
    var apercuDiv = document.getElementById('export-apercu');

    if (!apercuDiv) return;

    if (entrees.length === 0) {
        apercuDiv.innerHTML = '<div class="export-apercu-vide">Aucune entrée ne correspond aux filtres sélectionnés.</div>';
        apercuDiv.style.display = 'block';
        return;
    }

    var html = '<div class="export-apercu-container">' +
        '<div class="export-apercu-header">' +
            '<h4 class="export-apercu-titre">' + entrees.length + ' entrée(s) à exporter</h4>' +
            '<button class="btn-selectionner-tout" onclick="selectionnerToutesLesEntrees(true)">☑️ Tout sélectionner</button>' +
            '<button class="btn-deselectionner-tout" onclick="selectionnerToutesLesEntrees(false)">☐ Tout désélectionner</button>' +
        '</div>' +
        '<div class="export-apercu-liste">' +
            entrees.map(function(e) {
                return '<label class="export-apercu-item">' +
                    '<input type="checkbox" class="export-entree-check" value="' + e.id + '" checked />' +
                    '<div class="export-apercu-info">' +
                        '<div class="export-apercu-titre-entree">' + escapeHtml(e.titre) + '</div>' +
                        '<div class="export-apercu-meta">' +
                            (e.auteur ? escapeHtml(e.auteur) + ' • ' : '') +
                            (CATEGORIES[e.categorie]?.nom || e.categorie) +
                            (e.note ? ' • ' + '★'.repeat(e.note) : '') +
                        '</div>' +
                    '</div>' +
                '</label>';
            }).join('') +
        '</div>' +
        '<button class="btn-exporter-selection" onclick="exporterSelection()">📥 Exporter la sélection (' + entrees.length + ')</button>' +
    '</div>';

    apercuDiv.innerHTML = html;
    apercuDiv.style.display = 'block';
};

// Sélectionner/désélectionner toutes les entrées
window.selectionnerToutesLesEntrees = function(selectionner) {
    var checkboxes = document.querySelectorAll('.export-entree-check');
    checkboxes.forEach(function(cb) {
        cb.checked = selectionner;
    });
};

// Convertir une entrée en ligne CSV
function entreeVersCsv(entree) {
    var genres = Array.isArray(entree.genres) ? entree.genres.join(';') : (entree.genre || '');
    var tags = Array.isArray(entree.tags) ? entree.tags.join(';') : '';
    var statutsPossession = Array.isArray(entree.statutPossession) ? entree.statutPossession.join(';') : (entree.statutPossession || '');

    var colonnes = [
        entree.titre || '',
        entree.auteur || '',
        entree.categorie || '',
        genres,
        tags,
        entree.dateDecouverte || entree.dateCreation || '',
        entree.note || '',
        entree.critique ? entree.critique.replace(/"/g, '""') : '',
        entree.couverture || '',
        entree.statutLecture || '',
        statutsPossession,
        entree.dateRetour || '',
        entree.prive ? 'oui' : 'non',
        entree.lienYoutube || '',
        entree.typeMusique || '',
        entree.lienSpotify || '',
        entree.lienDeezer || '',
        entree.lienQobuz || ''
    ];

    return colonnes.map(function(col) {
        return '"' + String(col).replace(/"/g, '""') + '"';
    }).join(',');
}

// Exporter toutes les entrées filtrées
window.exporterToutesLesEntrees = function() {
    var entrees = getEntreesExportFiltrees();

    if (entrees.length === 0) {
        afficherToast('Aucune entrée à exporter');
        return;
    }

    var csv = 'Titre,Auteur,Catégorie,Genres,Tags,Date,Note,Critique,Couverture,Statut Lecture,Statuts Possession,Date Retour,Privé,Lien YouTube,Type Musique,Lien Spotify,Lien Deezer,Lien Qobuz\n';

    entrees.forEach(function(e) {
        csv += entreeVersCsv(e) + '\n';
    });

    telechargerFichier(csv, 'mes-decouvertes-' + new Date().toISOString().split('T')[0] + '.csv', 'text/csv');
    afficherToast(entrees.length + ' entrée(s) exportée(s) !');
};

// Exporter la sélection
window.exporterSelection = function() {
    var checkboxes = document.querySelectorAll('.export-entree-check:checked');
    var idsSelectionnes = [];
    checkboxes.forEach(function(cb) {
        idsSelectionnes.push(cb.value);
    });

    if (idsSelectionnes.length === 0) {
        afficherToast('Aucune entrée sélectionnée');
        return;
    }

    var entrees = state.entrees.filter(function(e) {
        return idsSelectionnes.indexOf(e.id) !== -1;
    });

    var csv = 'Titre,Auteur,Catégorie,Genres,Tags,Date,Note,Critique,Couverture,Statut Lecture,Statuts Possession,Date Retour,Privé,Lien YouTube,Type Musique,Lien Spotify,Lien Deezer,Lien Qobuz\n';

    entrees.forEach(function(e) {
        csv += entreeVersCsv(e) + '\n';
    });

    telechargerFichier(csv, 'mes-decouvertes-selection-' + new Date().toISOString().split('T')[0] + '.csv', 'text/csv');
    afficherToast(entrees.length + ' entrée(s) exportée(s) !');
};

// Télécharger un fichier CSV exemple
window.telechargerCSVExemple = function() {
    var csv = 'Titre,Auteur,Catégorie,Genres,Tags,Date,Note,Critique,Couverture,Statut Lecture,Statuts Possession,Date Retour,Privé,Lien YouTube,Type Musique,Lien Spotify,Lien Deezer,Lien Qobuz\n';
    csv += '"1984","George Orwell","livre","Science-Fiction;Dystopie","classique;incontournable;must-read","2024-01-15","5","Un chef-d\'œuvre de la littérature dystopique","","Decouvert","Possede","","non","","","","",""\n';
    csv += '"Inception","Christopher Nolan","film","SF;Thriller","mind-bending;visuel","2024-01-20","5","Un film visuellement époustouflant","","Decouvert","Streaming","","non","","","","",""\n';
    csv += '"Bohemian Rhapsody","Queen","musique","Rock","années 70;rock classique","2024-02-01","5","Une chanson iconique","","Decouvert","Streaming","","non","","morceau","https://open.spotify.com/track/...","",""\n';

    telechargerFichier(csv, 'exemple-decouvertes.csv', 'text/csv');
    afficherToast('Fichier exemple téléchargé !');
};

// Fonction utilitaire pour télécharger un fichier
function telechargerFichier(contenu, nomFichier, type) {
    var blob = new Blob([contenu], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nomFichier;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Traiter le fichier CSV importé
window.traiterFichierCSV = function(input) {
    var fichier = input.files[0];
    if (!fichier) return;

    var reader = new FileReader();

    reader.onload = function(e) {
        var contenu = e.target.result;
        var lignes = contenu.split('\n');

        if (lignes.length < 2) {
            afficherToast('Fichier CSV vide ou invalide');
            input.value = '';
            return;
        }

        var entrees = [];
        var erreurs = [];

        for (var i = 1; i < lignes.length; i++) {
            var ligne = lignes[i].trim();
            if (!ligne) continue;

            try {
                var colonnes = parseCSVLine(ligne);

                if (colonnes.length < 18) {
                    erreurs.push('Ligne ' + (i + 1) + ': nombre de colonnes insuffisant');
                    continue;
                }

                var titre = colonnes[0];
                if (!titre) {
                    erreurs.push('Ligne ' + (i + 1) + ': titre manquant');
                    continue;
                }

                var entree = {
                    titre: titre,
                    auteur: colonnes[1] || '',
                    categorie: colonnes[2] || 'autre',
                    genres: colonnes[3] ? colonnes[3].split(';').map(function(g) { return g.trim(); }).filter(function(g) { return g; }) : [],
                    tags: colonnes[4] ? colonnes[4].split(';').map(function(t) { return t.trim(); }).filter(function(t) { return t; }) : [],
                    dateDecouverte: colonnes[5] || new Date().toISOString().split('T')[0],
                    note: parseInt(colonnes[6]) || 0,
                    critique: colonnes[7] || '',
                    couverture: colonnes[8] || '',
                    statutLecture: colonnes[9] || 'Decouvert',
                    statutPossession: colonnes[10] ? colonnes[10].split(';').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [],
                    dateRetour: colonnes[11] || '',
                    prive: colonnes[12] === 'oui',
                    lienYoutube: colonnes[13] || '',
                    typeMusique: colonnes[14] || 'album',
                    lienSpotify: colonnes[15] || '',
                    lienDeezer: colonnes[16] || '',
                    lienQobuz: colonnes[17] || '',
                    dateCreation: new Date().toISOString()
                };

                entrees.push(entree);
            } catch (err) {
                erreurs.push('Ligne ' + (i + 1) + ': ' + err.message);
            }
        }

        if (erreurs.length > 0) {
            console.warn('Erreurs lors de l\'import :', erreurs);
        }

        if (entrees.length === 0) {
            afficherToast('Aucune entrée valide trouvée dans le fichier');
            input.value = '';
            return;
        }

        importerEntrees(entrees, erreurs);
        input.value = '';
    };

    reader.readAsText(fichier);
};

// Parser une ligne CSV avec gestion des guillemets
function parseCSVLine(ligne) {
    var colonnes = [];
    var colonne = '';
    var dansGuillemets = false;

    for (var i = 0; i < ligne.length; i++) {
        var char = ligne[i];
        var nextChar = ligne[i + 1];

        if (char === '"') {
            if (dansGuillemets && nextChar === '"') {
                colonne += '"';
                i++;
            } else {
                dansGuillemets = !dansGuillemets;
            }
        } else if (char === ',' && !dansGuillemets) {
            colonnes.push(colonne);
            colonne = '';
        } else {
            colonne += char;
        }
    }

    colonnes.push(colonne);
    return colonnes;
}

// Vérifier si une entrée existe déjà (même titre et auteur)
function entreeExisteDeja(titre, auteur) {
    return state.entrees.some(function(e) {
        var titreSimilaire = e.titre.toLowerCase().trim() === titre.toLowerCase().trim();
        var auteurSimilaire = (e.auteur || '').toLowerCase().trim() === (auteur || '').toLowerCase().trim();
        return titreSimilaire && auteurSimilaire;
    });
}

// Importer les entrées dans Firestore
async function importerEntrees(entrees, erreurs) {
    var doublons = [];
    var entreesFiltrees = [];

    entrees.forEach(function(entree) {
        if (entreeExisteDeja(entree.titre, entree.auteur)) {
            doublons.push(entree.titre + (entree.auteur ? ' - ' + entree.auteur : ''));
        } else {
            entreesFiltrees.push(entree);
        }
    });

    var messageConfirm = 'Vous allez importer ' + entreesFiltrees.length + ' entrée(s).\n\n';

    if (doublons.length > 0) {
        messageConfirm += 'Attention : ' + doublons.length + ' doublon(s) détecté(s) et ignoré(s) :\n';
        messageConfirm += doublons.slice(0, 5).join('\n');
        if (doublons.length > 5) {
            messageConfirm += '\n... et ' + (doublons.length - 5) + ' autre(s)';
        }
        messageConfirm += '\n\n';
    }

    if (erreurs.length > 0) {
        messageConfirm += 'Attention : ' + erreurs.length + ' ligne(s) avec erreur(s) ont été ignorées.\n\n';
    }

    messageConfirm += 'Voulez-vous continuer ?';

    if (entreesFiltrees.length === 0) {
        afficherToast('Aucune nouvelle entrée à importer (tous des doublons ou erreurs)');
        return;
    }

    var confirmation = confirm(messageConfirm);
    if (!confirmation) return;

    state.syncing = true;
    render();

    var compteur = 0;
    var erreursImport = [];

    for (var i = 0; i < entreesFiltrees.length; i++) {
        try {
            await sauvegarderEntree(entreesFiltrees[i]);
            compteur++;
        } catch (err) {
            erreursImport.push('Erreur pour "' + entreesFiltrees[i].titre + '": ' + err.message);
        }
    }

    state.syncing = false;

    var message = compteur + ' entrée(s) importée(s) !';
    if (doublons.length > 0) {
        message += ' (' + doublons.length + ' doublon(s) ignoré(s))';
    }
    if (erreursImport.length > 0) {
        message += '\n' + erreursImport.length + ' erreur(s) lors de l\'import.';
        console.error('Erreurs d\'import :', erreursImport);
    }

    afficherToast(message);
    await chargerEntrees();
};
