import HighlightedText from "../../common/HighlightedText";

/**
 * Keeps the existing Results-table API while using the shared word-by-word highlighting component.
 */
export const highlightText = (text, searchTerm) => (
  <HighlightedText text={text} searchQuery={searchTerm} />
);
