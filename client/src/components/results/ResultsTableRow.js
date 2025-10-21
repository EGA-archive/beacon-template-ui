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
import config from "../../config/config.json";

export default function ResultsTableRow({ item, handleOpenModal }) {
  // console.log(item);
  return (
    <TableRow>
      <TableCell colSpan={5} sx={{ p: 0 }}>
        <Box sx={{ p: 0 }}>
          <TableContainer>
            <Table
              stickyHeader
              aria-label="Results table"
              sx={{ tableLayout: "fixed" }}
            >
              <TableBody>
                {item.items.map((dataset, i) => (
                  <TableRow key={i}>
                    {/* Dataset Name */}
                    <TableCell
                      style={{
                        width:
                          BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_name
                            .width,
                      }}
                    >
                      <Box sx={{ display: "flex", pl: 9 }}>
                        <Typography sx={{ fontWeight: "bold" }} variant="body2">
                          Dataset:
                        </Typography>
                        <Typography sx={{ pl: 1 }} variant="body2">
                          {dataset.dataset}
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

                    {/* Response + Details */}
                    <TableCell
                      // sx={{
                      //   backgroundColor: {
                      //     lg: "seashell",
                      //     md: "steelblue",
                      //     sm: "lightgreen",
                      //     xs: "lightblue",
                      //   },
                      // }}
                      style={{
                        width:
                          BEACON_NETWORK_COLUMNS_EXPANDED
                            .beacon_dataset_response.width,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={3}>
                        <Typography variant="body2" fontWeight="bold">
                          {dataset.results.length > 0
                            ? dataset.results.length
                            : "---"}
                        </Typography>

                        <Tooltip title="View dataset details" arrow>
                          <Button
                            onClick={() => handleOpenModal(item)}
                            variant="outlined"
                            startIcon={<CalendarViewMonthIcon />}
                            sx={{
                              textTransform: "none",
                              fontSize: "13px",
                              fontWeight: 400,
                              fontFamily: '"Open Sans", sans-serif',
                              color: config.ui.colors.darkPrimary,
                              borderColor: config.ui.colors.darkPrimary,
                              borderRadius: "8px",
                              px: 1.5,
                              py: 0.5,
                              minHeight: "28px",
                              minWidth: "84px",
                              "& .MuiButton-startIcon": {
                                marginRight: "6px",
                              },
                              "&:hover": {
                                backgroundColor: `${config.ui.colors.darkPrimary}10`,
                              },
                            }}
                          >
                            Details
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    {/* Dataset Detail Icon (Optional/Filler) */}
                    <TableCell
                      style={{
                        width:
                          BEACON_NETWORK_COLUMNS_EXPANDED.beacon_dataset_detail
                            .width,
                      }}
                    />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TableCell>
    </TableRow>
  );
}
