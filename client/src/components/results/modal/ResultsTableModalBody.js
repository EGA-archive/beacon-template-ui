import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { queryBuilder } from "../../search/utils/queryBuilder";
import ResultsTableToolbar from "./ResultsTableToolbar";
import { exportCSV } from "../utils/exportCSV";
import {
  cleanAndParseInfo,
  summarizeValue,
  formatHeaderName,
} from "../utils/tableHelpers";
import FrequencyInPopulationsCell from "../modal/cellRenderers/FrequencyInPopulationsCell";
import InterventionsOrProceduresCell from "../modal/cellRenderers/InterventionsOrProceduresCell";
import MeasuresCell from "../modal/cellRenderers/MeasuresCell";
import InfoCell from "../modal/cellRenderers/InfoCell";
import MolecularAttributesCell from "../modal/cellRenderers/MolecularAttributesCell";
import VariationCell from "../modal/cellRenderers/VariationCell";
import CaseLevelDataCell from "../modal/cellRenderers/CaseLevelDataCell";
import useAuthHeaders from "../../../hooks/useAuthHeaders";
import DownloadLimitDialog from "../modal/DownloadLimitDialog";
import { highlightText } from "../utils/highlightText";
import defaultsortingicon from "../../../assets/logos/default-sorting-icon.svg";
import sortascIcon from "../../../assets/logos/sort-asc.svg";
import sortdescIcon from "../../../assets/logos/sort-desc.svg";
import { getSortableValue } from "../utils/sortValue";
import ResultsEmpty from "../ResultsEmpty";

/**
 * Displays paginated results inside the modal.
 * Keeps full dataset in memory but renders only the current page slice.
 */
