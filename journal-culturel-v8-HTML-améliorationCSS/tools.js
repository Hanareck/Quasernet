// UTILS

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('journal-culturel-theme', state.theme);
    render();
}

function afficherToast(msg) {
    state.toast = msg;
    render();
    setTimeout(function() { state.toast = null; render(); }, 2500);
}

function getEntreesFiltrees() {
    return state.entrees.filter(function(e) {
        if (state.categorieActive !== 'tous' && e.categorie !== state.categorieActive) return false;
        if (state.recherche && !e.titre.toLowerCase().includes(state.recherche.toLowerCase()) &&
            !(e.auteur && e.auteur.toLowerCase().includes(state.recherche.toLowerCase()))) return false;

        // Filtre notes (multi-selection)
        if (Array.isArray(state.filtreNotes) && state.filtreNotes.length > 0) {
            if (state.filtreNotes.indexOf(e.note) === -1) return false;
        }

        // Filtre genres (multi-selection)
        if (Array.isArray(state.filtreGenres) && state.filtreGenres.length > 0) {
            var genres = Array.isArray(e.genres) ? e.genres : (e.genre ? [e.genre] : []);
            var hasMatchingGenre = state.filtreGenres.some(function(g) {
                return genres.indexOf(g) !== -1;
            });
            if (!hasMatchingGenre) return false;
        }

        // Filtre tags (multi-selection - ET ou OU logique)
        if (Array.isArray(state.filtreTags) && state.filtreTags.length > 0) {
            var entreeTags = Array.isArray(e.tags) ? e.tags : [];
            if (state.filtreTagsMode === 'ET') {
                // Mode ET : l'entree doit avoir TOUS les tags selectionnes
                var hasAllTags = state.filtreTags.every(function(tag) {
                    return entreeTags.indexOf(tag) !== -1;
                });
                if (!hasAllTags) return false;
            } else {
                // Mode OU : l'entree doit avoir AU MOINS UN des tags selectionnes
                var hasAnyTag = state.filtreTags.some(function(tag) {
                    return entreeTags.indexOf(tag) !== -1;
                });
                if (!hasAnyTag) return false;
            }
        }

        // Filtre statut lecture (multi-selection)
        if (Array.isArray(state.filtreStatutsLecture) && state.filtreStatutsLecture.length > 0) {
            if (state.filtreStatutsLecture.indexOf(e.statutLecture) === -1) return false;
        }

        // Filtre statut possession (multi-selection)
        if (Array.isArray(state.filtreStatutsPossession) && state.filtreStatutsPossession.length > 0) {
            var statutsPossession = Array.isArray(e.statutPossession)
                ? e.statutPossession
                : (e.statutPossession ? [e.statutPossession] : []);
            var hasMatchingStatut = state.filtreStatutsPossession.some(function(s) {
                return statutsPossession.indexOf(s) !== -1;
            });
            if (!hasMatchingStatut) return false;
        }

        return true;
    }).sort(function(a, b) {
        switch (state.tri) {
            case 'date-desc': return new Date(b.dateDecouverte || b.dateCreation) - new Date(a.dateDecouverte || a.dateCreation);
            case 'date-asc': return new Date(a.dateDecouverte || a.dateCreation) - new Date(b.dateDecouverte || b.dateCreation);
            case 'note-desc': return (b.note || 0) - (a.note || 0);
            case 'note-asc': return (a.note || 0) - (b.note || 0);
            case 'titre': return a.titre.localeCompare(b.titre);
            default: return 0;
        }
    });
}

