import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  formatAlleleFrequency,
  formatCount,
} from "../../utils/alleleFrequencyUtils";
import config from "../../../../config/config.json";

/**
 * Displays allele-frequency information for each population.
 *
 * The component receives already-normalized rows, so it only handles
 * how the values are displayed.
 */

const primaryDarkColor = config.ui.colors.darkPrimary;

export default function AlleleFrequencyTable({ rows = [] }) {
  return (
    <TableContainer
      sx={{
        border: `1px solid ${primaryDarkColor}`,
        borderRadius: "8px",
        overflowX: "auto",
      }}
    >
      <Table size="small">
        <TableHead
          sx={{
            backgroundColor: primaryDarkColor,
            "& .MuiTableCell-root": {
              color: "white",
              fontWeight: 700,
              height: "49px",
            },
          }}
        >
          <TableRow>
            <TableCell>Population</TableCell>
            <TableCell align="center">Allele Frequency</TableCell>

            <TableCell align="center">Allele Count</TableCell>

            <TableCell align="center">Allele Number</TableCell>

            <TableCell align="center">Homozygous</TableCell>

            <TableCell align="center">Heterozygous</TableCell>

            <TableCell align="center">Hemizygous</TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            "& .MuiTableRow-root": {
              height: "39px",
            },
            "& .MuiTableCell-root": {
              height: "39px",
              py: 0,
              textAlign: "center",
            },
            "& .MuiTableCell-root:first-of-type": {
              textAlign: "left",
            },
          }}
        >
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.population}</TableCell>

              <TableCell align="right">
                {formatAlleleFrequency(row.alleleFrequency)}
              </TableCell>

              <TableCell align="right">
                {formatCount(row.alleleCount)}
              </TableCell>

              <TableCell align="right">
                {formatCount(row.alleleNumber)}
              </TableCell>

              <TableCell align="right">{formatCount(row.homozygous)}</TableCell>

              <TableCell align="right">
                {formatCount(row.heterozygous)}
              </TableCell>

              <TableCell align="right">{formatCount(row.hemizygous)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
