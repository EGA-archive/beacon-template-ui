import { Typography, Button, Box, Divider } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import config from "../../config/config.json";
import { capitalize } from "../common/textFormatting";
import { useEffect, useRef } from "react";
import { getSelectableScopeStyles } from "../styling/selectableScopeStyles";

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

  const isExpanded = expandedKey === keyValue;
  const isSimple = variant === "simple";
  const isRemovable = variant === "removable";
  const isExpandable = isRemovable && scopes.length > 1;

  const baseBgColor =
    bgColor === "common"
      ? alpha(config.ui.colors.primary, 0.05)
      : alpha(config.ui.colors.secondary, 0.4);

  const hoverColor =
    bgColor === "common"
      ? alpha(config.ui.colors.primary, 0.15)
      : alpha(config.ui.colors.secondary, 0.6);

  const activeBgColor = stateSelected
    ? alpha(config.ui.colors.primary, 0.25)
    : baseBgColor;

  const finalBgColor = isSimple
    ? baseBgColor
    : isExpanded
    ? hoverColor
    : activeBgColor;

  const labelToShow =
    scopes.length > 1 && scope ? `${label} | ${capitalize(scope)}` : label;

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
        flexWrap: "wrap",
        alignItems: isSimple ? "center" : "flex-start",
        justifyContent: isSimple ? "center" : "flex-start",
        padding: isSimple ? "4px 12px" : isExpanded ? "9px 12px" : "4px 12px",
        borderRadius: "8px",
        border: "1px solid black",
        backgroundColor: `${finalBgColor} !important`,
        fontSize: "14px",
        fontWeight: 400,
        cursor: isSimple || isRemovable ? "pointer" : "default",
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: `${hoverColor} !important`,
        },
        maxWidth: isExpanded ? "400px" : "auto",
        height: isExpanded ? "auto" : "fit-content",
      }}
      onClick={() => {
        if (isSimple && typeof onClick === "function") {
          onClick();
        } else if (isExpandable && typeof setExpandedKey === "function") {
          setExpandedKey(isExpanded ? null : keyValue);
        }
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Typography sx={{ fontSize: "14px" }}>{labelToShow}</Typography>
        {isRemovable && (
          <ClearIcon
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
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

      {isExpandable && isExpanded && (
        <Box mt={1} sx={{ width: "100%" }}>
          <Divider
            orientation="horizontal"
            flexItem
            sx={{ borderColor: "black" }}
          />
          <Typography fontWeight={400} fontSize={13} mb={1} mt={1}>
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
      )}
    </Box>
  );
}
