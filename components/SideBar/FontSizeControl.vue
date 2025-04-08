<script setup>
import { watch } from "vue";
import EpubSettingSlider from "@/components/EpubSettingSlider.vue";
import { useGlobalStore } from "~/store/useGlobalStore.js";
import {
  updateHighlightsAfterStyleChange,
  loadAnnotations,
} from "~/utils/annotations";

const props = defineProps({
  rendition: Object,
  bookId: String,
});

const globalStore = useGlobalStore();

// Watch for changes and apply them directly
watch(
  () => globalStore.fontSize,
  async (newValue) => {
    if (props.rendition && newValue !== null) {
      props.rendition.themes.fontSize(`${newValue}px`);
      // Get current highlights and update them
      const annotations = loadAnnotations(props.bookId);
      await updateHighlightsAfterStyleChange(
        props.rendition,
        annotations.highlights
      );
    }
  },
  { immediate: true }
);

// Handle slider value changes
const handleSliderChange = (value) => {
  globalStore.updateFontSize(value);
};
</script>

<template>
  <EpubSettingSlider
    :rendition="rendition"
    :bookId="bookId"
    :min="10"
    :max="30"
    :step="1"
    unit="px"
    themeProperty="font-size"
    :value="globalStore.fontSize"
    @update:value="handleSliderChange"
  />
</template>
