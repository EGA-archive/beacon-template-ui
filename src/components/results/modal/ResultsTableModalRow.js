import {
  Box,
  TableCell,
  TableContainer,
  TableRow,
  Table,
  TableBody,
  Typography,
  Button
} from "@mui/material";

const ResultsTableModalRow = (item) => {

  

  const itemRow = item.results;

  console.log("itemRow:", itemRow);

  return (
    <TableRow>
      <TableCell 
        colSpan={5} 
        sx={{
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
        <Box sx={{ p: 0 }}>
          <TableContainer>
            <Table stickyHeader aria-label="Results table">
              <TableBody>
                <TableCell 
                  style={{ 
                    width: "60%" 
                  }}>
                    { itemRow.description }
                </TableCell>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TableCell>
    </TableRow>
  )
}

export default ResultsTableModalRow;