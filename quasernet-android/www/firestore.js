// FIRESTORE - Gestion des donnees

async function chargerEntrees() {
    if (!state.user) return;
    state.syncing = true;
    render();
    try {
        var snapshot = await db.collection('users').doc(state.user.uid).collection('entrees').orderBy('dateCreation', 'desc').get();
        state.entrees = snapshot.docs.map(function(doc) {
            var data = { id: doc.id, ...doc.data() };
            if (!Array.isArray(data.statutPossession)) {
                data.statutPossession = data.statutPossession ? [data.statutPossession] : [];
            }
            if (data.prive === undefined) data.prive = false;
            if (data.ordre === undefined || data.ordre === null) data.ordre = 0;
            return data;
        });

        await migrerOrdresEntrees();
    } catch (error) {
        console.error('Erreur chargement:', error);
        afficherToast('Erreur de chargement');
    }
    state.syncing = false;
    render();
}

async function sauvegarderEntree(entree) {
    if (!state.user) return;
    state.syncing = true;
    render();
    try {
        if (!Array.isArray(entree.statutPossession)) {
            entree.statutPossession = entree.statutPossession ? [entree.statutPossession] : [];
        }
        if (entree.prive === undefined) entree.prive = false;
        
        if (entree.id) {
            var id = entree.id;
            var data = Object.assign({}, entree);
            delete data.id;
            await db.collection('users').doc(state.user.uid).collection('entrees').doc(id).update(data);
            var index = state.entrees.findIndex(function(e) { return e.id === id; });
            if (index !== -1) state.entrees[index] = entree;
            if (state.modeEdition) {
                afficherToast('Modifie');
            }
        } else {
            var docRef = await db.collection('users').doc(state.user.uid).collection('entrees').add(entree);
            state.entrees.unshift({ id: docRef.id, ...entree });
            afficherToast('Ajoute');
        }
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
        afficherToast('Erreur');
    }
    state.syncing = false;
    render();
}

async function supprimerEntree(id) {
    if (!state.user || !confirm('Supprimer cette entree ?')) return;
    state.syncing = true;
    render();
    try {
        await db.collection('users').doc(state.user.uid).collection('entrees').doc(id).delete();
        state.entrees = state.entrees.filter(function(e) { return e.id !== id; });
        afficherToast('Supprime');
    } catch (error) {
        afficherToast('Erreur');
    }
    state.syncing = false;
    state.vue = 'liste';
    state.entreeSelectionnee = null;
    render();
}

// ========== FIL D'ACTUALITE ==========
async function chargerFil() {
    if (!state.user || state.amis.length === 0) {
        state.fil = [];
        return;
    }
    
    state.filLoading = true;
    render();
    
    try {
        var fil = [];
        
        // Charger les 10 dernieres entrees de chaque ami (y compris soi-même)
        for (var i = 0; i < state.amis.length; i++) {
            var ami = state.amis[i];
            try {
                var snapshot = await db.collection('users').doc(ami.uid)
                    .collection('entrees')
                    .where('prive', '==', false)
                    .orderBy('dateCreation', 'desc')
                    .limit(10)
                    .get();
                
                snapshot.docs.forEach(function(doc) {
                    var data = doc.data();
                    fil.push({
                        id: doc.id,
                        ownerId: ami.uid,
                        ownerPseudo: ami.pseudo,
                        ...data
                    });
                });
            } catch (e) {
                console.error('Erreur chargement fil ami:', e);
            }
        }
        
        // Trier par date de creation (plus recent en premier)
        fil.sort(function(a, b) {
            return new Date(b.dateCreation) - new Date(a.dateCreation);
        });
        
        // Garder les 50 plus recents
        state.fil = fil.slice(0, 50);
    } catch (error) {
        console.error('Erreur chargement fil:', error);
    }
    
    state.filLoading = false;
    render();
}

