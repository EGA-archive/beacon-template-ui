import { Chip } from "@mui/material";
import { alpha, lighten } from "@mui/system";
import config from "../../config/config.json";

export default function FilterLabel({ label, onClick, bgColor }) {
  let backgroundColor = "";
  let hoverColor = "";

  if (bgColor === "common") {
    backgroundColor = alpha(config.ui.colors.primary, 0.05);
    hoverColor = alpha(config.ui.colors.primary, 0.15);
  } else if (bgColor === "genomic") {
    backgroundColor = alpha(config.ui.colors.secondary, 0.4);
    hoverColor = config.ui.colors.secondary;
  }

  const selectedBgColor = lighten(config.ui.colors.primary, 0.9);

  return (
    <Chip
      label={label}
      onClick={onClick}
      component="div"
      clickable
      variant="outlined"
      sx={{
        height: 32,
        borderRadius: "8px",
        border: "1px solid black",
        backgroundColor,
        fontSize: "14px",
        fontWeight: 400,
        transition: "background-color 0.2s ease",
        "&.MuiChip-clickable:hover": {
          backgroundColor: "hoverColor",
        },
        "&.Mui-selected": {
          backgroundColor: hoverColor,
        },
      }}
    />
  );
}
