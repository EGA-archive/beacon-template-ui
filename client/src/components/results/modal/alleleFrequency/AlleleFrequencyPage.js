import { useState } from "react";
import { Box, Typography } from "@mui/material";

import Loader from "../../../common/Loader";
import ResultsPageHeader from "../../modal/ResultsPageHeader";
import ResultsEmpty from "../../ResultsEmpty";

import AlleleFrequencyTable from "./AlleleFrequencyTable";
import AlleleFrequencyChart, {
  getAlleleFrequencyChartWidth,
} from "./AlleleFrequencyChart";

import { buildAlleleFrequencyRows } from "../../utils/buildAlleleFrequencyRows";
import { useAlleleFrequencyContext } from "../../hooks/useAlleleFrequencyContext";
import { useAlleleFrequencyFallback } from "../../hooks/useAlleleFrequencyFallback";

import config from "../../../../config/runtimeConfig";

/**
 * Returns the clearest available identifier for the selected variant.
 *
 * Locally stored data uses variantId.
 * Fresh Beacon records normally use id.
 */
const getSelectedVariantLabel = (data, genomicHGVSId, variantId) =>
  data?.identifiers?.genomicHGVSId ||
  data?.variantId ||
  data?.id ||
  genomicHGVSId ||
  variantId ||
  "—";

export default function AlleleFrequencyPage() {
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  /**
   * Read the AF context.
   *
   * When the page was opened in the same browser, storedData contains
   * the complete selected variant.
   *
   * For a shared/direct URL, the remaining values are reconstructed
   * from the URL and used for the authenticated fallback request.
   */
  const {
    storedData,
    beaconId,
    datasetId,
    entryTypeId,
    selectedFilters,
    appliedQuery,
    variantId,
    genomicHGVSId,
    contactEmail,
  } = useAlleleFrequencyContext();

  /**
   * Start with locally stored data when available.
   *
   * A shared URL has no matching localStorage entry, so its data
   * will be populated by the fresh Beacon request instead.
   */
  const [data, setData] = useState(storedData);
  const [loading, setLoading] = useState(!storedData);
  const [fetchError, setFetchError] = useState("");

  const shouldFetch = !storedData;

  /**
   * Refetch the selected variant when it cannot be recovered
   * from this browser's localStorage.
   *
   * The request uses the current user's Bearer token, allowing
   * the Beacon to make the authorization decision.
   */
  useAlleleFrequencyFallback({
    shouldFetch,
    entryTypeId,
    selectedFilters,
    beaconId,
    datasetId,
    variantId,
    genomicHGVSId,
    setData,
    setLoading,
    setError: setFetchError,
  });

  const alleleFrequencyRows = buildAlleleFrequencyRows(
    data?.frequencyInPopulations
  );

  /**
   * When there are more than 14 populations, the chart and table
   * are always stacked to give the chart enough horizontal space.
   */
  const hasManyPopulations = alleleFrequencyRows.length > 14;

  /**
   * Give the chart enough width for its bars, Y-axis and margins.
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
        mt: 2,
        mb: 3,
      }}
    >
      <ResultsPageHeader
        pageTitle="Allele Frequency"
        beaconName={storedData?.beaconName || beaconId}
        datasetName={datasetId}
        appliedQuery={appliedQuery}
        contactEmail={contactEmail}
      />

      {/* Selected variant can also be reconstructed from the URL. */}
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
          {getSelectedVariantLabel(data, genomicHGVSId, variantId)}
        </Box>
      </Box>

      {/* Shared/direct URL is fetching the variant again. */}
      {loading && <Loader message="Loading allele frequency data..." />}

      {/* Backend denied access or the fallback request failed. */}
      {!loading && fetchError && <ResultsEmpty message={fetchError} />}

      {/* Data is ready. */}
      {!loading &&
        !fetchError &&
        data &&
        (alleleFrequencyRows.length > 0 ? (
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
        ))}

      {/* No local data and no successful fallback result. */}
      {!loading && !fetchError && !data && (
        <ResultsEmpty message="The allele frequency data could not be loaded." />
      )}
    </Box>
  );
}