// ========== NOTIFICATIONS ==========
async function chargerNotifications() {
    if (!state.user) return;

    state.notificationsLoading = true;
    render();

    try {
        var notifications = [];

        // Limiter aux 10 entrées les plus récentes pour optimiser les performances
        var entreesRecentes = state.entrees
            .slice()
            .sort(function(a, b) {
                var dateA = new Date(a.dateDecouverte || a.dateCreation);
                var dateB = new Date(b.dateDecouverte || b.dateCreation);
                return dateB - dateA;
            })
            .slice(0, 10);

        // Créer toutes les promesses de requêtes (parallélisation avec Promise.all)
        var promises = [];
        entreesRecentes.forEach(function(entree) {
            // Promesse pour les likes
            promises.push(
                db.collection('users').doc(state.user.uid)
                    .collection('entrees').doc(entree.id)
                    .collection('likes')
                    .orderBy('date', 'desc')
                    .limit(5)
                    .get()
                    .then(function(likesSnap) {
                        var likes = [];
                        likesSnap.docs.forEach(function(doc) {
                            var data = doc.data();
                            if (data.ownerId !== state.user.uid) {
                                likes.push({
                                    type: 'like',
                                    entreeId: entree.id,
                                    entreeTitre: entree.titre,
                                    pseudo: data.pseudo,
                                    date: data.date
                                });
                            }
                        });
                        return likes;
                    })
                    .catch(function() { return []; })
            );

            // Promesse pour les commentaires
            promises.push(
                db.collection('users').doc(state.user.uid)
                    .collection('entrees').doc(entree.id)
                    .collection('commentaires')
                    .orderBy('date', 'desc')
                    .limit(5)
                    .get()
                    .then(function(commSnap) {
                        var comments = [];
                        commSnap.docs.forEach(function(doc) {
                            var data = doc.data();
                            if (data.userId !== state.user.uid) {
                                comments.push({
                                    type: 'commentaire',
                                    entreeId: entree.id,
                                    entreeTitre: entree.titre,
                                    pseudo: data.pseudo,
                                    texte: data.texte,
                                    date: data.date
                                });
                            }
                        });
                        return comments;
                    })
                    .catch(function() { return []; })
            );
        });

        // Attendre toutes les requêtes en parallèle
        var results = await Promise.all(promises);

        // Aplatir les résultats
        results.forEach(function(result) {
            if (Array.isArray(result)) {
                notifications = notifications.concat(result);
            }
        });

        // Trier par date
        notifications.sort(function(a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        state.notifications = notifications.slice(0, 50);
    } catch (error) {
        console.error('Erreur chargement notifications:', error);
    }

    state.notificationsLoading = false;
    render();
}

// ========== CATALOGUE AMI ==========
async function chargerCatalogueAmi(amiUid, amiPseudo) {
    state.catalogueLoading = true;
    state.catalogueAmi = null;
    state.catalogueFiltreCategorie = 'tous';
    state.catalogueTri = 'date-desc';
    render();
    
    try {
        var snapshot = await db.collection('users').doc(amiUid).collection('entrees')
            .where('prive', '==', false)
            .orderBy('dateCreation', 'desc')
            .get();
        
        var entrees = [];
        for (var i = 0; i < snapshot.docs.length; i++) {
            var doc = snapshot.docs[i];
            var data = { id: doc.id, odlnierId: amiUid, ...doc.data() };
            if (!Array.isArray(data.statutPossession)) {
                data.statutPossession = data.statutPossession ? [data.statutPossession] : [];
            }
            
            // Charger likes et commentaires
            try {
                var likesSnap = await db.collection('users').doc(amiUid)
                    .collection('entrees').doc(doc.id)
                    .collection('likes').get();
                data.likes = likesSnap.docs.map(function(l) { return l.id; });
                data.likesCount = likesSnap.size;
                
                var commSnap = await db.collection('users').doc(amiUid)
                    .collection('entrees').doc(doc.id)
                    .collection('commentaires').orderBy('date', 'desc').limit(20).get();
                data.commentaires = commSnap.docs.map(function(c) { return { id: c.id, ...c.data() }; });
            } catch (e) {
                data.likes = [];
                data.likesCount = 0;
                data.commentaires = [];
            }
            
            entrees.push(data);
        }
        
        state.catalogueAmi = {
            uid: amiUid,
            pseudo: amiPseudo,
            entrees: entrees
        };
    } catch (error) {
        console.error('Erreur chargement catalogue:', error);
        afficherToast('Erreur de chargement');
        state.catalogueAmi = null;
    }
    
    state.catalogueLoading = false;
    render();
}

// ========== LIKES ==========
async function likerEntree(ownerId, entreeId) {
    if (!state.user) return;
    try {
        var likeRef = db.collection('users').doc(ownerId)
            .collection('entrees').doc(entreeId)
            .collection('likes').doc(state.user.uid);

        var likeDoc = await likeRef.get();

        if (likeDoc.exists) {
            await likeRef.delete();
            afficherToast('Like retire');
        } else {
            await likeRef.set({
                ownerId: state.user.uid,
                pseudo: state.userPseudo,
                date: new Date().toISOString()
            });
            afficherToast('Like ajoute');
        }

        // Rafraîchit tout le catalogue ami et la fiche sélectionnée
        if (state.catalogueAmi && ownerId === state.catalogueAmi.uid) {
            await chargerCatalogueAmi(ownerId, state.catalogueAmi.pseudo);
            if (state.entreeAmiSelectionnee) {
                state.entreeAmiSelectionnee = state.catalogueAmi.entrees.find(function(e) { return e.id === entreeId; });
            }
        }
        render();
    } catch (error) {
        console.error('Erreur like:', error);
        afficherToast('Erreur');
    }
}

// ========== COMMENTAIRES ==========
var commentaireEnCours = false;

async function commenterEntree(ownerId, entreeId, texte) {
    if (!state.user || !texte.trim()) return;
    if (commentaireEnCours) return;
    commentaireEnCours = true;

    try {
        var nouveauComm = {
            userId: state.user.uid,
            pseudo: state.userPseudo,
            texte: texte.trim(),
            date: new Date().toISOString()
        };

        var commRef = await db.collection('users').doc(ownerId)
            .collection('entrees').doc(entreeId)
            .collection('commentaires').add(nouveauComm);

        nouveauComm.id = commRef.id;

        // Rafraîchit tout le catalogue ami et la fiche sélectionnée
        if (state.catalogueAmi && ownerId === state.catalogueAmi.uid) {
            await chargerCatalogueAmi(ownerId, state.catalogueAmi.pseudo);
            if (state.entreeAmiSelectionnee) {
                state.entreeAmiSelectionnee = state.catalogueAmi.entrees.find(function(e) { return e.id === entreeId; });
            }
        }
        afficherToast('Commentaire ajoute');
        render();
    } catch (error) {
        console.error('Erreur commentaire:', error);
        afficherToast('Erreur');
    } finally {
        commentaireEnCours = false;
    }
}

// Suppression d'un commentaire (seulement si c'est le sien)
async function supprimerCommentaire(ownerId, entreeId, commentaireId) {
    if (!state.user) return;
    if (!confirm('Supprimer ce commentaire ?')) return;
    try {
        // Correction : accès correct au document à supprimer
        var commRef = db.collection('users').doc(ownerId)
            .collection('entrees').doc(entreeId)
            .collection('commentaires').doc(commentaireId);

        var commDoc = await commRef.get();

        if (!commDoc.exists) {
            afficherToast('Commentaire introuvable');
            return;
        }
        var data = commDoc.data();
        // Vérification du propriétaire du commentaire
        if (data.userId !== state.user.uid) {
            afficherToast('Vous ne pouvez supprimer que vos propres commentaires');
            return;
        }

        // Suppression effective
        await db.collection('users').doc(ownerId)
            .collection('entrees').doc(entreeId)
            .collection('commentaires').doc(commentaireId)
            .delete();

        // Rafraîchit tout le catalogue ami et la fiche sélectionnée
        if (state.catalogueAmi && ownerId === state.catalogueAmi.uid) {
            await chargerCatalogueAmi(ownerId, state.catalogueAmi.pseudo);
            if (state.entreeAmiSelectionnee) {
                state.entreeAmiSelectionnee = state.catalogueAmi.entrees.find(function(e) { return e.id === entreeId; });
            }
        }
        afficherToast('Commentaire supprime');
        render();
    } catch (error) {
        console.error('Erreur suppression commentaire:', error);
        afficherToast('Erreur suppression');
    }
}

// ========== RECHERCHE UTILISATEUR ==========
async function rechercherUtilisateur(recherche) {
    if (!recherche || recherche.length < 2) return null;
    
    var rechercheNormalisee = recherche.trim().toLowerCase();
    
    try {
        var snapshot = await db.collection('users')
            .where('pseudoLower', '==', rechercheNormalisee)
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            var doc = snapshot.docs[0];
            return { uid: doc.id, ...doc.data() };
        }
        
        snapshot = await db.collection('users')
            .where('email', '==', rechercheNormalisee)
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            var doc = snapshot.docs[0];
            return { uid: doc.id, ...doc.data() };
        }
        
        return null;
    } catch (error) {
        console.error('Erreur recherche utilisateur:', error);
        return null;
    }
}

