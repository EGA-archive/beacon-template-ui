import { useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  formatAlleleFrequency,
  formatCount,
} from "../../utils/alleleFrequencyUtils";

import TableToolbarControls from "../../table/TableToolbarControls";
import { downloadCsvFile } from "../../utils/downloadCsvFile";
import ResultsEmpty from "../../ResultsEmpty";

import config from "../../../../config/config.json";

const primaryDarkColor = config.ui.colors.darkPrimary;

/**
 * Displays allele-frequency information for each population.
 *
 * The available columns come from the data returned by the Beacon.
 *
 * The toolbar allows the user to:
 * - select which columns are visible;
 * - search the population data;
 * - download the current view or all population rows.
 */
export default function AlleleFrequencyTable({
  rows = [],
  highlightedRowId = null,
  onHighlightRow,
}) {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Build the available columns from the data itself.
   *
   * "id" is only used internally to connect the chart and table,
   * so it is not shown as a table column.
   *
   * Columns containing no data at all are also excluded.
   */
  const availableColumns = useMemo(() => {
    const columnIds = [
      ...new Set(
        rows.flatMap((row) => Object.keys(row).filter((key) => key !== "id"))
      ),
    ];

    return columnIds
      .filter((columnId) =>
        rows.some((row) => {
          const value = row[columnId];

          return value !== undefined && value !== null && value !== "";
        })
      )
      .map((columnId) => ({
        id: columnId,

        // Convert alleleFrequency into "Allele Frequency".
        name: columnId
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/^./, (letter) => letter.toUpperCase()),
      }));
  }, [rows]);

  /**
   * Format values exactly as they appear in the table.
   *
   * This same formatting is reused by search and CSV download
   * so the user gets consistent values everywhere.
   */
  const getDisplayValue = (row, columnId) => {
    const value = row[columnId];

    if (columnId === "alleleFrequency") {
      return formatAlleleFrequency(value);
    }

    if (columnId === "population") {
      return value ?? "-";
    }

    if (typeof value === "number" || value === null || value === undefined) {
      return formatCount(value);
    }

    return String(value);
  };

  /**
   * Search across all available Beacon columns.
   *
   * This behaves like the Results Table search:
   * the search is not limited only to currently visible columns.
   */
  const filteredRows = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return rows;
    }

    return rows.filter((row) => {
      const rowText = availableColumns
        .map((column) => getDisplayValue(row, column.id))
        .join(" ")
        .toLowerCase();

      return rowText.includes(normalizedSearchTerm);
    });
  }, [rows, availableColumns, searchTerm]);

  /**
   * Keep the columns in their original Beacon order,
   * while displaying only the columns selected by the user.
   */
  const visibleColumnObjects = useMemo(
    () =>
      availableColumns.filter((column) => visibleColumns.includes(column.id)),
    [availableColumns, visibleColumns]
  );

  /**
   * Download View:
   * - searched rows;
   * - selected columns.
   *
   * Download All:
   * - all population rows;
   * - selected columns.
   *
   * All AF population data is already loaded, so Download All
   * does not need another API request.
   */
  const handleExport = (downloadMode = "view") => {
    const rowsToExport = downloadMode === "view" ? filteredRows : rows;

    downloadCsvFile({
      rows: rowsToExport,
      columns: visibleColumnObjects,
      fileName: `beacon-allele-frequency-${
        new Date().toISOString().split("T")[0]
      }.csv`,

      getCellValue: (row, column) => getDisplayValue(row, column.id),
    });
  };

  return (
    <>
      {/* Shared toolbar used by the Results Table and AF Table */}
      <Box sx={{ mb: 2 }}>
        <TableToolbarControls
          columns={availableColumns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleExport={handleExport}
        />
      </Box>

      {visibleColumns.length === 0 ? (
        <Box
          sx={{
            minHeight: "250px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ResultsEmpty message="To view the allele frequency table, please select at least one column" />
        </Box>
      ) : (
        <TableContainer
          sx={{
            border: `1px solid ${primaryDarkColor}`,
            borderRadius: "8px",
            overflowX: "auto",
          }}
        >
          <Table size="small">
            <TableHead
              sx={{
                backgroundColor: primaryDarkColor,

                "& .MuiTableCell-root": {
                  color: "white",
                  fontWeight: 700,
                  height: "49px",
                },
              }}
            >
              <TableRow>
                {visibleColumnObjects.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.id === "population" ? "left" : "center"}
                  >
                    {column.name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                "& .MuiTableRow-root": {
                  height: "39px",
                },

                "& .MuiTableCell-root": {
                  height: "39px",
                  py: 0,
                  textAlign: "center",
                },

                "& .MuiTableCell-root:first-of-type": {
                  textAlign: "left",
                },
              }}
            >
              {filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onMouseEnter={() => onHighlightRow?.(row.id)}
                  onMouseLeave={() => onHighlightRow?.(null)}
                  sx={(theme) => ({
                    cursor: "pointer",

                    backgroundColor:
                      highlightedRowId === row.id
                        ? theme.palette.action.hover
                        : "transparent",

                    transition: "background-color 120ms ease",

                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  })}
                >
                  {visibleColumnObjects.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.id === "population" ? "left" : "center"}
                    >
                      {getDisplayValue(row, column.id)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}
