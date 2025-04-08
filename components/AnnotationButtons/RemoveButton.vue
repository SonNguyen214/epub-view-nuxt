<script setup>
import { removeHighlight } from "~/utils/annotations";

const props = defineProps({
  rendition: {
    type: Object,
    required: true,
  },
  currentCfiRange: {
    type: String,
    required: true,
  },
  currentSelection: {
    type: Object,
    required: true,
  },
  highlights: {
    type: Array,
    required: true,
  },
  bookId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits([
  "update:highlights",
  "update:show-button",
  "update:current-selection",
  "update:current-cfi-range",
  "update:is-highlighted",
  "save-highlights",
]);

const handleRemoveHighlight = () => {
  if (props.rendition && props.currentCfiRange) {
    try {
      const success = removeHighlight(
        props.rendition,
        props.currentCfiRange,
        props.bookId
      );

      if (success) {
        // Update local highlights array
        const newHighlights = props.highlights.filter((highlight) => {
          if (!highlight.text) return true;
          return (
            highlight.text.trim() !== props.currentSelection.toString().trim()
          );
        });
        emit("update:highlights", newHighlights);
        emit("save-highlights");

        // Clear selection
        if (props.currentSelection) {
          props.currentSelection.removeAllRanges();
        }
        emit("update:show-button", false);
        emit("update:current-selection", null);
        emit("update:current-cfi-range", null);
        emit("update:is-highlighted", false);
      }
    } catch (error) {
      console.error("Error removing highlight:", error);
    }
  }
};
</script>

<template>
  <button
    @click="handleRemoveHighlight"
    class="flex items-center gap-2 px-4 py-2 text-[0.7vw] font-medium text-white bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 rounded-lg shadow-md transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105 active:scale-95"
  >
    <i class="pi pi-times"></i>
    Remove
  </button>
</template>
