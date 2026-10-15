import { Box } from "@mui/material";

/**
 * Highlights every word from the search query inside the displayed text.
 *
 * Matching is case-insensitive and the original text is preserved.
 */
export default function HighlightedText({ text, searchQuery = "" }) {
  const value = String(text ?? "");

  const searchWords = [
    ...new Set(
      searchQuery
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.toLowerCase())
    ),
  ];

  if (!value || searchWords.length === 0) {
    return value;
  }

  // Escape characters that have a special meaning inside RegExp.
  const escapedWords = searchWords
    .sort((a, b) => b.length - a.length)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");

  return value.split(regex).map((part, index) => {
    const isMatch = searchWords.includes(part.toLowerCase());

    if (!isMatch) {
      return part;
    }

    return (
      <Box
        key={`${part}-${index}`}
        component="mark"
        sx={{
          backgroundColor: "#FFFFC5",
          color: "inherit",
          p: 0,
          borderRadius: "2px",
        }}
      >
        {part}
      </Box>
    );
  });
}
