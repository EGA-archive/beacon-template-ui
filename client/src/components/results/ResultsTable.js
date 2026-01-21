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
import { loadNetworkMembersWithMaturity } from "./utils/networkMembers";
import CohortsTable from "./CohortsTable";
import DatasetsTable from "./DatasetsTable";
import {
  getBeaconAggregationInfo,
  getDatasetResponse,
} from "./utils/beaconType";

const ResultsTableModal = lazy(() => import("./modal/ResultsTableModal"));

export default function ResultsTable() {
  const {
    resultData,
    beaconsInfo,
    selectedPathSegment: selectedEntryType,
  } = useSelectedEntry();

  // expandedRow and selectedSubRow have very similar logs.
  // expandedRow populates when the row is open (when the user clicks)
  // selectedSubRow populates when the user clicks to open the deatils
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedSubRow, setSelectedSubRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [networkMembers, setNetworkMembers] = useState([]);

  const headerCellStyle = {
    backgroundColor: config.ui.colors.primary,
    fontWeight: 700,
    color: "white",
    transition: "background-color 0.3s ease",
  };

  const handleRowClick = (item) => {
    if (expandedRow && expandedRow.beaconId === item.beaconId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(item);
    }
  };

  let tableColumns =
    config.beaconType === "singleBeacon"
      ? BEACON_SINGLE_COLUMNS
      : BEACON_NETWORK_COLUMNS;

  const selectedBgColor = (theme) => theme.palette.grey[100];

  const handleRowClicked = (item) => {
    setSelectedSubRow(item);
  };

  const handleOpenModal = (subRow) => {
    setSelectedSubRow(subRow);
    setModalOpen(true);
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
    window.location.href = `mailto:${email}`;
  };

  useEffect(() => {
    async function loadMembers() {
      const membersWithMaturity = await loadNetworkMembersWithMaturity();
      setNetworkMembers(membersWithMaturity);
    }
    if (config.beaconType === "networkBeacon") {
      loadMembers();
    }
  }, []);

  const getBeaconStatusLabel = (status) => {
    if (!status) return "Undefined";
    const normalized = status.toUpperCase();
    if (normalized === "PROD") return "Production";
    if (normalized === "TEST") return "Test";
    if (normalized === "DEV") return "Development";
    return status;
  };

  if (selectedEntryType === "cohorts" || selectedEntryType === "cohort") {
    return <CohortsTable />;
  }

  if (selectedEntryType === "datasets" || selectedEntryType === "dataset") {
    return <DatasetsTable />;
  }

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
                  const iconUrl = findBeaconIcon(item.beaconId);
                  const itemEmail = findBeaconEmail(item.beaconId);

                  const { type: beaconType, datasetCount } =
                    getBeaconAggregationInfo(item);

                  let displayValue;

                  if (beaconType === "record") {
                    displayValue = datasetCount;
                  } else if (beaconType === "count") {
                    displayValue = <i>Count Beacon</i>;
                  } else {
                    displayValue = <i>Boolean Beacon</i>;
                  }

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
                          "&:hover": { backgroundColor: selectedBgColor },
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
                            width: BEACON_NETWORK_COLUMNS[0].width,
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="flex-start"
                            alignItems="center"
                            gap={1}
                          >
                            {item.items.length > 0 &&
                              item.beaconId &&
                              (expandedRow &&
                              expandedRow.beaconId === item.beaconId ? (
                                <KeyboardArrowDownIcon data-cy="results-row-collapse-icon" />
                              ) : (
                                <KeyboardArrowRightRoundedIcon data-cy="results-row-expand-icon" />
                              ))}

                            {iconUrl && (
                              <img
                                className="table-icon"
                                src={iconUrl}
                                alt="Beacon logo"
                                onError={(e) => {
                                  const fallbackId =
                                    item.beaconId || item.id || "unknown";
                                  console.warn(
                                    `[ResultsTable] Broken logo for beacon: ${fallbackId}`
                                  );
                                  e.target.style.display = "none";
                                }}
                              />
                            )}

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
                              width: BEACON_NETWORK_COLUMNS[1].width,
                            }}
                          >
                            {(() => {
                              const status =
                                item.maturity || (item.exists ? "PROD" : "DEV");
                              return getBeaconStatusLabel(status);
                            })()}
                          </TableCell>
                        )}

                        {/* N of Datasets Column in the Network */}
                        {config.beaconType !== "singleBeacon" && (
                          <TableCell
                            sx={{ fontWeight: "bold" }}
                            style={{
                              width: BEACON_NETWORK_COLUMNS.find(
                                (c) => c.id === "datasets_count"
                              )?.width,
                            }}
                          >
                            {displayValue}
                          </TableCell>
                        )}

                        {/* Response Column */}
                        <TableCell
                          sx={{ fontWeight: "bold" }}
                          style={{
                            width: BEACON_NETWORK_COLUMNS.find(
                              (c) => c.id === "response"
                            )?.width,
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

                        {/* Contact */}
                        <TableCell
                          style={{
                            width: BEACON_NETWORK_COLUMNS.find(
                              (c) => c.id === "contact"
                            )?.width,
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
                                backgroundColor: "transparent",
                                color: config.ui.colors.primary,
                                width: "50px",
                                height: "30px",
                                minWidth: "30px",
                                minHeight: "30px",
                                padding: 0,
                                transition: "all 0.3s ease",
                                backgroundColor: "transparent",
                                "&:hover": { backgroundColor: "transparent" },
                                "& .hoverIcon": { display: "none" },
                                "&:hover .hoverIcon": {
                                  display: "inline-flex",
                                },
                                "&:hover .defaultIcon": { display: "none" },
                              }}
                            >
                              <LocalPostOfficeRoundedIcon className="hoverIcon" />
                              <LocalPostOfficeOutlinedIcon className="defaultIcon" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRow &&
                        expandedRow.beaconId &&
                        expandedRow.beaconId === item.beaconId && (
                          <ResultsTableRow
                            item={expandedRow}
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
