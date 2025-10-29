import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
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

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setRowsPerPage(newLimit);
  //   setPage(0);
  // };
  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);

    console.log("🔢 Rows per page changed to:", newLimit);
  };
  const handleClose = () => {
    setPage(0);
    setTotalPages(0);
    setTotalItems(0);
    setDataTable([]);
    onClose();
  };

  // const queryBuilder = (page, entryTypeId) => {
  //   let skipItems = page * rowsPerPage;

  //   let filter = {
  //     meta: { apiVersion: "2.0" },
  //     query: {
  //       filters: [],
  //       requestParameters: {},
  //       includeResultsetResponses: "HIT",
  //       pagination: {
  //         skip: parseInt(`${skipItems}`),
  //         limit: parseInt(`${rowsPerPage}`),
  //       },
  //       testMode: false,
  //       requestedGranularity: "record",
  //     },
  //   };

  //   if (selectedFilter.length > 0) {
  //     selectedFilter.forEach((item) => {
  //       if (item.queryParams) {
  //         // Range or genomic query here
  //         filter.query.requestParameters = {
  //           ...filter.query.requestParameters,
  //           ...item.queryParams,
  //         };
  //       } else if (item.operator) {
  //         // Normal Beacon filters
  //         filter.query.filters.push({
  //           id: item.field,
  //           operator: item.operator,
  //           value: item.value,
  //         });
  //       } else {
  //         // Standard filtering term
  //         filter.query.filters.push({
  //           id: item.id,
  //           ...(item.scope ? { scope: item.scope } : {}),
  //         });
  //       }
  //     });
  //   }

  //   return filter;
  // };

  const queryBuilder = (page, entryTypeId) => {
    // Calculate how many items to skip (for pagination)
    const skipItems = page * rowsPerPage;

    // Base Beacon query structure
    const filter = {
      meta: { apiVersion: "2.0" },
      query: {
        filters: [],
        requestParameters: {},
        includeResultsetResponses: "HIT",
        // pagination: {
        //   skip: parseInt(`${skipItems}`),
        //   limit: parseInt(`${rowsPerPage}`),
        // },
        pagination: {
          skip: 0,
          limit: 1000,
        },
        testMode: false,
        requestedGranularity: "record",
      },
    };

    // Build query from selected filters
    if (selectedFilter.length > 0) {
      selectedFilter.forEach((item) => {
        if (item.queryParams) {
          // Genomic or coordinate-based queries → go inside requestParameters
          filter.query.requestParameters = {
            ...filter.query.requestParameters,
            ...item.queryParams,
          };
        } else if (item.operator) {
          // Filter with explicit operator (e.g., =, >, <)
          filter.query.filters.push({
            id: item.id,
            operator: item.operator,
            value: item.value,
          });
        } else {
          // Simple ontology or categorical filter term
          filter.query.filters.push({
            id: item.id,
            ...(item.scope ? { scope: item.scope } : {}),
          });
        }
      });
    }

    // If requestParameters is empty, remove it entirely
    if (
      !filter.query.requestParameters ||
      Object.keys(filter.query.requestParameters).length === 0
    ) {
      delete filter.query.requestParameters;
    }

    // Some Beacons also reject empty `filters` arrays, so remove if empty
    if (filter.query.filters.length === 0) {
      delete filter.query.filters;
    }

    console.log("Final queryBuilder output:", JSON.stringify(filter, null, 2));
    return filter;
  };

  // useEffect(() => {
  //   if (!open) return;

  // const fetchTableItems = async () => {
  //   try {
  //     setLoading(true);

  //     const url = `${config.apiUrl}/${selectedPathSegment}`;
  //     console.log(url);
  //     setUrl(url);
  //     // let query = queryBuilder(page, entryTypeId);
  //     // const response = await fetch(url, {
  //     //   method: "POST",
  //     //   headers: { "Content-Type": "application/json" },
  //     //   body: JSON.stringify(query),
  //     // });

  //     let response;
  //     if (selectedFilter.length === 0) {
  //       response = await fetch(url);
  //     } else {
  //       const query = queryBuilder(page, entryTypeId);
  //       response = await fetch(url, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(query),
  //       });
  //       console.log(query);
  //     }

  //     const data = await response.json();
  //     const results = data.response?.resultSets;

  //     const beacon = results?.find((item) => {
  //       const id = subRow.beaconId || subRow.id;
  //       const itemId = item.beaconId || item.id;
  //       return id === itemId;
  //     });
  //     if (!beacon) {
  //       console.warn("[Modal] No matching beacon found:", subRow);
  //       return;
  //     }
  //     const totalDatasetsPages = Math.ceil(beacon.resultsCount / rowsPerPage);
  //     setTotalItems(beacon.resultsCount);
  //     setTotalPages(totalDatasetsPages);
  //     setDataTable(beacon.results);
  //   } catch (err) {
  //     console.error("❌ Failed to fetch modal table", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchTableItems = async () => {
  //   try {
  //     setLoading(true);
  //     const url = `${config.apiUrl}/${selectedPathSegment}`;
  //     setUrl(url);

  //     console.log("=== FETCH STARTED ===");
  //     console.log("URL:", url);
  //     console.log("Selected path segment:", selectedPathSegment);
  //     console.log("Selected filter:", selectedFilter);

  //     let response;
  //     let query = null;

  //     if (selectedFilter.length === 0) {
  //       console.log("No filters detected. Sending simple GET request.");
  //       response = await fetch(url);
  //     } else {
  //       console.log("Filters detected. Building POST request...");
  //       query = queryBuilder(page, entryTypeId);
  //       console.log("Built query object:", query);
  //       console.log(
  //         "Query JSON stringified:",
  //         JSON.stringify(query, null, 2)
  //       );

  //       response = await fetch(url, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(query),
  //       });
  //     }

  //     console.log("Response status:", response.status);
  //     const data = await response.json();
  //     console.log("Raw response data:", data);

  //     // Check if the backend returned an error object
  //     if (data.error) {
  //       console.log("Server responded with an error:", data.error);
  //     }

  //     const results = data.response?.resultSets;
  //     console.log("Extracted resultSets:", results);

  //     const beacon = results?.find((item) => {
  //       const id = subRow.beaconId || subRow.id;
  //       const itemId = item.beaconId || item.id;
  //       return id === itemId;
  //     });

  //     if (!beacon) {
  //       console.warn("[Modal] No matching beacon found. SubRow:", subRow);
  //       return;
  //     }

  //     console.log("Beacon found:", beacon);

  //     const totalDatasetsPages = Math.ceil(beacon.resultsCount / rowsPerPage);
  //     console.log("Total results:", beacon.resultsCount);
  //     console.log("Total pages:", totalDatasetsPages);

  //     setTotalItems(beacon.resultsCount);
  //     setTotalPages(totalDatasetsPages);
  //     setDataTable(beacon.results);

  //     console.log("Data table updated:", beacon.results);
  //     console.log("=== FETCH COMPLETED SUCCESSFULLY ===");
  //   } catch (err) {
  //     console.error("❌ Failed to fetch modal table:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // fetchTableItems();
  // }, [open, subRow, page, rowsPerPage]);

  useEffect(() => {
    if (!open) return;
    let active = true;

    const fetchTableItems = async () => {
      try {
        setLoading(true);
        const url = `${config.apiUrl}/${selectedPathSegment}`;
        setUrl(url);

        console.log("=== FETCH STARTED ===");
        console.log("🔗 URL:", url);
        console.log("📂 Selected path segment:", selectedPathSegment);
        console.log("🎛 Selected filter:", selectedFilter);

        let response;
        let query = null;

        if (selectedFilter.length === 0) {
          console.log("🟢 No filters detected → sending simple GET request");
          response = await fetch(url);
        } else {
          console.log("🧩 Filters detected → building POST query...");
          query = queryBuilder(page, entryTypeId);
          console.log("🧱 Built query object:", query);
          console.log(
            "🧾 Query (stringified):",
            JSON.stringify(query, null, 2)
          );

          response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query),
          });
        }

        console.log("📡 Response status:", response.status);
        const data = await response.json();
        if (!active) return;

        console.log("📦 Raw response:", data);

        if (data.error) {
          console.warn("⚠️ Server responded with an error:", data.error);
        }

        const results = data.response?.resultSets;
        console.log("📊 Extracted resultSets length:", results?.length || 0);

        const beacon = results?.find((item) => {
          const id = subRow.beaconId || subRow.id;
          const itemId = item.beaconId || item.id;
          return id === itemId;
        });

        if (!beacon) {
          console.warn("🚫 No matching beacon found for:", subRow);
          return;
        }

        console.log("✅ Beacon found:", beacon.beaconId || beacon.id);
        console.log("📈 Beacon resultsCount:", beacon.resultsCount);
        console.log("📉 Beacon.results length:", beacon.results?.length || 0);

        // Check for missing or partial data (like when the modal goes blank)
        if (!beacon.results || beacon.results.length === 0) {
          console.warn("⚠️ Beacon results array is empty!");

          if (beacon.results?.length === 0) {
            const skip = page * rowsPerPage;
            console.warn("⚠️ Empty results received at skip:", skipItems);
            console.log("🔍 Full beacon object:", beacon);
            console.log("🧾 Full API response:", data);
          }
        } else {
          // Check for missing variantInternalId
          const allIds = beacon.results
            .map((r) => r.variantInternalId)
            .filter(Boolean);
          console.log("🧬 variantInternalId count:", allIds.length);
          console.log("🧬 First few IDs:", allIds.slice(0, 5));
          console.log("🧬 Last few IDs:", allIds.slice(-5));
        }

        const totalDatasetsPages = Math.ceil(beacon.resultsCount / rowsPerPage);
        console.log("📚 Total pages:", totalDatasetsPages);

        setTotalItems(beacon.resultsCount);
        setTotalPages(totalDatasetsPages);
        setDataTable(beacon.results);

        // Double-check render counts
        console.log(
          `✅ Data table updated → ${
            beacon.results?.length || 0
          } rows set (${selectedPathSegment})`
        );
        console.log("=== FETCH COMPLETED SUCCESSFULLY ===");
      } catch (err) {
        console.error("❌ Failed to fetch modal table:", err);
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

// import { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   InputAdornment,
//   IconButton,
//   Modal,
//   Fade,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import ResultsTableModalBody from "./ResultsTableModalBody";
// import Loader from "../../common/Loader";
// import config from "../../../config/config.json";
// import { useSelectedEntry } from "../../context/SelectedEntryContext";
// import { PATH_SEGMENT_TO_ENTRY_ID } from "../../common/textFormatting";

// const style = {
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: "90%",
//   maxWidth: "1200px",
//   height: "80vh",
//   bgcolor: "background.paper",
//   borderRadius: 2,
//   boxShadow: 24,
//   display: "flex",
//   flexDirection: "column",
//   overflowY: "auto",
//   p: 4,
// };

// export default function ResultsTableModal({ open, subRow, onClose }) {
//   const { selectedPathSegment, selectedFilter } = useSelectedEntry();

//   const [loading, setLoading] = useState(false);
//   const [allData, setAllData] = useState([]);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(3);
//   const [dataTable, setDataTable] = useState([]);
//   const [totalItems, setTotalItems] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);

//   const entryTypeId = PATH_SEGMENT_TO_ENTRY_ID[selectedPathSegment];

//   // Reset modal state
//   const handleClose = () => {
//     setPage(0);
//     setAllData([]);
//     setDataTable([]);
//     setTotalItems(0);
//     setTotalPages(0);
//     onClose();
//   };

//   const handleChangePage = (_, newPage) => setPage(newPage);
//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   // Build query body
//   const buildQuery = () => {
//     const query = {
//       meta: { apiVersion: "2.0" },
//       query: {
//         includeResultsetResponses: "HIT",
//         testMode: false,
//         requestedGranularity: "record",
//       },
//     };

//     if (selectedFilter.length > 0) {
//       const filters = [];
//       let requestParameters = {};

//       selectedFilter.forEach((item) => {
//         if (item.queryParams) {
//           requestParameters = { ...requestParameters, ...item.queryParams };
//         } else if (item.operator) {
//           filters.push({
//             id: item.field,
//             operator: item.operator,
//             value: item.value,
//           });
//         } else {
//           filters.push({
//             id: item.id,
//             ...(item.scope ? { scope: item.scope } : {}),
//           });
//         }
//       });

//       if (filters.length) query.query.filters = filters;
//       if (Object.keys(requestParameters).length)
//         query.query.requestParameters = requestParameters;
//     }

//     return query;
//   };

//   // Fetch all results once when modal opens
//   useEffect(() => {
//     if (!open) return;

//     const fetchAllResults = async () => {
//       try {
//         setLoading(true);
//         const url = `${config.apiUrl}/${selectedPathSegment}`;

//         let response;
//         if (selectedFilter.length > 0) {
//           const query = buildQuery();
//           response = await fetch(url, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(query),
//           });
//         } else {
//           response = await fetch(url);
//         }

//         const data = await response.json();
//         const results = data.response?.resultSets;
//         if (!results) {
//           console.warn("[Modal] No results found in response");
//           return;
//         }

//         const beacon = results.find((item) => {
//           const id = subRow.beaconId || subRow.id;
//           const itemId = item.beaconId || item.id;
//           return id === itemId;
//         });

//         if (!beacon) {
//           console.warn("[Modal] No matching beacon found:", subRow);
//           return;
//         }

//         const rows = beacon.results || [];
//         const count = beacon.resultsCount || rows.length;

//         setAllData(rows);
//         setTotalItems(count);
//         setTotalPages(Math.ceil(count / rowsPerPage));
//       } catch (error) {
//         console.error("❌ Failed to fetch modal table:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllResults();
//     // Only when modal opens or closes
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open]);

