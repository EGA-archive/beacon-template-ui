import { Typography, Button, Box, Divider, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import config from "../../config/config.json";
import { capitalize, formatEntryLabel } from "../common/textFormatting";
import { useEffect, useRef } from "react";
import { getSelectableScopeStyles } from "../styling/selectableScopeStyles";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { getEntryTypeSelectableStyles } from "../styling/getEntryTypeSelectableStyles";

// // This component shows a label for the filter that can be removable and expandable
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
  stateSelected,
  variant = "",
}) {
  const containerRef = useRef(null);

  const {
    hasSearchResults,
    setQueryDirty,
    openGenomicQueryBuilder,
    setGenomicPrefill,
    setEditingGenomicFilter,
    entryTypes,
    selectedPathSegment,
    setSelectedPathSegment,
  } = useSelectedEntry();

  const isExpanded = expandedKey === keyValue;

  const isSimple = variant === "simple";
  const isEntryTypeChip = scope === "entryType";
  const isRemovable = variant === "removable" && !isEntryTypeChip;

  const isGenomicChip =
    scope === "genomicQueryBuilder" || scope === "genomicVariant";

  const isEntryTypeExpandable =
    isEntryTypeChip && entryTypes.length > 1 && variant === "removable";

  const isMultiScopeChip = isRemovable && scopes.length > 1;

  const isExpandable = isEntryTypeExpandable || isMultiScopeChip;

  const baseBgColor =
    bgColor === "common"
      ? alpha(config.ui.colors.primary, 0.05)
      : alpha(config.ui.colors.secondary, 0.4);

  const hoverColor =
    bgColor === "common"
      ? alpha(config.ui.colors.primary, 0.05)
      : alpha(config.ui.colors.secondary, 0.6);

  const activeBgColor = isMultiScopeChip
    ? alpha(config.ui.colors.primary, 0.2)
    : stateSelected
    ? alpha(config.ui.colors.primary, 0.25)
    : baseBgColor;

  const expandedMultiScopeBg =
    isExpanded && isMultiScopeChip
      ? alpha(config.ui.colors.primary, 0.2)
      : null;

  const finalBgColor = isSimple
    ? baseBgColor
    : isExpanded
    ? hoverColor
    : activeBgColor;

  const multiScopeHoverBg = isMultiScopeChip
    ? alpha(config.ui.colors.primary, 0.3)
    : null;

  const labelToShow =
    scopes.length > 1 && scope ? `${label} | ${capitalize(scope)}` : label;

  const chipBackgroundColor = isEntryTypeChip
    ? isExpanded
      ? "#E6E7E8 !important"
      : "#F4F5F6 !important"
    : expandedMultiScopeBg
    ? `${expandedMultiScopeBg} !important`
    : `${finalBgColor} !important`;

  const chipHoverColor = isEntryTypeChip
    ? variant === "removable"
      ? "#E6E7E8 !important"
      : chipBackgroundColor
    : isMultiScopeChip
    ? `${multiScopeHoverBg} !important`
    : `${hoverColor} !important`;

  const handleChipClick = () => {
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

    if (isSimple && typeof onClick === "function") {
      onClick();
      return;
    }

    if (isExpandable && typeof setExpandedKey === "function") {
      setExpandedKey(isExpanded ? null : keyValue);
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
          <strong>{key}:</strong> {value}
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
        isGenomicChip
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
          borderRadius: "8px",
          border: "1px solid black",
          backgroundColor: chipBackgroundColor,
          fontSize: "14px",
          fontWeight: 400,
          cursor:
            isSimple || isRemovable || isEntryTypeExpandable
              ? "pointer"
              : "default",
          transition: "background-color 0.2s ease",

          "&:hover": {
            backgroundColor: chipHoverColor,
          },

          maxWidth: isExpanded ? "400px" : "auto",
          height: isExpanded ? "auto" : "fit-content",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={{ fontSize: "14px" }} data-cy="filter-chip">
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

        {isExpanded && isEntryTypeExpandable ? (
          <Box mt={1} sx={{ width: "100%" }}>
            <Divider
              orientation="horizontal"
              flexItem
              sx={{ borderColor: "black" }}
            />

            <Typography fontWeight={400} fontSize={12} mb={1} mt={1}>
              Change the results type:
            </Typography>

            <Box display="flex" gap={1} flexWrap="wrap">
              {entryTypes.map((entry) => {
                const isSelected = entry.pathSegment === selectedPathSegment;

                return (
                  <Button
                    key={entry.pathSegment}
                    variant={isSelected ? "contained" : "outlined"}
                    onClick={() => {
                      setSelectedPathSegment(entry.pathSegment);
                      setExpandedKey(null);
                    }}
                    sx={getEntryTypeSelectableStyles(isSelected)}
                  >
                    {formatEntryLabel(entry.pathSegment)}
                  </Button>
                );
              })}
            </Box>
          </Box>
        ) : isExpanded && isMultiScopeChip ? (
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
