import {
  BEACON_NETWORK_COLUMNS,
  BEACON_SINGLE_COLUMNS,
} from "../../lib/tableConstants";
import React, { lazy, Suspense } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import InfoIcon from "@mui/icons-material/Info";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import LocalPostOfficeRoundedIcon from "@mui/icons-material/LocalPostOfficeRounded";
import LocalPostOfficeOutlinedIcon from "@mui/icons-material/LocalPostOfficeOutlined";
import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { useState, useEffect } from "react";
import ResultsTableRow from "./ResultsTableRow";
import CohortsTable from "./CohortsTable";
import DatasetsTable from "./DatasetsTable";
import {
  getBeaconAggregationInfo,
  getDatasetResponse,
} from "./utils/beaconType";
import useBeaconMetadata from "../../hooks/useBeaconMetaData";

const ResultsTableModal = lazy(() => import("./modal/ResultsTableModal"));

export default function ResultsTable() {
  const {
    resultData,
    beaconsInfo,
    selectedPathSegment: selectedEntryType,
    lastSearchedFilters,
    lastSearchedPathSegment,
  } = useSelectedEntry();

  console.log("resultData", resultData);

  // expandedRow and selectedSubRow have very similar logs.
  // expandedRow populates when the row is open (when the user clicks)
  // selectedSubRow populates when the user clicks to open the deatils
  // const [expandedRow, setExpandedRow] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedSubRow, setSelectedSubRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { envMap } = useBeaconMetadata();

  const headerCellStyle = {
    backgroundColor: config.ui.colors.primary,
    fontWeight: 700,
    color: "white",
    transition: "background-color 0.3s ease",
  };

  const handleRowClick = (item) => {
    setExpandedRows((prev) => ({
      ...prev,
      [item.beaconId]: !prev[item.beaconId],
    }));
  };

  let tableColumns =
    config.beaconType === "singleBeacon"
      ? BEACON_SINGLE_COLUMNS
      : BEACON_NETWORK_COLUMNS;

  const formatEntryTypeLabel = (entryType) => {
    const labels = {
      g_variants: "Genomic Variations",
      individuals: "Individuals",
      biosamples: "Biosamples",
      analyses: "Analyses",
      cohorts: "Cohorts",
      datasets: "Datasets",
      runs: "Runs",
    };

    return labels[entryType] || entryType;
  };

  tableColumns = tableColumns.map((column) =>
    column.id === "response"
      ? {
          ...column,
          label: (
            <Box>
              <Box>Search Results</Box>

              <Box
                sx={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "12px",
                }}
              >
                ({formatEntryTypeLabel(lastSearchedPathSegment)})
              </Box>
            </Box>
          ),
        }
      : column
  );

  const getColumnWidth = (columnId) =>
    tableColumns.find((column) => column.id === columnId)?.width;

  useEffect(() => {
    const initialExpandedRows = {};

    resultData.forEach((item) => {
      if (item.items?.length > 0 && item.beaconId) {
        initialExpandedRows[item.beaconId] = true;
      }
    });

    setExpandedRows(initialExpandedRows);
  }, [resultData]);

  const handleRowClicked = (item) => {
    setSelectedSubRow(item);
  };

  const handleOpenModal = (subRow) => {
    const storageKey = `datasetDetailedTable_${subRow.beaconId}_${subRow.datasetId}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...subRow,

        entryTypeId: lastSearchedPathSegment,
        selectedPathSegment: lastSearchedPathSegment,
        selectedFilters: lastSearchedFilters,

        appliedQuery: {
          entryType: lastSearchedPathSegment,
          filters: lastSearchedFilters,
        },
      })
    );

    window.open(
      `/dataset-detailed-table?beaconId=${encodeURIComponent(
        subRow.beaconId
      )}&datasetId=${encodeURIComponent(subRow.datasetId)}`,
      "_blank"
    );
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const getErrors = (data) => {
    return `error code: ${data.error.errorCode}; error message: ${data.error.errorMessage}`;
  };

  const findBeaconIcon = (beaconId) => {
    if (!beaconsInfo || beaconsInfo.length === 0) return null;
    let beacon = {};
    if (config.beaconType === "singleBeacon") {
      beacon = beaconsInfo[0];
    } else {
      beacon = beaconsInfo.find((item) => {
        const id = item.meta?.beaconId || item.id;
        return id === beaconId;
      });
    }
    if (!beacon) return null;

    const logo = beacon.response
      ? beacon.response?.organization?.logoUrl
      : beacon.organization?.logoUrl;
    return logo ?? null;
  };

  const findBeaconEmail = (beaconId) => {
    if (!beaconsInfo || beaconsInfo.length === 0) return null;
    let beacon = {};
    if (config.beaconType === "singleBeacon") {
      beacon = beaconsInfo[0];
    } else {
      beacon = beaconsInfo.find((item) => {
        const id = item.meta?.beaconId || item.id;
        return id === beaconId;
      });
    }
    if (!beacon) return null;
    const email = beacon.response
      ? beacon.response?.organization?.contactUrl
      : beacon.organization?.contactUrl;
    return email ?? null;
  };

  const handleEmail = (email) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const getBeaconStatusLabel = (status) => {
    if (!status) return "Undefined";

    const normalized = status.toString().toUpperCase();

    if (normalized.includes("PROD")) return "Production";
    if (normalized.includes("TEST")) return "Test";
    if (normalized.includes("DEV")) return "Development";

    return status;
  };

  if (selectedEntryType === "cohorts" || selectedEntryType === "cohort") {
    return <CohortsTable />;
  }

  if (selectedEntryType === "datasets" || selectedEntryType === "dataset") {
    return <DatasetsTable />;
  }

  // console.log("item", item);

  return (
    <Box>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          boxShadow: "none",
          borderRadius: 0,
        }}
      >
        <TableContainer>
          <Table
            stickyHeader
            aria-label="Results table"
            data-cy="results-table"
            sx={{
              tableLayout: "fixed",
              width: "100%",
            }}
          >
            <TableHead>
              <TableRow>
                {tableColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{
                      ...headerCellStyle,
                      width: column.width,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {resultData

                // This lines of code filters out erroring out beacons
                .filter((item) => item.exists === true && !item.info?.error)

                .map((item, index) => {
                  console.log(item);
                  const itemEmail = findBeaconEmail(item.beaconId);

                  const { type: beaconType, datasetCount } =
                    getBeaconAggregationInfo(item);

                  const DATA_VISIBILITY_LABELS = {
                    boolean: "Presence only (boolean)",
                    count: "Count",
                    record: "Detailed records",
                  };

                  const dataVisibilityValue =
                    DATA_VISIBILITY_LABELS[beaconType] || "-";

                  const datasetCountValue =
                    beaconType === "record" &&
                    datasetCount !== undefined &&
                    datasetCount !== null
                      ? datasetCount
                      : "-";

                  return (
                    <React.Fragment key={index}>
                      <TableRow
                        onClick={() => {
                          if (item.items?.length > 0) {
                            handleRowClick(item);
                          }
                        }}
                        sx={{
                          fontWeight: "bold",
                          cursor:
                            item.items?.length > 0 ? "pointer" : "default",
                          "&:hover": {
                            backgroundColor: alpha(
                              config.ui.colors.secondary,
                              0.4
                            ),
                          },
                          "&.MuiTableRow-root": {
                            transition: "background-color 0.2s ease",
                          },
                          "& td": {
                            borderBottom: "1px solid rgba(224, 224, 224, 1)",
                            py: 1.5,
                          },
                        }}
                      >
                        {/* Beacon and Dataset name */}
                        <TableCell
                          data-cy="results-table-cell-id"
                          sx={{ fontWeight: "bold" }}
                          style={{
                            width: getColumnWidth("beacon_dataset"),
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="flex-start"
                            alignItems="center"
                            gap={1}
                          >
                            <Box
                              sx={{
                                width: "24px",
                                minWidth: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {item.items?.length > 0 &&
                                item.beaconId &&
                                (expandedRows[item.beaconId] ? (
                                  <KeyboardArrowDownIcon data-cy="results-row-collapse-icon" />
                                ) : (
                                  <KeyboardArrowRightRoundedIcon data-cy="results-row-expand-icon" />
                                ))}
                            </Box>

                            <span data-cy="results-table-id-value">
                              {item.beaconId || item.id || "Unavailable"}
                            </span>
                          </Box>
                        </TableCell>

                        {/* Beacon Maturity: ONLY for network beacons. This is skipped for Single Beacons */}
                        {config.beaconType === "networkBeacon" && (
                          <TableCell
                            sx={{ fontWeight: "bold" }}
                            style={{
                              width: getColumnWidth("maturity"),
                            }}
                          >
                            {(() => {
                              const status =
                                envMap[item.beaconId] || item.maturity;
                              return getBeaconStatusLabel(status);
                            })()}
                          </TableCell>
                        )}

                        {/* Data Visibility Column in the Network */}
                        {config.beaconType !== "singleBeacon" && (
                          <TableCell
                            sx={{ fontWeight: "bold" }}
                            style={{
                              width: getColumnWidth("data_visibility"),
                            }}
                          >
                            <Box component="strong">{dataVisibilityValue}</Box>
                          </TableCell>
                        )}

                        {/* N of Datasets Column in the Network */}
                        {config.beaconType !== "singleBeacon" && (
                          <TableCell
                            sx={{ fontWeight: "bold" }}
                            style={{
                              width: getColumnWidth("datasets_count"),
                            }}
                          >
                            {datasetCountValue}
                          </TableCell>
                        )}

                        {/* Response Column */}
                        <TableCell
                          sx={{ fontWeight: "bold" }}
                          style={{
                            width: getColumnWidth("response"),
                          }}
                        >
                          {/* Network Beacon logic to render correct values in the response */}
                          {config.beaconType === "networkBeacon" && (
                            <>
                              {beaconType === "boolean" &&
                                (item.exists ? (
                                  "Yes"
                                ) : (
                                  <Tooltip
                                    title={
                                      getErrors(item.info) ||
                                      "Beacon returned a negative response under HIT mode"
                                    }
                                  >
                                    <ReportProblemIcon
                                      sx={{ color: "#FF8A8A" }}
                                    />
                                  </Tooltip>
                                ))}

                              {beaconType === "count" &&
                                new Intl.NumberFormat(
                                  navigator.language
                                ).format(item.totalResultsCount)}

                              {beaconType === "record" &&
                                (item.totalResultsCount > 0
                                  ? new Intl.NumberFormat(
                                      navigator.language
                                    ).format(item.totalResultsCount)
                                  : "-")}
                            </>
                          )}

                          {/* Single Beacons logic to render correct values in the response */}
                          {config.beaconType === "singleBeacon" &&
                            (() => {
                              const responses = item.items.map((ds) =>
                                getDatasetResponse(ds)
                              );
                              const numericValues = responses.filter(
                                (r) => typeof r === "number"
                              );

                              if (numericValues.length > 0) {
                                const total = numericValues.reduce(
                                  (sum, n) => sum + n,
                                  0
                                );
                                return new Intl.NumberFormat(
                                  navigator.language
                                ).format(total);
                              }

                              return "Yes";
                            })()}

                          {/* Info icon same for both modes */}
                          {item.description && (
                            <Tooltip title={item.description || item.name}>
                              <IconButton>
                                <InfoIcon
                                  sx={{ color: config.ui.colors.primary }}
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>

                        {/* Details Table logic rendering for Single Beacons */}
                        {config.beaconType === "singleBeacon" && (
                          <TableCell
                            style={{
                              width: BEACON_NETWORK_COLUMNS[4].width,
                            }}
                          >
                            {(() => {
                              const dataset = item.items?.[0];

                              if (!dataset || !dataset.exists) {
                                return <i>Unavailable</i>;
                              }

                              const hasId = !!dataset.dataset || !!dataset.id;
                              const hasCount =
                                typeof dataset.resultsCount === "number" &&
                                !Number.isNaN(dataset.resultsCount);
                              const hasArray = Array.isArray(dataset.results);
                              const arrayLength = hasArray
                                ? dataset.results.length
                                : 0;
                              const hasData = arrayLength > 0;

                              // Scenario 1 — exists only
                              if (!hasId && !hasCount) {
                                return <i>Unavailable</i>;
                              }

                              // Scenario 2 — exists + id only (no count, no results array)
                              if (hasId && !hasCount && !hasArray) {
                                return <i>Unavailable</i>;
                              }

                              // Scenario 3 — exists + count ONLY (results array missing)
                              if (hasCount && !hasArray) {
                                return <i>Unavailable</i>;
                              }

                              // Scenario 4 — exists + count + empty results[]
                              const tooltipTitle = hasData
                                ? "View dataset details"
                                : "No details available (empty result)";

                              return (
                                <Tooltip title={tooltipTitle} arrow>
                                  <span>
                                    <Button
                                      onClick={() =>
                                        hasData &&
                                        handleOpenModal({
                                          beaconId: item.beaconId,
                                          datasetId:
                                            dataset.dataset || dataset.id,
                                          dataTable: dataset.results || [],
                                          displayedCount:
                                            item.totalResultsCount || 0,
                                          actualLoadedCount: arrayLength,
                                          headers: dataset.headers || [],
                                        })
                                      }
                                      variant="outlined"
                                      data-cy="results-table-details-button"
                                      startIcon={<CalendarViewMonthIcon />}
                                      disabled={!hasData}
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
                              );
                            })()}
                          </TableCell>
                        )}

                        {/* Contact Column
                        Present in both Single and Network Beacons */}
                        <TableCell
                          style={{
                            width: getColumnWidth("contact"),
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            {itemEmail && (
                              <Button
                                variant="text"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmail(itemEmail);
                                }}
                                sx={{
                                  textTransform: "none",
                                  fontSize: "14px",
                                  fontWeight: 400,
                                  fontFamily: '"Open Sans", sans-serif',
                                  color: config.ui.colors.primary,
                                  width: "50px",
                                  height: "30px",
                                  minWidth: "30px",
                                  minHeight: "30px",
                                  padding: 0,
                                  transition: "all 0.3s ease",
                                  backgroundColor: "transparent",
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
                                }}
                              >
                                <LocalPostOfficeRoundedIcon className="hoverIcon" />
                                <LocalPostOfficeOutlinedIcon className="defaultIcon" />
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                      {expandedRows[item.beaconId] && (
                        <ResultsTableRow
                          item={item}
                          handleRowClicked={handleRowClicked}
                          handleOpenModal={handleOpenModal}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {selectedSubRow && (
        <Suspense fallback={<div>Loading...</div>}>
          <ResultsTableModal
            key={`${selectedSubRow.beaconId}-${selectedSubRow.datasetId}`}
            open={modalOpen}
            subRow={selectedSubRow}
            onClose={handleCloseModal}
            beaconId={selectedSubRow?.beaconId}
            datasetId={selectedSubRow?.datasetId}
            dataTable={selectedSubRow?.dataTable || []}
            headers={selectedSubRow?.headers || []}
          />
        </Suspense>
      )}
    </Box>
  );
}
