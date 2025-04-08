<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  loadAnnotations,
  saveAnnotations,
  setupHighlightTheme,
  initializeAnnotations,
  isTextHighlighted,
} from "~/utils/annotations";
import NoteDialog from "../NoteDialog.vue";
import HighlightButton from "./HighlightButton.vue";
import RemoveButton from "./RemoveButton.vue";
import NoteButton from "./NoteButton.vue";
import { useGlobalStore } from "~/store/useGlobalStore";

const props = defineProps({
  rendition: {
    type: Object,
    required: true,
  },
  bookId: {
    type: String,
    required: true,
  },
});

const showButton = ref(false);
const buttonPosition = ref({ x: 0, y: 0 });
const currentSelection = ref(null);
const iframe = ref(null);
const currentCfiRange = ref(null);
const highlights = ref([]);
const notes = ref([]);
const showNoteDialog = ref(false);
const noteText = ref("");
const isHighlighted = ref(false);
const store = useGlobalStore();

// Load highlights and notes from localStorage
const loadHighlights = () => {
  const result = loadAnnotations(props.bookId);
  highlights.value = result.highlights;
  notes.value = result.notes;
};

// Save highlights and notes to localStorage
const saveHighlights = () => {
  saveAnnotations(props.bookId, highlights.value, notes.value);
};

const saveNote = () => {
  if (props.rendition && currentCfiRange.value && noteText.value.trim()) {
    try {
      // Add new note
      const newNote = {
        cfi: currentCfiRange.value,
        text: currentSelection.value.toString().trim(),
        note: noteText.value.trim(),
      };

      // Add note to store
      store.addNote(props.bookId, newNote);

      // Clear selection and close dialog
      if (currentSelection.value) {
        currentSelection.value.removeAllRanges();
      }
      showButton.value = false;
      showNoteDialog.value = false;
      noteText.value = "";
      currentSelection.value = null;
      currentCfiRange.value = null;
    } catch (error) {
      console.error("Error saving note:", error);
    }
  }
};

const cancelNote = () => {
  showNoteDialog.value = false;
  noteText.value = "";
};

const handleSelection = async (cfiRange, contents) => {
  if (!contents) return;

  const selection = contents.window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (selectedText.length > 0) {
      const rect = range.getBoundingClientRect();
      const iframe = document.querySelector("#area iframe");

      if (iframe) {
        const iframeRect = iframe.getBoundingClientRect();
        buttonPosition.value = {
          x: rect.right + iframeRect.left,
          y: rect.bottom + iframeRect.top,
          width: rect.width,
          height: rect.height,
        };
        currentSelection.value = selection;
        currentCfiRange.value = cfiRange;

        // Check and initialize annotations if needed
        if (!props.rendition?.annotations) {
          initializeAnnotations(props.rendition);
        }

        // Ensure annotations are initialized
        if (props.rendition?.annotations) {
          try {
            const isHighlightedResult = isTextHighlighted(
              props.rendition,
              cfiRange,
              props.bookId
            );
            isHighlighted.value = isHighlightedResult;
          } catch (error) {
            isHighlighted.value = false;
          }
        } else {
          isHighlighted.value = false;
        }

        showButton.value = true;
      }
    } else {
      showButton.value = false;
    }
  } else {
    showButton.value = false;
  }
};

const handleClickOutside = (event) => {
  if (!event.target.closest(".annotation-button")) {
    showButton.value = false;
  }
};

const setupIframe = () => {
  if (props.rendition) {
    // Set up highlight theme
    setupHighlightTheme(props.rendition);

    // Initialize annotations
    initializeAnnotations(props.rendition);

    // Set up selected event
    props.rendition.on("selected", (cfiRange, contents) => {
      handleSelection(cfiRange, contents);
    });

    props.rendition.on("unselected", () => {
      showButton.value = false;
      currentSelection.value = null;
      currentCfiRange.value = null;
    });

    // Set up mouseup event to catch selection
    props.rendition.on("mouseup", (event) => {
      if (currentCfiRange.value) {
        const selection = iframe.value?.contentWindow?.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedText = range.toString().trim();
          if (selectedText.length > 0) {
            showButton.value = true;
          } else {
            showButton.value = false;
          }
        }
      }
    });

    props.rendition.on("mousedown", () => {
      showButton.value = false;
    });

    // Handle page rendering
    props.rendition.on("rendered", (section) => {
      iframe.value = document.querySelector("iframe");
    });

    document.addEventListener("click", handleClickOutside);
  }
};

// Watch for rendition changes
watch(
  () => props.rendition,
  (newRendition) => {
    if (newRendition) {
      setupIframe();
      loadHighlights();
    }
  },
  { immediate: true }
);

// Watch for bookId changes to reload highlights
watch(
  () => props.bookId,
  (newBookId) => {
    if (newBookId) {
      loadHighlights();
    }
  },
  { immediate: true }
);

onMounted(() => {
  setupIframe();
  loadHighlights();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  if (props.rendition) {
    // Safely remove event listeners
    const events = [
      "selected",
      "unselected",
      "mouseup",
      "mousedown",
      "rendered",
    ];
    events.forEach((event) => {
      if (props.rendition && typeof props.rendition.off === "function") {
        // props.rendition.off(event);
      }
    });

    // Remove click event listener
    document.removeEventListener("click", handleClickOutside);
  }
});
</script>

<template>
  <div>
    <div
      v-if="showButton"
      class="fixed z-50 bg-white rounded-lg shadow-lg p-2 annotation-button"
      :style="{
        left: `${buttonPosition.x}px`,
        top: `${buttonPosition.y + 10}px`,
        transform: 'translateX(-50%)',
      }"
    >
      <div class="flex gap-2">
        <HighlightButton
          v-if="!isHighlighted"
          :rendition="rendition"
          :current-cfi-range="currentCfiRange"
          :current-selection="currentSelection"
          :highlights="highlights"
          :book-id="bookId"
          @update:highlights="highlights = $event"
          @update:show-button="showButton = $event"
          @update:current-selection="currentSelection = $event"
          @update:current-cfi-range="currentCfiRange = $event"
          @save-highlights="saveHighlights"
        />
        <RemoveButton
          v-else
          :rendition="rendition"
          :current-cfi-range="currentCfiRange"
          :current-selection="currentSelection"
          :highlights="highlights"
          :book-id="bookId"
          @update:highlights="highlights = $event"
          @update:show-button="showButton = $event"
          @update:current-selection="currentSelection = $event"
          @update:current-cfi-range="currentCfiRange = $event"
          @update:is-highlighted="isHighlighted = $event"
          @save-highlights="saveHighlights"
        />
        <NoteButton @update:show-note-dialog="showNoteDialog = $event" />
      </div>
    </div>

    <!-- Note Dialog -->
    <NoteDialog
      v-model:show="showNoteDialog"
      v-model:noteText="noteText"
      @save="saveNote"
      @cancel="cancelNote"
    />
  </div>
</template>

<style scoped>
.annotation-button {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