function getStats() {
    var now = new Date();
    var thisMonth = now.getMonth();
    var thisYear = now.getFullYear();
    
    var parCategorie = {};
    var parMois = {};
    var parNote = {1:0, 2:0, 3:0, 4:0, 5:0};
    var aDecouvrir = 0, aAcheter = 0, empruntes = 0;
    
    state.entrees.forEach(function(e) {
        parCategorie[e.categorie] = (parCategorie[e.categorie] || 0) + 1;
        if (e.note) parNote[e.note] = (parNote[e.note] || 0) + 1;
        if (e.statutLecture === 'A decouvrir') aDecouvrir++;
        
        var statutsPossession = Array.isArray(e.statutPossession) 
            ? e.statutPossession 
            : (e.statutPossession ? [e.statutPossession] : []);
        
        if (statutsPossession.indexOf('A acheter') !== -1) aAcheter++;
        if (statutsPossession.indexOf('Emprunte') !== -1) empruntes++;
        
        var dateStr = e.dateDecouverte || e.dateCreation;
        if (dateStr) {
            var d = new Date(dateStr);
            var moisKey = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
            parMois[moisKey] = (parMois[moisKey] || 0) + 1;
        }
    });
    
    var ceMois = state.entrees.filter(function(e) {
        if (e.statutLecture === 'A decouvrir') return false;
        var dateStr = e.dateDecouverte || e.dateCreation;
        if (!dateStr) return false;
        var d = new Date(dateStr);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    
    var cetteAnnee = state.entrees.filter(function(e) {
        if (e.statutLecture === 'A decouvrir') return false;
        var dateStr = e.dateDecouverte || e.dateCreation;
        if (!dateStr) return false;
        return new Date(dateStr).getFullYear() === thisYear;
    }).length;
    
    return { total: state.entrees.length, parCategorie: parCategorie, parMois: parMois, parNote: parNote, aDecouvrir: aDecouvrir, aAcheter: aAcheter, empruntes: empruntes, ceMois: ceMois, cetteAnnee: cetteAnnee };
}

function getGenresDisponibles() {
    if (state.categorieActive === 'tous') {
        var genres = [];
        state.entrees.forEach(function(e) {
            var entreeGenres = Array.isArray(e.genres) ? e.genres : (e.genre ? [e.genre] : []);
            entreeGenres.forEach(function(g) {
                if (g && genres.indexOf(g) === -1) genres.push(g);
            });
        });
        return genres.sort();
    }
    return CATEGORIES[state.categorieActive]?.genres || [];
}

function getTagsDisponibles() {
    var tags = [];
    state.entrees.forEach(function(e) {
        var entreeTags = Array.isArray(e.tags) ? e.tags : [];
        entreeTags.forEach(function(t) {
            if (t && tags.indexOf(t) === -1) tags.push(t);
        });
    });
    return tags.sort();
}

function getEntreesDueSoon() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(today.getDate() + 7);

    return state.entrees.filter(function(e) {
        var statutsPossession = Array.isArray(e.statutPossession) ? e.statutPossession : (e.statutPossession ? [e.statutPossession] : []);
        var estEmprunte = statutsPossession.indexOf('Emprunte') !== -1;

        if (!estEmprunte || !e.dateRetour) return false;

        var dateRetour = new Date(e.dateRetour);
        dateRetour.setHours(0, 0, 0, 0);

        return dateRetour >= today && dateRetour <= sevenDaysLater;
    });
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateCourte(d) { 
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); 
}

function escapeHtml(s) { 
    return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;') : ''; 
}

function renderEtoiles(n, interactive) {
    return [1,2,3,4,5].map(function(i) {
        return '<span class="etoile ' + (i <= n ? 'active' : '') + ' ' + (interactive ? 'interactive' : '') + '"' + (interactive ? ' onclick="setNote(' + i + ')"' : '') + '>★</span>';
    }).join('');
}

function renderEtoilesInteractives(note, entreeId) {
    return [1,2,3,4,5].map(function(i) {
        return '<span class="etoile ' + (i <= note ? 'active' : '') + ' interactive" onclick="setNoteDetail(\'' + entreeId + '\', ' + i + ')">★</span>';
    }).join('');
}

function joursRestants(dateRetour) {
    if (!dateRetour) return null;
    var now = new Date();
    var retour = new Date(dateRetour);
    var diff = Math.ceil((retour - now) / (1000 * 60 * 60 * 24));
    return diff;
}

window.saveJournalStatsFirestore = async function(year, month, data) {
    if (!state.user) return;
    try {
        await db.collection('users').doc(state.user.uid)
            .collection('journalStats')
            .doc(year + '-' + String(month).padStart(2, '0'))
            .set({ data: data }, { merge: true });
    } catch (e) {
        console.error('Erreur sauvegarde stats:', e);
    }
};

window.loadJournalStatsFirestore = async function() {
    if (!state.user) return;
    try {
        var snap = await db.collection('users').doc(state.user.uid)
            .collection('journalStats').get();
        state.journalStats = {};
        snap.forEach(function(doc) {
            state.journalStats[doc.id] = doc.data().data || {};
        });
    } catch (e) {
        state.journalStats = {};
    }
};

// ========== SYSTÈME DE "VU/NON VU" ==========

function getVuesFromLocalStorage() {
    try {
        var stored = localStorage.getItem('journal-vues');
        return stored ? JSON.parse(stored) : { fil: [], notifications: [] };
    } catch (e) {
        return { fil: [], notifications: [] };
    }
}

function saveVuesToLocalStorage(vues) {
    try {
        localStorage.setItem('journal-vues', JSON.stringify(vues));
    } catch (e) {
        console.error('Erreur sauvegarde vues:', e);
    }
}

window.marquerCommeVu = function(type, id) {
    var vues = getVuesFromLocalStorage();
    if (!vues[type]) vues[type] = [];
    if (vues[type].indexOf(id) === -1) {
        vues[type].push(id);
        saveVuesToLocalStorage(vues);
    }
};

window.marquerTousCommeVus = function(type, ids) {
    var vues = getVuesFromLocalStorage();
    if (!vues[type]) vues[type] = [];
    ids.forEach(function(id) {
        if (vues[type].indexOf(id) === -1) {
            vues[type].push(id);
        }
    });
    saveVuesToLocalStorage(vues);
    render();
};

window.estVu = function(type, id) {
    var vues = getVuesFromLocalStorage();
    return vues[type] && vues[type].indexOf(id) !== -1;
};

window.epinglerElement = function(type, id) {
    var vues = getVuesFromLocalStorage();
    if (vues[type]) {
        var index = vues[type].indexOf(id);
        if (index > -1) {
            vues[type].splice(index, 1);
            saveVuesToLocalStorage(vues);
            render();
        }
    }
};

window.getElementsNonVus = function() {
    var vues = getVuesFromLocalStorage();
    var countFil = 0;
    var countNotif = 0;

    // Compter les posts du fil non vus
    state.fil.forEach(function(post) {
        var postId = post.ownerId + '_' + post.id;
        if (!vues.fil || vues.fil.indexOf(postId) === -1) {
            countFil++;
        }
    });

    // Compter les notifications non vues
    state.notifications.forEach(function(notif) {
        var notifId = notif.type + '_' + notif.entreeId + '_' + (notif.pseudo || '');
        if (!vues.notifications || vues.notifications.indexOf(notifId) === -1) {
            countNotif++;
        }
    });

    return countFil + countNotif;
};
