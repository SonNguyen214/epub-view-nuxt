<script setup>
import EpubView from "~/components/EpubView.vue";
import Loading from "~/components/Loading.vue";
import { useLoadingStore } from "~/store/useLoadingStore";
import { useGlobalStore } from "~/store/useGlobalStore";
import {
  loadAnnotations,
  setupHighlightTheme,
  restoreAllHighlights,
} from "~/utils/annotations";
import { useBookMarks } from "~/composables/useBookmarks";
import AnnotationContainer from "~/components/AnnotationButtons/AnnotationContainer.vue";

// Define reactive references
const renditionBook = ref(); // Stores the EPUB.js rendition instance
const bookEpub = ref(); // Stores the EPUB.js book instance
const metadata = ref(); // Stores book metadata
const currentBookId = ref(); // Stores the current book's identifier
const currentPercentage = ref(); // Stores the current reading progress percentage
const loading = useLoadingStore(); // Loading state management
const globalStore = useGlobalStore(); // Global store instance

const { bookmarks, addBookMark, removeBookmark, gotoBookMark } = useBookMarks();

// Set last read position when the page is unloaded or refreshed
onMounted(() => {
  window.addEventListener("beforeunload", onCancelReader);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", onCancelReader);
});

// Navigate to the last read position
const gotoLastRead = () => {
  const storedLastRead = JSON.parse(localStorage.getItem("lastRead") || "{}");
  const savedCfi = storedLastRead[currentBookId.value];

  if (savedCfi && renditionBook.value) {
    renditionBook.value.display(savedCfi);
  } else {
    alert("No previous reading position found!");
  }
};

// Handle EPUB file upload
const handleUpload = async (event) => {
  const file = event.files[0];
  loading.setLoading(true);
  onCancelReader(); // Reset the reader before loading a new book

  if (file) {
    const ePub = (await import("epubjs")).default;
    try {
      const book = ePub(file);
      await nextTick();

      // Reset reader settings
      globalStore.resetReaderSettings();

      // Set view mode to 2 (double page) when loading a new book
      globalStore.toggleViewMode(2);

      // Render the EPUB book
      const rendition = book.renderTo("area", {
        width: "82vw",
        height: "100%",
        ignoreClass: "annotator-hl",
        manager: "default",
        allowScriptedContent: true,
        flow: "paginated",
        spread: "auto",
        minSpreadWidth: 720,
        resizeOnOrientationChange: true,
      });

      // Setup highlight theme
      setupHighlightTheme(rendition);

      // Update reactive variables
      renditionBook.value = rendition;
      bookEpub.value = book;
      currentBookId.value = file.name;

      // Load annotations for this book
      const annotations = loadAnnotations(file.name);

      // If no annotations found, try to find similar filename
      if (
        annotations.highlights.length === 0 &&
        annotations.notes.length === 0
      ) {
        // Get the base name without extension
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const savedAnnotations = JSON.parse(
          localStorage.getItem("epubAnnotations") || "{}"
        );

        const similarKey = Object.keys(savedAnnotations).find(
          (key) => key.includes(baseName) || baseName.includes(key)
        );

        if (similarKey) {
          // Use annotations from the similar file
          annotations.highlights =
            savedAnnotations[similarKey].highlights || [];
          annotations.notes = savedAnnotations[similarKey].notes || [];
        }
      }

      // Display the book and set up everything
      await rendition.display();
      await book.ready;
      await book.locations.generate(1000);

      // Load metadata
      const meta = await book.loaded.metadata;
      metadata.value = meta;

      // Restore all highlights
      if (annotations.highlights && annotations.highlights.length > 0) {
        await restoreAllHighlights(rendition, annotations.highlights);
      }

      // Track reading progress
      rendition.on("relocated", (location) => {
        currentPercentage.value = rendition.book.locations.percentageFromCfi(
          location.start.cfi
        );
      });

      loading.setLoading(false);
    } catch (error) {
      console.error("Error loading book:", error);
      loading.setLoading(false);
    }
  }
};

// Navigate to the first page
const goToFirstPage = () => {
  if (renditionBook.value) {
    renditionBook.value.display(0);
  }
};

// Save the last read position and reset the reader
const onCancelReader = () => {
  if (renditionBook.value && currentBookId.value) {
    const location = renditionBook.value.currentLocation();
    if (location) {
      const cfi = location.start.cfi;
      const lastReadData = JSON.parse(localStorage.getItem("lastRead") || "{}");

      lastReadData[currentBookId.value] = cfi;
      localStorage.setItem("lastRead", JSON.stringify(lastReadData));
    }
  }

  // Reset reader state
  renditionBook.value = null;
  bookEpub.value = null;
  currentBookId.value = null;

  // Clear the rendering area
  const area = document.getElementById("area");
  if (area) area.innerHTML = "";
};

// Computed property to check if the current page is bookmarked
const isCurrentPageBookmarked = computed(() => {
  if (
    !currentBookId.value ||
    !bookmarks.value[currentBookId.value] ||
    currentPercentage.value === null
  ) {
    return false;
  }
  return bookmarks.value[currentBookId.value].some((bookmark) => {
    // Compare with a 0.1% margin of error
    return Math.abs(bookmark.percentage - currentPercentage.value) < 0.001;
  });
});

// Toggle bookmark status for the current page
const switchBookmarked = () => {
  if (isCurrentPageBookmarked.value) {
    const currentCfi = renditionBook.value.currentLocation().start.cfi;
    const currentPercentage =
      renditionBook.value.book.locations.percentageFromCfi(currentCfi);
    removeBookmark(currentPercentage, currentBookId.value, bookmarks);
  } else {
    addBookMark(renditionBook.value, currentBookId.value, bookmarks);
  }
};
</script>

<template>
  <div v-if="loading.loading">
    <Loading />
  </div>
  <div class="flex gap-5">
    <!-- Button to go to the last read position -->
    <div
      v-if="!!renditionBook"
      class="absolute bottom-10 right-10 z-10 cursor-pointer text-red-400"
      @click="gotoLastRead"
    >
      Go to Last Read >>
    </div>

    <!-- Sidebar component -->
    <SideBarView
      :rendition="renditionBook"
      @handle-upload="handleUpload"
      :bookmarks="bookmarks"
      :current-book-id="currentBookId"
      @switchBookmarked="switchBookmarked"
      @gotoFirstPage="goToFirstPage"
      @gotoBookmark="gotoBookMark"
      @removeBookmark="removeBookmark"
      :book-epub="bookEpub"
    />

    <!-- EPUB View component -->
    <EpubView
      :rendition="renditionBook"
      :metadata="metadata"
      @handle-remove="onCancelReader"
      :is-bookmarked="isCurrentPageBookmarked"
      @switchBookmarked="switchBookmarked"
      :bookId="currentBookId"
    />
    <!-- button component -->
    <AnnotationContainer
      v-if="renditionBook"
      :rendition="renditionBook"
      :book-id="currentBookId"
    />
  </div>
</template>
