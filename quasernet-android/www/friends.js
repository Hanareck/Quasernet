// GESTION DES AMIS

async function chargerAmis() {
    if (!state.user) return;
    
    try {
        var userDoc = await db.collection('users').doc(state.user.uid).get();
        if (userDoc.exists) {
            var data = userDoc.data();
            var amisUids = data.amis || [];
            
            // Ajouter soi-même si pas déjà dans la liste
            if (amisUids.indexOf(state.user.uid) === -1) {
                amisUids.unshift(state.user.uid);
                await db.collection('users').doc(state.user.uid).update({
                    amis: amisUids
                });
            }

            state.amis = [];
            for (var i = 0; i < amisUids.length; i++) {
                var amiUid = amisUids[i];
                try {
                    var amiDoc = await db.collection('users').doc(amiUid).get();
                    if (amiDoc.exists) {
                        var amiData = amiDoc.data();
                        state.amis.push({
                            uid: amiUid,
                            pseudo: amiData.pseudo,
                            email: amiData.email
                        });
                    }
                } catch (e) {
                    console.error('Erreur chargement ami:', e);
                }
            }
        }
    } catch (error) {
        console.error('Erreur chargement amis:', error);
    }
    render();
}

async function ajouterAmi() {
    var input = document.getElementById('ami-recherche-input');
    if (!input) return;
    
    var recherche = input.value.trim();
    
    if (!recherche) {
        afficherToast('Entrez un pseudo ou email');
        return;
    }
    
    if (recherche.length < 2) {
        afficherToast('Minimum 2 caracteres');
        return;
    }
    
    // Verifier si c'est nous-meme
    if (recherche.toLowerCase() === state.userPseudo.toLowerCase() || 
        recherche.toLowerCase() === state.user.email.toLowerCase()) {
        afficherToast('Vous ne pouvez pas vous ajouter');
        return;
    }
    
    try {
        var utilisateur = await rechercherUtilisateur(recherche);
        
        if (!utilisateur) {
            afficherToast('Utilisateur introuvable');
            return;
        }
        
        // Verifier si deja ami
        var dejaAmi = state.amis.some(function(a) { return a.uid === utilisateur.uid; });
        if (dejaAmi) {
            afficherToast('Deja dans vos amis');
            return;
        }
        
        // Ajouter a la liste d'amis
        var amisUids = state.amis.map(function(a) { return a.uid; });
        amisUids.push(utilisateur.uid);
        
        await db.collection('users').doc(state.user.uid).update({
            amis: amisUids
        });
        
        state.amis.push({
            uid: utilisateur.uid,
            pseudo: utilisateur.pseudo,
            email: utilisateur.email
        });
        
        input.value = '';
        afficherToast(utilisateur.pseudo + ' ajoute !');
        
        render();
    } catch (error) {
        console.error('Erreur ajout ami:', error);
        afficherToast('Erreur');
    }
}

async function retirerAmi(amiUid) {
    if (!confirm('Retirer cet ami de votre liste ?')) return;
    
    try {
        var amisUids = state.amis.map(function(a) { return a.uid; }).filter(function(uid) { return uid !== amiUid; });
        
        await db.collection('users').doc(state.user.uid).update({
            amis: amisUids
        });
        
        state.amis = state.amis.filter(function(a) { return a.uid !== amiUid; });
        afficherToast('Ami retire');
        
        render();
    } catch (error) {
        console.error('Erreur retrait ami:', error);
        afficherToast('Erreur');
    }
}

function voirCatalogueAmi(amiUid, amiPseudo) {
    state.vue = 'catalogueAmi';
    chargerCatalogueAmi(amiUid, amiPseudo);
}
