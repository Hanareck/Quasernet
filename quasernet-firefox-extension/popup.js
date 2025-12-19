// Popup Script - Interface utilisateur

// Éléments du DOM
const captureBtn = document.getElementById('captureBtn');
const statusDiv = document.getElementById('status');
const previewDiv = document.getElementById('preview');
const previewContent = document.getElementById('previewContent');
const syncBtn = document.getElementById('syncBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const historyList = document.getElementById('historyList');
const settingsForm = document.getElementById('settingsForm');

// Gestion des onglets
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;

    // Retirer la classe active de tous les onglets
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    // Ajouter la classe active à l'onglet sélectionné
    tab.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Charger l'historique si l'onglet historique est sélectionné
    if (tabName === 'history') {
      loadHistory();
    }
  });
});

/**
 * Affiche un message de statut
 */
function showStatus(message, type = 'info') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove('hidden');

  // Cacher automatiquement après 3 secondes
  setTimeout(() => {
    statusDiv.classList.add('hidden');
  }, 3000);
}

/**
 * Affiche l'aperçu des données capturées
 */
function showPreview(data) {
  const fields = [
    { key: 'title', label: 'Titre' },
    { key: 'creator', label: 'Créateur' },
    { key: 'type', label: 'Type' },
    { key: 'siteName', label: 'Site' },
    { key: 'url', label: 'URL' }
  ];

  let html = '<dl class="preview-list">';

  fields.forEach(field => {
    if (data[field.key]) {
      html += `
        <dt>${field.label}</dt>
        <dd>${escapeHtml(data[field.key])}</dd>
      `;
    }
  });

  html += '</dl>';

  previewContent.innerHTML = html;
  previewDiv.classList.remove('hidden');
}

/**
 * Échappe le HTML pour éviter les injections
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Gère la capture
 */
async function handleCapture() {
  try {
    captureBtn.disabled = true;
    captureBtn.textContent = 'Capture en cours...';

    const response = await browser.runtime.sendMessage({ action: 'capture' });

    if (response.success) {
      showStatus('Capture réussie !', 'success');
      if (response.data) {
        showPreview(response.data);
      }
    } else {
      showStatus(`Erreur: ${response.error}`, 'error');
      previewDiv.classList.add('hidden');
    }

  } catch (error) {
    showStatus(`Erreur: ${error.message}`, 'error');
    console.error('Erreur lors de la capture:', error);
  } finally {
    captureBtn.disabled = false;
    captureBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      Capturer cette page
    `;
  }
}

/**
 * Charge et affiche l'historique
 */
async function loadHistory() {
  try {
    const response = await browser.runtime.sendMessage({ action: 'getLocalCaptures' });

    if (response.success && response.captures.length > 0) {
      const captures = response.captures.sort((a, b) =>
        new Date(b.capturedAt) - new Date(a.capturedAt)
      );

      let html = '';
      captures.forEach(capture => {
        const syncBadge = capture.synced
          ? '<span class="badge synced">Synchronisé</span>'
          : '<span class="badge unsynced">Non synchronisé</span>';

        html += `
          <div class="history-item" data-id="${capture.id}">
            <div class="history-item-header">
              <strong>${escapeHtml(capture.title || 'Sans titre')}</strong>
              ${syncBadge}
            </div>
            <div class="history-item-meta">
              ${capture.creator ? escapeHtml(capture.creator) + ' • ' : ''}
              ${capture.siteName || ''} •
              ${new Date(capture.capturedAt).toLocaleDateString('fr-FR')}
            </div>
            <button class="btn-delete" data-id="${capture.id}">Supprimer</button>
          </div>
        `;
      });

      historyList.innerHTML = html;

      // Ajouter les gestionnaires d'événements pour les boutons de suppression
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          await browser.runtime.sendMessage({ action: 'deleteLocalCapture', id });
          loadHistory();
        });
      });

    } else {
      historyList.innerHTML = '<p class="empty-state">Aucune capture locale</p>';
    }

  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error);
    historyList.innerHTML = '<p class="error">Erreur lors du chargement</p>';
  }
}

/**
 * Synchronise les captures locales
 */
async function syncLocalCaptures() {
  try {
    syncBtn.disabled = true;
    syncBtn.textContent = 'Synchronisation...';

    const response = await browser.runtime.sendMessage({ action: 'syncLocal' });

    if (response.success) {
      showStatus(`${response.syncedCount} capture(s) synchronisée(s)`, 'success');
      loadHistory();
    } else {
      showStatus(`Erreur: ${response.error}`, 'error');
    }

  } catch (error) {
    showStatus(`Erreur: ${error.message}`, 'error');
  } finally {
    syncBtn.disabled = false;
    syncBtn.textContent = 'Synchroniser';
  }
}

/**
 * Charge les paramètres
 */
async function loadSettings() {
  try {
    const config = await browser.storage.local.get({
      apiUrl: '',
      apiKey: '',
      autoSave: false,
      useLocalStorage: false
    });

    document.getElementById('apiUrl').value = config.apiUrl || '';
    document.getElementById('apiKey').value = config.apiKey || '';
    document.getElementById('autoSave').checked = config.autoSave || false;
    document.getElementById('useLocalStorage').checked = config.useLocalStorage || false;

  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error);
  }
}

/**
 * Sauvegarde les paramètres
 */
async function saveSettings(e) {
  e.preventDefault();

  try {
    const config = {
      apiUrl: document.getElementById('apiUrl').value,
      apiKey: document.getElementById('apiKey').value,
      autoSave: document.getElementById('autoSave').checked,
      useLocalStorage: document.getElementById('useLocalStorage').checked
    };

    await browser.storage.local.set(config);
    showStatus('Paramètres enregistrés', 'success');

  } catch (error) {
    showStatus(`Erreur: ${error.message}`, 'error');
  }
}

/**
 * Efface l'historique local
 */
async function clearHistory() {
  if (!confirm('Êtes-vous sûr de vouloir effacer tout l\'historique local ?')) {
    return;
  }

  try {
    await browser.runtime.sendMessage({ action: 'clearLocalCaptures' });
    showStatus('Historique effacé', 'success');
    loadHistory();
  } catch (error) {
    showStatus(`Erreur: ${error.message}`, 'error');
  }
}

// Event listeners
captureBtn.addEventListener('click', handleCapture);
syncBtn.addEventListener('click', syncLocalCaptures);
clearHistoryBtn.addEventListener('click', clearHistory);
settingsForm.addEventListener('submit', saveSettings);

// Charger les paramètres au démarrage
loadSettings();

// Raccourci clavier pour la capture (Ctrl+Shift+C)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    handleCapture();
  }
});
