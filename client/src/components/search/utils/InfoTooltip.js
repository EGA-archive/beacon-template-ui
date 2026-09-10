import { Box, Tooltip } from "@mui/material";
import config from "../../../config/runtimeConfig";

export default function InfoTooltip({ children, testId = "info-tooltip" }) {
  return (
    <Tooltip
      title={children}
      placement="top-start"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            py: 1,
            backgroundColor: "#fff",
            color: "#000",
            border: "1px solid black",
            minWidth: {
              xs: "361px",
              sm: "400px",
            },
          },
        },
        arrow: {
          sx: {
            color: "#fff",
            "&::before": {
              border: "1px solid black",
            },
          },
        },
      }}
    >
      <Box
        component="span"
        data-testid={testId}
        sx={{
          cursor: "pointer",
          width: "20px",
          height: "20px",
          borderRadius: "30px",
          backgroundColor: config.ui.colors.primary,
          color: "white",
          textAlign: "center",
          fontSize: "14px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        i
      </Box>
    </Tooltip>
  );
}
