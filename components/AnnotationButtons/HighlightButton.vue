<script setup>
import { addHighlight } from "~/utils/annotations";

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
  "save-highlights",
]);

const handleHighlight = () => {
  if (props.rendition && props.currentCfiRange) {
    try {
      const success = addHighlight(
        props.rendition,
        props.currentCfiRange,
        (e) => {
          // console.log('highlight clicked', e.target);
        }
      );

      if (success) {
        // Save highlight information
        const newHighlights = [
          ...props.highlights,
          {
            cfi: props.currentCfiRange,
            text: props.currentSelection.toString().trim(),
          },
        ];
        emit("update:highlights", newHighlights);
        emit("save-highlights");

        // Clear selection
        if (props.currentSelection) {
          props.currentSelection.removeAllRanges();
        }
        emit("update:show-button", false);
        emit("update:current-selection", null);
        emit("update:current-cfi-range", null);
      }
    } catch (error) {
      console.error("Error adding highlight:", error);
    }
  }
};
</script>

<template>
  <button
    @click="handleHighlight"
    class="flex items-center gap-2 px-4 py-2 text-[0.7vw] font-medium text-white bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 rounded-lg shadow-md transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105 active:scale-95"
  >
    <i class="pi pi-highlighter"></i>
    Highlight
  </button>
</template>
