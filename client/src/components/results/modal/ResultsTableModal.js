import { useState, useEffect } from "react";
import { Box, Typography, TablePagination } from "@mui/material";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import ResultsTableModalBody from "./ResultsTableModalBody";
import config from "../../../config/config.json";
import CloseIcon from "@mui/icons-material/Close";
import { InputAdornment, IconButton } from "@mui/material";
import { useSelectedEntry } from "../../context/SelectedEntryContext";
import Loader from "../../common/Loader";
import { PATH_SEGMENT_TO_ENTRY_ID } from "../../common/textFormatting";
import { mockSingleBeaconResponse } from "../../search/mockSingleBeaconResponse";

/**
 * Displays a modal containing a paginated results table for the selected dataset.
 * Fetches detailed records from the Beacon API using POST requests with pagination.
 */
const ResultsTableModal = ({
  open,
  subRow,
  onClose,
  beaconId,
  datasetId,
  headers,
}) => {
  const { selectedPathSegment, selectedFilter, responseMeta } =
    useSelectedEntry();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dataTable, setDataTable] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [url, setUrl] = useState("");
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [searchCount, setSearchCount] = useState(null);
  const entryTypeId = PATH_SEGMENT_TO_ENTRY_ID[selectedPathSegment];

  const limit = responseMeta?.receivedRequestSummary?.pagination?.limit;

  useEffect(() => {
    if (headers && headers.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(headers);
    }
  }, [headers, visibleColumns.length]);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "1200px",
    height: "80vh",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    // overflow: "hidden",
    // overflowY: "auto",
    p: 4,
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
  };

  const handleClose = () => {
    setSearchTerm("");
    setPage(0);
    setTotalPages(0);
    setTotalItems(0);
    setDataTable([]);
    onClose();
  };

  // Builds the Beacon query with pagination
  const queryBuilder = (page, entryTypeId) => {
    const skipItems = page * rowsPerPage;
    const filter = {
      meta: { apiVersion: "2.0" },
      query: {
        filters: [],
        requestParameters: {},
        includeResultsetResponses: "HIT",
        pagination: { skip: 0, limit: 100 },
        testMode: false,
        requestedGranularity: "record",
      },
    };

    // Add filters if present
    if (selectedFilter.length > 0) {
      selectedFilter.forEach((item) => {
        if (item.queryParams) {
          filter.query.requestParameters = {
            ...filter.query.requestParameters,
            ...item.queryParams,
          };
        } else if (item.operator) {
          filter.query.filters.push({
            id: item.id,
            operator: item.operator,
            value: item.value,
          });
        } else {
          filter.query.filters.push({
            id: item.id,
            ...(item.scope ? { scope: item.scope } : {}),
          });
        }
      });
    }

    if (
      !filter.query.requestParameters ||
      Object.keys(filter.query.requestParameters).length === 0
    ) {
      delete filter.query.requestParameters;
    }

    if (filter.query.filters.length === 0) {
      delete filter.query.filters;
    }

    return filter;
  };

  useEffect(() => {
    if (!open) return;
    let active = true;

    // Use preloaded data if available (first open only)
    if (page === 0 && subRow?.dataTable?.length > 0) {
      setDataTable(subRow.dataTable);
      setTotalItems(subRow.dataTable.length);
      setTotalPages(Math.ceil(subRow.dataTable.length / rowsPerPage));
      setLoading(false);
      return; // Skip fetchTableItems for this case
    }

    const fetchTableItems = async () => {
      if (subRow?.dataTable?.length > 0) return;
      try {
        setLoading(true);
        const url = `${config.apiUrl}/${selectedPathSegment}`;
        setUrl(url);

        // Always use POST with pagination, even if no filters
        const query = queryBuilder(page, entryTypeId);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });

        const data = await response.json();
        // const data = mockSingleBeaconResponse;

        if (!active) return;

        const results = data.response?.resultSets;

        if (!results?.length) return;

        // Try to match the correct beacon by ID; otherwise, use the first
        let beacon = results.find((item) => {
          const id = subRow.beaconId || subRow.id;
          const itemId = item.beaconId || item.id;
          return id === itemId;
        });
        if (!beacon) beacon = results[0];

        if (!beacon?.results) return;

        const totalDatasetsPages = Math.ceil(beacon.resultsCount / rowsPerPage);
        setTotalItems(beacon.resultsCount);

        setTotalPages(totalDatasetsPages);
        setDataTable(beacon.results);
      } catch (err) {
        console.error("Failed to fetch modal table:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTableItems();
    return () => {
      active = false;
    };
  }, [open, subRow, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Fade in={open}>
        <Box sx={style}>
          {/* Close button top left */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <InputAdornment position="end">
              <IconButton
                onClick={handleClose}
                size="small"
                sx={{ color: config.ui.colors.darkPrimary }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          </Box>

          {/* Title  */}
          <Typography
            id="modal-modal-title"
            sx={{
              fontWeight: "bold",
              fontSize: "17px",
              mb: 2,
              color: config.ui.colors.darkPrimary,
            }}
          >
            Results detailed table
          </Typography>

          {/* Scrollable Table with the details results */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
              pr: 1,
            }}
          >
            {loading && <Loader message="Loading data..." />}

            {!loading && dataTable.length > 0 && (
              <ResultsTableModalBody
                dataTable={dataTable}
                totalItems={totalItems}
                page={page}
                rowsPerPage={rowsPerPage}
                totalPages={totalPages}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                primary={config.ui.colors.primary}
                entryTypeId={entryTypeId}
                selectedPathSegment={selectedPathSegment}
                beaconId={beaconId}
                datasetId={datasetId}
                displayedCount={subRow?.displayedCount || 0}
                actualLoadedCount={subRow?.actualLoadedCount || 0}
                headers={headers}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setSearchCount={setSearchCount}
              />
            )}
          </Box>

          {/* Fixed Pagination at the bottom of the modal */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 1,
            }}
          >
            <TablePagination
              component="div"
              count={searchTerm ? searchCount ?? 0 : totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ResultsTableModal;
