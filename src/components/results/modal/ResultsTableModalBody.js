import { useState, useEffect, Fragment } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  tableCellClasses
} from "@mui/material";
import { styled } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import config from '../../../config/config.json';
import { DATASET_TABLE_INDIVIDUAL } from '../../../lib/constants';
import ResultsTableModalRow from './ResultsTableModalRow';
import { useSelectedEntry } from "../../context/SelectedEntryContext";
import Loader from "../../common/Loader";

const parseType = (item) => {
  switch(item) {
    case 'dataset':
      return 'datasets';
  }
}

const ResultsTableModalBody = ({ baseItem }) => {
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const { selectedPathSegment } = useSelectedEntry();

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 11,
    },
    border: `1px solid ${config.ui.colors.darkPrimary}`,
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td': {
      border: `1px solid ${config.ui.colors.darkPrimary}`,
    },
    '&:last-child th': {
      border: `1px solid white`,
    }
  }));

  const headerCellStyle = {
    backgroundColor: config.ui.colors.darkPrimary,
    fontWeight: 700,
    color: "white"
  };

  const getDiseases = (row) => {
    if(row) {
      let diseasesString = [];
      row.forEach(element => {
        let diseases = element.diseaseCode.id + "-" + element.diseaseCode.label;
        diseasesString.push(diseases);
      });
      return diseasesString.join(",");
    }
    return "-";
  }

  const getGeographicOrigin = (row) => {
    if(row) {
      return row.id + "-" + row.label;
    }
    return "-";
  }

  const getPhenotypic = (row) => {
    if(row) {
      let phenotypicString = [];
      row.forEach(element => {
        let phenotypic = element.featureType.id + "-" + element.featureType.label;
        phenotypicString.push(phenotypic);
      });
      return phenotypicString.join(",");
    }
    return "-";
  }

  const getSex = (row) => {
    if(row) {
      return row.id + "-" + row.label;
    }
    return "-";
  }

  let tableType = parseType(baseItem.setType);

  useEffect(() => {
    const fetchTableItems = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${config.apiUrl}/${tableType}/${baseItem.id}/${selectedPathSegment}`);
        const data = await res.json();
        let dataFiltered = data.response?.resultSets?.find((item) => item.id === baseItem.id);
        console.log(dataFiltered.results)
        setDataTable(dataFiltered.results);
      } catch (err) {
        console.error("Failed to fetch modal table", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTableItems();
  }, []);

  const handleRowClick = (item) => {
    if(expandedRow && expandedRow.id === item.id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(item);
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          boxShadow: "none",
          borderRadius: 0,
        }}
      >
        { loading && (<Loader message="Loading data..." />)}
        { !loading && dataTable && (
          <TableContainer sx={{ maxHeight: 540 }}>
            <Table stickyHeader aria-label="Results table">
              <TableHead>
                <StyledTableRow>
                  {DATASET_TABLE_INDIVIDUAL.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ width: column.width }}
                      sx={headerCellStyle}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                { dataTable.map((item) => (
                  <Fragment key={ item.id }>
                    <StyledTableRow 
                      hover
                      sx={{
                        '&.MuiTableRow-root': {
                          transition: 'background-color 0.2s ease',
                        },
                        '& td': {
                          borderBottom: '1px solid rgba(224, 224, 224, 1)',
                          py: 1.5,
                        },
                        fontWeight: "bold" 
                      }}>
                      <StyledTableCell 
                        sx={{ fontSize: "11px" }} 
                        style={{ width: DATASET_TABLE_INDIVIDUAL[0].width }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          { item.beaconId ? item.beaconId : item.id }
                        </Box>
                      </StyledTableCell >
                      <StyledTableCell sx={{ fontSize: "11px" }} style={{ width: DATASET_TABLE_INDIVIDUAL[1].width }}>
                        { item[DATASET_TABLE_INDIVIDUAL[1].column] ? getDiseases(item[DATASET_TABLE_INDIVIDUAL[1].column]) : "-" }
                      </StyledTableCell >
                      <StyledTableCell sx={{ fontSize: "11px" }} style={{ width: DATASET_TABLE_INDIVIDUAL[2].width }}>
                        { item[DATASET_TABLE_INDIVIDUAL[2].column] ? getGeographicOrigin(item[DATASET_TABLE_INDIVIDUAL[2].column]) : "-" }
                      </StyledTableCell >
                      <StyledTableCell sx={{ fontSize: "11px" }} style={{ width: DATASET_TABLE_INDIVIDUAL[3].width }}>
                        { item[DATASET_TABLE_INDIVIDUAL[3].column] ? getPhenotypic(item[DATASET_TABLE_INDIVIDUAL[3].column]) : "-" }
                      </StyledTableCell >
                       <StyledTableCell sx={{ fontSize: "11px" }} style={{ width: DATASET_TABLE_INDIVIDUAL[4].width }}>
                        { item[DATASET_TABLE_INDIVIDUAL[4].column] ? getSex(item[DATASET_TABLE_INDIVIDUAL[4].column]) : "-" }
                      </StyledTableCell >
                    </StyledTableRow>

                    { expandedRow && expandedRow.id && expandedRow.id === item.id && (
                      <ResultsTableModalRow 
                        item={expandedRow} 
                      />
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
      </Paper>
    </Box>
  )
}

export default ResultsTableModalBody;