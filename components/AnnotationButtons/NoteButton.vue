<script setup>
const emit = defineEmits(["update:showNoteDialog"]);

const handleNote = () => {
  emit("update:showNoteDialog", true);
};
</script>

<template>
  <button
    @click="handleNote"
    class="flex items-center gap-2 px-4 py-2 text-[0.7vw] font-medium text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-lg shadow-md transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-105 active:scale-95"
  >
    <i class="pi pi-pencil"></i>
    Note
  </button>
</template>
