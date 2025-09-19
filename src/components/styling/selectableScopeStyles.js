import config from "../../config/config.json";
import { alpha } from "@mui/material/styles";

// Create a lighter version of the primary color for hover effect
const hoverColor = alpha(config.ui.colors.primary, 0.05);

// This function returns a style object based on whether the scope is selected
export const getSelectableScopeStyles = (isSelected) => ({
  // Rounded corners for the little scope "pills"
  borderRadius: "7px",

  // Font styling
  fontWeight: 400,
  fontSize: "12px",
  fontFamily: '"Open Sans", sans-serif',

  // Padding for spacing inside the scope pill
  px: 1.5, // padding left & right
  py: 0.3, // padding top & bottom

  // Margin for spacing between pills
  mr: 1, // margin-right
  mb: 0.5, // margin-bottom

  // Cursor becomes pointer on hover
  cursor: "pointer",

  // Smooth animation when styles change
  transition: "all 0.2s ease-in-out",

  // Make sure the text is Capitalized
  textTransform: "capitalize",

  // Background color changes based on selection
  backgroundColor: isSelected ? config.ui.colors.primary : "#fff",

  // Text color also depends on selection
  color: isSelected ? "#fff" : config.ui.colors.darkPrimary,

  // Border changes depending on selection
  border: `1px solid ${
    isSelected ? config.ui.colors.primary : config.ui.colors.darkPrimary
  }`,

  // No shadow by default
  boxShadow: "none",

  // What happens when you hover over the pill
  "&:hover": {
    boxShadow: "none",
    // If it's not selected, apply a light hover background
    backgroundColor: isSelected ? "none" : hoverColor,
  },
});
