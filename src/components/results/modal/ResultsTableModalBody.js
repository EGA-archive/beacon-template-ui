import { useState, Fragment } from 'react';
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
  TablePagination
} from "@mui/material";
import { styled } from '@mui/material/styles';
import config from '../../../config/config.json';
import { DATASET_TABLE_NETWORK } from '../../../lib/constants';
import ResultsTableModalRow from './ResultsTableModalRow';

const ResultsTableModalBody = ({ dataTable, totalItems, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: config.ui.colors.darkPrimary,
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
    if (row) {
      return row.map(el => `${el.diseaseCode.id}-${el.diseaseCode.label}`).join(", ");
    }
    return "-";
  };

  const getGeographicOrigin = (row) => row ? `${row.id}-${row.label}` : "-";

  const getPhenotypic = (row) => row ? row.map(el => `${el.featureType.id}-${el.featureType.label}`).join(", ") : "-";

  const getSex = (row) => row ? `${row.id}-${row.label}` : "-";

  const handleRowClick = (item) => {
    if(expandedRow && expandedRow.id === item.id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(item);
    }
  };

  function formatHeaderName(header) {
    const withSpaces = header.replace(/([A-Z])/g, ' $1');
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  }


  const cleanAndParseInfo = (infoString) => {
    try {
      if (typeof infoString !== "string") return null;

      const cleaned = infoString.replace(/"|"/g, '"');
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (error) {
      console.log("Failed to parse item.info:", error);
      return null;
    }
  };

  const headersSet = new Set();
  dataTable.forEach(obj => {
    Object.keys(obj).forEach(key => {
      headersSet.add(key);
    });
  });

  const headers = Array.from(headersSet);

  const indexedHeaders = {};
  headers.forEach((header, index) => {
    indexedHeaders[index] = {
      id: header,
      name: formatHeaderName(header)
    };
  });

  const headersArray = Object.values(indexedHeaders);
  const sortedHeaders = [
    ...headersArray.filter(h => h.id === "id"),
    ...headersArray.filter(h => h.id !== "id")
  ];

  function summarizeValue(value) {
    if (value == null) return "-";

    if (Array.isArray(value)) {
      return value.map((el) => summarizeValue(el)).join(", ");
    }

    if (typeof value === "object") {
      if (value.label) {
        return value.label;
      }

      if (value.id) {
        return value.id;
      }

      const nestedValues = Object.values(value).map((v) => summarizeValue(v)).filter(Boolean);

      if (nestedValues.length) {
        return nestedValues.join(", ");
      }

      return "-";
    }

    if (typeof value === "string" || typeof value === "number") {
      return value;
    }

    return "-";
  }

  function renderCellContent(item, column) {
    const value = item[column];
    if (!value) return "-";

    return summarizeValue(value);
  }

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
        <>
          <TableContainer sx={{ maxHeight: 540 }}>
            <Table stickyHeader aria-label="Results table">
              <TableHead>
                <StyledTableRow>
                  {sortedHeaders.map((column) => (
                    <TableCell
                      key={column.id}
                      sx={headerCellStyle}
                    >
                      {column.name}
                    </TableCell>
                  ))}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                { dataTable.map((item, index) => {
                  const isExpanded = expandedRow?.id === item.id;
                  let id = item.id;
                  const parsedInfo = cleanAndParseInfo(item.info);
                  if (parsedInfo?.sampleID) {
                    id += `_${parsedInfo.sampleID}`;
                  } else {
                    id += `_${index}`;
                  }

                  return (
                    <Fragment key={id}>
                      <StyledTableRow
                        key={`row-${id}`}
                        hover
                        sx={{
                          '&.MuiTableRow-root': {
                            transition: 'background-color 0.2s ease',
                          },
                          '& td': {
                            borderBottom: '1px solid rgba(224, 224, 224, 1)',
                            py: 1.5,
                          },
                          fontWeight: "bold",
                        }}
                      >
                        {Object.values(indexedHeaders).map((colConfig) => (
                          <StyledTableCell
                            key={`${id}-${colConfig.id}`}
                            sx={{ fontSize: "11px" }}
                            style={{ width: colConfig.width }}
                          >
                            {renderCellContent(item, colConfig.id)}
                          </StyledTableCell>
                        ))}
                      </StyledTableRow>

                      {isExpanded && (
                        <ResultsTableModalRow key={`expanded-${id}`} item={expandedRow} />
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      </Paper>
    </Box>
  )
}

export default ResultsTableModalBody;