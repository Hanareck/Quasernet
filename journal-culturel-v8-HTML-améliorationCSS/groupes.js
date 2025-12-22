// groupes.js - Gestion des groupes avec mot de passe

/**
 * Créer un nouveau groupe
 * @param {string} nom - Nom du groupe
 * @param {string} password - Mot de passe du groupe
 * @returns {Promise<string>} ID du groupe créé
 */
function creerGroupe(nom, password) {
    if (!nom || nom.trim().length === 0 || nom.length > 50) {
        afficherToast('Le nom du groupe doit contenir entre 1 et 50 caractères');
        return Promise.reject(new Error('Nom invalide'));
    }

    if (!password || password.trim().length === 0) {
        afficherToast('Le mot de passe est obligatoire');
        return Promise.reject(new Error('Mot de passe obligatoire'));
    }

    return hashPassword(password).then(function(passwordHash) {
        var groupeRef = firebase.firestore().collection('groupes').doc();
        var groupeId = groupeRef.id;

        var membreData = {
            uid: state.user.uid,
            pseudo: state.user.pseudo || 'Anonyme',
            dateAjout: firebase.firestore.FieldValue.serverTimestamp()
        };

        var groupeData = {
            nom: nom.trim(),
            passwordHash: passwordHash,
            createur: state.user.uid,
            createurPseudo: state.user.pseudo || 'Anonyme',
            dateCreation: firebase.firestore.FieldValue.serverTimestamp(),
            membres: [membreData],
            membresUids: [state.user.uid],
            nombrePosts: 0,
            dernierPost: null
        };

        return groupeRef.set(groupeData).then(function() {
            // Ajouter le groupe à l'utilisateur
            return firebase.firestore().collection('users').doc(state.user.uid).update({
                groupes: firebase.firestore.FieldValue.arrayUnion({
                    id: groupeId,
                    nom: nom.trim(),
                    dateAjout: new Date().toISOString(),
                    postsNonLus: 0
                })
            });
        }).then(function() {
            afficherToast('Groupe créé avec succès !');
            return chargerGroupes().then(function() {
                return groupeId;
            });
        });
    }).catch(function(error) {
        console.error('Erreur création groupe:', error);
        afficherToast('Erreur lors de la création du groupe');
        throw error;
    });
}

/**
 * Rejoindre un groupe existant
 * @param {string} groupeId - ID du groupe à rejoindre
 * @param {string} password - Mot de passe du groupe
 * @returns {Promise<void>}
 */
