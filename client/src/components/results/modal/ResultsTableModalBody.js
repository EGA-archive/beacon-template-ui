import {
  useState,
  Fragment,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  Tooltip,
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
import InterventionsOrProceduresCell from "../modal/cellRenderers/InterventionsOrProceduresCell";
import MeasuresCell from "../modal/cellRenderers/MeasuresCell";
import InfoCell from "../modal/cellRenderers/InfoCell";
import MolecularAttributesCell from "../modal/cellRenderers/MolecularAttributesCell";
import VariationCell from "../modal/cellRenderers/VariationCell";
import CaseLevelDataCell from "../modal/cellRenderers/CaseLevelDataCell";

/**
 * Displays paginated results inside the modal.
 * Keeps full dataset in memory but renders only the current page slice.
 */
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
  page,
  rowsPerPage,
  setSearchTerm,
  searchTerm,
  setSearchCount,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const initialized = useRef(false);

  const start = page * rowsPerPage;
  const end = start + rowsPerPage;

  useEffect(() => {
    setFilteredData(dataTable);
  }, [dataTable]);

  const StyledTableCell = useMemo(
    () =>
      styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: config.ui.colors.darkPrimary,
          color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: { fontSize: 11 },
        border: `1px solid ${config.ui.colors.darkPrimary}`,
      })),
    []
  );

  const StyledTableRow = useMemo(
    () =>
      styled(TableRow)(({ theme }) => ({
        "&:nth-of-type(odd)": { backgroundColor: theme.palette.action.hover },
        "&:last-child td": {
          border: `1px solid ${config.ui.colors.darkPrimary}`,
        },
        "&:last-child th": { border: `1px solid white` },
      })),
    []
  );

  const headerCellStyle = useMemo(
    () => ({
      backgroundColor: config.ui.colors.darkPrimary,
      fontWeight: 700,
      color: "white",
    }),
    []
  );

  /** Build headers dynamically */
  const headersArray = useMemo(() => {
    const rawHeaders =
      providedHeaders.length > 0
        ? providedHeaders
        : Array.from(
            new Set(
              dataTable.flatMap((obj) =>
                obj && typeof obj === "object" ? Object.keys(obj) : []
              )
            )
          );

    const indexedHeaders = rawHeaders.map((header) => ({
      id: header,
      name:
        header === "identifiers"
          ? "Genomic variation"
          : formatHeaderName(header),
    }));

    return indexedHeaders.filter((h) => h.id !== "variantInternalId");
  }, [dataTable, providedHeaders]);

  const sortedHeaders = useMemo(() => {
    const primaryId =
      headersArray.find((h) => h.id === "id")?.id ||
      headersArray.find((h) => h.id === "identifiers")?.id;

    if (!primaryId) return headersArray;
    return [
      ...headersArray.filter((h) => h.id === primaryId),
      ...headersArray.filter((h) => h.id !== primaryId),
    ];
  }, [headersArray]);

  /** Initialize visible columns once (no eslint disable, no re-runs) */
  useEffect(() => {
    if (
      !initialized.current &&
      sortedHeaders.length > 0 &&
      visibleColumns.length === 0
    ) {
      setVisibleColumns(sortedHeaders.map((h) => h.id));
      initialized.current = true;
    }
  }, [sortedHeaders, visibleColumns.length, setVisibleColumns]);

  /** Filter data by search term */
  useEffect(() => {
    const filtered = dataTable.filter((item) => {
      if (!searchTerm) return true;
      const rowString = sortedHeaders
        .map((h) => summarizeValue(item[h.id]))
        .join(" ")
        .toLowerCase();
      return rowString.includes(searchTerm.toLowerCase());
    });

    setFilteredData(filtered);

    if (setSearchCount) {
      setSearchCount(filtered.length);
    }
  }, [searchTerm, dataTable, sortedHeaders]);

  /** Slice visible rows for current page */

  const visibleRows = useMemo(
    () => filteredData.slice(start, end),
    [filteredData, start, end]
  );

  /** Export CSV */
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

  const CELL_RENDERERS = {
    interventionsOrProcedures: InterventionsOrProceduresCell,
    measures: MeasuresCell,
    info: InfoCell,
    molecularAttributes: MolecularAttributesCell,
    variation: VariationCell,
    caseLevelData: CaseLevelDataCell,
  };

  /** Render table cell content */
  const renderCellContent = useCallback((item, column) => {
    const value = item[column];
    if (!value) return "-";

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
                return innerLabel ? `${key}: ${innerLabel}` : null;
              }
              if (Array.isArray(val)) {
                const labels = val
                  .map((v) => v.label || v.id || null)
                  .filter(Boolean);
                return labels.length ? `${key}: ${labels.join(", ")}` : null;
              }
              return typeof val === "string" || typeof val === "number"
                ? `${key}: ${val}`
                : null;
            })
            .filter(Boolean);
          return parts.join(", ");
        })
        .filter(Boolean)
        .join(" | ");
    }

    return summarizeValue(value);
  }, []);

  /** Render */
  return (
    <Box
      sx={{
        maxHeight: "70vh",
        // overflow: "hidden",
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
          // overflow: "hidden",
          boxShadow: "none",
          borderRadius: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TableContainer
          sx={{
            maxHeight: "60vh",
            overflow: "visible",
            // overflowY: "auto"
          }}
        >
          <Table stickyHeader aria-label="Results table">
            <TableHead>
              <StyledTableRow>
                {sortedHeaders
                  .filter((col) => visibleColumns.includes(col.id))
                  .map((column) => (
                    <TableCell key={column.id} sx={headerCellStyle}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {column.name}
                      </Box>
                    </TableCell>
                  ))}
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((item, index) => {
                // const isExpanded = expandedRow?.id === item.id;
                const isExpanded =
                  expandedRow !== null && expandedRow.id === item.id;

                const parsedInfo = cleanAndParseInfo(item.info);
                const id = `${item.id || `row_${index}`}${
                  parsedInfo?.sampleID ? `_${parsedInfo.sampleID}` : ""
                }`;

                return (
                  <Fragment key={id}>
                    <StyledTableRow
                      hover
                      sx={{
                        "&.MuiTableRow-root": {
                          transition: "background-color 0.2s ease",
                        },
                        "& td": {
                          borderBottom: "1px solid rgba(224,224,224,1)",
                          py: 1.5,
                        },
                        fontWeight: "bold",
                      }}
                    >
                      {sortedHeaders
                        .filter((col) => visibleColumns.includes(col.id))
                        .map((col) => (
                          <StyledTableCell
                            key={`${id}-${col.id}`}
                            sx={{
                              fontSize: "11px",
                              whiteSpace: "wrap",
                              overflowWrap: "anywhere",
                              verticalAlign: "top",
                            }}
                            data-cy={
                              col.id === "identifiers"
                                ? "variant-identifiers-cell"
                                : undefined
                            }
                            style={{
                              width: col.width || "auto",
                              maxWidth:
                                col.id === "variantInternalId"
                                  ? "300px"
                                  : "250px",
                            }}
                          >
                            {(() => {
                              const Renderer = CELL_RENDERERS[col.id];
                              return Renderer ? (
                                <Renderer value={item[col.id]} />
                              ) : (
                                renderCellContent(item, col.id)
                              );
                            })()}
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
      </Paper>
    </Box>
  );
};

export default ResultsTableModalBody;
