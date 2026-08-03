import {
  BEACON_NETWORK_COLUMNS,
  BEACON_NETWORK_TABLET_COLUMN_WIDTHS,
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
import config from "../../config/runtimeConfig";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { useState, useEffect } from "react";
import ResultsTableRow from "./ResultsTableRow";
import CohortsTable from "./CohortsTable";
import DatasetsTable from "./DatasetsTable";
import { getBeaconAggregationInfo, getDatasetType } from "./utils/beaconType";
import useBeaconMetadata from "../../hooks/useBeaconMetaData";

const ResultsTableModal = lazy(() => import("./modal/ResultsTableModal"));
const COMPACT_RESULTS_TABLE_MAX_WIDTH = 764;

const compactResultsTableTextStyle = {
  [`@media (max-width: ${COMPACT_RESULTS_TABLE_MAX_WIDTH}px)`]: {
    "& .MuiTableCell-root": {
      fontSize: "12px",
      lineHeight: 1.2,
    },

    "& > thead > tr > th": {
      px: 1,
    },

    "& > tbody > tr > td:not([colspan])": {
      px: 1,
    },

    "& .MuiTableBody-root .MuiTypography-root": {
      fontSize: "12px",
      lineHeight: 1.2,
    },

    '& [data-cy="results-table-details-button"]': {
      fontSize: "10px",
      lineHeight: 1,
      minWidth: "60px",
      minHeight: "22px",
      height: "24px",
      px: 0.75,
      py: 0,
      borderRadius: "6px",
    },

    '& [data-cy="results-table-details-button"] .MuiButton-startIcon': {
      marginLeft: 0,
      marginRight: "3px",
    },

    '& [data-cy="results-table-details-button"] .MuiSvgIcon-root': {
      fontSize: "14px",
    },
  },
};

export default function ResultsTable() {
  const {
    resultData,
    beaconsInfo,
    selectedPathSegment: selectedEntryType,
    lastSearchedFilters,
    lastSearchedPathSegment,
  } = useSelectedEntry();

  // expandedRow and selectedSubRow have very similar logs.
  // expandedRow populates when the row is open (when the user clicks)
  // selectedSubRow populates when the user clicks to open the deatils
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedSubRow, setSelectedSubRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { envMap } = useBeaconMetadata();

  const headerCellStyle = {
    backgroundColor: config.ui.colors.primary,
    fontWeight: 700,
    color: "white",
    fontSize: "14px",
    lineHeight: 1.3,
    transition: "background-color 0.3s ease",
  };

  const hiddenOnTabletStyle = {
    display: {
      xs: "none",
      sm: "none",
      md: "none",
      lg: "table-cell",
    },
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
                  lineHeight: 1.4,

                  "@media (max-width: 764px)": {
                    fontSize: "10px",
                    lineHeight: 1.25,
                  },
                }}
              >
                ({formatEntryTypeLabel(lastSearchedPathSegment)})
              </Box>
            </Box>
          ),
        }
      : column
  );

  const getResponsiveColumnWidth = (column) => {
    if (config.beaconType === "singleBeacon") {
      return column.width;
    }

    return {
      xs: BEACON_NETWORK_TABLET_COLUMN_WIDTHS[column.id] || column.width,
      lg: column.width,
    };
  };

  const getColumnWidth = (columnId) =>
    tableColumns.find((column) => column.id === columnId)?.width;

  const getResponsiveColumnWidthById = (columnId) => {
    const column = tableColumns.find((column) => column.id === columnId);

    return column ? getResponsiveColumnWidth(column) : undefined;
  };

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

  const DATASET_STORAGE_PREFIX = "datasetDetailedTable_";
  const DATASET_CONTEXT_TTL = 24 * 60 * 60 * 1000;

  const removeExpiredDatasetContexts = () => {
    const now = Date.now();

    Object.keys(localStorage)
      .filter((key) => key.startsWith(DATASET_STORAGE_PREFIX))
      .forEach((key) => {
        try {
          const context = JSON.parse(localStorage.getItem(key));

          if (!context?.expiresAt || context.expiresAt <= now) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      });
  };

  const handleOpenModal = (subRow) => {
    const queryId = crypto.randomUUID();
    const storageKey = `${DATASET_STORAGE_PREFIX}${queryId}`;
    const selectedFilters = lastSearchedFilters || [];
    const contactEmail = findBeaconEmail(subRow.beaconId);

    const storedContext = {
      beaconId: subRow.beaconId,
      beaconName: subRow.beaconName,
      datasetId: subRow.datasetId,
      displayedCount: subRow.displayedCount,
      contactEmail,
      entryTypeId: lastSearchedPathSegment,
      selectedPathSegment: lastSearchedPathSegment,
      selectedFilters,
      appliedQuery: {
        entryType: lastSearchedPathSegment,
        filters: selectedFilters,
      },

      expiresAt: Date.now() + DATASET_CONTEXT_TTL,
    };

    removeExpiredDatasetContexts();

    try {
      localStorage.setItem(storageKey, JSON.stringify(storedContext));
    } catch (error) {
      console.error("Unable to store Dataset Detailed Table context:", error);
      return;
    }

    const params = new URLSearchParams({
      beaconId: subRow.beaconId,
      datasetId: subRow.datasetId,
      entryType: lastSearchedPathSegment,
      queryId,
    });

    let detailsWindow;
    let cleanupTimer;

    const cleanup = () => {
      window.removeEventListener("message", handleDetailsPageReady);
      window.clearTimeout(cleanupTimer);
    };

    const handleDetailsPageReady = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== detailsWindow) return;

      const message = event.data;

      if (
        message?.type !== "DATASET_DETAILED_TABLE_READY" ||
        message?.queryId !== queryId
      ) {
        return;
      }

      detailsWindow.postMessage(
        {
          type: "DATASET_DETAILED_TABLE_DATA",
          queryId,
          dataTable: Array.isArray(subRow.dataTable) ? subRow.dataTable : [],
        },
        window.location.origin
      );

      cleanup();
    };

    window.addEventListener("message", handleDetailsPageReady);

    detailsWindow = window.open(
      `/dataset-detailed-table?${params.toString()}`,
      "_blank"
    );

    if (!detailsWindow) {
      cleanup();
      console.error("The Dataset Detailed Table tab could not be opened.");
      return;
    }

    cleanupTimer = window.setTimeout(cleanup, 10000);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const getErrors = (data) => {
    return `error code: ${data.error.errorCode}; error message: ${data.error.errorMessage}`;
  };

  const findBeaconName = (beaconId) => {
    if (!beaconId || !Array.isArray(beaconsInfo)) {
      return null;
    }

    const beaconInfo = beaconsInfo.find(
      (beacon) =>
        beacon?.meta?.beaconId === beaconId || beacon?.response?.id === beaconId
    );

    return beaconInfo?.response?.name?.trim() || null;
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

  const getDisplayedDatasetCount = (item, dataset) => {
    if (typeof dataset.resultsCount === "number") {
      return dataset.resultsCount;
    }

    const total = item.totalResultsCount || 0;
    const datasets = item.items || [];

    if (total <= 100) {
      return dataset.results?.length || 0;
    }

    if (datasets.length === 1) {
      return total;
    }

    return dataset.results?.length || "-";
  };

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
              ...compactResultsTableTextStyle,
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
                      // width: column.width,
                      width: getResponsiveColumnWidth(column),
                      ...(column.id === "maturity" ||
                      column.id === "data_visibility"
                        ? hiddenOnTabletStyle
                        : {}),
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {resultData
                // This line filters out erroring beacons
                .filter((item) => item.exists === true && !item.info?.error)
                .flatMap((item, index) => {
                  const itemEmail = findBeaconEmail(item.beaconId);
                  const DATA_VISIBILITY_LABELS = {
                    boolean: "Presence only (boolean)",
                    count: "Count",
                    record: "Detailed records",
                  };

                  // SINGLE BEACON
                  // One row per dataset
                  if (config.beaconType === "singleBeacon") {
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

                    return safeItems.map((dataset, datasetIndex) => {
                      const displayedCount = getDisplayedDatasetCount(
                        item,
                        dataset
                      );
                      const actualLoadedCount = dataset.results?.length || 0;

                      const isRecord = dataset.type === "record";
                      const isCount = dataset.type === "count";
                      const isBoolean = dataset.type === "boolean";

                      const dataVisibilityValue =
                        DATA_VISIBILITY_LABELS[dataset.type] || "-";

                      const datasetId = dataset.dataset || dataset.id;
                      const beaconId =
                        item.beaconId || item.id || "singleBeacon";
                      const hasData = dataset.results?.length > 0;

                      return (
                        <TableRow
                          key={`${beaconId}-${datasetId || datasetIndex}`}
                          sx={{
                            fontWeight: "bold",
                            "&:hover": {
                              backgroundColor: alpha(
                                config.ui.colors.secondary,
                                0.4
                              ),
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
                              width:
                                getResponsiveColumnWidthById("beacon_dataset"),
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                backgroundColor: "gold",
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
                            sx={{ fontWeight: "bold" }}
                            style={{
                              width: getColumnWidth("data_visibility"),
                            }}
                          >
                            <Box component="strong">{dataVisibilityValue}</Box>
                          </TableCell>

                          {/* Search Results */}
                          {/* <TableCell
                            sx={{ fontWeight: "bold" }}
                            style={{
                              width: getColumnWidth("response"),
                            }}
                          > */}
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              width: getResponsiveColumnWidthById("response"),
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={3}>
                              <Box component="span">
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
                              </Box>

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
                                      onClick={(e) => {
                                        e.stopPropagation();

                                        if (!hasData) return;

                                        handleOpenModal({
                                          beaconId,
                                          datasetId,
                                          dataTable: dataset.results || [],
                                          displayedCount,
                                          actualLoadedCount,
                                          headers: dataset.headers || [],
                                        });
                                      }}
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
                              )}
                            </Box>
                          </TableCell>

                          {/* Contact */}
                          <TableCell
                            sx={{
                              width: getResponsiveColumnWidthById("contact"),
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
                      );
                    });
                  }

                  // NETWORK BEACON
                  const matchedBeaconInfo = beaconsInfo?.find((beacon) => {
                    const metadataBeaconId = beacon.meta?.beaconId || beacon.id;

                    return metadataBeaconId === item.beaconId;
                  });

                  const beaconName = findBeaconName(item.beaconId);

                  const { type: beaconType, datasetCount } =
                    getBeaconAggregationInfo(item);

                  const dataVisibilityValue =
                    DATA_VISIBILITY_LABELS[beaconType] || "-";

                  const datasetCountValue =
                    beaconType === "record" &&
                    datasetCount !== undefined &&
                    datasetCount !== null
                      ? datasetCount
                      : "-";

                  return (
                    <React.Fragment key={`network-${item.beaconId || index}`}>
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
                        {/* Beacon name, falling back to Beacon ID */}
                        <TableCell
                          data-cy="results-table-cell-id"
                          sx={{
                            backgroundColor: "gold",
                            fontWeight: "bold",
                            width:
                              getResponsiveColumnWidthById("beacon_dataset"),
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

                                "@media (max-width: 764px)": {
                                  width: "18px",
                                  minWidth: "18px",
                                  "& .MuiSvgIcon-root": {
                                    fontSize: "18px",
                                  },
                                },
                              }}
                            >
                              {item.items?.length > 0 &&
                                (item.beaconId || item.id) &&
                                (expandedRows[item.beaconId || item.id] ? (
                                  <KeyboardArrowDownIcon data-cy="results-row-collapse-icon" />
                                ) : (
                                  <KeyboardArrowRightRoundedIcon data-cy="results-row-expand-icon" />
                                ))}
                            </Box>

                            <span data-cy="results-table-id-value">
                              {beaconName ||
                                item.beaconId ||
                                item.id ||
                                "Unavailable"}
                            </span>
                          </Box>
                        </TableCell>

                        {/* Beacon Maturity */}
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            ...hiddenOnTabletStyle,
                          }}
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

                        {/* Data Visibility */}
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            ...hiddenOnTabletStyle,
                          }}
                          style={{
                            width: getColumnWidth("data_visibility"),
                          }}
                        >
                          <Box component="strong">{dataVisibilityValue}</Box>
                        </TableCell>

                        {/* nº of Datasets */}
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width:
                              getResponsiveColumnWidthById("datasets_count"),
                          }}
                        >
                          {datasetCountValue}
                        </TableCell>

                        {/* Search Results */}
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            width: getResponsiveColumnWidthById("response"),
                          }}
                        >
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
                                <ReportProblemIcon sx={{ color: "#FF8A8A" }} />
                              </Tooltip>
                            ))}

                          {beaconType === "count" &&
                            new Intl.NumberFormat(navigator.language).format(
                              item.totalResultsCount
                            )}

                          {beaconType === "record" &&
                            (item.totalResultsCount > 0
                              ? new Intl.NumberFormat(
                                  navigator.language
                                ).format(item.totalResultsCount)
                              : "-")}

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

                        {/* Contact */}
                        <TableCell
                          sx={{
                            width: getResponsiveColumnWidthById("contact"),
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

                                  "@media (max-width: 764px)": {
                                    width: "34px",
                                    height: "26px",
                                    minWidth: "26px",
                                    minHeight: "26px",

                                    "& .MuiSvgIcon-root": {
                                      fontSize: "18px",
                                    },
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
                          beaconName={beaconName}
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