//   // Slice data locally when page or rowsPerPage change
//   useEffect(() => {
//     if (!allData.length) return;
//     const start = page * rowsPerPage;
//     const end = start + rowsPerPage;
//     setDataTable(allData.slice(start, end));
//   }, [allData, page, rowsPerPage]);

//   return (
//     <Modal open={open} onClose={handleClose}>
//       <Fade in={open}>
//         <Box sx={style}>
//           {/* Close button */}
//           <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//             <InputAdornment position="end">
//               <IconButton
//                 onClick={handleClose}
//                 size="small"
//                 sx={{ color: config.ui.colors.darkPrimary }}
//               >
//                 <CloseIcon fontSize="small" />
//               </IconButton>
//             </InputAdornment>
//           </Box>

//           {/* Header */}
//           <Typography
//             sx={{
//               fontWeight: "bold",
//               fontSize: "17px",
//               mb: 2,
//               color: config.ui.colors.darkPrimary,
//             }}
//           >
//             Results detailed table
//           </Typography>

//           {/* Beacon info */}
//           <Box sx={{ mb: 2 }}>
//             {subRow.beaconId && (
//               <Typography sx={{ color: config.ui.colors.darkPrimary }}>
//                 Beacon: <strong>{subRow.beaconId}</strong>
//               </Typography>
//             )}
//             {subRow.id && (
//               <Typography sx={{ color: config.ui.colors.darkPrimary }}>
//                 Dataset: <strong>{subRow.id}</strong>
//               </Typography>
//             )}
//           </Box>

//           {/* Table */}
//           <Box>
//             {loading && <Loader message="Loading data..." />}
//             {!loading && dataTable.length > 0 && (
//               <ResultsTableModalBody
//                 dataTable={dataTable}
//                 totalItems={totalItems}
//                 page={page}
//                 rowsPerPage={rowsPerPage}
//                 totalPages={totalPages}
//                 handleChangePage={handleChangePage}
//                 handleChangeRowsPerPage={handleChangeRowsPerPage}
//                 primary={config.ui.colors.primary}
//                 entryTypeId={entryTypeId}
//                 selectedPathSegment={selectedPathSegment}
//               />
//             )}
//           </Box>
//         </Box>
//       </Fade>
//     </Modal>
//   );
// }
