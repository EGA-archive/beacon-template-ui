import { useState } from "react";
import { Box, Typography } from "@mui/material";
import ResultsPageHeader from "../../modal/ResultsPageHeader";
import ResultsEmpty from "../../ResultsEmpty";
import AlleleFrequencyTable from "./AlleleFrequencyTable";
import AlleleFrequencyChart, {
  getAlleleFrequencyChartWidth,
} from "./AlleleFrequencyChart";
import { buildAlleleFrequencyRows } from "../../utils/buildAlleleFrequencyRows";
import config from "../../../../config/config.json";

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
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const alleleFrequencyRows = buildAlleleFrequencyRows(
    data?.frequencyInPopulations
  );

  // Check with Sara
  /**
   * When there are more than 14 populations, the chart and table
   * are always stacked to give the chart enough horizontal space.
   */
  const hasManyPopulations = alleleFrequencyRows.length > 14;

  /**
   * Give the chart enough width for its bars, Y-axis and margins.
   *
   * - Small charts remain compact.
   * - Medium charts receive more space.
   * - The chart is capped so the table still has enough room.
   */
  const chartColumnWidth = getAlleleFrequencyChartWidth(
    alleleFrequencyRows.length
  );

  const chartAndTableColumns = hasManyPopulations
    ? "1fr"
    : {
        xs: "1fr",
        lg: `${chartColumnWidth}px minmax(0, 1fr)`,
      };

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
      {data ? (
        <>
          <ResultsPageHeader
            pageTitle="Allele Frequency"
            beaconName={data.beaconName || data.beaconId}
            datasetName={data.datasetId}
            appliedQuery={data.appliedQuery}
            contactEmail={data.contactEmail}
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

          {alleleFrequencyRows.length > 0 ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: chartAndTableColumns,
                columnGap: 2,
                rowGap: 2,
                alignItems: "start",
                width: "100%",
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  minWidth: 0,
                  width: "100%",
                  justifySelf: "start",
                }}
              >
                <AlleleFrequencyChart
                  rows={alleleFrequencyRows}
                  highlightedRowId={highlightedRowId}
                  onHighlightRow={setHighlightedRowId}
                  hasManyPopulations={hasManyPopulations}
                />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                  width: "100%",
                  mt: hasManyPopulations
                    ? 0
                    : {
                        xs: 0,
                        lg: -1.5,
                      },
                }}
              >
                <AlleleFrequencyTable
                  rows={alleleFrequencyRows}
                  highlightedRowId={highlightedRowId}
                  onHighlightRow={setHighlightedRowId}
                />
              </Box>
            </Box>
          ) : (
            <ResultsEmpty message="No allele frequency data was found." />
          )}
        </>
      ) : (
        <ResultsEmpty message="The allele frequency data could not be loaded." />
      )}
    </Box>
  );
}
