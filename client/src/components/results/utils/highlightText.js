export const highlightText = (text, searchTerm) => {
  if (!searchTerm?.trim()) return text;

  const safeText = String(text);

  const parts = safeText.split(
    new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  );

  return parts.map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <span
        key={index}
        style={{
          backgroundColor: "#FFF59D",
          fontWeight: 700,
          padding: "0 1px",
          borderRadius: "2px",
        }}
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};
