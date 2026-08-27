import { Box, Button, TableCell, TableRow, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";

import config from "../../../config/runtimeConfig";
import AlleleFrequenciesButton from "../modal/alleleFrequency/AlleleFrequenciesButton";
import { hasAlleleFrequencies } from "../modal/alleleFrequency/hasAlleleFrequencies";
import { getDatasetType } from "../utils/beaconType";
import { openAlleleFrequencyPage } from "../utils/openAlleleFrequencyPage";
import {
  DATA_VISIBILITY_LABELS,
  findBeaconEmail,
  findBeaconName,
  getDisplayedDatasetCount,
} from "../utils/resultsTableUtils";
import ResultsContactButton from "./ResultsContactButton";

/**
 * Renders dataset rows for a Single Beacon response.
 *
 * Each dataset can expose:
 * - its result count;
 * - detailed records;
 * - allele frequency results when available;
 * - the Beacon contact action.
 */
export default function SingleBeaconResultsRows({
  resultData,
  beaconsInfo,
  lastSearchedFilters,
  lastSearchedPathSegment,
  getResponsiveColumnWidthById,
  hiddenOnTabletStyle,
  onOpenDetails,
}) {
  const numberFormatter = new Intl.NumberFormat(navigator.language);

  return (
    <>
      {resultData.flatMap((item) => {
        const itemEmail = findBeaconEmail(
          beaconsInfo,
          item.beaconId,
          config.beaconType
        );

        // Normalize dataset responses before rendering them.
        const datasets = (item.items || []).map((dataset) => ({
          ...dataset,
          type: getDatasetType(dataset),
          results: Array.isArray(dataset.results) ? dataset.results : [],
          dataset: dataset.dataset ?? dataset.id ?? undefined,
          exists: dataset.exists ?? false,
        }));

        return datasets.map((dataset, datasetIndex) => {
          const displayedCount = getDisplayedDatasetCount(item, dataset);

          const isRecord = dataset.type === "record";
          const isCount = dataset.type === "count";
          const isBoolean = dataset.type === "boolean";

          const singleResult =
            isRecord && displayedCount === 1 && dataset.results.length === 1
              ? dataset.results[0]
              : null;

          const showAlleleFrequency =
            singleResult &&
            hasAlleleFrequencies(singleResult.frequencyInPopulations);

          const dataVisibility = DATA_VISIBILITY_LABELS[dataset.type] || "-";

          const datasetId = dataset.dataset || dataset.id;
          const beaconId = item.beaconId || item.id || "singleBeacon";

          const hasData = dataset.results.length > 0;

          const resultValue = isBoolean
            ? dataset.exists
              ? "Yes"
              : "No"
            : isCount
            ? numberFormatter.format(dataset.resultsCount)
            : displayedCount > 0
            ? numberFormatter.format(displayedCount)
            : "-";

          return (
            <TableRow
              key={`${beaconId}-${datasetId || datasetIndex}`}
              sx={{
                fontWeight: "bold",

                "&:hover": {
                  backgroundColor: alpha(config.ui.colors.secondary, 0.4),
                },

                "& td": {
                  borderBottom: "1px solid rgba(224, 224, 224, 1)",
                  py: 1.5,
                },
              }}
            >
              {/* Dataset */}
              <TableCell
                data-cy="results-table-cell-id"
                sx={{
                  fontWeight: "bold",
                  width: getResponsiveColumnWidthById("beacon_dataset"),
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    minWidth: 0,
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {datasetId || <i>Undefined</i>}
                </Box>
              </TableCell>

              {/* Data Visibility */}
              <TableCell
                sx={{
                  fontWeight: "bold",
                  ...hiddenOnTabletStyle,
                  width: getResponsiveColumnWidthById("data_visibility"),
                }}
              >
                <Box component="strong">{dataVisibility}</Box>
              </TableCell>

              {/* Search Results */}
              <TableCell
                sx={{
                  fontWeight: "bold",
                  width: getResponsiveColumnWidthById("response"),
                }}
              >
                <Box display="flex" alignItems="center" gap={3}>
                  <Box component="span">{resultValue}</Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {/* Dataset details */}
                    {isRecord && (
                      <Tooltip
                        title={
                          hasData
                            ? "View dataset details"
                            : "No details available (empty result)"
                        }
                        arrow
                      >
                        <span>
                          <Button
                            variant="outlined"
                            data-cy="results-table-details-button"
                            startIcon={<CalendarViewMonthIcon />}
                            disabled={!hasData}
                            onClick={(event) => {
                              event.stopPropagation();

                              if (!hasData) return;

                              onOpenDetails({
                                beaconId,
                                datasetId,
                                dataTable: dataset.results,
                                displayedCount,
                              });
                            }}
                            sx={{
                              textTransform: "none",
                              fontSize: "13px",
                              fontWeight: 400,
                              fontFamily: '"Open Sans", sans-serif',

                              color: hasData
                                ? config.ui.colors.darkPrimary
                                : "#999",

                              borderColor: hasData
                                ? config.ui.colors.darkPrimary
                                : "#ccc",

                              borderRadius: "8px",
                              px: 1.5,
                              py: 0.5,
                              minHeight: "28px",
                              minWidth: "84px",

                              "& .MuiButton-startIcon": {
                                marginRight: "6px",
                                color: hasData
                                  ? config.ui.colors.darkPrimary
                                  : "#bbb",
                              },

                              "&:hover": {
                                backgroundColor: hasData
                                  ? `${config.ui.colors.darkPrimary}10`
                                  : "transparent",
                              },
                            }}
                          >
                            Details
                          </Button>
                        </span>
                      </Tooltip>
                    )}

                    {/* Allele Frequency shortcut */}
                    {showAlleleFrequency && (
                      <Tooltip title="View allele frequency results" arrow>
                        <span>
                          <AlleleFrequenciesButton
                            iconOnly
                            onClick={(event) => {
                              event.stopPropagation();

                              openAlleleFrequencyPage({
                                item: singleResult,
                                beaconId,
                                beaconName: findBeaconName(
                                  beaconsInfo,
                                  beaconId
                                ),
                                datasetId,
                                entryTypeId: lastSearchedPathSegment,
                                appliedQuery: {
                                  entryType: lastSearchedPathSegment,
                                  filters: lastSearchedFilters || [],
                                },
                              });
                            }}
                          />
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </TableCell>

              {/* Contact */}
              <TableCell
                sx={{
                  width: getResponsiveColumnWidthById("contact"),
                }}
              >
                <ResultsContactButton email={itemEmail} />
              </TableCell>
            </TableRow>
          );
        });
      })}
    </>
  );
}
