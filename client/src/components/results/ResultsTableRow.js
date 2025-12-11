import React from "react";
import {
  Box,
  TableCell,
  TableContainer,
  TableRow,
  Table,
  TableBody,
  Typography,
  Button,
  Tooltip,
} from "@mui/material";
import { BEACON_NETWORK_COLUMNS_EXPANDED } from "../../lib/constants";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import config from "../../config/config.json";
import { lighten } from "@mui/system";
import { getDatasetType } from "./utils/beaconType";

// This component renders only for Beacon Networks
export default function ResultsTableRow({ item, handleOpenModal }) {
  const { setActualLoadedCount } = useSelectedEntry();

  // This function decides what number to render in the response column at a dataset level
  const getDisplayedCount = (item, dataset) => {
    // If the dataset shows resultsCount then we return it directly (resultsCount is not a mandatory field in Beacon v2)
    if (typeof dataset.resultsCount === "number") {
      return dataset.resultsCount;
    }

    // If the dataset does not have a resultsCount key
    // Then we calculate it by taking the beacon total and the array of all datasets for this beacon
    const total = item.totalResultsCount || 0;
    const datasets = item.items || [];

    // If the beacon’s total number of results is 100 or fewer
    // Show the actual number of results we received
    if (total <= 100) {
      return dataset.results?.length || 0;
    }

    // If the beacon has only one dataset
    // Show the beacon total number since it belongs 100% to that dataset
    if (datasets.length === 1) {
      return total;
    }

    // Fallback (inconsistent API)
    console.warn(
      `[ResultsTableRow] Missing resultsCount for dataset ${
        dataset.dataset || dataset.id
      }`
    );

    // If none of these cases are met, we show the number of results we received or "-"
    return dataset.results?.length || "-";
  };

  const datasetBgColor = lighten(config.ui.colors.primary, 0.9);

  // Prepare items to ensure structure is consistent
  const safeItems = (item.items || []).map((ds) => {
    const datasetType = getDatasetType(ds);

    return {
      ...ds,
      type: datasetType,
      results: Array.isArray(ds.results) ? ds.results : [],
      dataset: ds.dataset ?? ds.id ?? undefined,
      exists: ds.exists ?? false,
    };
  });

  return (
    <TableRow>
      <TableCell colSpan={6} sx={{ p: 0 }}>
        <Box sx={{ p: 0 }}>
          <TableContainer>
            <Table
              stickyHeader
              aria-label="Results table"
              sx={{ tableLayout: "fixed" }}
            >
              <TableBody
                sx={{
                  backgroundColor: datasetBgColor,
                }}
              >
                {safeItems.map((dataset, i) => {
                  const displayedCount = getDisplayedCount(item, dataset);
                  const actualLoadedCount = dataset.results?.length || 0;
                  setActualLoadedCount(actualLoadedCount);

                  // Direct semantic classification
                  const isRecord = dataset.type === "record";
                  const isCount = dataset.type === "count";
                  const isBoolean = dataset.type === "boolean";

                  return (
                    <TableRow key={i}>
                      {/* Dataset ID */}
                      <TableCell
                        style={{
                          width:
                            BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_name
                              .width,
                        }}
                      >
                        <Box sx={{ display: "flex", pl: 9 }}>
                          <Typography
                            sx={{
                              pl: 6.5,
                              whiteSpace: "normal",
                              wordWrap: "break-word",
                              maxWidth: {
                                xs: "250px",
                                sm: "350px",
                                md: "450px",
                                lg: "550px",
                                xl: "650px",
                              },
                            }}
                            variant="body2"
                          >
                            {dataset.dataset ? (
                              dataset.dataset
                            ) : (
                              <i>Undefined</i>
                            )}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Empty column 1 */}
                      <TableCell
                        style={{
                          width:
                            BEACON_NETWORK_COLUMNS_EXPANDED
                              .beacon_dataset_empty_one.width,
                        }}
                      />

                      {/* Empty column 2 */}
                      <TableCell
                        style={{
                          width:
                            BEACON_NETWORK_COLUMNS_EXPANDED
                              .beacon_dataset_empty_two.width,
                        }}
                      />

                      {/* Response (Boolean | Count | Record) + Details button for real datasets */}
                      <TableCell
                        style={{
                          width:
                            BEACON_NETWORK_COLUMNS_EXPANDED
                              .beacon_dataset_response.width,
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={3}>
                          <Typography variant="body2" fontWeight="bold">
                            {isBoolean
                              ? dataset.exists
                                ? "Yes"
                                : "No"
                              : isCount
                              ? new Intl.NumberFormat(
                                  navigator.language
                                ).format(dataset.resultsCount)
                              : displayedCount > 0
                              ? new Intl.NumberFormat(
                                  navigator.language
                                ).format(displayedCount)
                              : "-"}
                          </Typography>

                          {isRecord && (
                            <Tooltip
                              title={
                                dataset.results?.length > 0
                                  ? "View dataset details"
                                  : "No details available (empty result)"
                              }
                              arrow
                            >
                              <span>
                                <Button
                                  onClick={() =>
                                    handleOpenModal({
                                      beaconId: item.beaconId,
                                      datasetId: dataset.dataset,
                                      dataTable: dataset.results || [],
                                      displayedCount,
                                      actualLoadedCount,
                                    })
                                  }
                                  variant="outlined"
                                  startIcon={<CalendarViewMonthIcon />}
                                  disabled={
                                    !dataset.results ||
                                    dataset.results.length === 0
                                  }
                                  data-cy="results-table-details-button"
                                  sx={{
                                    textTransform: "none",
                                    fontSize: "13px",
                                    fontWeight: 400,
                                    fontFamily: '"Open Sans", sans-serif',
                                    color:
                                      !dataset.results ||
                                      dataset.results.length === 0
                                        ? "#999"
                                        : config.ui.colors.darkPrimary,
                                    borderColor:
                                      !dataset.results ||
                                      dataset.results.length === 0
                                        ? "#ccc"
                                        : config.ui.colors.darkPrimary,
                                    borderRadius: "8px",
                                    px: 1.5,
                                    py: 0.5,
                                    minHeight: "28px",
                                    minWidth: "84px",
                                    "& .MuiButton-startIcon": {
                                      marginRight: "6px",
                                      color:
                                        !dataset.results ||
                                        dataset.results.length === 0
                                          ? "#bbb"
                                          : config.ui.colors.darkPrimary,
                                    },
                                    "&:hover": {
                                      backgroundColor:
                                        !dataset.results ||
                                        dataset.results.length === 0
                                          ? "transparent"
                                          : `${config.ui.colors.darkPrimary}10`,
                                    },
                                  }}
                                >
                                  Details
                                </Button>
                              </span>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      {/* Empty */}
                      <TableCell
                        style={{
                          width:
                            BEACON_NETWORK_COLUMNS_EXPANDED.beacon_empty_three
                              .width,
                        }}
                      />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TableCell>
    </TableRow>
  );
}
