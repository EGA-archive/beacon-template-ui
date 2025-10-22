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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import config from "../../../config/config.json";
import ResultsTableModalRow from "./ResultsTableModalRow";
import { queryBuilder } from "../../search/utils/queryBuilder";
import ResultsTableToolbar from "./ResultsTableToolbar";
import { exportCSV } from "../utils/exportCSV";
import {
  cleanAndParseInfo,
  summarizeValue,
  formatHeaderName,
} from "../utils/tableHelpers";

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
  const [searchTerm, setSearchTerm] = useState("");

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

  function renderCellContent(item, column) {
    const value = item[column];
    if (!value) return "-";

    return summarizeValue(value);
  }

  console.log("sortedHeaders", sortedHeaders);

  const [visibleColumns, setVisibleColumns] = useState(
    sortedHeaders.map((h) => h.id)
  );

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
      <ResultsTableToolbar
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleExport={() =>
          exportCSV({
            dataTable,
            sortedHeaders,
            visibleColumns,
            summarizeValue,
            searchTerm,
            entryTypeId,
            selectedPathSegment,
            queryBuilder,
          })
        }
        sortedHeaders={sortedHeaders}
      />

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
          <TableContainer
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <Table stickyHeader aria-label="Results table">
              <TableHead>
                <StyledTableRow>
                  {sortedHeaders
                    .filter((col) => visibleColumns.includes(col.id))
                    .map((column) => (
                      <TableCell key={column.id} sx={headerCellStyle}>
                        {column.name}
                      </TableCell>
                    ))}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {dataTable
                  .filter((item) => {
                    if (!searchTerm) return true;
                    const rowString = sortedHeaders
                      .map((h) => summarizeValue(item[h.id]))
                      .join(" ")
                      .toLowerCase();
                    return rowString.includes(searchTerm.toLowerCase());
                  })
                  .map((item, index) => {
                    const isExpanded =
                      expandedRow && expandedRow?.id === item.id;
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
                          {Object.values(sortedHeaders)
                            .filter((colConfig) =>
                              visibleColumns.includes(colConfig.id)
                            )
                            .map((colConfig) => (
                              <StyledTableCell
                                key={`${id}-${colConfig.id}`}
                                sx={{ fontSize: "11px" }}
                                style={{ width: colConfig.width }}
                              >
                                {renderCellContent(item, colConfig.id)}
                              </StyledTableCell>
                            ))}
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
        </>
      </Paper>
    </Box>
  );
};

export default ResultsTableModalBody;
