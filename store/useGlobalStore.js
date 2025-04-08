import { defineStore } from "pinia";
import { ref } from "vue";
import { loadAnnotations, saveAnnotations } from "~/utils/annotations";

export const useGlobalStore = defineStore("global", () => {
  // Reader Settings
  const fontSize = useState("fontSize", () => null);
  const lineSpacing = useState("lineSpacing", () => null);

  // View Mode Settings
  const viewMode = useState("viewMode", () => 2);

  const notes = ref([]);

  // Reader Settings Functions
  function updateFontSize(size) {
    fontSize.value = size;
  }

  function updateLineSpacing(spacing) {
    lineSpacing.value = spacing;
  }

  function resetReaderSettings() {
    fontSize.value = null;
    lineSpacing.value = null;
  }

  // View Mode Functions
  function toggleViewMode(value) {
    viewMode.value = value;
    localStorage.setItem("viewMode", JSON.stringify(viewMode.value));
  }

  function loadViewMode() {
    const savedViewMode = localStorage.getItem("viewMode");
    if (savedViewMode !== null) {
      viewMode.value = JSON.parse(savedViewMode);
    }
  }

  const loadNotes = (bookId) => {
    if (bookId) {
      const result = loadAnnotations(bookId);
      notes.value = result.notes;
    }
  };

  const addNote = (bookId, newNote) => {
    notes.value = [...notes.value, newNote];
    // Get current highlights from localStorage
    const result = loadAnnotations(bookId);
    saveAnnotations(bookId, result.highlights, notes.value);
  };

  const deleteNote = (bookId, noteToDelete) => {
    notes.value = notes.value.filter((note) => note.cfi !== noteToDelete.cfi);
    // Get current highlights from localStorage
    const result = loadAnnotations(bookId);
    saveAnnotations(bookId, result.highlights, notes.value);
  };

  const updateNotes = (bookId, newNotes) => {
    notes.value = newNotes;
    // Get current highlights from localStorage
    const result = loadAnnotations(bookId);
    saveAnnotations(bookId, result.highlights, notes.value);
  };

  return {
    // Reader Settings
    fontSize,
    lineSpacing,
    updateFontSize,
    updateLineSpacing,
    resetReaderSettings,

    // View Mode
    viewMode,
    toggleViewMode,
    loadViewMode,

    notes,
    loadNotes,
    addNote,
    deleteNote,
    updateNotes,
  };
});
