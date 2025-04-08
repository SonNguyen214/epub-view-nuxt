<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  rendition: Object,
  bookId: String,
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  step: { type: Number, default: 1 },
  unit: { type: String, default: "" }, // Unit (e.g., 'px' for font size, '' for line-height)
  themeProperty: { type: String, required: true }, // CSS property to apply ('font-size' or 'line-height')
  value: { type: Number, required: true }, // Current value for the setting
});

const emit = defineEmits(["update:value"]);

// Apply the setting value to EPUB
const applySetting = () => {
  if (props.rendition) {
    props.rendition.themes.override(
      props.themeProperty,
      `${props.value}${props.unit}`
    );
  }
};

// Watch for value changes and apply them
watch(() => props.value, applySetting);

// Apply setting on component mount
onMounted(() => {
  applySetting();
});

// Handle slider value changes
const handleSliderChange = (event) => {
  emit("update:value", Number(event.target.value));
};
</script>

<template>
  <div class="setting-slider">
    <input
      type="range"
      :value="value"
      @input="handleSliderChange"
      :min="min"
      :max="max"
      :step="step"
      class="w-full mt-2 cursor-pointer"
    />
  </div>
</template>

<style scoped>
.setting-slider input[type="range"] {
  -webkit-appearance: none;
  height: 4px;
  background: #ccc;
  border-radius: 5px;
  outline: none;
}
.setting-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}
</style>
