import { Box, Typography } from "@mui/material";
import ResultsPageHeader from "../../modal/ResultsPageHeader";
import ResultsEmpty from "../../ResultsEmpty";
import AlleleFrequencyTable from "./AlleleFrequencyTable";
import { buildAlleleFrequencyRows } from "../../utils/buildAlleleFrequencyRows";
import config from "../../../../config/config.json";
import AlleleFrequencyChart from "./AlleleFrequencyChart";

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
  const alleleFrequencyRows = buildAlleleFrequencyRows(
    data?.frequencyInPopulations
  );

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

          {/* <Box
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
            {alleleFrequencyRows.length > 0 ? (
              <AlleleFrequencyTable rows={alleleFrequencyRows} />
            ) : (
              <ResultsEmpty message="No allele frequency data was found." />
            )}
          </Box> */}
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

          {alleleFrequencyRows.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  xl: "minmax(0, 1fr) minmax(0, 1.15fr)",
                },
                gap: 3,
                alignItems: "start",
              }}
            >
              <AlleleFrequencyChart rows={alleleFrequencyRows} />

              <AlleleFrequencyTable rows={alleleFrequencyRows} />
            </Box>
          ) : (
            <ResultsEmpty message="No allele frequency data was found." />
          )}
        </>
      )}
    </Box>
  );
}
