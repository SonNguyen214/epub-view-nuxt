// utils/annotations.js

export const loadAnnotations = (bookId) => {
  try {
    const savedAnnotations = JSON.parse(
      localStorage.getItem("epubAnnotations") || "{}"
    );
    // Initialize empty arrays if no data exists
    if (!savedAnnotations[bookId]) {
      savedAnnotations[bookId] = {
        highlights: [],
        notes: [],
      };
      localStorage.setItem("epubAnnotations", JSON.stringify(savedAnnotations));
    }

    const result = {
      highlights: savedAnnotations[bookId].highlights || [],
      notes: savedAnnotations[bookId].notes || [],
    };

    return result;
  } catch (error) {
    // Initialize with empty arrays on error
    return { highlights: [], notes: [] };
  }
};

export const saveAnnotations = (bookId, highlights, notes) => {
  try {
    const savedAnnotations = JSON.parse(
      localStorage.getItem("epubAnnotations") || "{}"
    );
    // Ensure the book entry exists
    if (!savedAnnotations[bookId]) {
      savedAnnotations[bookId] = {};
    }
    // Save both highlights and notes
    savedAnnotations[bookId] = {
      highlights: Array.from(highlights || []),
      notes: Array.from(notes || []),
    };
    localStorage.setItem("epubAnnotations", JSON.stringify(savedAnnotations));
  } catch (error) {}
};

