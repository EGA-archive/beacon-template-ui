import { useEffect, useRef, useState } from "react";
import {
  Box,
  Fade,
  IconButton,
  Modal,
  TablePagination,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import config from "../../../config/config.json";
import { useSelectedEntry } from "../../context/SelectedEntryContext";
import { PATH_SEGMENT_TO_ENTRY_ID } from "../../common/textFormatting";
import Loader from "../../common/Loader";
import ResultsTableModalBody from "./ResultsTableModalBody";
import { buildDetailedTableQuery } from "./buildDetailedTableQuery";

const MODAL_STYLE = {
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
  p: 4,
};

/**
 * Displays a modal containing the first 100 detailed records
 * returned for the selected dataset.
 *
 * Pagination is handled locally over the loaded records.
 */
const ResultsTableModal = ({
  open,
  subRow,
  onClose,
  beaconId,
  datasetId,
  headers,
}) => {
  const { selectedPathSegment, selectedFilter } = useSelectedEntry();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [searchCount, setSearchCount] = useState(null);

  const columnsInitialized = useRef(false);

  const entryTypeId =
    PATH_SEGMENT_TO_ENTRY_ID[selectedPathSegment] || selectedPathSegment;

  useEffect(() => {
    if (!columnsInitialized.current && headers?.length > 0) {
      setVisibleColumns(headers);
      columnsInitialized.current = true;
    }
  }, [headers]);

  useEffect(() => {
    if (!open) return undefined;

    let active = true;

    const preloadedData = subRow?.dataTable;

    if (Array.isArray(preloadedData) && preloadedData.length > 0) {
      setDataTable(preloadedData);
      setLoading(false);

      return () => {
        active = false;
      };
    }

    const fetchTableItems = async () => {
      try {
        setLoading(true);
        setDataTable([]);

        const requestUrl = `${config.apiUrl}/${selectedPathSegment}`;
        const query = buildDetailedTableQuery(selectedFilter || []);

        const response = await fetch(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(query),
        });

        if (!response.ok) {
          throw new Error(
            `Detailed table request failed with status ${response.status}`
          );
        }

        const responseData = await response.json();

        if (!active) return;

        const resultSets = responseData.response?.resultSets;

        if (!Array.isArray(resultSets) || resultSets.length === 0) {
          setDataTable([]);
          return;
        }

        const selectedBeaconId = subRow?.beaconId || subRow?.id || beaconId;

        const matchingResultSet =
          resultSets.find((resultSet) => {
            const resultSetBeaconId = resultSet.beaconId || resultSet.id;

            return resultSetBeaconId === selectedBeaconId;
          }) || resultSets[0];

        const results = matchingResultSet?.results;

        setDataTable(Array.isArray(results) ? results : []);
      } catch (error) {
        if (active) {
          console.error("Failed to fetch detailed table:", error);
          setDataTable([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchTableItems();

    return () => {
      active = false;
    };
  }, [open, subRow, beaconId, selectedPathSegment, selectedFilter]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClose = () => {
    setSearchTerm("");
    setSearchCount(null);
    setPage(0);
    setDataTable([]);
    onClose();
  };

  const paginationCount = searchTerm ? searchCount ?? 0 : dataTable.length;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="results-table-modal-title"
    >
      <Fade in={open}>
        <Box sx={MODAL_STYLE}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              id="results-table-modal-title"
              sx={{
                fontWeight: 700,
                fontSize: "17px",
                color: config.ui.colors.darkPrimary,
              }}
            >
              Results detailed table
            </Typography>

            <IconButton
              onClick={handleClose}
              size="small"
              aria-label="Close detailed results table"
              sx={{
                color: config.ui.colors.darkPrimary,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

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
                entryTypeId={entryTypeId}
                selectedPathSegment={selectedPathSegment}
                selectedFilters={selectedFilter || []}
                beaconId={beaconId}
                datasetId={datasetId}
                displayedCount={subRow?.displayedCount || 0}
                headers={headers}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                page={page}
                rowsPerPage={rowsPerPage}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setSearchCount={setSearchCount}
              />
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 1,
            }}
          >
            <TablePagination
              component="div"
              count={paginationCount}
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
