import { Box, Button } from "@mui/material";
import LocalPostOfficeRoundedIcon from "@mui/icons-material/LocalPostOfficeRounded";
import LocalPostOfficeOutlinedIcon from "@mui/icons-material/LocalPostOfficeOutlined";

import config from "../../../config/runtimeConfig";

/**
 * Displays the contact action used in Results tables.
 * The outlined icon is shown by default and switches to the filled icon on hover.
 */
export default function ResultsContactButton({ email, compact = false }) {
  if (!email) return null;

  const handleEmail = (event) => {
    event.stopPropagation();
    window.open(`mailto:${email}`, "_blank");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Button
        variant="text"
        onClick={handleEmail}
        aria-label="Contact Beacon owner"
        sx={{
          width: "50px",
          height: "30px",
          minWidth: "30px",
          minHeight: "30px",
          p: 0,

          color: config.ui.colors.primary,
          backgroundColor: "transparent",
          transition: "all 0.3s ease",

          "&:hover": {
            backgroundColor: "transparent",
          },

          "& .hoverIcon": {
            display: "none",
          },

          "&:hover .hoverIcon": {
            display: "inline-flex",
          },

          "&:hover .defaultIcon": {
            display: "none",
          },

          ...(compact && {
            "@media (max-width: 764px)": {
              width: "34px",
              height: "26px",
              minWidth: "26px",
              minHeight: "26px",

              "& .MuiSvgIcon-root": {
                fontSize: "18px",
              },
            },
          }),
        }}
      >
        <LocalPostOfficeRoundedIcon className="hoverIcon" />
        <LocalPostOfficeOutlinedIcon className="defaultIcon" />
      </Button>
    </Box>
  );
}
