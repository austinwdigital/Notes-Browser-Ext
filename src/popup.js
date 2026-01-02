/**
 * Quick Note Browser Extension
 * A modern, lightweight note-taking extension with markdown support
 * @author austinwdigital
 * @version 1.0.0
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize markdown-it
  const md = new markdownit({
    html: false,        // Disable HTML tags in source for security
    breaks: true,       // Convert '\n' in paragraphs into <br>
    linkify: true,      // Autoconvert URL-like text to links
    typographer: true,  // Enable smartquotes and other typographic replacements
  });

  // DOM Elements - Cached for performance
  const elements = {
    noteArea: document.getElementById('note'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    app: document.getElementById('app'),
    clearBtn: document.getElementById('clearBtn'),
    exportBtn: document.getElementById('exportBtn'),
    modal: document.getElementById('confirmModal'),
    confirmYes: document.getElementById('confirmYes'),
    confirmNo: document.getElementById('confirmNo'),
    saveBtn: document.getElementById('saveBtn'),
    saveStatus: document.querySelector('.save-status'),
    noteSelector: document.getElementById('noteSelector'),
    newNoteBtn: document.getElementById('newNoteBtn'),
    editTitleBtn: document.getElementById('editTitleBtn'),
    createNoteModal: document.getElementById('createNoteModal'),
    newNoteTitle: document.getElementById('newNoteTitle'),
    createNoteBtn: document.getElementById('createNoteBtn'),
    cancelCreateBtn: document.getElementById('cancelCreateBtn'),
    editTitleModal: document.getElementById('editTitleModal'),
    editNoteTitleInput: document.getElementById('editNoteTitleInput'),
    saveEditBtn: document.getElementById('saveEditBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    previewBtn: document.getElementById('previewBtn'),
    previewArea: document.createElement('div')
  };

  // Initialize preview area
  elements.previewArea.className = 'preview-mode';
  elements.noteArea.parentNode.insertBefore(elements.previewArea, elements.noteArea.nextSibling);

  // Application state
  const state = {
    currentNoteId: null,
    saveTimeout: null,
    debounceTimeout: null,
    isPreviewMode: false,
    isInitialized: false
  };

  // Constants
  const STORAGE_KEYS = {
    NOTES: 'quickNotes',
    LAST_NOTE_ID: 'lastNoteId',
    DARK_MODE: 'darkMode'
  };

  const DEBOUNCE_DELAY = 500;
  const SAVE_STATUS_DURATION = 2000;
  const MAX_NOTES = 100; // Prevent memory issues
  const MAX_NOTE_SIZE = 1000000; // 1MB per note

  /**
   * Storage Controller - Handles all Chrome Storage API operations
   */
  const Storage = {
    get: async (key, defaultValue = {}) => {
      try {
        const result = await chrome.storage.local.get(key);
        return result[key] !== undefined ? result[key] : defaultValue;
      } catch (error) {
        console.error(`Error getting storage item ${key}:`, error);
        return defaultValue;
      }
    },

    set: async (key, value) => {
      try {
        await chrome.storage.local.set({ [key]: value });
      } catch (error) {
        console.error(`Error setting storage item ${key}:`, error);
      }
    },

    remove: async (key) => {
      try {
        await chrome.storage.local.remove(key);
      } catch (error) {
        console.error(`Error removing storage item ${key}:`, error);
      }
    },

    // Note-specific methods
    getNotes: async () => Storage.get(STORAGE_KEYS.NOTES, {}),
    setNotes: async (notes) => Storage.set(STORAGE_KEYS.NOTES, notes),
    getLastNoteId: async () => {
      const result = await Storage.get(STORAGE_KEYS.LAST_NOTE_ID, null);
      return result;
    },
    setLastNoteId: async (id) => Storage.set(STORAGE_KEYS.LAST_NOTE_ID, id)
  };

  /**
   * Theme Controller - Manages dark/light mode
   */
  const ThemeController = {
    async init() {
      const savedTheme = await Storage.get(STORAGE_KEYS.DARK_MODE, null);

      if (savedTheme === 'enabled') {
        this.enable();
      } else if (savedTheme === 'disabled') {
        this.disable();
      } else {
        // No saved preference, check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          this.enable();
        } else {
          this.disable();
        }
      }
    },

    enable() {
      document.body.classList.add('dark');
      elements.app.classList.add('dark');
      elements.noteArea.classList.add('dark');
      elements.darkModeToggle.classList.add('dark');
    },

    disable() {
      document.body.classList.remove('dark');
      elements.app.classList.remove('dark');
      elements.noteArea.classList.remove('dark');
      elements.darkModeToggle.classList.remove('dark');
    },

    async toggle() {
      const isDark = document.body.classList.contains('dark');
      if (isDark) {
        this.disable();
        await Storage.set(STORAGE_KEYS.DARK_MODE, 'disabled');
      } else {
        this.enable();
        await Storage.set(STORAGE_KEYS.DARK_MODE, 'enabled');
      }
    }
  };

  /**
   * Notes Controller - Manages note CRUD operations
   */
  const NotesController = {
    /**
     * Create a new note
     * @param {string} title - The title for the new note
     * @returns {string|null} - The ID of the created note or null if failed
     */
    async createNote(title = 'New Note') {
      try {
        if (!title.trim()) {
          return null;
        }

        const notes = await Storage.getNotes();

        // Check note limit
        if (Object.keys(notes).length >= MAX_NOTES) {
          alert('Maximum number of notes reached. Please delete some notes before creating new ones.');
          return null;
        }

        const noteId = `note_${Date.now()}`;

        notes[noteId] = {
          title: title.trim(),
          content: '',
          createdAt: Date.now(),
          lastModified: Date.now()
        };

        await Storage.setNotes(notes);
        await this.loadNotesList();
        await this.loadNote(noteId);
        return noteId;
      } catch (error) {
        console.error('Error creating note:', error);
        alert('Failed to create note. Please try again.');
        return null;
      }
    },

    /**
     * Load a specific note by ID
     * @param {string} noteId - The ID of the note to load
     */
    async loadNote(noteId) {
      try {
        const notes = await Storage.getNotes();
        if (notes[noteId]) {
          state.currentNoteId = noteId;
          elements.noteArea.value = notes[noteId].content;
          await Storage.setLastNoteId(noteId);
          elements.noteSelector.value = noteId;

          // Reset preview mode when loading a new note
          if (state.isPreviewMode) {
            UI.togglePreview();
          }
        }
      } catch (error) {
        console.error('Error loading note:', error);
      }
    },

    /**
     * Save the current note
     */
    async saveNote() {
      try {
        if (!state.currentNoteId) {
          return;
        }

        const content = elements.noteArea.value;

        // Check note size
        if (content.length > MAX_NOTE_SIZE) {
          alert('Note is too large. Please reduce the content size.');
          return;
        }

        const notes = await Storage.getNotes();
        const currentNote = notes[state.currentNoteId];

        if (currentNote) {
          notes[state.currentNoteId] = {
            ...currentNote,
            content: content,
            lastModified: Date.now()
          };

          await Storage.setNotes(notes);
          UI.showSaveStatus();
        }
      } catch (error) {
        console.error('Error saving note:', error);
        alert('Failed to save note. Your changes may not be persisted.');
      }
    },

    /**
     * Delete a note by ID
     * @param {string} noteId - The ID of the note to delete
     */
    async deleteNote(noteId) {
      try {
        const notes = await Storage.getNotes();
        delete notes[noteId];
        await Storage.setNotes(notes);

        // If no notes left, create a default one
        if (Object.keys(notes).length === 0) {
          await this.createNote();
        } else {
          await this.loadNotesList();
          // Load the most recently modified note
          const sortedNotes = Object.entries(notes)
            .sort(([, a], [, b]) => b.lastModified - a.lastModified);
          await this.loadNote(sortedNotes[0][0]);
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    },

    /**
     * Update a note's title
     * @param {string} noteId - The ID of the note to update
     * @param {string} newTitle - The new title
     */
    async updateNoteTitle(noteId, newTitle) {
      try {
        if (!newTitle.trim()) {
          return false;
        }

        const notes = await Storage.getNotes();
        if (notes[noteId]) {
          notes[noteId].title = newTitle.trim();
          notes[noteId].lastModified = Date.now();
          await Storage.setNotes(notes);
          await this.loadNotesList();
          elements.noteSelector.value = noteId;
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error updating note title:', error);
        return false;
      }
    },

    /**
     * Load and populate the notes list dropdown
     */
    async loadNotesList() {
      try {
        const notes = await Storage.getNotes();
        elements.noteSelector.innerHTML = '<option value="" disabled>Select a note...</option>';

        const sortedNotes = Object.entries(notes)
          .sort(([, a], [, b]) => b.lastModified - a.lastModified);

        sortedNotes.forEach(([id, note]) => {
          const option = document.createElement('option');
          option.value = id;
          option.textContent = note.title;
          elements.noteSelector.appendChild(option);
        });

        // Load the last active note if it exists
        const lastNoteId = await Storage.getLastNoteId();
        if (lastNoteId && notes[lastNoteId]) {
          await this.loadNote(lastNoteId);
        } else if (sortedNotes.length > 0) {
          await this.loadNote(sortedNotes[0][0]);
        }
      } catch (error) {
        console.error('Error loading notes list:', error);
      }
    }
  };

  /**
   * UI Controller - Manages user interface interactions
   */
  const UI = {
    /**
     * Show save status indicator
     */
    showSaveStatus() {
      elements.saveStatus.classList.add('visible');
      if (state.saveTimeout) {
        clearTimeout(state.saveTimeout);
      }
      state.saveTimeout = setTimeout(() => {
        elements.saveStatus.classList.remove('visible');
      }, SAVE_STATUS_DURATION);
    },

    /**
     * Export current note as text file
     */
    async exportNote() {
      try {
        const content = elements.noteArea.value.trim();
        if (!content) {
          this.showToast('No content to export', 'warning');
          return;
        }

        const notes = await Storage.getNotes();
        const currentNote = notes[state.currentNoteId];
        const filename = currentNote ? `${currentNote.title}.txt` : 'quick-note.txt';

        const blob = new Blob([elements.noteArea.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('Note exported successfully', 'success');
      } catch (error) {
        console.error('Error exporting note:', error);
        this.showToast('Failed to export note', 'error');
      }
    },

    /**
     * Show a temporary toast message
     */
    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => toast.classList.add('show'), 10);

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    },

    /**
     * Show create note modal
     */
    showCreateNoteModal() {
      elements.createNoteModal.style.display = 'block';
      elements.newNoteTitle.value = 'New Note';
      elements.newNoteTitle.select();
      elements.newNoteTitle.focus();
    },

    /**
     * Hide create note modal
     */
    hideCreateNoteModal() {
      elements.createNoteModal.style.display = 'none';
      elements.newNoteTitle.value = '';
    },

    /**
     * Show edit title modal
     * @param {string} currentTitle - The current title to edit
     */
    showEditTitleModal(currentTitle) {
      elements.editTitleModal.style.display = 'block';
      elements.editNoteTitleInput.value = currentTitle;
      elements.editNoteTitleInput.select();
      elements.editNoteTitleInput.focus();
    },

    /**
     * Hide edit title modal
     */
    hideEditTitleModal() {
      elements.editTitleModal.style.display = 'none';
      elements.editNoteTitleInput.value = '';
    },

    /**
     * Toggle between edit and preview modes
     */
    togglePreview() {
      const previewIcon = elements.previewBtn.querySelector('.preview-icon');
      const editIcon = elements.previewBtn.querySelector('.edit-icon');

      if (state.isPreviewMode) {
        // Switch to edit mode
        elements.previewArea.classList.remove('active');
        elements.noteArea.classList.remove('hidden');
        elements.previewBtn.title = 'Show preview';
        previewIcon.style.display = 'block';
        editIcon.style.display = 'none';
        state.isPreviewMode = false;
        elements.noteArea.focus();
      } else {
        // Switch to preview mode
        try {
          const content = elements.noteArea.value;
          if (!content.trim()) {
            UI.showToast('No content to preview', 'warning');
            return;
          }
          elements.previewArea.innerHTML = md.render(content);
          elements.previewArea.classList.add('active');
          elements.noteArea.classList.add('hidden');
          elements.previewBtn.title = 'Edit note';
          previewIcon.style.display = 'none';
          editIcon.style.display = 'block';
          state.isPreviewMode = true;
        } catch (error) {
          console.error('Error parsing markdown:', error);
          UI.showToast('Failed to render markdown preview', 'error');
        }
      }
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
      // Theme toggle
      elements.darkModeToggle.addEventListener('click', () => ThemeController.toggle());

      // Note management
      elements.newNoteBtn.addEventListener('click', () => {
        UI.showCreateNoteModal();
      });

      elements.noteSelector.addEventListener('change', async () => {
        const selectedNoteId = elements.noteSelector.value;
        if (selectedNoteId) {
          await NotesController.loadNote(selectedNoteId);
        }
      });

      elements.editTitleBtn.addEventListener('click', async () => {
        if (state.currentNoteId) {
          const notes = await Storage.getNotes();
          const currentNote = notes[state.currentNoteId];
          if (currentNote) {
            UI.showEditTitleModal(currentNote.title);
          }
        }
      });

      // Edit title modal handlers
      elements.saveEditBtn.addEventListener('click', async () => {
        const newTitle = elements.editNoteTitleInput.value.trim();
        if (newTitle && state.currentNoteId) {
          const success = await NotesController.updateNoteTitle(state.currentNoteId, newTitle);
          if (success) {
            UI.hideEditTitleModal();
          }
        }
      });

      elements.cancelEditBtn.addEventListener('click', () => {
        UI.hideEditTitleModal();
      });

      elements.editNoteTitleInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          elements.saveEditBtn.click();
        } else if (e.key === 'Escape') {
          UI.hideEditTitleModal();
        }
      });

      // Auto-save on input with debouncing
      elements.noteArea.addEventListener('input', () => {
        if (state.debounceTimeout) {
          clearTimeout(state.debounceTimeout);
        }
        state.debounceTimeout = setTimeout(async () => {
          await NotesController.saveNote();
        }, DEBOUNCE_DELAY);
      });

      // Manual save
      elements.saveBtn.addEventListener('click', async () => await NotesController.saveNote());

      // Delete confirmation modal
      elements.clearBtn.addEventListener('click', () => {
        if (state.currentNoteId) {
          elements.modal.style.display = 'block';
        }
      });

      elements.confirmYes.addEventListener('click', async () => {
        if (state.currentNoteId) {
          await NotesController.deleteNote(state.currentNoteId);
        }
        elements.modal.style.display = 'none';
      });

      elements.confirmNo.addEventListener('click', () => {
        elements.modal.style.display = 'none';
      });

      // Create note modal handlers
      elements.createNoteBtn.addEventListener('click', async () => {
        const title = elements.newNoteTitle.value.trim();
        if (title) {
          await NotesController.createNote(title);
          UI.hideCreateNoteModal();
        }
      });

      elements.cancelCreateBtn.addEventListener('click', () => {
        UI.hideCreateNoteModal();
      });

      elements.newNoteTitle.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          elements.createNoteBtn.click();
        } else if (e.key === 'Escape') {
          UI.hideCreateNoteModal();
        }
      });

      // Modal click-outside handlers
      window.addEventListener('click', (event) => {
        if (event.target === elements.modal) {
          elements.modal.style.display = 'none';
        }
        if (event.target === elements.createNoteModal) {
          UI.hideCreateNoteModal();
        }
        if (event.target === elements.editTitleModal) {
          UI.hideEditTitleModal();
        }
      });

      // Export functionality
      elements.exportBtn.addEventListener('click', () => UI.exportNote());

      // Preview toggle
      elements.previewBtn.addEventListener('click', () => UI.togglePreview());

      // Keyboard shortcuts
      document.addEventListener('keydown', async (e) => {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          await NotesController.saveNote();
        }
        // Ctrl/Cmd + N to create new note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
          e.preventDefault();
          UI.showCreateNoteModal();
        }
        // Escape to close modals
        if (e.key === 'Escape') {
          if (elements.modal.style.display === 'block') {
            elements.modal.style.display = 'none';
          }
          if (elements.createNoteModal.style.display === 'block') {
            UI.hideCreateNoteModal();
          }
          if (elements.editTitleModal.style.display === 'block') {
            UI.hideEditTitleModal();
          }
        }
      });
    }
  };

  /**
   * Initialize the application
   */
  const init = async () => {
    try {
      // Prevent double initialization
      if (state.isInitialized) {
        return;
      }
      state.isInitialized = true;

      await ThemeController.init();
      UI.setupEventListeners();
      await NotesController.loadNotesList();

      // Create a default note if none exist
      const notes = await Storage.getNotes();
      if (Object.keys(notes).length === 0) {
        await NotesController.createNote('Welcome to Quick Note!');
      }
    } catch (error) {
      console.error('Error initializing application:', error);
    }
  };

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (state.saveTimeout) clearTimeout(state.saveTimeout);
    if (state.debounceTimeout) clearTimeout(state.debounceTimeout);
  });

  // Start the application
  init();
});
