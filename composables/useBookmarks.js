export const useBookMarks = () => {
  const bookmarks = ref({});

  onMounted(() => {
    const bookmarkStore = JSON.parse(localStorage.getItem("bookmarks" || "{}"));
    if (bookmarkStore) {
      bookmarks.value = bookmarkStore;
    }
  });

  const addBookMark = (rendition, currentBookId) => {
    // Ensure rendition and book ID are available
    if (rendition && currentBookId) {
      // Get the current reading position in CFI format
      const currentCfi = rendition.currentLocation().start.cfi;

      // Convert CFI position to a percentage of the book's progress
      const percentage = rendition.book.locations.percentageFromCfi(currentCfi);

      // Format the current date as YYYY.MM.DD
      const date = new Date();
      const formattedDate = `${date.getFullYear()}.${
        date.getMonth() + 1
      }.${date.getDate()}`;

      // Create a new bookmark object
      const bookmark = {
        percentage: percentage,
        date: formattedDate,
      };

      // Check if the bookmark already exists (avoid duplicates)
      const isDuplicate = bookmarks.value[currentBookId]?.some(
        (bm) => Math?.abs(bm.percentage - percentage) < 0.001
      );

      if (isDuplicate) {
        return bookmarks.value;
      }

      // Update the bookmarks state
      bookmarks.value = {
        ...bookmarks.value,
        [currentBookId]: [...(bookmarks.value[currentBookId] || []), bookmark],
      };

      // Save bookmarks to localStorage
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks.value));
    }
  };

  const removeBookmark = (cfiToRemove, currentBookId) => {
    // Ensure a book ID is provided
    if (currentBookId) {
      // Remove the specified bookmark by filtering it out
      bookmarks.value = {
        ...bookmarks.value,
        [currentBookId]: bookmarks.value[currentBookId].filter(
          (bookmark) => bookmark.percentage !== cfiToRemove
        ),
      };

      // Update localStorage with the new bookmark state
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks.value));
    }
  };

  const gotoBookMark = async (percentage, rendition, currentBookId) => {
    // Validate required parameters
    if (!rendition || !bookmarks.value || !currentBookId) {
      console.error("Missing required parameters:", {
        rendition,
        bookmarks,
        currentBookId,
      });
      return;
    }

    try {
      // Retrieve the bookmarks for the current book
      const currentBookmarks = bookmarks.value[currentBookId];
      if (!currentBookmarks) {
        console.error("No bookmarks found for current book");
        return;
      }

      // Find the bookmark matching the given percentage
      const targetBookmark = currentBookmarks.find(
        (bookmark) => Math.abs(bookmark.percentage - percentage) < 0.001
      );

      if (!targetBookmark) {
        console.error("Bookmark not found:", percentage);
        return;
      }

      // Ensure book locations are generated before navigating
      if (!rendition.book.locations.length()) {
        await rendition.book.locations.generate(1000);
      }

      // Convert the percentage back to a CFI position
      const cfi = rendition.book.locations.cfiFromPercentage(
        targetBookmark.percentage
      );

      // Navigate to the bookmarked location
      await rendition.display(cfi);

      // Handle resizing by recalculating the CFI position
      rendition.on("resized", () => {
        const newCfi = rendition.book.locations.cfiFromPercentage(
          targetBookmark.percentage
        );
        rendition.display(newCfi);
      });
    } catch (error) {
      console.error("Error navigating to bookmark:", error);
    }
  };

  return {
    bookmarks,
    addBookMark,
    removeBookmark,
    gotoBookMark,
  };
};
