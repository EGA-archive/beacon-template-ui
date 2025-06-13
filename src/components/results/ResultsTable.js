import { BEACON_NETWORK_COLUMNS, BEACON_SINGLE_COLUMNS } from '../../lib/constants';
import React, { lazy, Suspense } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import IconButton from '@mui/material/IconButton';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import Tooltip from '@mui/material/Tooltip';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import config from '../../config/config.json';
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { lighten } from "@mui/system";
import { useState } from 'react';
import ResultsTableRow from './ResultsTableRow';
const ResultsTableModal = lazy(() => import('./modal/ResultsTableModal'));


export default function ResultsTable() {
  const { resultData, beaconsInfo } = useSelectedEntry();
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedSubRow, setSelectedSubRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const bgColor = lighten(config.ui.colors.primary, 0.95);
  const headerCellStyle = {
    backgroundColor: config.ui.colors.primary,
    fontWeight: 700,
    color: "white"
  };

  const handleRowClick = (item) => {
    if(expandedRow && expandedRow.beaconId === item.beaconId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(item);
    }
  };

  let tableColumns = (config.beaconType === 'singleBeacon') ? BEACON_SINGLE_COLUMNS : BEACON_NETWORK_COLUMNS;

  const selectedBgColor = lighten(config.ui.colors.primary, 0.9);

  const handleRowClicked = (item) => {
    setSelectedSubRow(item);
  }

  const handleOpenModal = (subRow) => {
    setSelectedSubRow(subRow);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const getErrors = (data) => {
    return `error code: ${data.error.errorCode}; error message: ${data.error.errorMessage}`;
  }

  const findBeaconIcon = (beaconId) => {
    const beacon = beaconsInfo.find((item) => item.meta?.beaconId === beaconId);
    return beacon.response?.organization?.logoUrl ?? null;
  };

  const findBeaconEmail = (beaconId) => {
    const beacon = beaconsInfo.find((item) => item.meta?.beaconId === beaconId);
    return beacon.response?.organization?.contactUrl ?? null;
  }

  const handleEmail = (email) => {
    window.location.href = `mailto:${email}`;
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
          <Table stickyHeader aria-label="Results table">
            <TableHead>
              <TableRow>
                {tableColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ width: column.width }}
                    align={column.align}
                    sx={headerCellStyle}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              { resultData.map((item, index) => {
                const iconUrl = findBeaconIcon(item.beaconId);
                const itemEmail = findBeaconEmail(item.beaconId);

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      key={index}
                      hover
                      onClick={() => handleRowClick(item)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: selectedBgColor,
                        },
                        '&.MuiTableRow-root': {
                          transition: 'background-color 0.2s ease',
                        },
                        '& td': {
                          borderBottom: '1px solid rgba(224, 224, 224, 1)',
                          py: 1.5,
                        },
                        fontWeight: "bold" 
                      }}>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[0].width }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          { item.info &&
                            <Tooltip title={ getErrors(item.info) }>
                              <IconButton>
                                <ReportProblemIcon sx={{ color: '#FF8A8A' }} />
                              </IconButton>
                            </Tooltip>
                          }
                          { item.items.length>0 && item.beaconId && (
                              expandedRow && expandedRow.beaconId === item.beaconId ? (
                              <KeyboardArrowDownIcon />
                            ) : (
                              <KeyboardArrowUpIcon />
                            )
                          )}

                          {iconUrl && (
                            <img 
                              className="table-icon" 
                              src={iconUrl} 
                              alt="Beacon logo"
                            />
                          )}
                          { item.beaconId ? item.beaconId : item.id }
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[1].width }}>{item.exists ? "Production Beacon" : "Development"}</TableCell>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[2].width }}>{item.items.length>0 ?  item.items.length + " Datasets" : "-"}</TableCell>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[3].width }}>{item.totalResultsCount>0 ?  item.totalResultsCount : "-"}</TableCell>
                      { config.beaconType === 'singleBeacon' &&
                        <TableCell 
                          sx={{ fontWeight: "bold"  }} 
                          style={{ width: BEACON_NETWORK_COLUMNS[3].width }}
                          >
                            <Button 
                              variant="text"
                              onClick={ () => handleOpenModal(item) }
                              sx={{
                                textTransform: "none",
                                fontSize: "14px",
                                fontWeight: 400,
                                fontFamily: '"Open Sans", sans-serif',
                                backgroundColor: "white",
                                color: "gray",
                                width: "50px",
                                height: "30px",
                                minWidth: "30px",
                                minHeight: "30px",
                                padding: 0,
                                "&:hover": {
                                  color: config.ui.colors.primary,
                                  backgroundColor: bgColor
                                },
                              }}>
                              <CalendarViewMonthIcon />
                            </Button>
                        </TableCell>
                      }
                      <TableCell
                        style={{ 
                          width: BEACON_NETWORK_COLUMNS[4].width,
                          align: BEACON_NETWORK_COLUMNS[4].align,
                        }}
                        align={ 
                          BEACON_NETWORK_COLUMNS[4].align
                        }
                        >
                          { itemEmail && (
                            <Button 
                              variant="text"
                              onClick={ () => handleEmail(itemEmail)}
                              sx={{
                                textTransform: "none",
                                fontSize: "14px",
                                fontWeight: 400,
                                fontFamily: '"Open Sans", sans-serif',
                                backgroundColor: "white",
                                color: "gray",
                                width: "50px",
                                height: "30px",
                                minWidth: "30px",
                                minHeight: "30px",
                                padding: 0,
                                "&:hover": {
                                  color: config.ui.colors.primary,
                                  backgroundColor: bgColor
                                },
                              }}
                            >
                              <MailOutlineIcon />
                            </Button>
                          )}
                        </TableCell>
                    </TableRow>

                    {expandedRow && expandedRow.beaconId && expandedRow.beaconId === item.beaconId && (
                      <ResultsTableRow 
                        item={ expandedRow } 
                        handleRowClicked={ handleRowClicked }
                        handleOpenModal={ () => handleOpenModal(expandedRow) }
                      />
                    )}
                  </React.Fragment>
                  )
                })
              }
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {selectedSubRow && (
        <Suspense fallback={ <div>Loading...</div> }>
          <ResultsTableModal
            subRow={ selectedSubRow }
            handleRowClicked={ handleRowClicked }
            open={modalOpen}
            onClose={() => handleCloseModal()}
          />
        </Suspense>
      )}
    </Box>
  )
}