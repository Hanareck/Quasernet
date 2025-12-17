// AUTH - Authentification

function genererFriendCode() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var code = '';
    for (var i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function inscription(email, password, pseudo) {
    try {
        state.authError = null;
        
        // Verifier que le pseudo est unique
        if (pseudo) {
            var dispo = await pseudoDisponible(pseudo);
            if (!dispo) {
                state.authError = 'Ce pseudo est deja pris';
                render();
                return;
            }
        }
        
        var result = await auth.createUserWithEmailAndPassword(email, password);
        
        if (result.user && pseudo) {
            await db.collection('users').doc(result.user.uid).set({
                pseudo: pseudo,
                pseudoLower: pseudo.toLowerCase(),
                email: email.toLowerCase(),
                amis: [],
                dateCreation: new Date().toISOString()
            }, { merge: true });
            state.userPseudo = pseudo;
        }
    } catch (error) {
        state.authError = traduireErreur(error.code);
        render();
    }
}

async function connexion(email, password) {
    try {
        state.authError = null;
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        state.authError = traduireErreur(error.code);
        render();
    }
}

async function deconnexion() { 
    await auth.signOut(); 
}

async function changerPseudo() {
    var newPseudo = document.getElementById('new-pseudo')?.value?.trim();
    if (!newPseudo || newPseudo.length < 2) {
        state.settingsError = 'Le pseudo doit contenir au moins 2 caracteres';
        state.settingsSuccess = null;
        render();
        return;
    }

    // Verifier que le nouveau pseudo est disponible
    var dispo = await pseudoDisponible(newPseudo);
    if (!dispo && newPseudo.toLowerCase() !== state.userPseudo.toLowerCase()) {
        state.settingsError = 'Ce pseudo est deja pris';
        state.settingsSuccess = null;
        render();
        return;
    }

    try {
        // Verifier la limitation mensuelle
        var userDoc = await db.collection('users').doc(state.user.uid).get();
        var userData = userDoc.data();
        var dernierChangement = userData?.dernierChangementPseudo;

        if (dernierChangement) {
            var dateDernierChangement = new Date(dernierChangement);
            var maintenant = new Date();
            var joursEcoules = Math.floor((maintenant - dateDernierChangement) / (1000 * 60 * 60 * 24));

            if (joursEcoules < 30) {
                var joursRestants = 30 - joursEcoules;
                state.settingsError = 'Vous ne pouvez changer votre pseudo qu\'une fois par mois. Vous pourrez le modifier a nouveau dans ' + joursRestants + ' jour' + (joursRestants > 1 ? 's' : '');
                state.settingsSuccess = null;
                render();
                return;
            }
        }

        var maintenant = new Date().toISOString();
        await db.collection('users').doc(state.user.uid).update({
            pseudo: newPseudo,
            pseudoLower: newPseudo.toLowerCase(),
            dernierChangementPseudo: maintenant
        });
        state.userPseudo = newPseudo;
        state.dernierChangementPseudo = maintenant;
        state.settingsSuccess = 'Pseudo modifie avec succes';
        state.settingsError = null;

        // Vider le champ
        var inputPseudo = document.getElementById('new-pseudo');
        if (inputPseudo) inputPseudo.value = '';

        render();
        setTimeout(function() {
            state.settingsSuccess = null;
            render();
        }, 3000);
    } catch (error) {
        state.settingsError = 'Erreur lors de la modification';
        state.settingsSuccess = null;
        render();
    }
}

async function changerMotDePasse() {
    var currentPwd = document.getElementById('current-password')?.value;
    var newPwd = document.getElementById('new-password')?.value;
    var confirmPwd = document.getElementById('confirm-password')?.value;
    
    state.settingsError = null;
    state.settingsSuccess = null;
    
    if (!currentPwd || !newPwd || !confirmPwd) {
        state.settingsError = 'Tous les champs sont requis';
        render();
        return;
    }
    
    if (newPwd.length < 6) {
        state.settingsError = 'Le nouveau mot de passe doit contenir au moins 6 caracteres';
        render();
        return;
    }
    
    if (newPwd !== confirmPwd) {
        state.settingsError = 'Les mots de passe ne correspondent pas';
        render();
        return;
    }
    
    try {
        var credential = firebase.auth.EmailAuthProvider.credential(
            state.user.email,
            currentPwd
        );
        await state.user.reauthenticateWithCredential(credential);
        await state.user.updatePassword(newPwd);
        
        state.settingsSuccess = 'Mot de passe modifie avec succes';
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
        render();
        setTimeout(function() {
            state.settingsSuccess = null;
            render();
        }, 3000);
    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            state.settingsError = 'Mot de passe actuel incorrect';
        } else {
            state.settingsError = 'Erreur lors de la modification';
        }
        render();
    }
}

async function supprimerCompte() {
    if (!confirm('ATTENTION ! Cette action est irreversible.\n\nToutes vos donnees seront definitivement supprimees.\n\nVoulez-vous vraiment supprimer votre compte ?')) {
        return;
    }
    
    var confirmation = prompt('Pour confirmer, tapez "SUPPRIMER" en majuscules :');
    if (confirmation !== 'SUPPRIMER') {
        afficherToast('Suppression annulee');
        return;
    }
    
    try {
        var entriesSnapshot = await db.collection('users').doc(state.user.uid).collection('entrees').get();
        var deletePromises = entriesSnapshot.docs.map(function(doc) { return doc.ref.delete(); });
        await Promise.all(deletePromises);
        
        await db.collection('users').doc(state.user.uid).delete();
        await state.user.delete();
        
        afficherToast('Compte supprime');
    } catch (error) {
        console.error('Erreur suppression compte:', error);
        state.settingsError = 'Erreur lors de la suppression. Vous devez peut-etre vous reconnecter.';
        render();
    }
}

function traduireErreur(code) {
    var erreurs = {
        'auth/email-already-in-use': 'Email deja utilise',
        'auth/invalid-email': 'Email invalide',
        'auth/weak-password': 'Mot de passe trop court (6 car. min)',
        'auth/user-not-found': 'Compte introuvable',
        'auth/wrong-password': 'Mot de passe incorrect',
        'auth/invalid-credential': 'Email ou mot de passe incorrect',
        'auth/too-many-requests': 'Trop de tentatives'
    };
    return erreurs[code] || 'Une erreur est survenue';
}

// Exposer les fonctions au scope global
window.deconnexion = deconnexion;
