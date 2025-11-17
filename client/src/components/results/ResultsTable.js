import {
  BEACON_NETWORK_COLUMNS,
  BEACON_SINGLE_COLUMNS,
} from "../../lib/constants";
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
  Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import InfoIcon from "@mui/icons-material/Info";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { lighten } from "@mui/system";
import { useState, useEffect } from "react";
import ResultsTableRow from "./ResultsTableRow";
import { loadNetworkMembersWithMaturity } from "./utils/networkMembers";
import CohortsTable from "./CohortsTable";
import DatasetsTable from "./DatasetsTable";
import { getBeaconAggregationInfo, getDatasetType } from "./utils/beaconType";

const ResultsTableModal = lazy(() => import("./modal/ResultsTableModal"));

export default function ResultsTable() {
  const {
    resultData,
    beaconsInfo,
    entryTypesConfig,
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
    "&:hover": {
      backgroundColor: lighten(config.ui.colors.primary, 0.1),
    },
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
              {resultData.map((item, index) => {
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
                      onClick={() => handleRowClick(item)}
                      sx={{
                        fontWeight: "bold",
                        cursor: "pointer",
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
                              <KeyboardArrowDownIcon />
                            ) : (
                              <KeyboardArrowUpIcon />
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
                            {item.beaconId ? item.beaconId : item.id}
                          </span>
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold" }}
                        style={{
                          width:
                            config.beaconType === "singleBeacon"
                              ? BEACON_SINGLE_COLUMNS[1].width
                              : BEACON_NETWORK_COLUMNS[1].width,
                        }}
                      >
                        {(() => {
                          const status =
                            config.beaconType === "singleBeacon"
                              ? entryTypesConfig?.maturityAttributes
                                  ?.productionStatus
                              : item.maturity || (item.exists ? "PROD" : "DEV");
                          return getBeaconStatusLabel(status);
                        })()}
                      </TableCell>

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

                      <TableCell
                        sx={{ fontWeight: "bold" }}
                        style={{
                          width: BEACON_NETWORK_COLUMNS.find(
                            (c) => c.id === "response"
                          )?.width,
                        }}
                      >
                        {beaconType === "boolean" &&
                          (item.exists ? (
                            "Yes"
                          ) : (
                            <Tooltip
                              title={
                                getErrors(item.info) ||
                                "Beacon responded No under HIT mode"
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
                            ? new Intl.NumberFormat(navigator.language).format(
                                item.totalResultsCount
                              )
                            : "-")}

                        {item.description && (
                          <Tooltip
                            title={
                              item.description ? item.description : item.name
                            }
                          >
                            <IconButton>
                              <InfoIcon
                                sx={{ color: config.ui.colors.primary }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>

                      {/* {config.beaconType === "singleBeacon" && (
                        <TableCell
                          style={{
                            width: BEACON_NETWORK_COLUMNS[4].width,
                          }}
                        >
                          {(() => {
                            const dataset = item.items?.[0];
                            if (!dataset) return <i>Unavailable jjgjjgj </i>;

                            // CASE 1: COUNT → Unavailable
                            if (dataset.responseType === "Count") {
                              return <i>Unavailable jfdjfdshj</i>;
                            }

                            // CASE 2: RECORD → with or without data
                            if (dataset.responseType === "Record") {
                              const hasData =
                                dataset.results && dataset.results.length > 0;

                              return (
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
                                      onClick={() =>
                                        hasData &&
                                        handleOpenModal({
                                          beaconId: item.beaconId,
                                          datasetId:
                                            dataset.dataset || dataset.id,
                                          dataTable: dataset.results || [],
                                          displayedCount:
                                            item.totalResultsCount || 0,
                                          actualLoadedCount:
                                            dataset.results?.length || 0,
                                          headers: dataset.headers || [],
                                        })
                                      }
                                      variant="outlined"
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
                            }

                            // CASE 3: BOOLEAN or other → Unavailable
                            return <i>Unavailabdndnsdnnsle</i>;
                          })()}
                        </TableCell>
                      )} */}

                      {config.beaconType === "singleBeacon" && (
                        <TableCell
                          style={{
                            width: BEACON_NETWORK_COLUMNS[4].width,
                          }}
                        >
                          {(() => {
                            const dataset = item.items?.[0];
                            if (!dataset) return <i>Unavailable</i>;

                            const datasetType = getDatasetType(dataset);
                            const hasData =
                              Array.isArray(dataset.results) &&
                              dataset.results.length > 0;

                            if (datasetType === "count") {
                              return <i>Unavailable</i>;
                            }

                            if (datasetType === "boolean") {
                              return <i>Unavailable</i>;
                            }

                            if (datasetType === "record") {
                              return (
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
                                      onClick={() =>
                                        hasData &&
                                        handleOpenModal({
                                          beaconId: item.beaconId,
                                          datasetId:
                                            dataset.dataset || dataset.id,
                                          dataTable: dataset.results || [],
                                          displayedCount:
                                            item.totalResultsCount || 0,
                                          actualLoadedCount:
                                            dataset.results?.length || 0,
                                          headers: dataset.headers || [],
                                        })
                                      }
                                      variant="outlined"
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
                            }

                            // Fallback
                            return <i>Unavailable</i>;
                          })()}
                        </TableCell>
                      )}

                      <TableCell
                        style={{
                          width: BEACON_NETWORK_COLUMNS.find(
                            (c) => c.id === "contact"
                          )?.width,
                        }}
                      >
                        {itemEmail && (
                          <Tooltip title="Contact this beacon" arrow>
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
                                color: config.ui.colors.darkPrimary,
                                width: "50px",
                                height: "30px",
                                minWidth: "30px",
                                minHeight: "30px",
                                padding: 0,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  color: config.ui.colors.primary,
                                },
                              }}
                            >
                              <MailOutlineRoundedIcon />
                            </Button>
                          </Tooltip>
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
