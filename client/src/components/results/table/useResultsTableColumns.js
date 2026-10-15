import { useMemo } from "react";
import { Box } from "@mui/material";

import {
  BEACON_NETWORK_COLUMNS,
  BEACON_NETWORK_TABLET_COLUMN_WIDTHS,
  BEACON_SINGLE_COLUMNS,
  BEACON_SINGLE_TABLET_COLUMN_WIDTHS,
} from "../../../lib/tableConstants";

import { formatEntryTypeLabel } from "../utils/resultsTableUtils";
import { resultsHeaderSubtitleStyle } from "./resultsTableStyles";

/**
 * Builds the Results table columns and their responsive widths.
 * Single and Network Beacons use different column definitions,
 * but the Results table can consume them through the same API.
 */
export default function useResultsTableColumns({ isSingleBeacon, entryType }) {
  return useMemo(() => {
    const baseColumns = isSingleBeacon
      ? BEACON_SINGLE_COLUMNS
      : BEACON_NETWORK_COLUMNS;

    const compactWidths = isSingleBeacon
      ? BEACON_SINGLE_TABLET_COLUMN_WIDTHS
      : BEACON_NETWORK_TABLET_COLUMN_WIDTHS;

    /**
     * Add the searched entry type underneath
     * the Search Results column heading.
     */
    const tableColumns = baseColumns.map((column) =>
      column.id === "response"
        ? {
            ...column,
            label: (
              <Box>
                <Box>Search Results</Box>

                <Box sx={resultsHeaderSubtitleStyle}>
                  ({formatEntryTypeLabel(entryType)})
                </Box>
              </Box>
            ),
          }
        : column
    );

    /**
     * Compact widths are used below lg.
     * Desktop keeps the original configured width.
     */
    const getResponsiveColumnWidth = (column) => ({
      xs: compactWidths[column.id] || column.width,
      lg: column.width,
    });

    const getColumnWidth = (columnId) =>
      tableColumns.find((column) => column.id === columnId)?.width;

    const getResponsiveColumnWidthById = (columnId) => {
      const column = tableColumns.find((column) => column.id === columnId);

      return column ? getResponsiveColumnWidth(column) : undefined;
    };

    return {
      tableColumns,
      getColumnWidth,
      getResponsiveColumnWidth,
      getResponsiveColumnWidthById,
    };
  }, [isSingleBeacon, entryType]);
}
