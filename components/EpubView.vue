<script setup>
// import HighlightButton from "./HighlightButton.vue";

// Define component props
const props = defineProps({
  rendition: Object, // EPUB.js rendition instance
  metadata: Object, // Book metadata (title, author, etc.)
  isBookmarked: Boolean, // Indicates if the current page is bookmarked
  bookId: String, // Unique identifier for the book
});

const emit = defineEmits(["handleRemove", "switchBookmarked"]);

// Navigate to the next page
const handleNextPage = () => {
  props.rendition.next();
};

// Navigate to the previous page
const handlePrevPage = () => {
  props.rendition.prev();
};
</script>

<template>
  <div class="relative w-full px-10 h-dvh py-5">
    <!-- Header Section -->
    <div class="flex justify-between h-fit items-center">
      <!-- Book title with removable chip -->
      <Chip
        class="px-4 py-1"
        v-if="rendition"
        :label="metadata?.title"
        removable
        @remove="$emit('handleRemove')"
      />
      <div></div>
    </div>

    <!-- Bookmark toggle button -->
    <div
      class="fixed top-[5vw] select-none w-10 h-10 rounded-full bg-transparent right-[17vw] border duration-300 cursor-pointer z-[13]"
      @click="$emit('switchBookmarked')"
      :class="{ '!bg-yellow-400': isBookmarked }"
      v-if="!!rendition"
    >
      <img
        src="/pin.ico"
        alt="Bookmark Icon"
        class="absolute top-[-15px] right-[-10px]"
      />
    </div>

    <!-- Navigation arrows -->
    <div v-if="!!rendition">
      <i
        @click="handlePrevPage"
        class="pi z-10 pi-icon cursor-pointer text-4xl text-gray-500 pi-chevron-left absolute top-1/2 -translate-y-1/2 left-10"
      ></i>

      <i
        @click="handleNextPage"
        class="pi z-10 pi-icon cursor-pointer text-4xl text-gray-500 pi-chevron-right absolute top-1/2 -translate-y-1/2 right-10"
      ></i>
    </div>

    <!-- EPUB rendering area -->
    <div
      id="area"
      class="area flex py-[3%] px-[18%] w-full h-full justify-center items-center relative duration-200"
    ></div>

    <!-- <HighlightButton v-if="rendition" :rendition="rendition" :bookId="bookId" /> -->
  </div>
</template>
