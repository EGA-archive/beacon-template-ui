import {
  Box,
  TableCell,
  TableContainer,
  TableRow,
  Table,
  TableBody
} from "@mui/material";

const ResultsTableModalRow = ({ item }) => {
  const itemRow = item.results;

  return (
    <TableRow key={`modal-row-${item.id}`}>
      <TableCell
        colSpan={5}
        sx={{
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 2
        }}
      >
        <Box>
          <Typography variant="body2" color="textSecondary">
            {itemRow?.description || "No description available"}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default ResultsTableModalRow;