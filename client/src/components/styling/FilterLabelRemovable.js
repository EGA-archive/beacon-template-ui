import { Box, Button, Divider, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import { useEffect, useRef } from "react";

import config from "../../config/runtimeConfig";
import { capitalize } from "../common/textFormatting";
import { getSelectableScopeStyles } from "../styling/selectableScopeStyles";
import { useSelectedEntry } from "../context/SelectedEntryContext";

const GENOMIC_SCOPES = ["genomicQueryBuilder", "genomicVariant"];

// Chip colors are static for the lifetime of the app,
// so there is no need to recalculate them on every render.
const commonFilterBg = alpha(config.ui.colors.primary, 0.05);
const genomicFilterBg = alpha(config.ui.colors.secondary, 0.4);
const genomicFilterHoverBg = alpha(config.ui.colors.secondary, 0.6);
const multiScopeHoverBg = alpha(config.ui.colors.primary, 0.3);
const entryTypeBg = "#000000";

/**
 * Displays filter chips used across the Search and Results UI.
 *
 * Supported behaviours:
 * - simple chips;
 * - removable chips;
 * - expandable multi-scope chips;
 * - genomic chips that can reopen the Genomic Query Builder.
 */
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
  preventWrap = false,
}) {
  const containerRef = useRef(null);

  const {
    hasSearchResults,
    setQueryDirty,
    openGenomicQueryBuilder,
    setGenomicPrefill,
    setEditingGenomicFilter,
  } = useSelectedEntry();

  // Chip type and behaviour.
  const isSimple = variant === "simple";
  const isEntryTypeChip = scope === "entryType";
  const isRemovable = variant === "removable" && !isEntryTypeChip;
  const isGenomicChip = GENOMIC_SCOPES.includes(scope);
  const isMultiScopeChip = isRemovable && scopes.length > 1;

  /**
   * Only multi-scope chips can be expanded.
   *
   * The extra check is important because otherwise
   * undefined === undefined would mark simple chips as expanded.
   */
  const isExpanded = isMultiScopeChip && expandedKey === keyValue;

  const isClickable =
    !disableClick && (isGenomicChip || isSimple || isRemovable);

  // Common filters use the primary palette.
  // Genomic filters use the secondary palette.
  const isCommonFilter = bgColor === "common";
  const baseBgColor = isCommonFilter ? commonFilterBg : genomicFilterBg;
  const hoverBgColor = isCommonFilter ? commonFilterBg : genomicFilterHoverBg;

  const chipBackgroundColor = isEntryTypeChip
    ? `${entryTypeBg} !important`
    : `${baseBgColor} !important`;

  const chipHoverColor = isEntryTypeChip
    ? `${entryTypeBg} !important`
    : isMultiScopeChip
    ? `${multiScopeHoverBg} !important`
    : `${hoverBgColor} !important`;

  const labelToShow =
    scopes.length > 1 && scope ? `${label} | ${capitalize(scope)}` : label;

  const tooltipTitle =
    !disableTooltip && isGenomicChip
      ? "Click the genomic query to edit it in the Genomic Query Builder."
      : "";

  /**
   * Genomic chips reopen the Genomic Query Builder.
   * Simple chips delegate their click.
   * Multi-scope chips toggle their scope selector.
   */
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

    if (isMultiScopeChip) {
      setExpandedKey?.(isExpanded ? null : keyValue);
    }
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete?.();

    // A filter change after results have been returned
    // means the current results no longer represent the query.
    if (hasSearchResults) {
      setQueryDirty(true);
    }
  };

  /**
   * Genomic labels keep parameter names normal and values bold:
   * Assembly: GRCh38 | Chromosome: 21
   */
  const renderLabel = () => {
    if (type !== "genomic" || typeof label !== "string") {
      return labelToShow;
    }

    return label.split(" | ").map((part, index, parts) => {
      const [key, ...valueParts] = part.split(":");
      const value = valueParts.join(":");

      return (
        <span key={index}>
          {key}:<strong>{value}</strong>
          {index < parts.length - 1 && " | "}
        </span>
      );
    });
  };

  // Only listen for outside clicks while a scope selector is open.
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setExpandedKey?.(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, setExpandedKey]);

  return (
    <Tooltip title={tooltipTitle} arrow placement="top">
      <Box
        ref={containerRef}
        onClick={handleChipClick}
        sx={{
          display: isSimple ? "inline-flex" : "flex",
          flexDirection: isSimple ? "row" : "column",
          alignItems: isSimple ? "center" : "flex-start",
          justifyContent: isSimple ? "center" : "flex-start",

          p: isExpanded ? "9px 12px" : "4px 12px",

          border: "1px solid black",
          borderRadius: isEntryTypeChip ? "30px" : "8px",
          color: isEntryTypeChip ? "white" : "black",
          backgroundColor: chipBackgroundColor,

          cursor: isClickable ? "pointer" : "default",
          transition: "background-color 0.2s ease",

          "&:hover": {
            backgroundColor: disableClick
              ? chipBackgroundColor
              : chipHoverColor,
          },

          /**
           * On sm+ preventWrap keeps the complete chip together,
           * allowing the parent flex container to move it to the next row.
           *
           * On xs the chip may shrink so it cannot overflow the viewport.
           */
          flexShrink: {
            xs: 1,
            sm: preventWrap ? 0 : 1,
          },

          width: isGenomicChip && isSimple ? "fit-content" : "auto",
          maxWidth: isExpanded ? "400px" : "100%",
          minWidth: 0,
          height: isExpanded ? "auto" : "fit-content",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            maxWidth: "100%",
          }}
        >
          <Typography
            data-cy="filter-chip"
            sx={{
              fontSize: "14px",
              fontWeight: isEntryTypeChip ? 600 : 400,
              minWidth: 0,

              // On xs long labels may wrap.
              // From sm onward preventWrap moves the whole chip instead.
              whiteSpace: {
                xs: "normal",
                sm: preventWrap ? "nowrap" : "normal",
              },
            }}
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

        {/* Multi-scope chips expose their available scopes when expanded. */}
        {isExpanded && (
          <Box sx={{ width: "100%", mt: 1 }}>
            <Divider sx={{ borderColor: "black" }} />

            <Typography
              data-cy="scope-selector-title"
              sx={{
                fontWeight: 400,
                fontSize: "13px",
                my: 1,
              }}
            >
              Select the scope:
            </Typography>

            <Box display="flex" gap={1} flexWrap="wrap">
              {scopes.map((scopeOption) => {
                const isSelected = scopeOption === scope;

                return (
                  <Button
                    key={scopeOption}
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => onScopeChange?.(keyValue, scopeOption)}
                    sx={getSelectableScopeStyles(isSelected)}
                  >
                    {capitalize(scopeOption)}
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}
