import { Button } from "@mui/material";
import PropTypes from "prop-types";
import config from "../../config/config.json";
import { lighten } from "@mui/system";
import { alpha } from "@mui/material/styles";

/**
 * Reusable, pill-shaped button with a left icon and label.
 * It supports a "selected" state (for toggles or filters).
 * Used for filter buttons or view switchers in the UI.
 */

export default function StyledButtons({ icon, label, selected, onClick }) {
  return (
    <Button
      variant="outlined" // MUI style: outlined button
      startIcon={icon} // Icon shown on the left of the label
      onClick={onClick} // Called when the button is clicked
      sx={{
        borderRadius: "999px", // Makes it pill-shaped
        textTransform: "none", // Keeps label case as-is
        fontSize: { xs: "13px", sm: "14px" }, // Responsive font size
        fontWeight: 400,
        fontFamily: '"Open Sans", sans-serif',
        minWidth: { xs: "140px", sm: "180px" }, // Responsive width
        height: { xs: "45px", sm: "40px" }, // Responsive height
        px: 2,
        py: 0.5,
        backgroundColor: selected ? selectedBg : "white", // Light blue if selected
        border: `1px solid ${
          selected ? primaryDarkColor : unselectedBorderColor
        }`,
        color: primaryDarkColor,
        "&:hover": {
          backgroundColor: selected ? selectedBg : lighten("#fff", 0.05),
          border: `1px solid ${primaryDarkColor}`,
        },
      }}
    >
      {label} {/* Button text */}
    </Button>
  );
}

const primaryColor = config.ui.colors.primary;
const unselectedBorderColor = alpha(primaryColor, 0.15);
const selectedBg = alpha(primaryColor, 0.15);
const primaryDarkColor = config.ui.colors.darkPrimary;
const selectedBgColor = lighten(primaryDarkColor, 0.9);

StyledButtons.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};
