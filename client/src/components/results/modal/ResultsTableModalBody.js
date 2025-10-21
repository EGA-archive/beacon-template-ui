import { useState, Fragment } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  tableCellClasses,
  TablePagination,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import config from "../../../config/config.json";
import ResultsTableModalRow from "./ResultsTableModalRow";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { queryBuilder } from "../../search/utils/queryBuilder";

const ResultsTableModalBody = ({
  dataTable,
  totalItems,
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  entryTypeId,
  selectedPathSegment,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: config.ui.colors.darkPrimary,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 11,
    },
    border: `1px solid ${config.ui.colors.darkPrimary}`,
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td": {
      border: `1px solid ${config.ui.colors.darkPrimary}`,
    },
    "&:last-child th": {
      border: `1px solid white`,
    },
  }));

  const headerCellStyle = {
    backgroundColor: config.ui.colors.darkPrimary,
    fontWeight: 700,
    color: "white",
  };

  function formatHeaderName(header) {
    const withSpaces = header.replace(/([A-Z])/g, " $1");
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  }

  const cleanAndParseInfo = (infoString) => {
    try {
      if (typeof infoString !== "string") return null;

      const cleaned = infoString.replace(/"|"/g, '"');
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (error) {
      console.log("Failed to parse item.info:", error);
      return null;
    }
  };

  const headersSet = new Set();
  dataTable.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      headersSet.add(key);
    });
  });

  const headers = Array.from(headersSet);

  const indexedHeaders = {};
  headers.forEach((header, index) => {
    indexedHeaders[index] = {
      id: header,
      name: formatHeaderName(header),
    };
  });

  const headersArray = Object.values(indexedHeaders);
  const primaryId = headersArray.find((h) => h.id === "id")
    ? "id"
    : headersArray.find((h) => h.id === "variantInternalId")
    ? "variantInternalId"
    : null;

  const sortedHeaders = primaryId
    ? [
        ...headersArray.filter((h) => h.id === primaryId),
        ...headersArray.filter((h) => h.id !== primaryId),
      ]
    : headersArray;

  function summarizeValue(value) {
    if (value == null) return "-";

    if (Array.isArray(value)) {
      return value.map((el) => summarizeValue(el)).join(", ");
    }

    if (typeof value === "object") {
      if (value.label) {
        return value.label;
      }

      if (value.id) {
        return value.id;
      }

      const nestedValues = Object.values(value)
        .map((v) => summarizeValue(v))
        .filter(Boolean);

      if (nestedValues.length) {
        return nestedValues.join(", ");
      }

      return "-";
    }

    if (typeof value === "string" || typeof value === "number") {
      return value;
    }

    return "-";
  }

  function renderCellContent(item, column) {
    const value = item[column];
    if (!value) return "-";

    return summarizeValue(value);
  }

  console.log("sortedHeaders", sortedHeaders);

  // 🧪 Debug: inspect header vs rendered content of first row
  if (dataTable.length > 0) {
    const firstRow = dataTable[0];
    console.log("🧩 DEBUG — First row raw object:", firstRow);

    console.log("🧾 Header → Rendered content comparison (first row only):");
    sortedHeaders.forEach((col) => {
      const rawValue = firstRow[col.id];
      const rendered = summarizeValue(rawValue);
      console.log(
        `${col.id}:`,
        "\n   ↳ Raw:",
        rawValue,
        "\n   ↳ Rendered:",
        rendered
      );
    });
  }

  return (
    <Box
      sx={{
        maxHeight: "70vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          flexGrow: 1,
          overflow: "hidden",
          boxShadow: "none",
          borderRadius: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <>
          {/* <TableContainer sx={{ maxHeight: 540 }}> */}
          <TableContainer
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <Table stickyHeader aria-label="Results table">
              <TableHead>
                <StyledTableRow>
                  {sortedHeaders.map((column) => (
                    <TableCell key={column.id} sx={headerCellStyle}>
                      {column.name}
                    </TableCell>
                  ))}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {dataTable.map((item, index) => {
                  const isExpanded = expandedRow && expandedRow?.id === item.id;
                  let id = item.id;
                  const parsedInfo = cleanAndParseInfo(item.info);
                  if (parsedInfo?.sampleID) {
                    id += `_${parsedInfo.sampleID}`;
                  } else {
                    id += `_${index}`;
                  }

                  return (
                    <Fragment key={id}>
                      <StyledTableRow
                        key={`row-${id}`}
                        hover
                        sx={{
                          "&.MuiTableRow-root": {
                            transition: "background-color 0.2s ease",
                          },
                          "& td": {
                            borderBottom: "1px solid rgba(224, 224, 224, 1)",
                            py: 1.5,
                          },
                          fontWeight: "bold",
                        }}
                      >
                        {Object.values(sortedHeaders).map((colConfig) => {
                          return (
                            <StyledTableCell
                              key={`${id}-${colConfig.id}`}
                              sx={{ fontSize: "11px" }}
                              style={{ width: colConfig.width }}
                            >
                              {renderCellContent(item, colConfig.id)}
                            </StyledTableCell>
                          );
                        })}
                      </StyledTableRow>

                      {isExpanded && (
                        <ResultsTableModalRow
                          key={`expanded-${id}`}
                          item={expandedRow}
                        />
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
          />

          {/* 🔽 Export CSV Button (keeps header order from sortedHeaders) */}
          {/* Export CSV Button */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2, pr: 2 }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadRoundedIcon />}
              onClick={async () => {
                try {
                  console.log("Starting full CSV export...");

                  // Build a minimal valid Beacon query (no filters by default)
                  // You can pass selectedFilter from the parent if you want to export with filters
                  const fullQuery = queryBuilder([], entryTypeId);

                  // Request a large batch (adjust limit as needed)
                  fullQuery.query.pagination = { skip: 0, limit: 10000 };

                  const fullUrl = `${config.apiUrl}/${selectedPathSegment}`;
                  console.log("Fetching all results from:", fullUrl);

                  const response = await fetch(fullUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fullQuery),
                  });

                  if (!response.ok) {
                    console.error("Fetch failed with status:", response.status);
                    alert("Failed to fetch data for export.");
                    return;
                  }

                  const data = await response.json();
                  const resultSets = data?.response?.resultSets ?? [];
                  const results = resultSets.flatMap((r) => r.results || []);

                  console.log("Fetched", results.length, "records for export");

                  if (!results.length) {
                    alert("No data available to export.");
                    return;
                  }

                  // Use the same header order as the rendered table
                  const headers = sortedHeaders.map((h) => h.id);
                  const headerLabels = sortedHeaders.map((h) => h.name);

                  // Build CSV rows using the rendered (summarized) values
                  const csvRows = [
                    headerLabels.join(","), // header line
                    ...results.map((row) =>
                      headers
                        .map((field) =>
                          JSON.stringify(
                            summarizeValue(
                              row[field] !== undefined && row[field] !== null
                                ? row[field]
                                : ""
                            )
                          )
                        )
                        .join(",")
                    ),
                  ];

                  const csvContent = csvRows.join("\n");

                  // Create downloadable file
                  const blob = new Blob([csvContent], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);

                  // File name includes entry type and current date
                  const fileName = `beacon-${
                    selectedPathSegment || "results"
                  }-${new Date().toISOString().split("T")[0]}.csv`;

                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute("download", fileName);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);

                  console.log("CSV downloaded successfully:", fileName);
                } catch (err) {
                  console.error("CSV export failed:", err);
                  alert("CSV export failed. Check the console for details.");
                }
              }}
            >
              Export CSV
            </Button>
          </Box>
        </>
      </Paper>
    </Box>
  );
};

export default ResultsTableModalBody;