async function pseudoDisponible(pseudo) {
    if (!pseudo || pseudo.length < 2) return false;

    try {
        var snapshot = await db.collection('users')
            .where('pseudoLower', '==', pseudo.toLowerCase())
            .limit(1)
            .get();

        return snapshot.empty;
    } catch (error) {
        console.error('Erreur verification pseudo:', error);
        return false;
    }
}

// MIGRATION - Initialiser ordre pour entrees existantes
async function migrerOrdresEntrees() {
    if (!state.user) return;

    var entreesSansOrdre = state.entrees.filter(function(e) {
        return e.ordre === undefined || e.ordre === null;
    });

    if (entreesSansOrdre.length === 0) return;

    console.log('Migration ordre:', entreesSansOrdre.length, 'entrees');

    try {
        var promises = [];
        entreesSansOrdre.forEach(function(e) {
            var data = { ordre: 0 };
            promises.push(
                db.collection('users').doc(state.user.uid)
                    .collection('entrees').doc(e.id)
                    .update(data)
            );
            e.ordre = 0;
        });

        await Promise.all(promises);
        console.log('Migration ordre terminee');
    } catch (error) {
        console.error('Erreur migration ordre:', error);
    }
}

// Mettre a jour l'ordre d'une entree
async function mettreAJourOrdre(entreeId, nouvelOrdre) {
    if (!state.user) return;

    try {
        await db.collection('users').doc(state.user.uid)
            .collection('entrees').doc(entreeId)
            .update({ ordre: nouvelOrdre });

        var entree = state.entrees.find(function(e) { return e.id === entreeId; });
        if (entree) entree.ordre = nouvelOrdre;

    } catch (error) {
        console.error('Erreur maj ordre:', error);
        throw error;
    }
}

// Reordonner plusieurs entrees d'une section
async function reordonnerSection(entreesIds) {
    if (!state.user) return;

    state.syncing = true;
    render();

    try {
        var promises = [];
        entreesIds.forEach(function(id, index) {
            promises.push(
                db.collection('users').doc(state.user.uid)
                    .collection('entrees').doc(id)
                    .update({ ordre: index })
            );

            var entree = state.entrees.find(function(e) { return e.id === id; });
            if (entree) entree.ordre = index;
        });

        await Promise.all(promises);
        afficherToast('Ordre mis a jour');

    } catch (error) {
        console.error('Erreur reordonnancement:', error);
        afficherToast('Erreur de sauvegarde');
    }

    state.syncing = false;
    render();
}

window.migrerOrdresEntrees = migrerOrdresEntrees;
window.mettreAJourOrdre = mettreAJourOrdre;
window.reordonnerSection = reordonnerSection;
