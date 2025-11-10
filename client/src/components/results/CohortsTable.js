import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { lighten } from "@mui/system";
import config from "../../config/config.json";
import { COHORTS_TABLE } from "../../lib/constants";

export default function CohortsTable({ resultData = [] }) {
  const headerCellStyle = {
    backgroundColor: config.ui.colors.primary,
    fontWeight: 700,
    color: "white",
    transition: "background-color 0.3s ease",
    "&:hover": { backgroundColor: lighten(config.ui.colors.primary, 0.1) },
  };

  console.log("resultData", resultData);
  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        boxShadow: "none",
        borderRadius: 0,
      }}
    >
      <TableContainer>
        <Table stickyHeader aria-label="Cohorts results table">
          <TableHead>
            <TableRow>
              {COHORTS_TABLE.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{ ...headerCellStyle, width: column.width }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {resultData.map((cohort, index) => (
              <TableRow
                key={index}
                sx={{
                  "&:hover": {
                    backgroundColor: lighten(config.ui.colors.primary, 0.9),
                  },
                  "& td": {
                    borderBottom: "1px solid rgba(224,224,224,1)",
                    py: 1.5,
                  },
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" ml={4}>
                    {cohort.cohort_id || "-"}
                  </Box>
                </TableCell>
                <TableCell>{cohort.cohort_name || "-"}</TableCell>
                <TableCell>{cohort.cohort_type || "-"}</TableCell>
                <TableCell>{cohort.cohort_size || "-"}</TableCell>
                <TableCell>{cohort.cohort_gender || "-"}</TableCell>
                <TableCell>{cohort.cohort_age_range || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
