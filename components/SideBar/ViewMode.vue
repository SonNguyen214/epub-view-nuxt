<script setup>
import { watch, onMounted, computed } from "vue";
import { useGlobalStore } from "../../store/useGlobalStore.js";

const store = useGlobalStore(); // Access the store instance

const props = defineProps({
  rendition: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  isCoverPage: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["gotoFirstPage"]);

// Computed properties for active states
const viewModes = computed(() => [
  {
    label: "한 페이지",
    value: 1, // One-page mode
  },
  {
    label: "두 페이지",
    value: 2, // Two-page mode
  },
]);

onMounted(() => {
  store.loadViewMode();

  if (store.viewMode === undefined) {
    store.toggleViewMode(2);
  }
});

const toggleViewMode = (value) => {
  if (!props.rendition) return;

  if (store.viewMode === value) return;

  store.toggleViewMode(value);
  props.rendition.spread(
    props.isCoverPage ? "none" : value === 2 ? "auto" : "none"
  );
  props.rendition.resize("82vw", "100%");
  emit("gotoFirstPage");
};

// Watch for changes in view mode and update size
watch(
  () => store.viewMode,
  () => {
    if (props.rendition) {
      props.rendition.resize("82vw", "100%");
    }
  }
);
</script>

<template>
  <div class="flex gap-2">
    <!-- Iterate through viewModes to create a toggleable option -->
    <div
      v-for="mode in viewModes"
      :key="mode.value"
      @click="toggleViewMode(mode.value)"
      :class="[
        'text-[0.8vw] cursor-pointer transition-colors',
        store.viewMode === mode.value
          ? 'text-[#9FCDEE]'
          : 'hover:text-gray-300',
      ]"
    >
      {{ mode.label }}
    </div>
  </div>
</template>
