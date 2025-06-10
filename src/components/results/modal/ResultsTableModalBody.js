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
  Button
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import config from '../../../config/config.json';
import { DATASET_TABLE_INDIVIDUAL } from '../../../lib/constants';
import ResultsTableModalRow from './ResultsTableModalRow';
import { useSelectedEntry } from "../../context/SelectedEntryContext";


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
  

  const headerCellStyle = {
    backgroundColor: config.ui.colors.primary,
    fontWeight: 700,
    color: "white"
  };

  console.log("base item: " , baseItem);
  console.log("selectedPathSegment: " , selectedPathSegment);

  let tableType = parseType(baseItem.setType);

  useEffect(() => {
    const fetchTableItems = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${config.apiUrl}/${tableType}/${baseItem.id}/${selectedPathSegment}`);
        const data = await res.json();

        console.log("data: " , data.response?.resultSets[0]?.results)
        setDataTable(data.response?.resultSets[0]?.results);

      } catch (err) {
        console.error("Failed to fetch modal table", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTableItems();
  }, []);

  const handleRowClick = (item) => {
    console.log(item)
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
        { loading && <p> Loading ...</p>}

        { !loading && dataTable && (
          <TableContainer>
            <Table stickyHeader aria-label="Results table">
              <TableHead>
                <TableRow>
                  {DATASET_TABLE_INDIVIDUAL.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ width: column.width }}
                      sx={headerCellStyle}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                { dataTable.map((item) => (
                  <Fragment key={ item.id }>
                    <TableRow
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&.MuiTableRow-root': {
                          transition: 'background-color 0.2s ease',
                        },
                        '& td': {
                          borderBottom: '1px solid rgba(224, 224, 224, 1)',
                          py: 1.5,
                        },
                        fontWeight: "bold" 
                      }}>
                      <TableCell 
                        sx={{ fontWeight: "bold" }} 
                        style={{ width: DATASET_TABLE_INDIVIDUAL[0].width }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          { item.beaconId ? item.beaconId : item.id }
                      </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: DATASET_TABLE_INDIVIDUAL[1].width }}>
                        { item[DATASET_TABLE_INDIVIDUAL[1].column] ? item[DATASET_TABLE_INDIVIDUAL[1].column] : '-' }
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: DATASET_TABLE_INDIVIDUAL[2].width }}>
                        { DATASET_TABLE_INDIVIDUAL[2].column }
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold"  }} style={{ width: DATASET_TABLE_INDIVIDUAL[3].width }}>
                        { DATASET_TABLE_INDIVIDUAL[3].column }
                      </TableCell>
                    </TableRow>

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