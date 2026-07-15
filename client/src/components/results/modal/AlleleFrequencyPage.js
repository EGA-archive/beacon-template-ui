import { Box, Typography } from "@mui/material";
import ResultsPageHeader from "../../results/modal/ResultsPageHeader";
import config from "../../../config/config.json";

const getAlleleFrequencyData = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const queryId = searchParams.get("queryId");

  if (!queryId) return null;

  const storedData = localStorage.getItem(`alleleFrequency_${queryId}`);

  if (!storedData) return null;

  try {
    return JSON.parse(storedData);
  } catch {
    return null;
  }
};

const getSelectedVariantLabel = (data) =>
  data?.identifiers?.genomicHGVSId || data?.variantId || "—";

export default function AlleleFrequencyPage() {
  const data = getAlleleFrequencyData();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "70vh",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
        p: 3,
      }}
    >
      {data && (
        <>
          <ResultsPageHeader
            pageTitle="Allele Frequency"
            beaconName={data.beaconName || data.beaconId}
            datasetName={data.datasetId}
            appliedQuery={data.appliedQuery}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Selected variant:
            </Typography>

            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                border: `1px solid ${config.ui.colors.darkPrimary}`,
                borderRadius: "8px",
                color: config.ui.colors.darkPrimary,
                fontFamily: "monospace",
                fontSize: "12px",
                overflowWrap: "anywhere",
              }}
            >
              {getSelectedVariantLabel(data)}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
