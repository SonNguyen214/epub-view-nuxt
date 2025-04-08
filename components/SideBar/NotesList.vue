<script setup>
import { ref, computed } from "vue";
import { useGlobalStore } from "~/store/useGlobalStore";

const props = defineProps({
  notes: {
    type: Array,
    default: () => [],
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
  rendition: {
    type: Object,
    default: null,
  },
  currentBookId: {
    type: String,
    required: true,
    default: "",
  },
});

const emit = defineEmits(["noteClick", "noteDeleted"]);

const store = useGlobalStore();

const handleNoteClick = async (note) => {
  try {
    if (props.rendition) {
      await props.rendition.display(note.cfi);
    }
    emit("noteClick", note);
  } catch (e) {
    alert("클릭한 노트의 페이지가 존재하지 않습니다.");
    console.error(e);
  }
};

const deleteNote = (event, note) => {
  event.stopPropagation(); // Prevent triggering the note click

  try {
    store.deleteNote(props.currentBookId, note);
    emit("noteDeleted", note);
  } catch (error) {
    console.error("Error deleting note:", error);
  }
};

// Function to truncate text to 10 characters
const truncateText = (text) => {
  if (!text) return "";
  return text.length > 10 ? text.slice(0, 10) + "..." : text;
};
</script>

<template>
  <div
    v-if="notes.length > 0"
    class="sub-content flex flex-col gap-2 w-full px-2"
    :class="[isExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden']"
  >
    <div
      v-for="note in notes"
      :key="note.cfi"
      @click="handleNoteClick(note)"
      class="w-full relative"
    >
      <div
        class="text-[0.8vw] cursor-pointer bg-[#7BB3E8] text-black p-2 rounded-lg max-w-[90%]"
      >
        <div class="font-normal flex justify-between items-start gap-2">
          <span class="flex-1 break-words">{{ note.text }}</span>
          <button
            @click="(e) => deleteNote(e, note)"
            class="ml-2 min-w-[16px] min-h-[16px] w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-red-500 text-white transition-colors text-xs leading-none"
          >
            ×
          </button>
        </div>
        <div class="text-[0.7vw] text-gray-600 break-words">
          {{ note.note }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-content {
  max-height: 300px;
  overflow-y: auto;
}
</style>
