// crypto.js - Hash de mots de passe avec SHA-256

/**
 * Hash un mot de passe avec SHA-256
 * @param {string} password - Le mot de passe à hasher
 * @returns {Promise<string>} Le hash en hexadécimal
 */
function hashPassword(password) {
    var encoder = new TextEncoder();
    var data = encoder.encode(password);

    return crypto.subtle.digest('SHA-256', data).then(function(hashBuffer) {
        var hashArray = Array.from(new Uint8Array(hashBuffer));
        var hashHex = hashArray.map(function(b) {
            return b.toString(16).padStart(2, '0');
        }).join('');
        return hashHex;
    });
}

/**
 * Vérifie si un mot de passe correspond à un hash
 * @param {string} password - Le mot de passe à vérifier
 * @param {string} hash - Le hash à comparer
 * @returns {Promise<boolean>} True si le mot de passe correspond
 */
function verifyPassword(password, hash) {
    return hashPassword(password).then(function(computedHash) {
        return computedHash === hash;
    });
}
