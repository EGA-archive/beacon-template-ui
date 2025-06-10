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
  TableRow,
  Button
} from "@mui/material";
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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
    console.log(subRow);
    setSelectedSubRow(subRow);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
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