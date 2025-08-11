import { Typography, Box, Radio } from "@mui/material";
import config from "../../../config/config.json";

const primaryDarkColor = config.ui.colors.darkPrimary;

export const selectStyle = {
  backgroundColor: "#F5FAFE",
  borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiSelect-select": {
    fontFamily: '"Open Sans", sans-serif',
    fontSize: "14px",
    color: primaryDarkColor,
    padding: "12px 16px",
  },
};

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

export const textFieldStyle = {
  backgroundColor: "#F5FAFE",
  borderRadius: "10px",
  "& .MuiOutlinedInput-root": {
    "& fieldset": { border: "none" },
  },
  "& input": {
    fontFamily: '"Open Sans", sans-serif',
    fontSize: "14px",
    color: "primaryDarkColor",
    padding: "12px 16px",
  },
};

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

export const FieldHeader = ({
  label,
  required,
  isSelectable,
  isSelected,
  onSelect,
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