const ResultsTableModalBody = ({
  dataTable,
  entryTypeId,
  selectedPathSegment,
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
  selectedFilters,
  onOpenAlleleFrequency,
}) => {
  const [filteredData, setFilteredData] = useState([]);
  const [downloadLimitInfo, setDownloadLimitInfo] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const initialized = useRef(false);

  // Get authentication headers (includes Bearer token if user is logged in)
  const authHeaders = useAuthHeaders();

  const start = page * rowsPerPage;
  const end = start + rowsPerPage;

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

  const orderedVisibleHeaders = useMemo(() => {
    return visibleColumns
      .map((columnId) => sortedHeaders.find((header) => header.id === columnId))
      .filter(Boolean);
  }, [visibleColumns, sortedHeaders]);

  /** Initialize visible columns once (no eslint disable, no re-runs) */
  useEffect(() => {
    if (initialized.current || sortedHeaders.length === 0) return;

    initialized.current = true;

    if (visibleColumns.length === 0) {
      setVisibleColumns(sortedHeaders.map((header) => header.id));
    }
  }, [sortedHeaders, visibleColumns.length, setVisibleColumns]);

  /** Filter data by search term */
  useEffect(() => {
    const filtered = dataTable.filter((item) => {
      if (!searchTerm) return true;

      const rowString = sortedHeaders
        .map((h) => summarizeValue(item[h.id], h.id))
        .join(" ")
        .toLowerCase();

      return rowString.includes(searchTerm.toLowerCase());
    });

    setFilteredData(filtered);

    if (setSearchCount) {
      setSearchCount(filtered.length);
    }
  }, [searchTerm, dataTable, sortedHeaders, setSearchCount]);

  const handleSort = (columnId) => {
    if (sortColumn !== columnId) {
      setSortColumn(columnId);
      setSortDirection("asc");
      return;
    }

    if (sortDirection === "asc") {
      setSortDirection("desc");
      return;
    }

    setSortColumn(null);
    setSortDirection(null);
  };

  const getSortIcon = (columnId) => {
    if (sortColumn !== columnId) return defaultsortingicon;
    return sortDirection === "asc" ? sortascIcon : sortdescIcon;
  };

  const sortedFilteredData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = summarizeValue(a[sortColumn], sortColumn);
      const bValue = summarizeValue(b[sortColumn], sortColumn);

      const aSortable = getSortableValue(aValue);
      const bSortable = getSortableValue(bValue);

      // Genomic position sorting
      if (aSortable.type === "genomic" && bSortable.type === "genomic") {
        return sortDirection === "asc"
          ? aSortable.value - bSortable.value
          : bSortable.value - aSortable.value;
      }

      // Numeric sorting
      if (aSortable.type === "number" && bSortable.type === "number") {
        return sortDirection === "asc"
          ? aSortable.value - bSortable.value
          : bSortable.value - aSortable.value;
      }

      // Fallback text sorting
      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue), undefined, {
            numeric: true,
            sensitivity: "base",
          })
        : String(bValue).localeCompare(String(aValue), undefined, {
            numeric: true,
            sensitivity: "base",
          });
    });
  }, [filteredData, sortColumn, sortDirection]);

  const visibleRows = useMemo(
    () => sortedFilteredData.slice(start, end),
    [sortedFilteredData, start, end]
  );

  /** Export CSV */
  const handleExport = useCallback(
    (downloadMode = "view") => {
      return exportCSV({
        dataTable: sortedFilteredData,
        sortedHeaders,
        visibleColumns,
        summarizeValue,
        searchTerm,
        entryTypeId,
        selectedPathSegment,
        queryBuilder,
        datasetId,
        authHeaders,
        selectedFilters,
        downloadMode,
        onDownloadLimitReached: (info) => {
          setDownloadLimitInfo(info);
        },
      });
    },
    [
      sortedFilteredData,
      sortedHeaders,
      visibleColumns,
      searchTerm,
      entryTypeId,
      selectedPathSegment,
      datasetId,
      authHeaders,
      selectedFilters,
    ]
  );

  const CELL_RENDERERS = {
    interventionsOrProcedures: InterventionsOrProceduresCell,
    measures: MeasuresCell,
    info: InfoCell,
    molecularAttributes: MolecularAttributesCell,
    variation: VariationCell,
    caseLevelData: CaseLevelDataCell,
    frequencyInPopulations: FrequencyInPopulationsCell,
  };

  /** Render table cell content */
  const renderCellContent = useCallback((item, column) => {
    const value = item[column];
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    if (
      (column === "phenotypicFeatures" || column === "exposures") &&
      Array.isArray(value)
    ) {
      return value
        .map((entry) => {
          if (typeof entry !== "object" || entry === null) return entry;

          const parts = Object.entries(entry)
            .map(([key, val]) => {
              if (val === null || val === undefined || val === "") {
                return null;
              }
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

  return (
    <Box
      sx={{
        maxHeight: "70vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ResultsTableToolbar
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleExport={handleExport}
        setDownloadLimitInfo={setDownloadLimitInfo}
        sortedHeaders={sortedHeaders}
        count={displayedCount}
        loadedCount={dataTable.length}
      />
      {visibleColumns?.length === 0 ? (
        <Box
          sx={{
            minHeight: "250px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ResultsEmpty message="To view the details table, please select at least one column" />
        </Box>
      ) : (
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
          <TableContainer
            sx={{
              overflowX: "auto",
            }}
          >
            <Table stickyHeader aria-label="Results table">
              <TableHead>
                <StyledTableRow>
                  {orderedVisibleHeaders.map((column) => (
                    <TableCell key={column.id} sx={headerCellStyle}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                        }}
                      >
                        {column.name}
                        <img
                          src={getSortIcon(column.id)}
                          alt="sorting icon"
                          onClick={() => handleSort(column.id)}
                          style={{
                            opacity: sortColumn === column.id ? 1 : 0.5,
                            cursor: "pointer",
                            transition: "opacity 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = 1;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity =
                              sortColumn === column.id ? 1 : 0.5;
                          }}
                        />
                      </Box>
                    </TableCell>
                  ))}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((item, index) => {
                  const parsedInfo = cleanAndParseInfo(item.info);
                  const id = `${item.id || `row_${index}`}${
                    parsedInfo?.sampleID ? `_${parsedInfo.sampleID}` : ""
                  }`;

                  return (
                    <StyledTableRow
                      key={id}
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
                      {orderedVisibleHeaders.map((col) => (
                        <StyledTableCell
                          key={`${id}-${col.id}`}
                          sx={{
                            fontSize: "11px",
                            whiteSpace: "normal",
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
                              <Renderer
                                value={item[col.id]}
                                item={item}
                                searchTerm={searchTerm}
                                onOpenAlleleFrequency={onOpenAlleleFrequency}
                              />
                            ) : (
                              highlightText(
                                renderCellContent(item, col.id),
                                searchTerm
                              )
                            );
                          })()}
                        </StyledTableCell>
                      ))}
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <DownloadLimitDialog
        open={Boolean(downloadLimitInfo)}
        totalResults={downloadLimitInfo?.totalResults}
        downloadLimit={downloadLimitInfo?.downloadLimit}
        onClose={() => setDownloadLimitInfo(null)}
      />
    </Box>
  );
};

export default ResultsTableModalBody;
