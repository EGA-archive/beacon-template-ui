import { ButtonBase } from "@mui/material";
import alleleFrequenciesSvg from "../../../assets/logos/allele-frequencies.svg";

export default function AlleleFrequenciesButton({ onClick }) {
  return (
    <ButtonBase
      component="button"
      type="button"
      onClick={onClick}
      aria-label="View allele frequencies"
      sx={{
        display: "inline-flex",
        borderRadius: "8px",
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
    </ButtonBase>
  );
}
