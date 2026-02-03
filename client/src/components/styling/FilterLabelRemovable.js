import { Typography, Button, Box, Divider } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import config from "../../config/config.json";
import { capitalize } from "../common/textFormatting";
import { useEffect, useRef } from "react";
import { getSelectableScopeStyles } from "../styling/selectableScopeStyles";
import { useSelectedEntry } from "../context/SelectedEntryContext";

// This component shows a label for the filter that can be removable and expandable
export default function FilterLabelRemovable({
  label,
  scope,
  scopes = [],
  onDelete,
  onClick,
  onScopeChange,
  keyValue,
  expandedKey,
  setExpandedKey,
  bgColor,
  stateSelected,
  variant = "",
}) {
  const containerRef = useRef(null);

  // State to check if this label is the one currently expanded
  const isExpanded = expandedKey === keyValue;

  // Different types of labels: simple = clickable, removable = has delete icon
  const isSimple = variant === "simple";
  const isRemovable = variant === "removable";

  // Can expand only if it’s removable and has multiple scopes
  const isExpandable = isRemovable && scopes.length > 1;

  const { hasSearchResults, setQueryDirty } = useSelectedEntry();

  // Base background colors depending on the type (common or other)
  const baseBgColor =
    bgColor === "common"
      ? alpha(config.ui.colors.primary, 0.05)
      : alpha(config.ui.colors.secondary, 0.4);

  const hoverColor =
    bgColor === "common"
      ? alpha(config.ui.colors.primary, 0.05)
      : alpha(config.ui.colors.secondary, 0.6);

  // Multi-scope chip flag (used for coloring rules)
  const isMultiScopeChip = isRemovable && scopes.length > 1;

  // Background for applied multi-scope chip
  const activeBgColor = isMultiScopeChip
    ? alpha(config.ui.colors.primary, 0.2)
    : stateSelected
    ? alpha(config.ui.colors.primary, 0.25)
    : baseBgColor;

  // Background when chip is expanded and is multi-scope
  const expandedMultiScopeBg =
    isExpanded && scopes.length > 1
      ? alpha(config.ui.colors.primary, 0.2)
      : null;

  // Final chip background depending on simple/expanded/selected state
  const finalBgColor = isSimple
    ? baseBgColor
    : isExpanded
    ? hoverColor
    : activeBgColor;

  // Hover color specifically for multi-scope chips
  const multiScopeHoverBg = isMultiScopeChip
    ? alpha(config.ui.colors.primary, 0.3)
    : null;

  // Show scope inside label only if there are multiple
  const labelToShow =
    scopes.length > 1 && scope ? `${label} | ${capitalize(scope)}` : label;

  // Handle clicking outside to close expanded label
  useEffect(() => {
    if (!isExpandable) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        isExpanded &&
        typeof setExpandedKey === "function"
      ) {
        setExpandedKey(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, setExpandedKey, isExpandable]);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: isSimple ? "inline-flex" : "flex",
        flexDirection: isSimple ? "row" : "column",
        flexWrap: "wrap", // allow text to wrap
        alignItems: isSimple ? "center" : "flex-start",
        justifyContent: isSimple ? "center" : "flex-start",
        padding: isSimple ? "4px 12px" : isExpanded ? "9px 12px" : "4px 12px",
        borderRadius: "8px",
        border: "1px solid black",

        // If expanded & multi-scope, use darkPrimary background
        backgroundColor: expandedMultiScopeBg
          ? `${expandedMultiScopeBg} !important`
          : `${finalBgColor} !important`,

        fontSize: "14px",
        fontWeight: 400,
        cursor: isSimple || isRemovable ? "pointer" : "default",
        transition: "background-color 0.2s ease",

        "&:hover": {
          // Darker hover when multi-scope, otherwise default hover
          backgroundColor: isMultiScopeChip
            ? `${multiScopeHoverBg} !important`
            : `${hoverColor} !important`,
        },

        maxWidth: isExpanded ? "400px" : "auto",
        height: isExpanded ? "auto" : "fit-content", // auto height only if expanded
      }}
      onClick={() => {
        if (isSimple && typeof onClick === "function") {
          onClick(); // for simple variant, trigger onClick
        } else if (isExpandable && typeof setExpandedKey === "function") {
          // toggle expansion only when multiple scopes exist
          setExpandedKey(isExpanded ? null : keyValue);
        }
      }}
    >
      {/* Top part of the label: shows text and delete icon if removable */}
      <Box display="flex" alignItems="center" gap={1}>
        <Typography sx={{ fontSize: "14px" }} data-cy="filter-chip">
          {scope === "genomicQueryBuilder" && typeof label === "string"
            ? label.split(" | ").map((part, i, arr) => {
                const [key, ...valueParts] = part.split(":");
                const value = valueParts.join(":");
                return (
                  <span key={i}>
                    <strong>{key}:</strong> {value}
                    {i < arr.length - 1 && " | "}
                  </span>
                );
              })
            : labelToShow}
        </Typography>
        {isRemovable && (
          <ClearIcon
            onClick={(e) => {
              e.stopPropagation();

              onDelete?.();

              if (hasSearchResults) {
                setQueryDirty(true);
              }
            }}
            sx={{
              fontSize: 18,
              cursor: "pointer",
              opacity: 0.6,
              "&:hover": { opacity: 1 },
            }}
          />
        )}
      </Box>

      {/* Expanded content: scope selector.  
          Shown only when chip has multiple scopes */}
      {isExpandable && isExpanded && (
        <Box mt={1} sx={{ width: "100%" }}>
          <Divider
            orientation="horizontal"
            flexItem
            sx={{ borderColor: "black" }}
          />
          <Typography
            fontWeight={400}
            fontSize={13}
            mb={1}
            mt={1}
            data-cy="scope-selector-title"
          >
            Select the scope:
          </Typography>

          {/* Buttons for each available scope */}
          {/* Clicking a button changes the scope for this filter */}
          <Box display="flex" gap={1} flexWrap="wrap">
            {scopes.map((s) => {
              const isSelected = s === scope;
              return (
                <Button
                  key={s}
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => onScopeChange?.(keyValue, s)}
                  sx={getSelectableScopeStyles(isSelected)}
                >
                  {capitalize(s)}
                </Button>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
