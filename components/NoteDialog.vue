<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  noteText: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:noteText", "save", "cancel"]);

const updateNoteText = (event) => {
  emit("update:noteText", event.target.value);
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-[500px]">
      <h3 class="text-sm font-semibold mb-4">Add Note</h3>
      <textarea
        :value="noteText"
        @input="updateNoteText"
        class="w-full h-20 p-2 border text-xs rounded-lg mb-4"
        placeholder="Enter your note here..."
      ></textarea>
      <div class="flex justify-end gap-2 text-xs">
        <button
          @click="emit('cancel')"
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          @click="emit('save')"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>
