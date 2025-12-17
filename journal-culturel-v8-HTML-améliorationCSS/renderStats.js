function renderStats(s) {
    // Initialiser l'onglet actif
    if (!state.statsTab) state.statsTab = 'vue-ensemble';
    if (!state.statsPeriode) state.statsPeriode = 'annee'; // semaine, mois, annee, tout
    if (!state.statsCategorieFiltre) state.statsCategorieFiltre = 'tous';

    window.setStatsTab = function(tab) {
        state.statsTab = tab;
        render();
    };

    window.setStatsPeriode = function(periode) {
        state.statsPeriode = periode;
        render();
    };

    window.setStatsCategorieFiltre = function(cat) {
        state.statsCategorieFiltre = cat;
        render();
    };

    // Calcul des stats avancées
    var statsAvancees = calculerStatsAvancees();

    return '<div class="stats-container-new">' +
        '<div class="stats-header-new">' +
            '<div class="stats-header-left">' +
                '<h2 class="stats-titre-new">📊 Statistiques</h2>' +
                '<p class="stats-subtitle">Analysez vos découvertes culturelles</p>' +
            '</div>' +
            '<button class="btn-retour" onclick="retourListe()">← Retour</button>' +
        '</div>' +

        // Onglets
        '<div class="stats-tabs">' +
            '<button class="stats-tab ' + (state.statsTab === 'vue-ensemble' ? 'active' : '') + '" onclick="setStatsTab(\'vue-ensemble\')">🎯 Vue d\'ensemble</button>' +
            '<button class="stats-tab ' + (state.statsTab === 'decouvertes' ? 'active' : '') + '" onclick="setStatsTab(\'decouvertes\')">🔍 Découvertes</button>' +
            '<button class="stats-tab ' + (state.statsTab === 'objectifs' ? 'active' : '') + '" onclick="setStatsTab(\'objectifs\')">🏆 Objectifs</button>' +
            '<button class="stats-tab ' + (state.statsTab === 'records' ? 'active' : '') + '" onclick="setStatsTab(\'records\')">🌟 Records</button>' +
        '</div>' +

        // Contenu selon l'onglet
        renderStatsContent(s, statsAvancees) +
    '</div>';
}

