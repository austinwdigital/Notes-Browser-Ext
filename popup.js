document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const elements = {
    noteArea: document.getElementById("note"),
    darkModeToggle: document.getElementById("darkModeToggle"),
    app: document.getElementById("app"),
    clearBtn: document.getElementById("clearBtn"),
    exportBtn: document.getElementById("exportBtn"),
    modal: document.getElementById("confirmModal"),
    confirmYes: document.getElementById("confirmYes"),
    confirmNo: document.getElementById("confirmNo"),
    saveBtn: document.getElementById("saveBtn"),
    saveStatus: document.querySelector(".save-status"),
    noteSelector: document.getElementById("noteSelector"),
    newNoteBtn: document.getElementById("newNoteBtn"),
    editTitleBtn: document.getElementById("editTitleBtn"),
    createNoteModal: document.getElementById("createNoteModal"),
    newNoteTitle: document.getElementById("newNoteTitle"),
    createNoteBtn: document.getElementById("createNoteBtn"),
    cancelCreateBtn: document.getElementById("cancelCreateBtn"),
    editTitleModal: document.getElementById("editTitleModal"),
    editNoteTitleInput: document.getElementById("editNoteTitleInput"),
    saveEditBtn: document.getElementById("saveEditBtn"),
    cancelEditBtn: document.getElementById("cancelEditBtn")
  };

  let state = {
    currentNoteId: null,
    saveTimeout: null,
    debounceTimeout: null
  };

  // Storage Controller
  const Storage = {
    get: key => JSON.parse(localStorage.getItem(key)) || {},
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    remove: key => localStorage.removeItem(key),

    getNotes: () => Storage.get('quickNotes'),
    setNotes: notes => Storage.set('quickNotes', notes),
    getLastNoteId: () => localStorage.getItem('lastNoteId'),
    setLastNoteId: id => localStorage.setItem('lastNoteId', id)
  };

  // Theme Controller
  const ThemeController = {
    init() {
      const savedTheme = localStorage.getItem("darkMode");
      if (savedTheme === "enabled") this.enable();
    },

    enable() {
      document.body.classList.add("dark");
      elements.app.classList.add("dark");
      elements.noteArea.classList.add("dark");
      elements.darkModeToggle.classList.add("dark");
    },

    disable() {
      document.body.classList.remove("dark");
      elements.app.classList.remove("dark");
      elements.noteArea.classList.remove("dark");
      elements.darkModeToggle.classList.remove("dark");
    },

    toggle() {
      const isDark = document.body.classList.contains("dark");
      if (isDark) {
        this.disable();
        localStorage.setItem("darkMode", "disabled");
      } else {
        this.enable();
        localStorage.setItem("darkMode", "enabled");
      }
    }
  };

  // Notes Controller
  const NotesController = {
    async createNote(title = "New Note") {
      try {
        if (!title) return;

        const noteId = `note_${Date.now()}`;
        const notes = Storage.getNotes();

        notes[noteId] = {
          title,
          content: "",
          lastModified: Date.now()
        };

        Storage.setNotes(notes);
        await this.loadNotesList();
        this.loadNote(noteId);
        return noteId;
      } catch (error) {
        console.error('Error creating note:', error);
      }
    },

    async loadNote(noteId) {
      try {
        const notes = Storage.getNotes();
        if (notes[noteId]) {
          state.currentNoteId = noteId;
          elements.noteArea.value = notes[noteId].content;
          Storage.setLastNoteId(noteId);
          elements.noteSelector.value = noteId;
        }
      } catch (error) {
        console.error('Error loading note:', error);
      }
    },

    async saveNote() {
      try {
        if (!state.currentNoteId) return;

        const notes = Storage.getNotes();
        const currentNote = notes[state.currentNoteId];

        if (currentNote) {
          notes[state.currentNoteId] = {
            ...currentNote,
            content: elements.noteArea.value,
            lastModified: Date.now()
          };

          Storage.setNotes(notes);
          UI.showSaveStatus();
        }
      } catch (error) {
        console.error('Error saving note:', error);
      }
    },

    async deleteNote(noteId) {
      try {
        const notes = Storage.getNotes();
        delete notes[noteId];
        Storage.setNotes(notes);

        if (Object.keys(notes).length === 0) {
          await this.createNote();
        } else {
          await this.loadNotesList();
          this.loadNote(Object.keys(notes)[0]);
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    },

    async editNoteTitle(noteId) {
      try {
        const notes = Storage.getNotes();
        const note = notes[noteId];
        const newTitle = prompt("Enter new title:", note.title);

        if (newTitle && newTitle !== note.title) {
          notes[noteId].title = newTitle;
          Storage.setNotes(notes);
          await this.loadNotesList();
          elements.noteSelector.value = noteId;
        }
      } catch (error) {
        console.error('Error editing note title:', error);
      }
    },

    async loadNotesList() {
      try {
        const notes = Storage.getNotes();
        elements.noteSelector.innerHTML = '<option value="" disabled>Select a note...</option>';

        const sortedNotes = Object.entries(notes)
          .sort(([, a], [, b]) => b.lastModified - a.lastModified);

        sortedNotes.forEach(([id, note]) => {
          const option = document.createElement("option");
          option.value = id;
          option.textContent = note.title;
          elements.noteSelector.appendChild(option);
        });

        const lastNoteId = Storage.getLastNoteId();
        if (lastNoteId && notes[lastNoteId]) {
          this.loadNote(lastNoteId);
        }
      } catch (error) {
        console.error('Error loading notes list:', error);
      }
    }
  };

  // UI Controller
  const UI = {
    showSaveStatus() {
      elements.saveStatus.classList.add("visible");
      if (state.saveTimeout) clearTimeout(state.saveTimeout);
      state.saveTimeout = setTimeout(() => {
        elements.saveStatus.classList.remove("visible");
      }, 2000);
    },

    async exportNote() {
      try {
        const blob = new Blob([elements.noteArea.value], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "quick-note.txt";
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting note:', error);
      }
    },

    showCreateNoteModal() {
      elements.createNoteModal.style.display = "block";
      elements.newNoteTitle.value = "New Note";
      elements.newNoteTitle.select();
    },

    hideCreateNoteModal() {
      elements.createNoteModal.style.display = "none";
      elements.newNoteTitle.value = "";
    },

    showEditTitleModal(currentTitle) {
      elements.editTitleModal.style.display = "block";
      elements.editNoteTitleInput.value = currentTitle;
      elements.editNoteTitleInput.select();
    },

    hideEditTitleModal() {
      elements.editTitleModal.style.display = "none";
      elements.editNoteTitleInput.value = "";
    },

    setupEventListeners() {
      // Theme toggle
      elements.darkModeToggle.addEventListener("click", () => ThemeController.toggle());

      // Notes management
      elements.newNoteBtn.addEventListener("click", () => {
        UI.showCreateNoteModal();
      });

      elements.noteSelector.addEventListener("change", () =>
        NotesController.loadNote(elements.noteSelector.value));

      elements.editTitleBtn.addEventListener("click", () => {
        if (state.currentNoteId) {
          const notes = Storage.getNotes();
          const currentNote = notes[state.currentNoteId];
          UI.showEditTitleModal(currentNote.title);
        }
      });

      elements.saveEditBtn.addEventListener("click", async () => {
        const newTitle = elements.editNoteTitleInput.value.trim();
        if (newTitle && state.currentNoteId) {
          const notes = Storage.getNotes();
          notes[state.currentNoteId].title = newTitle;
          Storage.setNotes(notes);
          await NotesController.loadNotesList();
          elements.noteSelector.value = state.currentNoteId;
          UI.hideEditTitleModal();
        }
      });

      elements.cancelEditBtn.addEventListener("click", () => {
        UI.hideEditTitleModal();
      });

      elements.editNoteTitleInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          elements.saveEditBtn.click();
        } else if (e.key === "Escape") {
          UI.hideEditTitleModal();
        }
      });

      // Save functionality
      elements.noteArea.addEventListener("input", () => {
        if (state.debounceTimeout) clearTimeout(state.debounceTimeout);
        state.debounceTimeout = setTimeout(() => NotesController.saveNote(), 500);
      });

      elements.saveBtn.addEventListener("click", () => NotesController.saveNote());

      // Modal handling
      elements.clearBtn.addEventListener("click", () => elements.modal.style.display = "block");
      elements.confirmYes.addEventListener("click", async () => {
        if (state.currentNoteId) {
          await NotesController.deleteNote(state.currentNoteId);
        }
        elements.modal.style.display = "none";
      });
      elements.confirmNo.addEventListener("click", () => elements.modal.style.display = "none");

      elements.createNoteBtn.addEventListener("click", async () => {
        const title = elements.newNoteTitle.value.trim();
        if (title) {
          await NotesController.createNote(title);
          UI.hideCreateNoteModal();
        }
      });

      elements.cancelCreateBtn.addEventListener("click", () => {
        UI.hideCreateNoteModal();
      });

      elements.newNoteTitle.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          elements.createNoteBtn.click();
        } else if (e.key === "Escape") {
          UI.hideCreateNoteModal();
        }
      });

      // Add to modal click-outside handler
      window.addEventListener("click", (event) => {
        if (event.target === elements.modal) {
          elements.modal.style.display = "none";
        }
        if (event.target === elements.createNoteModal) {
          UI.hideCreateNoteModal();
        }
        if (event.target === elements.editTitleModal) {
          UI.hideEditTitleModal();
        }
      });

      // Export
      elements.exportBtn.addEventListener("click", () => UI.exportNote());
    }
  };

  // Initialize
  const init = async () => {
    ThemeController.init();
    UI.setupEventListeners();
    await NotesController.loadNotesList();
    if (!state.currentNoteId) {
      await NotesController.createNote();
    }
  };

  init();
});
