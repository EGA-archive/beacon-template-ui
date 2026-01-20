import { Typography, Box, Radio } from "@mui/material";
import config from "../../../config/config.json";
import { alpha } from "@mui/material/styles";

/*
 * This file defines shared styles and small UI components used across input forms.
 * It includes:
 * - Styles for Selects, TextFields, Typography
 * - A reusable label component (FieldLabel)
 * - A field header component (FieldHeader) that optionally includes a radio toggle
 */

// Main color for text and borders (dark primary theme color)
const primaryDarkColor = config.ui.colors.darkPrimary;
const lighterColor = alpha(config.ui.colors.primary, 0.05);
const unavailableColor = alpha(config.ui.colors.primary, 0.45);

// Styles for dropdown select inputs
export const selectStyle = {
  backgroundColor: lighterColor,
  borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiSelect-select": {
    fontFamily: '"Open Sans", sans-serif',
    fontSize: "14px",
    color: primaryDarkColor,
    padding: "12px 16px",
  },
};

// Typography style
export const mainBoxTypography = {
  mt: 3,
  mb: 2,
  fontFamily: '"Open Sans", sans-serif',
  fontWeight: 400,
  fontSize: "12px",
  color: primaryDarkColor,
  whiteSpace: "normal",
  "@media (min-width:750px)": {
    whiteSpace: "nowrap",
  },
};

// Style for text input fields
export const textFieldStyle = {
  backgroundColor: lighterColor,
  borderRadius: "10px",
  "& .MuiOutlinedInput-root": {
    "& fieldset": { border: "none" },
  },
  "& input": {
    fontFamily: '"Open Sans", sans-serif',
    fontSize: "14px",
    color: primaryDarkColor,
    padding: "12px 16px",
    height: "auto",
  },
};

/**
 * FieldLabel component
 * - Used above inputs to label them
 */
export const FieldLabel = ({
  children,
  isInactiveSelectable = false,
  isUnavailable = false,
}) => {
  const getColor = () => {
    if (isInactiveSelectable) return unavailableColor;
    if (isUnavailable) return unavailableColor;
    return primaryDarkColor;
  };
  return (
    <Typography
      sx={{
        fontFamily: '"Open Sans", sans-serif',
        fontWeight: 400,
        fontSize: "12px",
        color: getColor(),
        mb: 1,
        mt: "-4px",
        transition: "color 0.2s ease",
        whiteSpace: { xs: "normal", sm: "nowrap" },
      }}
    >
      {children}
    </Typography>
  );
};

/**
 * FieldHeader component
 * - Used at the top of each form field section
 * - Can show a label and optionally a radio button to select the field
 */
export const FieldHeader = ({
  label,
  required,
  isSelectable,
  isSelected,
  onSelect,
  isInactiveSelectable = false,
  isUnavailable = false,
}) => {
  const getColor = () => {
    if (isUnavailable) return unavailableColor; // very light gray
    if (isInactiveSelectable) return unavailableColor; // medium gray
    return primaryDarkColor; // normal dark primary
  };

  // color: unavailableColor,
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      {isSelectable && (
        <Radio
          checked={isSelected}
          onClick={onSelect}
          value={label}
          sx={{
            padding: "0 8px 0 0",
            color: getColor(),
            "&.Mui-checked": {
              color: primaryDarkColor,
            },
          }}
        />
      )}
      <Typography
        sx={{
          fontFamily: '"Open Sans", sans-serif',
          fontWeight: 700,
          fontSize: "14px",
          color: getColor(),
          transition: "color 0.2s ease",
        }}
      >
        {label}
        {required && <span style={{ color: getColor() }}>*</span>}
      </Typography>
    </Box>
  );
};
