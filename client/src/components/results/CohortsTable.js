import React from "react";
import {
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
import { useSelectedEntry } from "../context/SelectedEntryContext";

export default function CohortsTable() {
  const { rawItems } = useSelectedEntry();
  const headerCellStyle = {
    backgroundColor: config.ui.colors.darkPrimary,
    fontWeight: 700,
    color: "white",
    transition: "background-color 0.3s ease",
  };
  const getGenderDistribution = (cohort) => {
    try {
      const genders =
        cohort?.collectionEvents?.[0]?.eventGenders?.distribution?.genders;
      if (!genders) return "-";

      const entries = Object.entries(genders);

      return (
        <span>
          {entries.map(([key, value], idx) => (
            <span key={key}>
              <strong>{key}</strong>: {value}
              {idx < entries.length - 1 && ", "}
            </span>
          ))}
        </span>
      );
    } catch {
      return "-";
    }
  };

  const getAgeRangeDistribution = (cohort) => {
    try {
      const ranges =
        cohort?.collectionEvents?.[0]?.eventAgeRange?.distribution?.ranges;
      if (!ranges) return "-";

      const keys = Object.keys(ranges);
      if (keys.length === 0) return "-";

      const numericRanges = keys.map((key) => {
        const parts = key.split("-");
        const min = parseInt(parts[0].replace(/\D/g, ""), 10);
        const maxPart = parts[1] || "";
        const max = maxPart.includes("+")
          ? `${maxPart}` // keep "+" as is
          : parseInt(maxPart.replace(/\D/g, ""), 10);
        return { min, max };
      });

      const minValue = Math.min(...numericRanges.map((r) => r.min));
      const last = numericRanges[numericRanges.length - 1].max;

      return `${minValue}–${last}`;
    } catch (error) {
      console.warn("getAgeRangeDistribution error:", error);
      return "-";
    }
  };

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
            {rawItems?.map((cohort, index) => (
              <TableRow
                key={index}
                sx={{
                  "&:hover": {
                    backgroundColor: lighten(config.ui.colors.darkPrimary, 0.9),
                  },
                  "& td": {
                    borderBottom: "1px solid rgba(224,224,224,1)",
                    py: 1.5,
                  },
                }}
              >
                <TableCell>
                  <strong>{cohort.id || "-"}</strong>
                </TableCell>
                <TableCell>{cohort.name || "-"}</TableCell>
                <TableCell>{cohort.cohortType || "-"}</TableCell>
                <TableCell>
                  <strong>{cohort.cohortSize || "-"}</strong>
                </TableCell>
                <TableCell>{getGenderDistribution(cohort)}</TableCell>
                <TableCell>{getAgeRangeDistribution(cohort)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
