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

/**
 * Displays a modal containing a paginated results table for the selected dataset.
 * Fetches detailed records from the Beacon API using POST requests with pagination.
 */
const ResultsTableModal = ({ open, subRow, onClose }) => {
  const { selectedPathSegment, selectedFilter } = useSelectedEntry();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dataTable, setDataTable] = useState([]);
  const [url, setUrl] = useState("");
  const entryTypeId = PATH_SEGMENT_TO_ENTRY_ID[selectedPathSegment];

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
    overflowY: "auto",
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
        pagination: { skip: 0, limit: 1000 },
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

  // Fetches data for the modal table
  useEffect(() => {
    if (!open) return;
    let active = true;

    const fetchTableItems = async () => {
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

  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const visibleRows = dataTable.slice(start, end);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Fade in={open}>
        <Box sx={style}>
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

          <Box>
            <Typography
              id="modal-modal-title"
              sx={{
                fontWeight: "bold",
                fontSize: "17px",
                paddingBottom: "10px",
                color: config.ui.colors.darkPrimary,
              }}
            >
              Results detailed table
            </Typography>
          </Box>

          <Box>
            {loading && <Loader message="Loading data..." />}
            {!loading && dataTable.length > 0 && (
              <>
                <ResultsTableModalBody
                  dataTable={visibleRows}
                  totalItems={totalItems}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  totalPages={totalPages}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  primary={config.ui.colors.primary}
                  entryTypeId={entryTypeId}
                  selectedPathSegment={selectedPathSegment}
                />
                {/* Pagination moved here */}
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                >
                  <TablePagination
                    component="div"
                    count={totalItems}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 20]}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ResultsTableModal;
