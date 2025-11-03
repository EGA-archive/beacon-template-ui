import { Button } from "@mui/material";
import PropTypes from "prop-types";
import config from "../../config/config.json";
import { lighten } from "@mui/system";
import { alpha } from "@mui/material/styles";

/**
 * Reusable, pill-shaped button with optional icon and label.
 * Supports "contained" and "outlined" variants.
 * Accepts a "selected" state to visually toggle buttons (used for filters, tabs, etc.).
 */

export default function StyledButtons({
  icon, // Icon shown to the left of the label
  label, // Text label of the button
  selected, // Used to style outlined variant as selected
  onClick, // Click handler
  type = "button", // Default button type
  variant = "outlined", // 'contained' or 'outlined'
  disabled = false, // Disable state
  sx = {}, // Optional custom styles (overrides)
}) {
  // Base styling common to all buttons
  const baseStyles = {
    borderRadius: "999px", // Makes button pill-shaped
    textTransform: "none", // Keep label casing as-is
    fontSize: { xs: "13px", sm: "14px" },
    fontWeight: 400,
    fontFamily: '"Open Sans", sans-serif',
    minWidth: { xs: "120px", sm: "180px" },
    height: { xs: "45px", sm: "40px" },
    px: 2,
    py: 0.5,
  };

  // Styles for 'contained' vs 'outlined' variant
  const variantStyles =
    variant === "contained"
      ? {
          backgroundColor: primaryColor,
          border: `1px solid ${primaryColor}`,
          color: "#fff",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#fff",
            border: `1px solid ${primaryColor}`,
            color: primaryColor,
          },
          "&.Mui-disabled": {
            backgroundColor: "#F2F4F7",
            borderColor: "#F2F4F7",
            color: "#98A2B3",
          },
        }
      : {
          backgroundColor: selected ? selectedBg : "white",
          border: `1px solid ${
            selected ? primaryDarkColor : unselectedBorderColor
          }`,
          color: primaryDarkColor,

          "&:hover": {
            backgroundColor: selected ? selectedBg : lighten("#fff", 0.05),
            border: `1px solid ${primaryDarkColor}`,
          },
          "&.Mui-disabled": {
            backgroundColor: "#F2F4F7",
            borderColor: "#F2F4F7",
            color: "#98A2B3",
          },
        };

  // Final rendered MUI Button with all combined styles
  return (
    <Button
      type={type}
      variant={variant}
      startIcon={icon}
      onClick={onClick}
      disabled={disabled}
      sx={{
        ...baseStyles,
        ...variantStyles,
        ...sx, // Allow overriding base + variant styles
      }}
    >
      {label}
    </Button>
  );
}

// Colors from config and utilities
const primaryColor = config.ui.colors.primary;
const unselectedBorderColor = alpha(primaryColor, 0.15); // Light border for non-selected buttons
const selectedBg = alpha(primaryColor, 0.15); // Light background when selected
const primaryDarkColor = config.ui.colors.darkPrimary;

// Prop types for validation
StyledButtons.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};
