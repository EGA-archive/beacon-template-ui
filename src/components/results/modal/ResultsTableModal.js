import { useState, useEffect } from 'react';
import {
  Box,
  Typography
} from "@mui/material";
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import ResultsTableModalBody from './ResultsTableModalBody';
import config from '../../../config/config.json';
import CloseIcon from "@mui/icons-material/Close";
import { InputAdornment, IconButton } from "@mui/material";
import { useSelectedEntry } from "../../context/SelectedEntryContext";
import Loader from "../../common/Loader";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1200,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ResultsTableRowModal = ({ open, subRow, onClose }) => {
  const { selectedPathSegment, selectedFilter } = useSelectedEntry();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dataTable, setDataTable] = useState([]);


  const parseType = (item) => {
    switch(item) {
      case 'dataset':
        return 'datasets';
      default:
        return null;
    }
  }

  const tableType = parseType(subRow.setType);

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  }

  const queryBuilder = (page) => {
    let skipItems = page * rowsPerPage;
    let filter = {
      "meta": {
        "apiVersion": "2.0"
      },
      "query": {
        "filters": [],
        "includeResultsetResponses": "HIT",
        "testMode": false,
        "requestedGranularity": "record",
        "pagination": {
          "skip": parseInt(`${(skipItems)}`),
          "limit": parseInt(`${(rowsPerPage)}`)
        },
      }
    }

    let filterData = selectedFilter.map((item) => item.id);
    filter.query.filters = filterData;
    return filter;
  }

  useEffect(() => {
    const fetchTableItems = async () => {
      try {
        setLoading(true);
        const url = `${config.apiUrl}/${tableType}/${subRow.id}/${selectedPathSegment}`;
        let query = queryBuilder(page);

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query
          })
        };

        const response = await fetch(url, requestOptions);
        const data = await response.json();
        const results = data.response?.resultSets;

        const beacon = results.find((item) => {
          const id = subRow.beaconId || subRow.id;
          const itemId = item.beaconId || item.id;
          return id === itemId;
        });
        const totalDatasetsPages = Math.ceil(beacon.resultsCount / rowsPerPage);
        
        setTotalPages (totalDatasetsPages)
        setDataTable(beacon.results);
      } catch (err) {
        console.error("Failed to fetch modal table", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTableItems();
  }, [page, rowsPerPage]);

  return (
    <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
      <Fade in={open}>
        <Box sx={style}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <InputAdornment position="end">
              <IconButton
                onClick={() => onClose()}
                size="small"
                sx={{ color: config.ui.colors.darkPrimary }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          </Box>
          <Box>
            <Typography id="modal-modal-title" 
              sx={{ 
                fontWeight: "bold",
                fontSize: "17px",
                paddingBottom: "10px",
                color: `${ config.ui.colors.darkPrimary }`
              }}>
              Results detailed table
            </Typography>
          </Box>
          <Box>
            <Box>
              <Box>
                { subRow.beaconId  && (
                  <Box
                    sx={{
                      display: "flex"
                    }}>
                    <Typography sx={{
                      color: "black",
                      fontSize: "15px",
                      paddingRight: "10px",
                      color: `${ config.ui.colors.darkPrimary }`
                    }}>
                      Beacon:
                    </Typography>
                    <Typography sx={{
                      color: "black",
                      fontWeight: 700,
                      fontSize: "15px",
                      color: `${ config.ui.colors.darkPrimary }`
                    }}>
                      { subRow.beaconId }
                    </Typography>
                  </Box>
                )}
                { subRow.id  && (
                  <Box
                    sx={{
                      display: "flex",
                      paddingTop: "1px",
                      paddingBottom: "10px"
                    }}>
                    <Typography sx={{
                      color: `${ config.ui.colors.darkPrimary }`,
                      fontSize: "15px",
                      paddingRight: "10px",
                    }}>
                      Dataset:
                    </Typography>
                    <Typography sx={{
                      color: `${ config.ui.colors.darkPrimary }`,
                      fontWeight: 700,
                      fontSize: "15px",
                    }}>
                      { subRow.id }
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box>
                
              </Box>
            </Box>
            <Box>
              { loading && (<Loader message="Loading data..." />)}
              { !loading && dataTable.length>0 && (
                <>
                  <ResultsTableModalBody 
                    dataTable={dataTable}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalPages={totalPages}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    primary={ config.ui.colors.primary }
                  />
                </>
              )}
            </Box>
            <Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default ResultsTableRowModal;