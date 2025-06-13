import React from 'react';
import {
  Box,
  TableCell,
  TableContainer,
  TableRow,
  Table,
  TableBody,
  Typography,
  Button
} from "@mui/material";
import { lighten } from "@mui/system";
import { BEACON_NETWORK_COLUMNS_EXPANDED } from '../../lib/constants';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import config from '../../config/config.json';

export default function ResultsTableRow({ item, handleOpenModal }) {
  const bgColor = lighten(config.ui.colors.primary, 0.95);

  return (
    <>
      <TableRow>
        <TableCell colSpan={6} sx={{
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ p: 0 }}>
            <TableContainer>
              <Table stickyHeader aria-label="Results table">
                <TableBody>
                  { item.items.map((dataset, i) => (
                    <React.Fragment key={i}>
                      <TableRow key={i}>
                        <TableCell style={{ width: BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset }}></TableCell>
                        <TableCell style={{ width: BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_name }}>
                          <Box sx={{ display: 'flex'}}>
                            <Typography sx={{ fontWeight: "bold" }} variant="body2">Dataset: </Typography>
                            <Typography sx={{ paddingLeft: '5px' }} variant="body2">{ dataset.dataset } </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold"  }}  style={{ width: BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_response }}>
                          { dataset.results.length > 0 ? dataset.results.length : '-' }
                        </TableCell>
                        <TableCell 
                          style={{ 
                            width: BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_detail.width,
                            paddingRight: '0px'
                          }}
                          align={ 
                            BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_detail.float 
                          }
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
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
}