function rejoindreGroupe(groupeId, password) {
    if (!groupeId || groupeId.trim().length === 0) {
        afficherToast('Veuillez entrer un ID de groupe');
        return Promise.reject(new Error('ID groupe requis'));
    }

    if (!password || password.trim().length === 0) {
        afficherToast('Le mot de passe est obligatoire');
        return Promise.reject(new Error('Mot de passe requis'));
    }

    var groupeRef = firebase.firestore().collection('groupes').doc(groupeId.trim());

    return groupeRef.get().then(function(doc) {
        if (!doc.exists) {
            afficherToast('Groupe introuvable');
            throw new Error('Groupe introuvable');
        }

        var groupeData = doc.data();

        // Vérifier si déjà membre
        if (groupeData.membresUids.indexOf(state.user.uid) !== -1) {
            afficherToast('Vous êtes déjà membre de ce groupe');
            throw new Error('Déjà membre');
        }

        // Vérifier le mot de passe
        return verifyPassword(password, groupeData.passwordHash).then(function(isValid) {
            if (!isValid) {
                afficherToast('Mot de passe incorrect');
                throw new Error('Mot de passe incorrect');
            }

            var membreData = {
                uid: state.user.uid,
                pseudo: state.user.pseudo || 'Anonyme',
                dateAjout: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Ajouter aux membres du groupe
            return groupeRef.update({
                membres: firebase.firestore.FieldValue.arrayUnion(membreData),
                membresUids: firebase.firestore.FieldValue.arrayUnion(state.user.uid)
            });
        }).then(function() {
            // Ajouter le groupe à l'utilisateur
            return firebase.firestore().collection('users').doc(state.user.uid).update({
                groupes: firebase.firestore.FieldValue.arrayUnion({
                    id: groupeId.trim(),
                    nom: groupeData.nom,
                    dateAjout: new Date().toISOString(),
                    postsNonLus: 0
                })
            });
        }).then(function() {
            afficherToast('Vous avez rejoint le groupe !');
            return chargerGroupes();
        });
    }).catch(function(error) {
        console.error('Erreur rejoindre groupe:', error);
        if (error.message !== 'Groupe introuvable' &&
            error.message !== 'Déjà membre' &&
            error.message !== 'Mot de passe incorrect') {
            afficherToast('Erreur lors de la tentative de rejoindre le groupe');
        }
        throw error;
    });
}

/**
 * Quitter un groupe
 * @param {string} groupeId - ID du groupe à quitter
 * @returns {Promise<void>}
 */
function quitterGroupe(groupeId) {
    var groupeRef = firebase.firestore().collection('groupes').doc(groupeId);

    return groupeRef.get().then(function(doc) {
        if (!doc.exists) {
            afficherToast('Groupe introuvable');
            throw new Error('Groupe introuvable');
        }

        var groupeData = doc.data();

        // Vérifier que l'utilisateur n'est pas le créateur
        if (groupeData.createur === state.user.uid) {
            afficherToast('Le créateur ne peut pas quitter le groupe. Supprimez-le à la place.');
            throw new Error('Créateur ne peut pas quitter');
        }

        // Trouver et retirer le membre
        var membreARetirer = groupeData.membres.find(function(m) {
            return m.uid === state.user.uid;
        });

        if (!membreARetirer) {
            afficherToast('Vous n\'êtes pas membre de ce groupe');
            throw new Error('Pas membre');
        }

        return groupeRef.update({
            membres: firebase.firestore.FieldValue.arrayRemove(membreARetirer),
            membresUids: firebase.firestore.FieldValue.arrayRemove(state.user.uid)
        });
    }).then(function() {
        // Retirer le groupe de l'utilisateur
        var groupeData = state.groupes.find(function(g) { return g.id === groupeId; });
        if (groupeData) {
            return firebase.firestore().collection('users').doc(state.user.uid).update({
                groupes: firebase.firestore.FieldValue.arrayRemove({
                    id: groupeId,
                    nom: groupeData.nom,
                    dateAjout: groupeData.dateAjout,
                    postsNonLus: groupeData.postsNonLus || 0
                })
            });
        }
    }).then(function() {
        afficherToast('Vous avez quitté le groupe');
        return chargerGroupes();
    }).catch(function(error) {
        console.error('Erreur quitter groupe:', error);
        if (error.message !== 'Groupe introuvable' &&
            error.message !== 'Créateur ne peut pas quitter' &&
            error.message !== 'Pas membre') {
            afficherToast('Erreur lors de la tentative de quitter le groupe');
        }
        throw error;
    });
}

/**
 * Charger les groupes de l'utilisateur
 * @returns {Promise<void>}
 */
function chargerGroupes() {
    return firebase.firestore().collection('users').doc(state.user.uid).get()
        .then(function(doc) {
            if (doc.exists && doc.data().groupes) {
                state.groupes = doc.data().groupes;
            } else {
                state.groupes = [];
            }
            render();
        })
        .catch(function(error) {
            console.error('Erreur chargement groupes:', error);
            state.groupes = [];
        });
}

/**
 * Charger le détail d'un groupe avec ses posts
 * @param {string} groupeId - ID du groupe
 * @returns {Promise<void>}
 */
function chargerDetailGroupe(groupeId) {
    state.groupeActifLoading = true;
    state.groupeActif = null;
    render();

    var groupeRef = firebase.firestore().collection('groupes').doc(groupeId);

    return groupeRef.get().then(function(doc) {
        if (!doc.exists) {
            afficherToast('Groupe introuvable');
            throw new Error('Groupe introuvable');
        }

        var groupeData = doc.data();
        groupeData.id = doc.id;

        // Vérifier que l'utilisateur est membre
        if (groupeData.membresUids.indexOf(state.user.uid) === -1) {
            afficherToast('Vous n\'êtes pas membre de ce groupe');
            throw new Error('Pas membre');
        }

        state.groupeActif = groupeData;

        // Charger les posts du groupe
        return groupeRef.collection('posts')
            .orderBy('datePartage', 'desc')
            .limit(50)
            .get();
    }).then(function(snapshot) {
        var posts = [];
        snapshot.forEach(function(doc) {
            var postData = doc.data();
            postData.id = doc.id;
            posts.push(postData);
        });

        state.groupeActif.posts = posts;

        // Charger les likes et commentaires pour chaque post
        var promises = posts.map(function(post) {
            return Promise.all([
                chargerLikesPostGroupe(groupeId, post.id),
                chargerCommentairesPostGroupe(groupeId, post.id)
            ]).then(function(results) {
                post.likes = results[0];
                post.commentaires = results[1];
            });
        });

        return Promise.all(promises);
    }).then(function() {
        state.groupeActifLoading = false;
        render();
    }).catch(function(error) {
        console.error('Erreur chargement détail groupe:', error);
        state.groupeActifLoading = false;
        if (error.message !== 'Groupe introuvable' && error.message !== 'Pas membre') {
            afficherToast('Erreur lors du chargement du groupe');
        }
        state.vue = 'social';
        render();
    });
}

/**
 * Charger les likes d'un post de groupe
 * @param {string} groupeId - ID du groupe
 * @param {string} postId - ID du post
 * @returns {Promise<Array>}
 */
function chargerLikesPostGroupe(groupeId, postId) {
    return firebase.firestore()
        .collection('groupes').doc(groupeId)
        .collection('posts').doc(postId)
        .collection('likes')
        .get()
        .then(function(snapshot) {
            var likes = [];
            snapshot.forEach(function(doc) {
                var likeData = doc.data();
                likeData.id = doc.id;
                likes.push(likeData);
            });
            return likes;
        })
        .catch(function(error) {
            console.error('Erreur chargement likes:', error);
            return [];
        });
}

/**
 * Charger les commentaires d'un post de groupe
 * @param {string} groupeId - ID du groupe
 * @param {string} postId - ID du post
 * @returns {Promise<Array>}
 */
function chargerCommentairesPostGroupe(groupeId, postId) {
    return firebase.firestore()
        .collection('groupes').doc(groupeId)
        .collection('posts').doc(postId)
        .collection('commentaires')
        .orderBy('date', 'asc')
        .get()
        .then(function(snapshot) {
            var commentaires = [];
            snapshot.forEach(function(doc) {
                var commentData = doc.data();
                commentData.id = doc.id;
                commentaires.push(commentData);
            });
            return commentaires;
        })
        .catch(function(error) {
            console.error('Erreur chargement commentaires:', error);
            return [];
        });
}

/**
 * Partager une entrée dans un groupe
 * @param {Object} entree - L'entrée à partager
 * @param {string} groupeId - ID du groupe
 * @returns {Promise<void>}
 */
function partagerDansGroupe(entree, groupeId) {
    var groupeRef = firebase.firestore().collection('groupes').doc(groupeId);

    return groupeRef.get().then(function(doc) {
        if (!doc.exists) {
            afficherToast('Groupe introuvable');
            throw new Error('Groupe introuvable');
        }

        var groupeData = doc.data();

        // Vérifier que l'utilisateur est membre
        if (groupeData.membresUids.indexOf(state.user.uid) === -1) {
            afficherToast('Vous n\'êtes pas membre de ce groupe');
            throw new Error('Pas membre');
        }

        // Créer la copie statique du post
        var postData = {
            auteurUid: state.user.uid,
            auteurPseudo: state.user.pseudo || 'Anonyme',
            datePartage: firebase.firestore.FieldValue.serverTimestamp(),

            // Copie des données de l'entrée
            titre: entree.titre || '',
            auteur: entree.auteur || '',
            categorie: entree.categorie || '',
            genre: entree.genre || '',
            note: entree.note || 0,
            critique: entree.critique || '',
            citation: entree.citation || '',
            dateDecouverte: entree.dateDecouverte || null,
            dateDebutLecture: entree.dateDebutLecture || null,
            statutLecture: entree.statutLecture || '',
            statutPossession: entree.statutPossession || [],
            couverture: entree.couverture || '',
            lienYoutube: entree.lienYoutube || '',
            lienMusique: entree.lienMusique || '',

            likesCount: 0,
            commentsCount: 0
        };

        return groupeRef.collection('posts').add(postData);
    }).then(function() {
        // Mettre à jour le compteur de posts
        return groupeRef.update({
            nombrePosts: firebase.firestore.FieldValue.increment(1),
            dernierPost: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).then(function() {
        afficherToast('Entrée partagée dans le groupe !');
        state.modalPartagerGroupe = false;
        state.entreeAPartager = null;
        render();
    }).catch(function(error) {
        console.error('Erreur partage dans groupe:', error);
        if (error.message !== 'Groupe introuvable' && error.message !== 'Pas membre') {
            afficherToast('Erreur lors du partage');
        }
        throw error;
    });
}

/**
 * Liker un post de groupe
 * @param {string} groupeId - ID du groupe
 * @param {string} postId - ID du post
 * @returns {Promise<void>}
 */
function likerPostGroupe(groupeId, postId) {
    var postRef = firebase.firestore()
        .collection('groupes').doc(groupeId)
        .collection('posts').doc(postId);

    var likeRef = postRef.collection('likes').doc(state.user.uid);

    return likeRef.get().then(function(doc) {
        if (doc.exists) {
            // Retirer le like
            return likeRef.delete().then(function() {
                return postRef.update({
                    likesCount: firebase.firestore.FieldValue.increment(-1)
                });
            });
        } else {
            // Ajouter le like
            return likeRef.set({
                pseudo: state.user.pseudo || 'Anonyme',
                date: firebase.firestore.FieldValue.serverTimestamp()
            }).then(function() {
                return postRef.update({
                    likesCount: firebase.firestore.FieldValue.increment(1)
                });
            });
        }
    }).then(function() {
        return chargerDetailGroupe(groupeId);
    }).catch(function(error) {
        console.error('Erreur like post groupe:', error);
        afficherToast('Erreur lors du like');
    });
}

/**
 * Commenter un post de groupe
 * @param {string} groupeId - ID du groupe
 * @param {string} postId - ID du post
 * @param {string} texte - Texte du commentaire
 * @returns {Promise<void>}
 */
function commenterPostGroupe(groupeId, postId, texte) {
    if (!texte || texte.trim().length === 0) {
        afficherToast('Le commentaire ne peut pas être vide');
        return Promise.reject(new Error('Commentaire vide'));
    }

    var postRef = firebase.firestore()
        .collection('groupes').doc(groupeId)
        .collection('posts').doc(postId);

    var commentData = {
        auteurUid: state.user.uid,
        auteur: state.user.pseudo || 'Anonyme',
        texte: texte.trim(),
        date: firebase.firestore.FieldValue.serverTimestamp()
    };

    return postRef.collection('commentaires').add(commentData)
        .then(function() {
            return postRef.update({
                commentsCount: firebase.firestore.FieldValue.increment(1)
            });
        })
        .then(function() {
            afficherToast('Commentaire ajouté !');
            return chargerDetailGroupe(groupeId);
        })
        .catch(function(error) {
            console.error('Erreur ajout commentaire:', error);
            afficherToast('Erreur lors de l\'ajout du commentaire');
        });
}

/**
 * Supprimer un commentaire de post de groupe
 * @param {string} groupeId - ID du groupe
 * @param {string} postId - ID du post
 * @param {string} commentId - ID du commentaire
 * @returns {Promise<void>}
 */
function supprimerCommentaireGroupe(groupeId, postId, commentId) {
    var postRef = firebase.firestore()
        .collection('groupes').doc(groupeId)
        .collection('posts').doc(postId);

    return postRef.collection('commentaires').doc(commentId).delete()
        .then(function() {
            return postRef.update({
                commentsCount: firebase.firestore.FieldValue.increment(-1)
            });
        })
        .then(function() {
            afficherToast('Commentaire supprimé');
            return chargerDetailGroupe(groupeId);
        })
        .catch(function(error) {
            console.error('Erreur suppression commentaire:', error);
            afficherToast('Erreur lors de la suppression du commentaire');
        });
}

/**
 * Supprimer un post de groupe
 * @param {string} groupeId - ID du groupe
 * @param {string} postId - ID du post
 * @returns {Promise<void>}
 */
function supprimerPostGroupe(groupeId, postId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
        return Promise.resolve();
    }

    var postRef = firebase.firestore()
        .collection('groupes').doc(groupeId)
        .collection('posts').doc(postId);

    // Supprimer d'abord les sous-collections
    return Promise.all([
        supprimerSousCollection(postRef, 'likes'),
        supprimerSousCollection(postRef, 'commentaires')
    ]).then(function() {
        return postRef.delete();
    }).then(function() {
        return firebase.firestore().collection('groupes').doc(groupeId).update({
            nombrePosts: firebase.firestore.FieldValue.increment(-1)
        });
    }).then(function() {
        afficherToast('Post supprimé');
        return chargerDetailGroupe(groupeId);
    }).catch(function(error) {
        console.error('Erreur suppression post:', error);
        afficherToast('Erreur lors de la suppression du post');
    });
}

/**
 * Expulser un membre d'un groupe (admin seulement)
 * @param {string} groupeId - ID du groupe
 * @param {string} membreUid - UID du membre à expulser
 * @returns {Promise<void>}
 */
function expulserMembreGroupe(groupeId, membreUid) {
    if (membreUid === state.user.uid) {
        afficherToast('Vous ne pouvez pas vous expulser vous-même');
        return Promise.reject(new Error('Auto-expulsion interdite'));
    }

    if (!confirm('Êtes-vous sûr de vouloir expulser ce membre ?')) {
        return Promise.resolve();
    }

    var groupeRef = firebase.firestore().collection('groupes').doc(groupeId);

    return groupeRef.get().then(function(doc) {
        if (!doc.exists) {
            afficherToast('Groupe introuvable');
            throw new Error('Groupe introuvable');
        }

        var groupeData = doc.data();

        // Vérifier que l'utilisateur est le créateur
        if (groupeData.createur !== state.user.uid) {
            afficherToast('Seul le créateur peut expulser des membres');
            throw new Error('Pas autorisé');
        }

        // Trouver le membre à expulser
        var membreARetirer = groupeData.membres.find(function(m) {
            return m.uid === membreUid;
        });

        if (!membreARetirer) {
            afficherToast('Membre introuvable');
            throw new Error('Membre introuvable');
        }

        return groupeRef.update({
            membres: firebase.firestore.FieldValue.arrayRemove(membreARetirer),
            membresUids: firebase.firestore.FieldValue.arrayRemove(membreUid)
        });
    }).then(function() {
        // Retirer le groupe de l'utilisateur expulsé
        return firebase.firestore().collection('users').doc(membreUid).get();
    }).then(function(userDoc) {
        if (userDoc.exists && userDoc.data().groupes) {
            var groupeUser = userDoc.data().groupes.find(function(g) {
                return g.id === groupeId;
            });
            if (groupeUser) {
                return firebase.firestore().collection('users').doc(membreUid).update({
                    groupes: firebase.firestore.FieldValue.arrayRemove(groupeUser)
                });
            }
        }
    }).then(function() {
        afficherToast('Membre expulsé');
        return chargerDetailGroupe(groupeId);
    }).catch(function(error) {
        console.error('Erreur expulsion membre:', error);
        if (error.message !== 'Groupe introuvable' &&
            error.message !== 'Pas autorisé' &&
            error.message !== 'Membre introuvable' &&
            error.message !== 'Auto-expulsion interdite') {
            afficherToast('Erreur lors de l\'expulsion du membre');
        }
        throw error;
    });
}

/**
 * Supprimer un groupe (admin seulement)
 * @param {string} groupeId - ID du groupe
 * @returns {Promise<void>}
 */
function supprimerGroupe(groupeId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.')) {
        return Promise.resolve();
    }

    var groupeRef = firebase.firestore().collection('groupes').doc(groupeId);

    return groupeRef.get().then(function(doc) {
        if (!doc.exists) {
            afficherToast('Groupe introuvable');
            throw new Error('Groupe introuvable');
        }

        var groupeData = doc.data();

        // Vérifier que l'utilisateur est le créateur
        if (groupeData.createur !== state.user.uid) {
            afficherToast('Seul le créateur peut supprimer le groupe');
            throw new Error('Pas autorisé');
        }

        // Charger tous les posts
        return groupeRef.collection('posts').get().then(function(postsSnapshot) {
            // Supprimer les sous-collections de chaque post
            var promises = [];
            postsSnapshot.forEach(function(postDoc) {
                var postRef = groupeRef.collection('posts').doc(postDoc.id);
                promises.push(supprimerSousCollection(postRef, 'likes'));
                promises.push(supprimerSousCollection(postRef, 'commentaires'));
                promises.push(postRef.delete());
            });
            return Promise.all(promises);
        }).then(function() {
            // Retirer le groupe de tous les membres
            var promises = groupeData.membresUids.map(function(uid) {
                return firebase.firestore().collection('users').doc(uid).get().then(function(userDoc) {
                    if (userDoc.exists && userDoc.data().groupes) {
                        var groupeUser = userDoc.data().groupes.find(function(g) {
                            return g.id === groupeId;
                        });
                        if (groupeUser) {
                            return firebase.firestore().collection('users').doc(uid).update({
                                groupes: firebase.firestore.FieldValue.arrayRemove(groupeUser)
                            });
                        }
                    }
                });
            });
            return Promise.all(promises);
        }).then(function() {
            // Supprimer le document groupe
            return groupeRef.delete();
        });
    }).then(function() {
        afficherToast('Groupe supprimé');
        state.vue = 'social';
        return chargerGroupes();
    }).catch(function(error) {
        console.error('Erreur suppression groupe:', error);
        if (error.message !== 'Groupe introuvable' && error.message !== 'Pas autorisé') {
            afficherToast('Erreur lors de la suppression du groupe');
        }
        throw error;
    });
}

/**
 * Fonction utilitaire pour supprimer une sous-collection
 * @param {Object} docRef - Référence au document parent
 * @param {string} collectionName - Nom de la sous-collection
 * @returns {Promise<void>}
 */
function supprimerSousCollection(docRef, collectionName) {
    return docRef.collection(collectionName).get().then(function(snapshot) {
        var promises = [];
        snapshot.forEach(function(doc) {
            promises.push(doc.ref.delete());
        });
        return Promise.all(promises);
    });
}
