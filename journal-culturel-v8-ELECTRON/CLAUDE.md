# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Journal Culturel** is a personal cultural discovery journal web application built with vanilla JavaScript and Firebase. Users can catalog books, films, music, YouTube videos, news articles, and other cultural discoveries with ratings, notes, and covers. The app includes social features allowing users to follow friends, view their public catalogs, and interact through likes and comments.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES5 syntax), HTML5, CSS3
- **Backend**: Firebase (Authentication, Firestore)
- **Hosting**: Static files (no build step required)
- **APIs**:
  - Open Library (book covers)
  - OMDB (movie posters)
  - iTunes (music artwork)
  - YouTube oEmbed (video metadata)

## Development

### Running the Application

This is a static web application with no build process. To run locally:

```bash
# Serve with any static file server
python -m http.server 8000
# OR
npx serve .
```

Then open `http://localhost:8000` in your browser.

### Project Structure

The codebase follows a modular architecture with clear separation of concerns:

**Core Files:**
- `index.html` - Entry point, loads all scripts in dependency order
- `config.js` - Firebase configuration and global configuration (categories, statuses)
- `state.js` - Central state management object
- `main.js` - Application initialization and global event handlers

**Data Layer:**
- `firestore.js` - All Firestore operations (CRUD for entries, feed, notifications, catalog)
- `auth.js` - Authentication logic (login, register, password management)
- `friends.js` - Friend management (add, remove, search users)
- `cover.js` - External API integration for fetching covers/artwork

**Rendering Layer:**
- `render.js` - Main render coordinator (routes between auth/app/settings views)
- `renderApp.js` - App shell (header, navigation, footer)
- `renderAuth.js` - Login/registration forms
- `renderForm.js` - Entry creation/editing form
- `renderList.js` - Grid/list view of user's entries
- `renderDetail.js` - Single entry detail view (user's own entry)
- `renderStats.js` - Statistics dashboard
- `renderSocial.js` - Social section coordinator (tabs for feed/friends/notifications)
- `renderFil.js` - Activity feed from friends
- `renderAmis.js` - Friends list and friend catalog viewer (includes detail view for friend's entries)
- `renderNotifications.js` - Likes and comments received
- `renderSettings.js` - User settings (pseudo, password, account deletion)

**Utilities:**
- `tools.js` - Shared utility functions (filters, stats, formatting, local storage for "seen" tracking)

### Key Architecture Patterns

1. **State-Driven Rendering**: All UI updates flow through the central `state` object followed by `render()` call
2. **Global Event Handlers**: Window-level functions handle all user interactions (e.g., `window.ouvrirAjout`, `window.setCategorie`)
3. **Firestore Collections Structure**:
   - `/users/{uid}` - User profile (pseudo, email, friends array)
   - `/users/{uid}/entrees/{entryId}` - User's cultural entries
   - `/users/{uid}/entrees/{entryId}/likes/{userId}` - Likes on an entry
   - `/users/{uid}/entrees/{entryId}/commentaires/{commentId}` - Comments on an entry
   - `/users/{uid}/journalStats/{year-month}` - Monthly statistics
4. **Social System**: Friends are stored as an array of UIDs in each user document. The feed loads recent public entries from all friends. Notifications aggregate likes/comments received on user's entries.

### Important Implementation Details

- **No Build Step**: This is vanilla JS with ES5 syntax (var, function, no arrow functions). Don't introduce modern syntax or bundling.
- **Global Scope**: All functions exposed on window object for onclick handlers in HTML strings
- **Privacy**: Entries have a `prive` boolean flag. Private entries are excluded from friend views and the social feed.
- **Multi-Status Possession**: `statutPossession` is an array allowing multiple states (e.g., "Possede" + "A vendre")
- **YouTube Integration**: YouTube links are parsed to extract video IDs, fetch metadata via oEmbed, and display thumbnails
- **Music Links**: Support for Spotify, Deezer, and Qobuz streaming links
- **Pagination**: Personal entries use pagination (12 initial, +50 per load) to handle large collections
- **"Seen" Tracking**: Uses localStorage to track which feed posts and notifications the user has viewed (shows badge count)
- **Theme**: Light/dark theme stored in localStorage, applied via `data-theme` attribute

### Common Tasks

**Adding a new category:**
1. Update `CATEGORIES` object in `config.js`
2. Add genre list for that category
3. Icon is displayed automatically in navigation

**Modifying entry form fields:**
1. Update form structure in `renderForm.js`
2. Add field to initial state in `state.formulaire` (state.js and main.js)
3. Update `soumettreFormulaire()` in `main.js` if needed
4. Firestore schema is flexible (document-based), no migration needed

**Adding social features:**
1. Modify Firestore queries in `firestore.js`
2. Update relevant render functions (renderFil.js, renderNotifications.js, renderAmis.js)
3. Social interactions use owner-based collections (data lives in entry owner's Firestore space)

**Debugging Firebase:**
- Firebase config is in `config.js`
- Check `firebaseInitialized` flag
- All async errors are caught and show toasts via `afficherToast()`

### Code Style

- Use ES5 syntax (var, function, no const/let/arrow functions)
- String concatenation instead of template literals
- Functions exposed globally via `window.functionName = functionName`
- HTML rendered as concatenated strings
- All user-facing text is in French
- Use `escapeHtml()` for user-generated content in HTML strings
- Keep consistent with existing patterns (don't refactor working code unless requested)

### Firebase Security

The Firebase API key in `config.js` is public-facing (this is normal for Firebase web apps). Security is enforced through Firestore security rules on the Firebase backend, not in client code.
