<template>
  <div
    class="loader__wrap"
    role="alertdialog"
    aria-busy="true"
    aria-live="polite"
    aria-label="Loading…"
  >
    <div class="loader" aria-hidden="true">
      <div class="loader__sq"></div>
      <div class="loader__sq"></div>
    </div>
  </div>
</template>

<script setup>
import "./assets/loading.css";
</script>

<style>
</style>
