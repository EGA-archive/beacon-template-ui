import { useState, useEffect } from "react";
import { Box, Typography, Link } from "@mui/material";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import ResultsTableModalBody from "./ResultsTableModalBody";
import config from "../../../config/config.json";
import CloseIcon from "@mui/icons-material/Close";
import { InputAdornment, IconButton } from "@mui/material";
import { useSelectedEntry } from "../../context/SelectedEntryContext";
import Loader from "../../common/Loader";
import { PATH_SEGMENT_TO_ENTRY_ID } from "../../common/textFormatting";

const style = {
  // position: "absolute",
  // top: "50%",
  // left: "50%",
  // transform: "translate(-50%, -50%)",
  // width: "90%",
  // height: "70%",
  // bgcolor: "background.paper",
  // borderRadius: 2,
  // boxShadow: 24,
  // p: 4,
  // textAlign: "left",
  // fontSize: "14px",
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

  const parseType = (item) => {
    switch (item) {
      case "dataset":
        return "datasets";
      default:
        return null;
    }
  };

  const tableType = parseType(subRow.setType);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleClose = () => {
    setPage(0);
    setTotalPages(0);
    setTotalItems(0);
    setDataTable([]);
    onClose();
  };

  const queryBuilder = (page, entryTypeId) => {
    let skipItems = page * rowsPerPage;

    let filter = {
      meta: {
        apiVersion: "2.0",
      },
      query: {
        filters: [],
        includeResultsetResponses: "HIT",
        pagination: {
          skip: parseInt(`${skipItems}`),
          limit: parseInt(`${rowsPerPage}`),
        },
        testMode: false,
        requestedGranularity: "record",
      },
    };

    if (selectedFilter.length > 0) {
      let filterData = selectedFilter.map((item) => {
        if (item.operator) {
          return {
            id: item.field,
            operator: item.operator,
            value: item.value,
          };
        } else {
          return {
            id: item.id,
            ...(item.scope ? { scope: item.scope } : {}),
          };
        }
      });
      filter.query.filters = filterData;
    }
    return filter;
  };

  useEffect(() => {
    if (!open) return;

    const fetchTableItems = async () => {
      try {
        setLoading(true);
        const url = `${config.apiUrl}/${selectedPathSegment}`;
        setUrl(url);
        let query = queryBuilder(page, entryTypeId);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });

        const data = await response.json();
        const results = data.response?.resultSets;

        const beacon = results?.find((item) => {
          const id = subRow.beaconId || subRow.id;
          const itemId = item.beaconId || item.id;
          return id === itemId;
        });
        if (!beacon) {
          console.warn("[Modal] No matching beacon found:", subRow);
          return;
        }
        const totalDatasetsPages = Math.ceil(beacon.resultsCount / rowsPerPage);
        setTotalItems(beacon.resultsCount);
        setTotalPages(totalDatasetsPages);
        setDataTable(beacon.results);
      } catch (err) {
        console.error("❌ Failed to fetch modal table", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTableItems();
  }, [open, subRow, page, rowsPerPage]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Fade in={open}>
        <Box sx={style}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <InputAdornment position="end">
              <IconButton
                onClick={() => handleClose()}
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
                color: `${config.ui.colors.darkPrimary}`,
              }}
            >
              Results detailed table
            </Typography>
          </Box>
          <Box>
            <Box>
              <Box>
                {subRow.beaconId && (
                  <Box
                    sx={{
                      display: "flex",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "black",
                        fontSize: "15px",
                        paddingRight: "10px",
                        color: `${config.ui.colors.darkPrimary}`,
                      }}
                    >
                      Beacon:
                    </Typography>
                    <Typography
                      sx={{
                        color: "black",
                        fontWeight: 700,
                        fontSize: "15px",
                        color: `${config.ui.colors.darkPrimary}`,
                      }}
                    >
                      {subRow.beaconId}
                    </Typography>
                  </Box>
                )}
                {subRow.id && (
                  <Box
                    sx={{
                      display: "flex",
                      paddingTop: "1px",
                      paddingBottom: "10px",
                    }}
                  >
                    <Typography
                      sx={{
                        color: `${config.ui.colors.darkPrimary}`,
                        fontSize: "15px",
                        paddingRight: "10px",
                      }}
                    >
                      Dataset:
                    </Typography>
                    <Typography
                      sx={{
                        color: `${config.ui.colors.darkPrimary}`,
                        fontWeight: 700,
                        fontSize: "15px",
                      }}
                    >
                      {subRow.id}
                    </Typography>
                  </Box>
                )}
              </Box>
              {/* <Box sx={{ paddingBottom: "15px" }}>
                <Typography
                  sx={{
                    color: `${config.ui.colors.darkPrimary}`,
                    fontWeight: 700,
                    fontSize: "13px",
                    fontStyle: "italic",
                  }}
                >
                  <Link
                    href={url}
                    color="inherit"
                    underline="hover"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {url}
                  </Link>
                </Typography>
              </Box> */}
            </Box>
            <Box>
              {loading && <Loader message="Loading data..." />}
              {!loading && dataTable.length > 0 && (
                <>
                  <ResultsTableModalBody
                    dataTable={dataTable}
                    totalItems={totalItems}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalPages={totalPages}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    primary={config.ui.colors.primary}
                  />
                </>
              )}
            </Box>
            <Box></Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default ResultsTableModal;
