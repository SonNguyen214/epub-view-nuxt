<script setup>
const emit = defineEmits(["handelUpload"]);

const handleFileUpload = (event) => {
  emit("handelUpload", event);
};
</script>

<template>
  <FileUpload
    mode="basic"
    @select="handleFileUpload"
    customUpload
    accept=".epub"
    auto
    severity="secondary"
    class="absolute inset-0 opacity-0 cursor-pointer"
  />
</template>
