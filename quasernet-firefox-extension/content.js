// Content Script - Extraction de données
(function() {
  'use strict';

  /**
   * Charge la configuration des sites depuis le fichier JSON
   */
  async function loadSitesConfig() {
    try {
      const response = await fetch(browser.runtime.getURL('sites-config.json'));
      const config = await response.json();
      return config.sites;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
      return [];
    }
  }

  /**
   * Trouve la configuration correspondant au domaine actuel
   */
  function findSiteConfig(sites, currentUrl) {
    const hostname = new URL(currentUrl).hostname;

    return sites.find(site => {
      // Vérifier le domaine
      const domainMatch = site.domains.some(domain =>
        hostname === domain || hostname.endsWith('.' + domain)
      );

      // Vérifier le pattern d'URL si spécifié
      if (site.urlPattern) {
        const regex = new RegExp(site.urlPattern);
        return domainMatch && regex.test(currentUrl);
      }

      return domainMatch;
    });
  }

  /**
   * Extrait le contenu d'un élément en essayant plusieurs sélecteurs
   */
  function extractContent(selectors, attribute = null) {
    if (!Array.isArray(selectors)) {
      selectors = [selectors];
    }

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          if (attribute) {
            const value = element.getAttribute(attribute);
            if (value) return value.trim();
          } else {
            const text = element.textContent || element.innerText;
            if (text) return text.trim();
          }
        }
      } catch (error) {
        console.warn(`Sélecteur invalide: ${selector}`, error);
      }
    }

    return null;
  }

  /**
   * Extrait toutes les données de la page selon la configuration
   */
  function extractData(siteConfig) {
    const data = {
      url: window.location.href,
      capturedAt: new Date().toISOString(),
      siteName: siteConfig.name,
      type: siteConfig.type || 'unknown'
    };

    // Extraire le titre
    if (siteConfig.selectors.title) {
      data.title = extractContent(siteConfig.selectors.title);
    }

    // Extraire le créateur/artiste/auteur
    if (siteConfig.selectors.creator) {
      data.creator = extractContent(siteConfig.selectors.creator);
    }

    // Extraire la miniature
    if (siteConfig.selectors.thumbnail) {
      data.thumbnail = extractContent(siteConfig.selectors.thumbnail, 'content') ||
                      extractContent(siteConfig.selectors.thumbnail, 'href') ||
                      extractContent(siteConfig.selectors.thumbnail, 'src');
    }

    // Extraire la description
    if (siteConfig.selectors.description) {
      data.description = extractContent(siteConfig.selectors.description, 'content') ||
                        extractContent(siteConfig.selectors.description);
    }

    // Extraire les champs additionnels (date de sortie, etc.)
    if (siteConfig.selectors.releaseDate) {
      data.releaseDate = extractContent(siteConfig.selectors.releaseDate);
    }

    if (siteConfig.selectors.publishDate) {
      data.publishDate = extractContent(siteConfig.selectors.publishDate);
    }

    return data;
  }

  /**
   * Attend qu'un élément soit présent dans le DOM (pour les sites dynamiques)
   */
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      // Vérifier si l'élément existe déjà
      const element = document.querySelector(selector);
      if (element) {
        resolve(true);
        return;
      }

      // Sinon, utiliser MutationObserver
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(true);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout
      setTimeout(() => {
        observer.disconnect();
        resolve(false);
      }, timeout);
    });
  }

  /**
   * Gère les messages du popup
   */
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'extractData') {
      try {
        const sites = await loadSitesConfig();
        const siteConfig = findSiteConfig(sites, window.location.href);

        if (!siteConfig) {
          return {
            success: false,
            error: 'Site non supporté',
            url: window.location.href
          };
        }

        // Attendre que le contenu soit chargé si nécessaire
        if (siteConfig.dynamicContent && siteConfig.waitForSelector) {
          await waitForElement(siteConfig.waitForSelector);
          // Petit délai supplémentaire pour s'assurer que tout est chargé
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        const data = extractData(siteConfig);

        // Vérifier qu'on a au moins un titre
        if (!data.title) {
          return {
            success: false,
            error: 'Impossible d\'extraire le titre de la page',
            partialData: data
          };
        }

        return {
          success: true,
          data: data
        };

      } catch (error) {
        return {
          success: false,
          error: error.message,
          stack: error.stack
        };
      }
    }
  });

  // Indiquer que le content script est chargé
  console.log('Quasernet Capture: Content script chargé');
})();
