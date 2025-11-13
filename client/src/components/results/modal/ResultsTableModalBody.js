import { useState, Fragment, useEffect, useCallback } from "react";
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
  entryTypeId,
  selectedPathSegment,
  beaconId,
  datasetId,
  displayedCount,
  headers: providedHeaders = [],
  visibleColumns,
  setVisibleColumns,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(dataTable);

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

  const rawHeaders =
    providedHeaders && providedHeaders.length > 0
      ? providedHeaders
      : Array.from(
          new Set(
            dataTable.flatMap((obj) =>
              obj && typeof obj === "object" ? Object.keys(obj) : []
            )
          )
        );

  // Build indexedHeaders
  const indexedHeaders = {};
  rawHeaders.forEach((header, index) => {
    indexedHeaders[index] = {
      id: header,
      name: formatHeaderName(header),
    };
  });

  const headersArray = Object.values(indexedHeaders)
    // Rename "identifiers" → "Genomic variation"
    .map((h) =>
      h.id === "identifiers" ? { ...h, name: "Genomic variation" } : h
    )
    .filter((h) => h.id !== "variantInternalId");

  const primaryId = headersArray.find((h) => h.id === "id")
    ? "id"
    : headersArray.find((h) => h.id === "identifiers")
    ? "identifiers"
    : null;

  const sortedHeaders = primaryId
    ? [
        ...headersArray.filter((h) => h.id === primaryId),
        ...headersArray.filter((h) => h.id !== primaryId),
      ]
    : headersArray;

  useEffect(() => {
    if (sortedHeaders.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(sortedHeaders.map((h) => h.id));
    }
  }, [sortedHeaders, visibleColumns, setVisibleColumns]);

  function renderCellContent(item, column) {
    const value = item[column];
    if (!value) return "-";

    // Apply the same logic for phenotypicFeatures and exposures
    if (
      (column === "phenotypicFeatures" || column === "exposures") &&
      Array.isArray(value)
    ) {
      return value
        .map((entry) => {
          if (typeof entry !== "object" || entry === null) return entry;

          const parts = Object.entries(entry)
            .map(([key, val]) => {
              if (!val) return null;
              if (typeof val === "object" && !Array.isArray(val)) {
                if (val.iso8601duration)
                  return `Age at exposure: ${val.iso8601duration}`;
                if (val.label) return `${key}: ${val.label}`;
                if (val.id) return `${key}: ${val.id}`;
                const innerLabel =
                  val.evidenceCode?.label ||
                  val.featureType?.label ||
                  val.exposureCode?.label ||
                  val.onset?.label ||
                  val.unit?.label ||
                  val.severity?.label;

                if (innerLabel) return `${key}: ${innerLabel}`;
                return null;
              }
              if (Array.isArray(val)) {
                const labels = val
                  .map((v) => v.label || v.id || null)
                  .filter(Boolean);
                return labels.length > 0
                  ? `${key}: ${labels.join(", ")}`
                  : null;
              }
              if (typeof val === "string" || typeof val === "number") {
                return `${key}: ${val}`;
              }

              return null;
            })
            .filter(Boolean);

          return parts.join(", ");
        })
        .filter(Boolean)
        .join(" | ");
    }

    return summarizeValue(value);
  }

  useEffect(() => {
    const filtered = dataTable.filter((item) => {
      if (!searchTerm) return true;
      const rowString = sortedHeaders
        .map((h) => summarizeValue(item[h.id]))
        .join(" ")
        .toLowerCase();
      return rowString.includes(searchTerm.toLowerCase());
    });

    // Only update if the number of visible rows actually changes
    if (filtered.length !== filteredData.length) {
      setFilteredData(filtered);
    }
  }, [searchTerm, dataTable, sortedHeaders]);

  const handleExport = useCallback(() => {
    exportCSV({
      dataTable,
      sortedHeaders,
      visibleColumns,
      summarizeValue,
      searchTerm,
      entryTypeId,
      selectedPathSegment,
      queryBuilder,
      datasetId,
    });
  }, [
    dataTable,
    sortedHeaders,
    visibleColumns,
    searchTerm,
    entryTypeId,
    selectedPathSegment,
    datasetId,
  ]);

  return (
    <Box
      sx={{
        maxHeight: "70vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {config.beaconType === "networkBeacon" && (
        <Box
          sx={{
            color: config.ui.colors.darkPrimary,
            fontSize: "14px",
            display: "flex",
            alignItems: "flex-end",
            mt: "auto",
            gap: "6px",
          }}
        >
          Beacon: <b>{beaconId || "—"}</b>
        </Box>
      )}

      <Box
        sx={{
          color: config.ui.colors.darkPrimary,
          fontSize: "14px",
          display: "flex",
          alignItems: "flex-end",
          mt: "auto",
          gap: "6px",
        }}
      >
        Dataset: <b>{datasetId || "—"}</b>
      </Box>

      <ResultsTableToolbar
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleExport={handleExport}
        sortedHeaders={sortedHeaders}
        count={displayedCount}
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
                {filteredData.map((item, index) => {
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
                        {Object.values(sortedHeaders)
                          .filter((colConfig) =>
                            visibleColumns.includes(colConfig.id)
                          )
                          .map((colConfig) => (
                            <StyledTableCell
                              key={`${id}-${colConfig.id}`}
                              data-cy={
                                colConfig.id === "variantInternalId"
                                  ? "variant-internal-id-cell"
                                  : undefined
                              }
                              sx={{
                                fontSize: "11px",

                                ...(colConfig.id === "variantInternalId"
                                  ? {
                                      whiteSpace: "wrap",
                                      wordBreak: "break-word",
                                      overflowWrap: "anywhere",
                                      verticalAlign: "top",
                                      lineHeight: 1.4,
                                      paddingTop: "6px",
                                      paddingBottom: "6px",
                                    }
                                  : {
                                      whiteSpace: "wrap",
                                      overflowWrap: "anywhere",
                                      verticalAlign: "top",
                                    }),
                              }}
                              style={{
                                width: colConfig.width || "auto",
                                maxWidth:
                                  colConfig.id === "variantInternalId"
                                    ? "300px"
                                    : "250px",
                              }}
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
        </>
      </Paper>
    </Box>
  );
};

export default ResultsTableModalBody;
