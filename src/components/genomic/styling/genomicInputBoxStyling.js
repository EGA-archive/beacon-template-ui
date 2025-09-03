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
  },
};

/**
 * FieldLabel component
 * - Used above inputs to label them
 */
export const FieldLabel = ({ children }) => (
  <Typography
    sx={{
      fontFamily: '"Open Sans", sans-serif',
      fontWeight: 400,
      fontSize: "12px",
      color: primaryDarkColor,
      mb: 1,
      mt: "-4px",
      whiteSpace: { xs: "normal", sm: "nowrap" },
    }}
  >
    {children}
  </Typography>
);

/**
 * FieldHeader component
 * - Used at the top of each form field section
 * - Can show a label and optionally a radio button to select the field
 */
export const FieldHeader = ({
  label, // Text of the section
  required, // Whether to show a * next to label
  isSelectable, // If true, shows a radio button
  isSelected, // Whether the radio is selected
  onSelect, // Function to call when selected
}) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
    {isSelectable && (
      <Radio
        checked={isSelected}
        onClick={onSelect}
        value={label}
        sx={{
          padding: "0 8px 0 0",
          color: primaryDarkColor,
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
        color: primaryDarkColor,
      }}
    >
      {label}
      {required && <span style={{ color: primaryDarkColor }}>*</span>}
    </Typography>
  </Box>
);
