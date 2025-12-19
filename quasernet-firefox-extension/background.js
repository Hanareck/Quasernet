// Background Script - Orchestration et envoi à l'API

const DEFAULT_API_URL = 'https://api.quasernet.com/capture'; // Remplacer par votre URL d'API

/**
 * Récupère la configuration de l'API depuis le stockage local
 */
async function getApiConfig() {
  try {
    const result = await browser.storage.local.get({
      apiUrl: DEFAULT_API_URL,
      apiKey: '',
      autoSave: false,
      useLocalStorage: false
    });
    return result;
  } catch (error) {
    console.error('Erreur lors de la récupération de la config API:', error);
    return {
      apiUrl: DEFAULT_API_URL,
      apiKey: '',
      autoSave: false,
      useLocalStorage: false
    };
  }
}

/**
 * Sauvegarde les données localement
 */
async function saveLocally(data) {
  try {
    const result = await browser.storage.local.get({ captures: [] });
    const captures = result.captures || [];

    captures.push({
      ...data,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      synced: false
    });

    await browser.storage.local.set({ captures });
    return { success: true, savedLocally: true };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde locale:', error);
    throw error;
  }
}

/**
 * Envoie les données à l'API
 */
async function sendToApi(data, config) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, response: result };

  } catch (error) {
    console.error('Erreur lors de l\'envoi à l\'API:', error);
    throw error;
  }
}

/**
 * Gère la capture de données
 */
async function handleCapture(tab) {
  try {
    // Envoyer un message au content script pour extraire les données
    const response = await browser.tabs.sendMessage(tab.id, { action: 'extractData' });

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Erreur inconnue lors de l\'extraction'
      };
    }

    // Récupérer la configuration de l'API
    const config = await getApiConfig();

    // Décider si on sauvegarde localement ou on envoie à l'API
    if (config.useLocalStorage) {
      return await saveLocally(response.data);
    } else {
      try {
        const result = await sendToApi(response.data, config);

        // Si autoSave est activé, sauvegarder aussi localement
        if (config.autoSave) {
          await saveLocally(response.data);
        }

        return result;
      } catch (apiError) {
        // Si l'envoi à l'API échoue, sauvegarder localement
        console.warn('Échec de l\'envoi à l\'API, sauvegarde locale...', apiError);
        return await saveLocally(response.data);
      }
    }

  } catch (error) {
    console.error('Erreur dans handleCapture:', error);
    return {
      success: false,
      error: error.message || 'Erreur inconnue'
    };
  }
}

/**
 * Synchronise les captures locales non synchronisées avec l'API
 */
async function syncLocalCaptures() {
  try {
    const config = await getApiConfig();
    if (config.useLocalStorage || !config.apiUrl) {
      return { success: false, error: 'Mode local ou API non configurée' };
    }

    const result = await browser.storage.local.get({ captures: [] });
    const captures = result.captures || [];
    const unsyncedCaptures = captures.filter(c => !c.synced);

    if (unsyncedCaptures.length === 0) {
      return { success: true, syncedCount: 0, message: 'Aucune capture à synchroniser' };
    }

    let syncedCount = 0;
    const errors = [];

    for (const capture of unsyncedCaptures) {
      try {
        await sendToApi(capture, config);
        capture.synced = true;
        capture.syncedAt = new Date().toISOString();
        syncedCount++;
      } catch (error) {
        errors.push({ id: capture.id, error: error.message });
      }
    }

    // Sauvegarder les captures mises à jour
    await browser.storage.local.set({ captures });

    return {
      success: true,
      syncedCount,
      totalUnsynced: unsyncedCaptures.length,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gère les messages du popup
 */
browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'capture') {
    const tab = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab[0]) {
      return handleCapture(tab[0]);
    } else {
      return { success: false, error: 'Aucun onglet actif trouvé' };
    }
  }

  if (message.action === 'syncLocal') {
    return syncLocalCaptures();
  }

  if (message.action === 'getLocalCaptures') {
    const result = await browser.storage.local.get({ captures: [] });
    return { success: true, captures: result.captures || [] };
  }

  if (message.action === 'deleteLocalCapture') {
    const result = await browser.storage.local.get({ captures: [] });
    const captures = result.captures || [];
    const filtered = captures.filter(c => c.id !== message.id);
    await browser.storage.local.set({ captures: filtered });
    return { success: true };
  }

  if (message.action === 'clearLocalCaptures') {
    await browser.storage.local.set({ captures: [] });
    return { success: true };
  }
});

// Gestion de l'installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Quasernet Capture installé !');
    // Initialiser les paramètres par défaut
    browser.storage.local.set({
      apiUrl: DEFAULT_API_URL,
      apiKey: '',
      autoSave: false,
      useLocalStorage: false,
      captures: []
    });
  } else if (details.reason === 'update') {
    console.log('Quasernet Capture mis à jour !');
  }
});

console.log('Quasernet Capture: Background script chargé');
