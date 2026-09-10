import { Box, ButtonBase, Typography } from "@mui/material";
import alleleFrequenciesSvg from "../../../../assets/logos/allele-frequencies.svg";

export default function AlleleFrequenciesButton({ onClick, iconOnly = false }) {
  return (
    <ButtonBase
      component="button"
      type="button"
      onClick={onClick}
      data-cy={iconOnly ? "results-table-af-button" : undefined}
      aria-label="View allele frequencies"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: iconOnly ? "6px" : 0,

        width: iconOnly ? "64px" : "158px",
        height: "32px",
        minWidth: iconOnly ? "64px" : "158px",

        border: iconOnly ? "1px solid #023452" : "none",
        borderRadius: "8px",
        overflow: "hidden",

        transition: "background-color 0.2s ease",

        "&:hover": {
          backgroundColor: "rgba(2, 52, 82, 0.08)",
        },

        "&:focus-visible": {
          outline: "2px solid #023452",
          outlineOffset: "2px",
        },
      }}
    >
      {iconOnly ? (
        <>
          <Box
            className="af-icon"
            sx={{
              width: "20px",
              height: "20px",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <img
              src={alleleFrequenciesSvg}
              alt=""
              width="158"
              height="30"
              style={{
                position: "absolute",
                maxWidth: "none",
                top: "-5px",
                left: "-8px",
                pointerEvents: "none",
              }}
            />
          </Box>

          <Typography
            component="span"
            className="af-label"
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: 1,
              color: "#023452",
            }}
          >
            AF
          </Typography>
        </>
      ) : (
        <img
          src={alleleFrequenciesSvg}
          alt=""
          width="158"
          height="28"
          style={{
            display: "block",
            pointerEvents: "none",
          }}
        />
      )}
    </ButtonBase>
  );
}
