import { useGlobalStore } from "~/store/useGlobalStore";
import {
  mapSliderValueToFontSize,
  mapSliderValueToLineHeight,
} from "~/utils/annotations";
import {
  loadAnnotations,
  updateHighlightsAfterStyleChange,
} from "~/utils/annotations";

export const useReaderSettings = () => {
  const globalStore = useGlobalStore();
  const { rendition } = storeToRefs(globalStore);

  const updateFontSize = async (value) => {
    if (!rendition.value) return;

    const fontSize = mapSliderValueToFontSize(value);
    rendition.value.themes.fontSize(`${fontSize}rem`);

    // Update highlights after font size change
    const annotations = loadAnnotations(rendition.value.book.key);
    if (annotations.highlights && annotations.highlights.length > 0) {
      await updateHighlightsAfterStyleChange(
        rendition.value,
        annotations.highlights
      );
    }
  };

  const updateLineHeight = async (value) => {
    if (!rendition.value) return;

    const lineHeight = mapSliderValueToLineHeight(value);
    rendition.value.themes.override("line-height", `${lineHeight}rem`);

    // Update highlights after line height change
    const annotations = loadAnnotations(rendition.value.book.key);
    if (annotations.highlights && annotations.highlights.length > 0) {
      await updateHighlightsAfterStyleChange(
        rendition.value,
        annotations.highlights
      );
    }
  };

  return {
    updateFontSize,
    updateLineHeight,
  };
};
