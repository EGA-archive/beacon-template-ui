import { Box } from "@mui/material";
import TableToolbarControls from "../table/TableToolbarControls";

/**
 * Toolbar for the Results Table.
 *
 * It displays Results-specific information above the shared table controls.
 *
 * The column selector, keyword search and download button are shared
 * with other tables through TableToolbarControls.
 */
export default function ResultsTableToolbar({
  visibleColumns,
  setVisibleColumns,
  searchTerm,
  setSearchTerm,
  sortedHeaders,
  count,
  loadedCount,
  handleExport,
}) {
  return (
    <Box sx={{ mb: 2 }}>
      {/* Results-specific information */}
      <Box
        sx={{
          color: "000",
          fontSize: "14px",
          mb: 2,
        }}
      >
        <Box
          sx={{
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          Total Results:{" "}
          {count
            ? new Intl.NumberFormat(navigator.language).format(count)
            : "—"}
          <Box
            component="span"
            sx={{
              ml: 1,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "12px",
            }}
          >
            {loadedCount &&
              count > loadedCount &&
              `(Details returned for the first ${loadedCount} records)`}
          </Box>
        </Box>
      </Box>

      {/* Shared table controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/*
         * Keep the left side available for future Results-specific
         * display options.
         */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        />

        <TableToolbarControls
          columns={sortedHeaders}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleExport={handleExport}
        />
      </Box>
    </Box>
  );
}