export const addHighlight = (rendition, cfiRange, onClick = null) => {
  try {
    if (rendition?.annotations?.highlight) {
      rendition.annotations.highlight(cfiRange, {}, onClick || ((e) => {}));
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const setupHighlightTheme = (rendition) => {
  if (!rendition) return;

  rendition.themes.register("highlight", {
    "::selection": {
      background: "rgba(255, 255, 0, 0.3)",
    },
    ".annotator-hl": {
      background: "rgba(255, 255, 0, 0.3)",
    },
  });

  rendition.themes.select("highlight");
};

export const initializeAnnotations = (rendition) => {
  return rendition && rendition.annotations;
};

const mapSliderToValue = (value, min, max) => {
  return min + ((max - min) * value) / 100;
};

// Default value font size
const FONT_SIZE = {
  MIN: 0.8, // in rem
  MAX: 1.2, // in rem
};

// Default value line height
const LINE_HEIGHT = {
  MIN: 1.8, // in rem
  MAX: 2.2, // in rem
};

export const mapSliderValueToFontSize = (value) => {
  return mapSliderToValue(value, FONT_SIZE.MIN, FONT_SIZE.MAX);
};

export const mapSliderValueToLineHeight = (value) => {
  return mapSliderToValue(value, LINE_HEIGHT.MIN, LINE_HEIGHT.MAX);
};

export const restoreAllHighlights = async (rendition, highlights) => {
  if (!rendition || !highlights || highlights.length === 0) return;

  try {
    // Clear all existing highlights first
    if (rendition?.annotations?.remove) {
      rendition.annotations.remove("highlight");
    }

    // Add all highlights
    for (const highlight of highlights) {
      try {
        if (highlight.cfi) {
          addHighlight(rendition, highlight.cfi);
        }
      } catch (error) {
        console.error("Error restoring highlight:", error);
      }
    }
  } catch (error) {}
};

export const updateHighlightsAfterStyleChange = async (
  rendition,
  highlights
) => {
  if (!rendition || !highlights || highlights.length === 0) return;

  try {
    // Clear all existing highlights
    if (
      rendition.annotations &&
      typeof rendition.annotations.remove === "function"
    ) {
      rendition.annotations.remove("highlight");
    }

    // Wait for the rendition to update after style changes
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get the current location
    const currentLocation = rendition.currentLocation();
    if (!currentLocation) return;

    // Get the current page's CFI range
    const currentPageCfi = currentLocation.start.cfi;
    const currentPageEndCfi = currentLocation.end.cfi;

    // Create a map of old CFIs to new CFIs
    const cfiMap = new Map();

    // For each highlight, find its new position
    for (const highlight of highlights) {
      try {
        if (highlight.cfi) {
          // Get the text content of the highlight
          const range = rendition.getRange(highlight.cfi);
          if (range) {
            const text = range.toString();

            // Find the new position by searching through the current page
            const newRange = await findTextInRange(
              rendition,
              text,
              currentPageCfi,
              currentPageEndCfi
            );
            if (newRange) {
              const newCfi = newRange.toString();
              cfiMap.set(highlight.cfi, newCfi);

              // Add the highlight at the new position
              addHighlight(rendition, newCfi);
            }
          }
        }
      } catch (error) {
        console.error("Error updating highlight position:", error);
      }
    }

    // Update the highlights in localStorage with new CFIs
    const updatedHighlights = highlights.map((highlight) => ({
      ...highlight,
      cfi: cfiMap.get(highlight.cfi) || highlight.cfi,
    }));

    // Save the updated highlights
    const bookId = rendition.book.key;
    const savedAnnotations = JSON.parse(
      localStorage.getItem("epubAnnotations") || "{}"
    );
    if (savedAnnotations[bookId]) {
      savedAnnotations[bookId].highlights = updatedHighlights;
      localStorage.setItem("epubAnnotations", JSON.stringify(savedAnnotations));
    }

    return updatedHighlights;
  } catch (error) {
    console.error("Error in updateHighlightsAfterStyleChange:", error);
    return highlights;
  }
};

// Helper function to find text in a range
const findTextInRange = async (rendition, searchText, startCfi, endCfi) => {
  try {
    // Get the current page's content
    const page = rendition.manager.current();

    if (!page) return null;

    // Get all text nodes in the page
    const walker = document.createTreeWalker(
      page.document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    let foundNode = null;
    let foundOffset = -1;

    // Search through all text nodes
    while ((node = walker.nextNode())) {
      const index = node.textContent.indexOf(searchText);
      if (index !== -1) {
        foundNode = node;
        foundOffset = index;
        break;
      }
    }

    if (!foundNode || foundOffset === -1) return null;

    // Create a range from the found position
    const range = document.createRange();
    range.setStart(foundNode, foundOffset);
    range.setEnd(foundNode, foundOffset + searchText.length);

    // // Convert the range to a CFI using the rendition's methods
    // const cfi = rendition.manager.getRangeFromCfi(range);
    // return cfi;
  } catch (error) {
    console.error("Error finding text in range:", error);
    return null;
  }
};

export const isTextHighlighted = (rendition, cfiRange, bookId) => {
  try {
    if (!rendition || !cfiRange || !bookId) return false;

    // Get the text content of the selection
    const range = rendition.getRange(cfiRange);
    if (!range) return false;

    const selectedText = range.toString().trim();

    // Get saved annotations from localStorage
    const savedAnnotations = JSON.parse(
      localStorage.getItem("epubAnnotations") || "{}"
    );
    const bookAnnotations = savedAnnotations[bookId] || { highlights: [] };

    // Helper function to calculate similarity between two strings
    const calculateSimilarity = (str1, str2) => {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;

      // If the longer string is empty, return 1.0
      if (longer.length === 0) return 1.0;

      // Calculate similarity ratio
      return (longer.length - editDistance(longer, shorter)) / longer.length;
    };

    // Helper function to calculate edit distance between two strings
    const editDistance = (s1, s2) => {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();

      const costs = [];
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i === 0) {
            costs[j] = j;
          } else if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
        if (i > 0) costs[s2.length] = lastValue;
      }
      return costs[s2.length];
    };

    // Check if any highlight matches with sufficient similarity
    const isHighlighted = bookAnnotations.highlights.some((highlight) => {
      if (!highlight.text) return false;

      const highlightText = highlight.text.trim();

      // Calculate similarity between selected text and highlight text
      const similarity = calculateSimilarity(selectedText, highlightText);

      // Consider it a match if similarity is above 99%
      return similarity > 0.99;
    });

    return isHighlighted;
  } catch (error) {
    return false;
  }
};

export const removeHighlight = (rendition, cfiRange) => {
  try {
    if (rendition?.annotations?.remove) {
      rendition.annotations.remove(cfiRange, "highlight");
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
