import { BEACON_NETWORK_COLUMNS } from '../../lib/constants';
import React, { lazy, Suspense } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import IconButton from '@mui/material/IconButton';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import Tooltip from '@mui/material/Tooltip';
import MailIcon from "../../assets/logos/mail.png";
import config from '../../config/config.json';
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { lighten } from "@mui/system";
import { useState } from 'react';
import ResultsTableRow from './ResultsTableRow';
const ResultsTableModal = lazy(() => import('./modal/ResultsTableModal'));


export default function ResultsTable() {
  const { resultData } = useSelectedEntry();
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedSubRow, setSelectedSubRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
  console.log(resultData);


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
                {BEACON_NETWORK_COLUMNS.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ width: column.width }}
                    sx={headerCellStyle}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              { resultData.map((item, index) => (
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
                        { item.beaconId ? item.beaconId : item.id }
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[1].width }}>{item.exists ? "Production Beacon" : "Development"}</TableCell>
                    <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[2].width }}>{item.items.length>0 ?  item.items.length + " Datasets" : "-"}</TableCell>
                    <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[3].width }}>{item.totalResultsCount>0 ?  item.totalResultsCount : "-"}</TableCell>
                    <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[4].width }}>
                      
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold"  }} style={{ width: BEACON_NETWORK_COLUMNS[5].width }}>
                      <img
                        src={MailIcon}
                        alt="Contact"
                        style={{
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer'
                        }}
                        />
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
              ))}
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