function calculerStatsAvancees() {
    var now = new Date();
    var stats = {
        streak: 0,
        longestStreak: 0,
        moyenneNote: 0,
        genresPreferés: {},
        categoryMoyennes: {},
        derniereDecouverte: null,
        premiereDecouverte: null,
        totalParAnnee: {},
        comparaisonAnnee: {},
        achievements: []
    };

    if (state.entrees.length === 0) return stats;

    // Trier par date
    var entreesTriees = state.entrees.slice().sort(function(a, b) {
        var dateA = new Date(a.dateDecouverte || a.dateCreation);
        var dateB = new Date(b.dateDecouverte || b.dateCreation);
        return dateB - dateA;
    });

    // Dernière et première découverte
    stats.derniereDecouverte = entreesTriees[0];
    stats.premiereDecouverte = entreesTriees[entreesTriees.length - 1];

    // Calcul du streak (jours consécutifs avec au moins une découverte)
    var datesUniques = {};
    entreesTriees.forEach(function(e) {
        if (e.statutLecture !== 'A decouvrir' && (e.dateDecouverte || e.dateCreation)) {
            var date = new Date(e.dateDecouverte || e.dateCreation);
            var dateKey = date.toISOString().split('T')[0];
            datesUniques[dateKey] = true;
        }
    });

    var datesArray = Object.keys(datesUniques).sort().reverse();
    var currentStreak = 0;
    var longestStreak = 0;
    var tempStreak = 0;

    for (var i = 0; i < datesArray.length; i++) {
        if (i === 0) {
            var today = new Date().toISOString().split('T')[0];
            var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (datesArray[0] === today || datesArray[0] === yesterday) {
                currentStreak = 1;
                tempStreak = 1;
            }
        }

        if (i > 0) {
            var date1 = new Date(datesArray[i-1]);
            var date2 = new Date(datesArray[i]);
            var diffDays = Math.floor((date1 - date2) / 86400000);

            if (diffDays === 1) {
                tempStreak++;
                if (i === 1 && currentStreak > 0) currentStreak++;
            } else {
                if (tempStreak > longestStreak) longestStreak = tempStreak;
                tempStreak = 1;
            }
        }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    stats.streak = currentStreak;
    stats.longestStreak = longestStreak;

    // Moyenne des notes
    var notesArray = state.entrees.filter(function(e) { return e.note && e.note > 0; });
    if (notesArray.length > 0) {
        var sumNotes = notesArray.reduce(function(sum, e) { return sum + e.note; }, 0);
        stats.moyenneNote = (sumNotes / notesArray.length).toFixed(1);
    }

    // Genres préférés
    state.entrees.forEach(function(e) {
        var genres = Array.isArray(e.genres) ? e.genres : (e.genre ? [e.genre] : []);
        genres.forEach(function(g) {
            stats.genresPreferés[g] = (stats.genresPreferés[g] || 0) + 1;
        });
    });

    // Moyenne de notes par catégorie
    Object.keys(CATEGORIES).forEach(function(cat) {
        var catEntrees = state.entrees.filter(function(e) { return e.categorie === cat && e.note && e.note > 0; });
        if (catEntrees.length > 0) {
            var sum = catEntrees.reduce(function(s, e) { return s + e.note; }, 0);
            stats.categoryMoyennes[cat] = (sum / catEntrees.length).toFixed(1);
        }
    });

    // Stats par année
    state.entrees.forEach(function(e) {
        var date = new Date(e.dateDecouverte || e.dateCreation);
        var year = date.getFullYear();
        stats.totalParAnnee[year] = (stats.totalParAnnee[year] || 0) + 1;
    });

    // Comparaison avec l'année précédente
    var currentYear = now.getFullYear();
    var lastYear = currentYear - 1;
    var currentYearCount = stats.totalParAnnee[currentYear] || 0;
    var lastYearCount = stats.totalParAnnee[lastYear] || 0;
    stats.comparaisonAnnee = {
        actuelle: currentYearCount,
        precedente: lastYearCount,
        diff: currentYearCount - lastYearCount,
        pourcent: lastYearCount > 0 ? ((currentYearCount - lastYearCount) / lastYearCount * 100).toFixed(0) : 0
    };

    // Achievements
    if (state.entrees.length >= 10) stats.achievements.push({ icon: '🎓', titre: 'Explorateur', desc: '10 découvertes' });
    if (state.entrees.length >= 50) stats.achievements.push({ icon: '🎖️', titre: 'Collectionneur', desc: '50 découvertes' });
    if (state.entrees.length >= 100) stats.achievements.push({ icon: '🏅', titre: 'Expert', desc: '100 découvertes' });
    if (state.entrees.length >= 250) stats.achievements.push({ icon: '👑', titre: 'Maître', desc: '250 découvertes' });
    if (stats.longestStreak >= 7) stats.achievements.push({ icon: '🔥', titre: 'Série de 7', desc: stats.longestStreak + ' jours consécutifs' });
    if (stats.longestStreak >= 30) stats.achievements.push({ icon: '⚡', titre: 'Champion', desc: stats.longestStreak + ' jours consécutifs' });
    if (stats.moyenneNote >= 4) stats.achievements.push({ icon: '⭐', titre: 'Critique exigeant', desc: 'Moyenne ' + stats.moyenneNote + '/5' });

    return stats;
}

function renderStatsContent(s, statsAvancees) {
    if (state.statsTab === 'vue-ensemble') {
        return renderVueEnsemble(s, statsAvancees);
    } else if (state.statsTab === 'decouvertes') {
        return renderDecouvertes(s, statsAvancees);
    } else if (state.statsTab === 'objectifs') {
        return renderObjectifs(s, statsAvancees);
    } else if (state.statsTab === 'records') {
        return renderRecords(s, statsAvancees);
    }
    return '';
}

function renderVueEnsemble(s, statsAvancees) {
    return '<div class="stats-content">' +
        // Cards principales
        '<div class="stats-cards-grid">' +
            '<div class="stats-card-big primary">' +
                '<div class="stats-card-icon">📚</div>' +
                '<div class="stats-card-content">' +
                    '<div class="stats-card-value">' + s.total + '</div>' +
                    '<div class="stats-card-label">Découvertes totales</div>' +
                    (statsAvancees.comparaisonAnnee.diff !== 0 ?
                        '<div class="stats-card-trend ' + (statsAvancees.comparaisonAnnee.diff > 0 ? 'up' : 'down') + '">' +
                            (statsAvancees.comparaisonAnnee.diff > 0 ? '↗' : '↘') + ' ' +
                            Math.abs(statsAvancees.comparaisonAnnee.pourcent) + '% vs année précédente' +
                        '</div>' : ''
                    ) +
                '</div>' +
            '</div>' +
            '<div class="stats-card-big success">' +
                '<div class="stats-card-icon">🔥</div>' +
                '<div class="stats-card-content">' +
                    '<div class="stats-card-value">' + statsAvancees.streak + '</div>' +
                    '<div class="stats-card-label">Jours consécutifs</div>' +
                    '<div class="stats-card-detail">Record : ' + statsAvancees.longestStreak + ' jours</div>' +
                '</div>' +
            '</div>' +
            '<div class="stats-card-big warning">' +
                '<div class="stats-card-icon">⭐</div>' +
                '<div class="stats-card-content">' +
                    '<div class="stats-card-value">' + (statsAvancees.moyenneNote || '—') + '</div>' +
                    '<div class="stats-card-label">Note moyenne</div>' +
                    '<div class="stats-card-detail">' + renderEtoiles(Math.round(parseFloat(statsAvancees.moyenneNote) || 0)) + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="stats-card-big info">' +
                '<div class="stats-card-icon">📅</div>' +
                '<div class="stats-card-content">' +
                    '<div class="stats-card-value">' + s.ceMois + '</div>' +
                    '<div class="stats-card-label">Ce mois-ci</div>' +
                    '<div class="stats-card-detail">' + s.cetteAnnee + ' cette année</div>' +
                '</div>' +
            '</div>' +
        '</div>' +

        // Mini cards
        '<div class="stats-mini-cards">' +
            '<div class="stats-mini-card orange">' +
                '<div class="stats-mini-icon">📋</div>' +
                '<div class="stats-mini-value">' + s.aDecouvrir + '</div>' +
                '<div class="stats-mini-label">À découvrir</div>' +
            '</div>' +
            '<div class="stats-mini-card blue">' +
                '<div class="stats-mini-icon">🛒</div>' +
                '<div class="stats-mini-value">' + s.aAcheter + '</div>' +
                '<div class="stats-mini-label">À acheter</div>' +
            '</div>' +
            '<div class="stats-mini-card purple">' +
                '<div class="stats-mini-icon">🤝</div>' +
                '<div class="stats-mini-value">' + s.empruntes + '</div>' +
                '<div class="stats-mini-label">Emprunté</div>' +
            '</div>' +
        '</div>' +

        // Graphiques principaux
        '<div class="stats-row-2col">' +
            '<div class="stats-panel">' +
                '<h3 class="stats-panel-titre">📊 Par catégorie</h3>' +
                '<div class="stats-barres-new">' +
                    Object.entries(CATEGORIES).map(function(entry) {
                        var k = entry[0];
                        var v = entry[1];
                        var count = s.parCategorie[k] || 0;
                        var maxCat = Math.max.apply(null, Object.values(s.parCategorie).concat([1]));
                        var percent = (count / s.total * 100).toFixed(0);
                        return '<div class="stats-barre-new">' +
                            '<div class="stats-barre-header">' +
                                '<span class="stats-barre-label-new">' + v.icone + ' ' + v.nom + '</span>' +
                                '<span class="stats-barre-count">' + count + ' (' + percent + '%)</span>' +
                            '</div>' +
                            '<div class="stats-barre-track-new">' +
                                '<div class="stats-barre-fill-new" style="width:' + (count / maxCat * 100) + '%"></div>' +
                            '</div>' +
                        '</div>';
                    }).join('') +
                '</div>' +
            '</div>' +

            '<div class="stats-panel">' +
                '<h3 class="stats-panel-titre">⭐ Répartition des notes</h3>' +
                '<div class="stats-notes-circle">' +
                    [5, 4, 3, 2, 1].map(function(n) {
                        var count = s.parNote[n] || 0;
                        var total = Object.values(s.parNote).reduce(function(sum, v) { return sum + v; }, 0);
                        var percent = total > 0 ? (count / total * 100).toFixed(0) : 0;
                        return '<div class="stats-note-item">' +
                            '<div class="stats-note-stars">' + renderEtoiles(n) + '</div>' +
                            '<div class="stats-note-bar">' +
                                '<div class="stats-note-fill note-' + n + '" style="width:' + percent + '%"></div>' +
                            '</div>' +
                            '<div class="stats-note-value">' + count + '</div>' +
                        '</div>';
                    }).join('') +
                '</div>' +
            '</div>' +
        '</div>' +

        // Achievements
        (statsAvancees.achievements.length > 0 ?
            '<div class="stats-panel">' +
                '<h3 class="stats-panel-titre">🏆 Vos accomplissements</h3>' +
                '<div class="achievements-grid">' +
                    statsAvancees.achievements.map(function(ach) {
                        return '<div class="achievement-badge">' +
                            '<div class="achievement-icon">' + ach.icon + '</div>' +
                            '<div class="achievement-titre">' + ach.titre + '</div>' +
                            '<div class="achievement-desc">' + ach.desc + '</div>' +
                        '</div>';
                    }).join('') +
                '</div>' +
            '</div>' : ''
        ) +
    '</div>';
}

function renderDecouvertes(s, statsAvancees) {
    var moisLabels = ['Jan','Fev','Mar','Avr','Mai','Juin','Juil','Aout','Sep','Oct','Nov','Dec'];
    var now = new Date();
    var last12 = [];
    for (var i = 11; i >= 0; i--) {
        var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        last12.push({
            label: moisLabels[d.getMonth()] + ' ' + String(d.getFullYear()).substr(2),
            value: s.parMois[key] || 0
        });
    }
    var maxMois = Math.max.apply(null, last12.map(function(m) { return m.value; }).concat([1]));

    // Top genres
    var topGenres = Object.entries(statsAvancees.genresPreferés)
        .sort(function(a, b) { return b[1] - a[1]; })
        .slice(0, 10);

    return '<div class="stats-content">' +
        '<div class="stats-panel">' +
            '<h3 class="stats-panel-titre">📈 Évolution des 12 derniers mois</h3>' +
            '<div class="stats-timeline">' +
                last12.map(function(m) {
                    var height = maxMois > 0 ? (m.value / maxMois * 100) : 0;
                    return '<div class="stats-timeline-item">' +
                        '<div class="stats-timeline-bar" style="height:' + height + '%">' +
                            (m.value > 0 ? '<span class="stats-timeline-value">' + m.value + '</span>' : '') +
                        '</div>' +
                        '<div class="stats-timeline-label">' + m.label + '</div>' +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>' +

        '<div class="stats-row-2col">' +
            '<div class="stats-panel">' +
                '<h3 class="stats-panel-titre">🎭 Top 10 genres</h3>' +
                '<div class="stats-top-list">' +
                    (topGenres.length > 0 ?
                        topGenres.map(function(genre, idx) {
                            return '<div class="stats-top-item">' +
                                '<span class="stats-top-rank">#' + (idx + 1) + '</span>' +
                                '<span class="stats-top-name">' + escapeHtml(genre[0]) + '</span>' +
                                '<span class="stats-top-count">' + genre[1] + '</span>' +
                            '</div>';
                        }).join('')
                        : '<p class="stats-empty">Aucun genre enregistré</p>'
                    ) +
                '</div>' +
            '</div>' +

            '<div class="stats-panel">' +
                '<h3 class="stats-panel-titre">📊 Moyennes par catégorie</h3>' +
                '<div class="stats-moyennes">' +
                    Object.entries(CATEGORIES).map(function(entry) {
                        var k = entry[0];
                        var v = entry[1];
                        var moy = statsAvancees.categoryMoyennes[k];
                        return '<div class="stats-moyenne-item">' +
                            '<span class="stats-moyenne-cat">' + v.icone + ' ' + v.nom + '</span>' +
                            '<span class="stats-moyenne-note">' +
                                (moy ? '<span class="stats-moyenne-value">' + moy + '</span>' + renderEtoiles(Math.round(parseFloat(moy))) : '<span class="stats-moyenne-empty">—</span>') +
                            '</span>' +
                        '</div>';
                    }).join('') +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function renderObjectifs(s, statsAvancees) {
    // Objectifs par défaut
    var objectifs = [
        { titre: 'Lire 12 livres par an', cible: 12, actuel: (s.parCategorie.livre || 0), categorie: 'livre', icone: '📚' },
        { titre: 'Voir 24 films par an', cible: 24, actuel: (s.parCategorie.film || 0), categorie: 'film', icone: '🎬' },
        { titre: 'Découvrir 50 morceaux', cible: 50, actuel: (s.parCategorie.musique || 0), categorie: 'musique', icone: '🎵' },
        { titre: 'Maintenir un streak de 7 jours', cible: 7, actuel: statsAvancees.streak, categorie: 'streak', icone: '🔥' },
        { titre: 'Atteindre 100 découvertes', cible: 100, actuel: s.total, categorie: 'total', icone: '🎯' }
    ];

    return '<div class="stats-content">' +
        '<div class="stats-panel">' +
            '<div class="stats-panel-header">' +
                '<h3 class="stats-panel-titre">🎯 Objectifs 2025</h3>' +
                '<button class="btn-add-objectif" onclick="alert(\'Fonctionnalité à venir : définir vos propres objectifs !\')">+ Ajouter</button>' +
            '</div>' +
            '<div class="objectifs-grid">' +
                objectifs.map(function(obj) {
                    var progress = Math.min((obj.actuel / obj.cible * 100), 100);
                    var statut = progress >= 100 ? 'complete' : progress >= 75 ? 'almost' : progress >= 50 ? 'ontrack' : 'start';
                    return '<div class="objectif-card ' + statut + '">' +
                        '<div class="objectif-header">' +
                            '<span class="objectif-icon">' + obj.icone + '</span>' +
                            '<span class="objectif-titre">' + obj.titre + '</span>' +
                        '</div>' +
                        '<div class="objectif-progress">' +
                            '<div class="objectif-progress-bar">' +
                                '<div class="objectif-progress-fill" style="width:' + progress + '%"></div>' +
                            '</div>' +
                            '<div class="objectif-progress-text">' + obj.actuel + ' / ' + obj.cible + '</div>' +
                        '</div>' +
                        '<div class="objectif-footer">' +
                            '<span class="objectif-percent">' + progress.toFixed(0) + '%</span>' +
                            (progress >= 100 ?
                                '<span class="objectif-badge">✓ Atteint !</span>' :
                                '<span class="objectif-remaining">Encore ' + (obj.cible - obj.actuel) + '</span>'
                            ) +
                        '</div>' +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>' +

        '<div class="stats-panel">' +
            '<h3 class="stats-panel-titre">💡 Suggestions personnalisées</h3>' +
            '<div class="suggestions-list">' +
                generateSuggestions(s, statsAvancees).map(function(sugg) {
                    return '<div class="suggestion-card">' +
                        '<div class="suggestion-icon">' + sugg.icon + '</div>' +
                        '<div class="suggestion-content">' +
                            '<div class="suggestion-titre">' + sugg.titre + '</div>' +
                            '<div class="suggestion-desc">' + sugg.desc + '</div>' +
                        '</div>' +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>' +
    '</div>';
}

function generateSuggestions(s, statsAvancees) {
    var suggestions = [];

    if (s.aDecouvrir > 5) {
        suggestions.push({
            icon: '📋',
            titre: 'Liste d\'attente chargée',
            desc: 'Vous avez ' + s.aDecouvrir + ' découvertes en attente. Peut-être le moment d\'en explorer quelques-unes ?'
        });
    }

    if (statsAvancees.streak === 0 && s.total > 10) {
        suggestions.push({
            icon: '🔥',
            titre: 'Relancez votre streak !',
            desc: 'Ajoutez une découverte aujourd\'hui pour commencer une nouvelle série.'
        });
    }

    if (s.parCategorie.livre && s.parCategorie.film && (s.parCategorie.livre / s.parCategorie.film) > 3) {
        suggestions.push({
            icon: '🎬',
            titre: 'Équilibrez vos découvertes',
            desc: 'Vous lisez beaucoup ! Que diriez-vous d\'un bon film ?'
        });
    }

    if (statsAvancees.moyenneNote && parseFloat(statsAvancees.moyenneNote) < 3) {
        suggestions.push({
            icon: '⭐',
            titre: 'Trouvez vos pépites',
            desc: 'Votre moyenne est de ' + statsAvancees.moyenneNote + '/5. Explorez de nouveaux genres pour trouver vos coups de cœur !'
        });
    }

    if (suggestions.length === 0) {
        suggestions.push({
            icon: '🌟',
            titre: 'Excellent rythme !',
            desc: 'Continuez sur cette lancée, vos statistiques sont excellentes !'
        });
    }

    return suggestions;
}

function renderRecords(s, statsAvancees) {
    // Calculer les records
    var records = {
        meilleurMois: { mois: '', count: 0 },
        categoriePreferee: { nom: '', count: 0 },
        genrePreferé: { nom: '', count: 0 }
    };

    // Meilleur mois
    Object.entries(s.parMois).forEach(function(entry) {
        if (entry[1] > records.meilleurMois.count) {
            records.meilleurMois.count = entry[1];
            var parts = entry[0].split('-');
            var mois = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'][parseInt(parts[1])-1];
            records.meilleurMois.mois = mois + ' ' + parts[0];
        }
    });

    // Catégorie préférée
    Object.entries(s.parCategorie).forEach(function(entry) {
        if (entry[1] > records.categoriePreferee.count) {
            records.categoriePreferee.count = entry[1];
            records.categoriePreferee.nom = CATEGORIES[entry[0]].nom;
            records.categoriePreferee.icone = CATEGORIES[entry[0]].icone;
        }
    });

    // Genre préféré
    Object.entries(statsAvancees.genresPreferés).forEach(function(entry) {
        if (entry[1] > records.genrePreferé.count) {
            records.genrePreferé.count = entry[1];
            records.genrePreferé.nom = entry[0];
        }
    });

    return '<div class="stats-content">' +
        '<div class="records-grid">' +
            '<div class="record-card gold">' +
                '<div class="record-medal">🥇</div>' +
                '<div class="record-titre">Meilleur mois</div>' +
                '<div class="record-value">' + (records.meilleurMois.mois || '—') + '</div>' +
                '<div class="record-detail">' + (records.meilleurMois.count > 0 ? records.meilleurMois.count + ' découvertes' : 'Aucune donnée') + '</div>' +
            '</div>' +

            '<div class="record-card silver">' +
                '<div class="record-medal">🥈</div>' +
                '<div class="record-titre">Plus long streak</div>' +
                '<div class="record-value">' + (statsAvancees.longestStreak || 0) + ' jours</div>' +
                '<div class="record-detail">Consécutifs</div>' +
            '</div>' +

            '<div class="record-card bronze">' +
                '<div class="record-medal">🥉</div>' +
                '<div class="record-titre">Catégorie favorite</div>' +
                '<div class="record-value">' + (records.categoriePreferee.nom ? (records.categoriePreferee.icone || '') + ' ' + records.categoriePreferee.nom : '—') + '</div>' +
                '<div class="record-detail">' + (records.categoriePreferee.count > 0 ? records.categoriePreferee.count + ' entrées' : 'Aucune donnée') + '</div>' +
            '</div>' +

            '<div class="record-card">' +
                '<div class="record-medal">🎭</div>' +
                '<div class="record-titre">Genre préféré</div>' +
                '<div class="record-value">' + (records.genrePreferé.nom || '—') + '</div>' +
                '<div class="record-detail">' + (records.genrePreferé.count > 0 ? records.genrePreferé.count + ' fois' : 'Aucune donnée') + '</div>' +
            '</div>' +

            '<div class="record-card">' +
                '<div class="record-medal">⭐</div>' +
                '<div class="record-titre">Meilleure note moyenne</div>' +
                '<div class="record-value">' + (statsAvancees.moyenneNote || '—') + ' / 5</div>' +
                '<div class="record-detail">' + (statsAvancees.moyenneNote ? renderEtoiles(Math.round(parseFloat(statsAvancees.moyenneNote))) : '') + '</div>' +
            '</div>' +

            '<div class="record-card">' +
                '<div class="record-medal">📅</div>' +
                '<div class="record-titre">Première découverte</div>' +
                '<div class="record-value">' + (statsAvancees.premiereDecouverte ? escapeHtml(statsAvancees.premiereDecouverte.titre) : '—') + '</div>' +
                '<div class="record-detail">' + (statsAvancees.premiereDecouverte ? formatDate(statsAvancees.premiereDecouverte.dateDecouverte || statsAvancees.premiereDecouverte.dateCreation) : 'Aucune donnée') + '</div>' +
            '</div>' +
        '</div>' +

        '<div class="stats-panel">' +
            '<h3 class="stats-panel-titre">🏆 Tous vos achievements</h3>' +
            '<div class="all-achievements-grid">' +
                generateAllAchievements(s, statsAvancees).map(function(ach) {
                    return '<div class="achievement-item ' + (ach.unlocked ? 'unlocked' : 'locked') + '">' +
                        '<div class="achievement-icon-big">' + ach.icon + '</div>' +
                        '<div class="achievement-name">' + ach.name + '</div>' +
                        '<div class="achievement-description">' + ach.desc + '</div>' +
                        (ach.unlocked ?
                            '<div class="achievement-date">✓ Débloqué</div>' :
                            '<div class="achievement-progress">' + ach.progress + '</div>'
                        ) +
                    '</div>';
                }).join('') +
            '</div>' +
        '</div>' +
    '</div>';
}

function generateAllAchievements(s, statsAvancees) {
    return [
        { icon: '🎓', name: 'Premier pas', desc: '1 découverte', unlocked: s.total >= 1, progress: s.total + '/1' },
        { icon: '🎓', name: 'Explorateur', desc: '10 découvertes', unlocked: s.total >= 10, progress: s.total + '/10' },
        { icon: '🎖️', name: 'Collectionneur', desc: '50 découvertes', unlocked: s.total >= 50, progress: s.total + '/50' },
        { icon: '🏅', name: 'Expert', desc: '100 découvertes', unlocked: s.total >= 100, progress: s.total + '/100' },
        { icon: '👑', name: 'Maître', desc: '250 découvertes', unlocked: s.total >= 250, progress: s.total + '/250' },
        { icon: '💎', name: 'Légende', desc: '500 découvertes', unlocked: s.total >= 500, progress: s.total + '/500' },
        { icon: '🔥', name: 'Série de 3', desc: '3 jours consécutifs', unlocked: statsAvancees.longestStreak >= 3, progress: statsAvancees.longestStreak + '/3' },
        { icon: '🔥', name: 'Série de 7', desc: '7 jours consécutifs', unlocked: statsAvancees.longestStreak >= 7, progress: statsAvancees.longestStreak + '/7' },
        { icon: '⚡', name: 'Marathon', desc: '30 jours consécutifs', unlocked: statsAvancees.longestStreak >= 30, progress: statsAvancees.longestStreak + '/30' },
        { icon: '⭐', name: 'Bon goût', desc: 'Moyenne ≥ 3.5/5', unlocked: parseFloat(statsAvancees.moyenneNote) >= 3.5, progress: statsAvancees.moyenneNote + '/3.5' },
        { icon: '⭐', name: 'Critique exigeant', desc: 'Moyenne ≥ 4/5', unlocked: parseFloat(statsAvancees.moyenneNote) >= 4, progress: statsAvancees.moyenneNote + '/4' },
        { icon: '📚', name: 'Rat de bibliothèque', desc: '25 livres', unlocked: (s.parCategorie.livre || 0) >= 25, progress: (s.parCategorie.livre || 0) + '/25' },
        { icon: '🎬', name: 'Cinéphile', desc: '50 films', unlocked: (s.parCategorie.film || 0) >= 50, progress: (s.parCategorie.film || 0) + '/50' },
        { icon: '🎵', name: 'Mélomane', desc: '100 albums', unlocked: (s.parCategorie.musique || 0) >= 100, progress: (s.parCategorie.musique || 0) + '/100' }
    ];
}
