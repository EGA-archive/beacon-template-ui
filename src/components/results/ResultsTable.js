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
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import InfoIcon from "@mui/icons-material/Info";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import config from "../../config/config.json";

import { useSelectedEntry } from "../context/SelectedEntryContext";
import { lighten } from "@mui/system";
import { useState } from "react";
import ResultsTableRow from "./ResultsTableRow";
const ResultsTableModal = lazy(() => import("./modal/ResultsTableModal"));

export default function ResultsTable() {
  const { resultData, beaconsInfo } = useSelectedEntry();
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedSubRow, setSelectedSubRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const selectedBgColor = lighten(config.ui.colors.primary, 0.9);

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
    let beacon = {};
    if (config.beaconType === "singleBeacon") {
      beacon = beaconsInfo[0];
    } else {
      beacon = beaconsInfo.find((item) => {
        const id = item.meta?.beaconId || item.id;
        return id === beaconId;
      });
    }

    const logo = beacon.response
      ? beacon.response?.organization?.logoUrl
      : beacon.organization?.logoUrl;
    return logo ?? null;
  };

  const findBeaconEmail = (beaconId) => {
    let beacon = {};
    if (config.beaconType === "singleBeacon") {
      beacon = beaconsInfo[0];
    } else {
      beacon = beaconsInfo.find((item) => {
        const id = item.meta?.beaconId || item.id;
        return id === beaconId;
      });
    }
    const email = beacon.response
      ? beacon.response?.organization?.contactUrl
      : beacon.organization?.contactUrl;
    return email ?? null;
  };

  const handleEmail = (email) => {
    window.location.href = `mailto:${email}`;
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
          <Table stickyHeader aria-label="Results table">
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
                        sx={{ fontWeight: "bold" }}
                        style={{ width: BEACON_NETWORK_COLUMNS[0].width }}
                      >
                        <Box
                          display="flex"
                          justifyContent="flex-start"
                          alignItems="center"
                          gap={1}
                        >
                          {item.info && (
                            <Tooltip title={getErrors(item.info)}>
                              <IconButton>
                                <ReportProblemIcon sx={{ color: "#FF8A8A" }} />
                              </IconButton>
                            </Tooltip>
                          )}
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
                            />
                          )}
                          <span>{item.beaconId ? item.beaconId : item.id}</span>
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{ fontWeight: "bold" }}
                        style={{ width: BEACON_NETWORK_COLUMNS[1].width }}
                      >
                        {item.exists ? "Production Beacon" : "Development"}
                      </TableCell>

                      <TableCell
                        sx={{ fontWeight: "bold" }}
                        style={{ width: BEACON_NETWORK_COLUMNS[2].width }}
                      >
                        {item.items.length > 0
                          ? `${item.items.length} Datasets`
                          : "-"}
                      </TableCell>

                      <TableCell
                        sx={{ fontWeight: "bold" }}
                        style={{ width: BEACON_NETWORK_COLUMNS[3].width }}
                      >
                        {item.totalResultsCount > 0
                          ? new Intl.NumberFormat(navigator.language).format(
                              item.totalResultsCount
                            )
                          : "-"}
                      </TableCell>

                      {config.beaconType === "singleBeacon" && (
                        <TableCell
                          style={{ width: BEACON_NETWORK_COLUMNS[3].width }}
                        >
                          {item.totalResultsCount > 0 ? (
                            <Button
                              variant="text"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(item);
                              }}
                              sx={{
                                textTransform: "none",
                                fontSize: "14px",
                                fontWeight: 400,
                                fontFamily: '"Open Sans", sans-serif',
                                color: "gray",
                                width: "50px",
                                height: "30px",
                                minWidth: "30px",
                                minHeight: "30px",
                                backgroundColor: "transparent",
                                padding: 0,
                                "&:hover": {
                                  color: config.ui.colors.primary,
                                },
                              }}
                            >
                              <CalendarViewMonthIcon />
                            </Button>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}

                      <TableCell
                        style={{
                          width: BEACON_NETWORK_COLUMNS[4].width,
                          align: BEACON_NETWORK_COLUMNS[4].align,
                        }}
                        align={BEACON_NETWORK_COLUMNS[4].align}
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
                                color: "gray",
                                width: "50px",
                                height: "30px",
                                minWidth: "30px",
                                minHeight: "30px",
                                padding: 0,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  color: config.ui.colors.primary,
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <MailOutlineIcon />
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
                          handleOpenModal={() => handleOpenModal(expandedRow)}
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
            subRow={selectedSubRow}
            handleRowClicked={handleRowClicked}
            open={modalOpen}
            onClose={() => handleCloseModal()}
          />
        </Suspense>
      )}
    </Box>
  );
}
