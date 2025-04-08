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
  () => globalStore.lineSpacing,
  async (newValue) => {
    if (props.rendition && newValue !== null) {
      props.rendition.themes.override("line-height", `${newValue}rem`);
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
  globalStore.updateLineSpacing(value);
};
</script>

<template>
  <EpubSettingSlider
    :rendition="rendition"
    :bookId="bookId"
    :min="1"
    :max="3"
    :step="0.1"
    unit="rem"
    themeProperty="line-height"
    :value="globalStore.lineSpacing"
    @update:value="handleSliderChange"
  />
</template>
