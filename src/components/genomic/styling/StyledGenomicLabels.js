import { Button } from "@mui/material";
import config from "../../../config/config.json";

// Reusable button used to display genomic filter labels
// It can be "selected" (highlighted) or unselected (default)
export default function StyledGenomicLabels({ label, selected, onClick }) {
  const primaryDarkColor = config.ui.colors.darkPrimary;
  return (
    <Button
      onClick={onClick} // Callback when the label is clicked
      variant="outlined" // MUI style variant
      sx={{
        borderRadius: "999px",
        fontWeight: 700,
        textTransform: "none",
        fontFamily: '"Open Sans", sans-serif',
        fontSize: "14px",

        // Background changes if the label is selected
        backgroundColor: selected ? primaryDarkColor : "#FFFFFF",
        color: selected ? "white" : primaryDarkColor,

        // Border color is always primaryDarkColor
        border: `1px solid ${primaryDarkColor}`,
        boxShadow: "none",

        // Keep the label text on one line
        whiteSpace: "nowrap",

        // On hover, apply a subtle background if not selected
        "&:hover": {
          backgroundColor: selected ? primaryDarkColor : "#f5f5f5",
        },

        // Smooth transition between states
        transition: "background-color 0.2s ease-in-out",
      }}
    >
      {label}
    </Button>
  );
}
