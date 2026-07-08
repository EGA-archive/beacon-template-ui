import { Typography, Button, Box, Divider, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import config from "../../config/config.json";
import { capitalize } from "../common/textFormatting";
import { useEffect, useRef } from "react";
import { getSelectableScopeStyles } from "../styling/selectableScopeStyles";
import { useSelectedEntry } from "../context/SelectedEntryContext";

// This component shows a label for the filter that can be removable and expandable
export default function FilterLabelRemovable({
  type,
  label,
  queryType,
  queryParams,
  scope,
  scopes = [],
  onDelete,
  onClick,
  onScopeChange,
  keyValue,
  expandedKey,
  setExpandedKey,
  bgColor,
  variant = "",
  disableTooltip = false,
  disableClick = false,
}) {
  const containerRef = useRef(null);

  const {
    hasSearchResults,
    setQueryDirty,
    openGenomicQueryBuilder,
    setGenomicPrefill,
    setEditingGenomicFilter,
  } = useSelectedEntry();

  const isExpanded = expandedKey === keyValue;

  const isSimple = variant === "simple";
  const isEntryTypeChip = scope === "entryType";
  const isRemovable = variant === "removable" && !isEntryTypeChip;

  const isGenomicChip =
    scope === "genomicQueryBuilder" || scope === "genomicVariant";

  const isMultiScopeChip = isRemovable && scopes.length > 1;

  const isExpandable = isMultiScopeChip;

  // Common filter chips use a very light primary color.
  const commonFilterBg = alpha(config.ui.colors.primary, 0.05);

  // Genomic query chips use the secondary color, slightly stronger.
  const genomicFilterBg = alpha(config.ui.colors.secondary, 0.4);

  // Genomic query chips can have a stronger hover color.
  const genomicFilterHoverBg = alpha(config.ui.colors.secondary, 0.6);

  // Multi-scope filters are expandable, so they keep a visible hover state.
  const multiScopeHoverBg = alpha(config.ui.colors.primary, 0.3);

  // Entry type chips are black.
  const entryTypeBg = "#000000";

  const isCommonFilter = bgColor === "common";

  const baseBgColor = isCommonFilter ? commonFilterBg : genomicFilterBg;

  const regularHoverBg = isCommonFilter ? commonFilterBg : genomicFilterHoverBg;

  const labelToShow =
    scopes.length > 1 && scope ? `${label} | ${capitalize(scope)}` : label;

  const chipBackgroundColor = isEntryTypeChip
    ? `${entryTypeBg} !important`
    : `${baseBgColor} !important`;

  const chipHoverColor = isEntryTypeChip
    ? `${entryTypeBg} !important`
    : isMultiScopeChip
    ? `${multiScopeHoverBg} !important`
    : `${regularHoverBg} !important`;

  const handleChipClick = () => {
    if (disableClick) return;
    if (isGenomicChip) {
      setEditingGenomicFilter({
        id: keyValue,
        queryType,
        queryParams,
      });

      setGenomicPrefill({
        queryType,
        queryParams,
      });

      openGenomicQueryBuilder();
      return;
    }

    if (isSimple) {
      onClick?.();
      return;
    }

    if (isExpandable) {
      setExpandedKey?.(isExpanded ? null : keyValue);
    }
  };

  const handleDelete = (event) => {
    event.stopPropagation();

    onDelete?.();

    if (hasSearchResults) {
      setQueryDirty(true);
    }
  };

  const renderLabel = () => {
    if (type !== "genomic" || typeof label !== "string") {
      return labelToShow;
    }

    return label.split(" | ").map((part, i, arr) => {
      const [key, ...valueParts] = part.split(":");
      const value = valueParts.join(":");

      return (
        <span key={i}>
          {key}:<strong>{value}</strong>
          {i < arr.length - 1 && " | "}
        </span>
      );
    });
  };

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
  }, [isExpanded, isExpandable, setExpandedKey]);

  return (
    <Tooltip
      title={
        disableTooltip
          ? ""
          : isGenomicChip
          ? "Click the genomic query to edit it in the Genomic Query Builder."
          : ""
      }
      arrow
      placement="top"
    >
      <Box
        ref={containerRef}
        onClick={handleChipClick}
        sx={{
          display: isSimple ? "inline-flex" : "flex",
          flexDirection: isSimple ? "row" : "column",
          flexWrap: "wrap",
          alignItems: isSimple ? "center" : "flex-start",
          justifyContent: isSimple ? "center" : "flex-start",
          padding: isSimple ? "4px 12px" : isExpanded ? "9px 12px" : "4px 12px",
          borderRadius: isEntryTypeChip ? "30px" : "8px",
          border: "1px solid black",
          color: isEntryTypeChip ? "white" : "black",
          backgroundColor: chipBackgroundColor,
          fontSize: "14px",
          cursor:
            !disableClick && (isGenomicChip || isSimple || isRemovable)
              ? "pointer"
              : "default",
          transition: "background-color 0.2s ease",

          "&:hover": {
            // Disabled chips should not visually react on hover.
            backgroundColor: disableClick
              ? chipBackgroundColor
              : chipHoverColor,
          },
          maxWidth: isExpanded ? "400px" : "auto",
          height: isExpanded ? "auto" : "fit-content",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: isEntryTypeChip ? 600 : 400,
            }}
            data-cy="filter-chip"
          >
            {renderLabel()}
          </Typography>

          {isRemovable && (
            <ClearIcon
              onClick={handleDelete}
              sx={{
                fontSize: 18,
                cursor: "pointer",
                opacity: 0.6,
                "&:hover": {
                  opacity: 1,
                },
              }}
            />
          )}
        </Box>

        {isExpanded && isMultiScopeChip ? (
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
        ) : null}
      </Box>
    </Tooltip>
  );
}
