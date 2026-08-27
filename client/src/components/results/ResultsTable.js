import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  BEACON_NETWORK_COLUMNS,
  BEACON_NETWORK_TABLET_COLUMN_WIDTHS,
  BEACON_SINGLE_COLUMNS,
  BEACON_SINGLE_TABLET_COLUMN_WIDTHS,
} from "../../lib/tableConstants";
import config from "../../config/runtimeConfig";
import useBeaconMetadata from "../../hooks/useBeaconMetaData";

import { useSelectedEntry } from "../context/SelectedEntryContext";
import CohortsTable from "./CohortsTable";
import DatasetsTable from "./DatasetsTable";
import NetworkBeaconResultsRows from "./table/NetworkBeaconResultsRows";
import SingleBeaconResultsRows from "./table/SingleBeaconResultsRows";

import {
  hiddenOnTabletStyle,
  resultsHeaderSubtitleStyle,
  resultsTableHeaderCellStyle,
  resultsTablePaperStyle,
  resultsTableStyle,
} from "./table/resultsTableStyles";

import { openDatasetDetailedTablePage } from "./utils/openDatasetDetailedTablePage";
import {
  findBeaconEmail,
  formatEntryTypeLabel,
} from "./utils/resultsTableUtils";

export default function ResultsTable() {
  const {
    resultData,
    beaconsInfo,
    selectedPathSegment: selectedEntryType,
    lastSearchedFilters,
    lastSearchedPathSegment,
  } = useSelectedEntry();

  const { envMap } = useBeaconMetadata();

  const [expandedRows, setExpandedRows] = useState({});

  const isSingleBeacon = config.beaconType === "singleBeacon";

  /**
   * Toggle the dataset rows belonging to a Network Beacon.
   */
  const handleToggleRow = (item) => {
    const beaconId = item.beaconId || item.id;

    if (!beaconId) return;

    setExpandedRows((prev) => ({
      ...prev,
      [beaconId]: !prev[beaconId],
    }));
  };

  const baseColumns = isSingleBeacon
    ? BEACON_SINGLE_COLUMNS
    : BEACON_NETWORK_COLUMNS;

  /**
   * Add the searched entry type underneath the Search Results heading.
   */
  const tableColumns = baseColumns.map((column) =>
    column.id === "response"
      ? {
          ...column,
          label: (
            <Box>
              <Box>Search Results</Box>

              <Box sx={resultsHeaderSubtitleStyle}>
                ({formatEntryTypeLabel(lastSearchedPathSegment)})
              </Box>
            </Box>
          ),
        }
      : column
  );

  /**
   * Use compact widths below lg and the configured
   * column widths on desktop.
   */
  const getResponsiveColumnWidth = (column) => {
    const compactWidths = isSingleBeacon
      ? BEACON_SINGLE_TABLET_COLUMN_WIDTHS
      : BEACON_NETWORK_TABLET_COLUMN_WIDTHS;

    return {
      xs: compactWidths[column.id] || column.width,
      lg: column.width,
    };
  };

  const getColumnWidth = (columnId) =>
    tableColumns.find((column) => column.id === columnId)?.width;

  const getResponsiveColumnWidthById = (columnId) => {
    const column = tableColumns.find((column) => column.id === columnId);

    return column ? getResponsiveColumnWidth(column) : undefined;
  };

  /**
   * Network Beacon rows containing datasets start expanded.
   */
  useEffect(() => {
    const initialExpandedRows = {};

    resultData.forEach((item) => {
      const beaconId = item.beaconId || item.id;

      if (item.items?.length > 0 && beaconId) {
        initialExpandedRows[beaconId] = true;
      }
    });

    setExpandedRows(initialExpandedRows);
  }, [resultData]);

  /**
   * Open the selected dataset in the dedicated detailed-table page.
   */
  const handleOpenDetails = (subRow) => {
    openDatasetDetailedTablePage({
      subRow,
      entryTypeId: lastSearchedPathSegment,
      selectedFilters: lastSearchedFilters || [],
      contactEmail: findBeaconEmail(
        beaconsInfo,
        subRow.beaconId,
        config.beaconType
      ),
    });
  };

  // Entry types with dedicated table components.
  if (["cohort", "cohorts"].includes(selectedEntryType)) {
    return <CohortsTable />;
  }

  if (["dataset", "datasets"].includes(selectedEntryType)) {
    return <DatasetsTable />;
  }

  // Do not render non-existing or erroring Beacon responses.
  const visibleResultData = resultData.filter(
    (item) => item.exists === true && !item.info?.error
  );

  return (
    <Paper sx={resultsTablePaperStyle}>
      <TableContainer>
        <Table
          stickyHeader
          aria-label="Results table"
          data-cy="results-table"
          sx={resultsTableStyle}
        >
          <TableHead>
            <TableRow>
              {tableColumns.map((column) => {
                const hideOnCompact =
                  column.id === "maturity" || column.id === "data_visibility";

                return (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    sx={{
                      ...resultsTableHeaderCellStyle,
                      width: getResponsiveColumnWidth(column),

                      ...(hideOnCompact ? hiddenOnTabletStyle : {}),
                    }}
                  >
                    {column.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {isSingleBeacon ? (
              <SingleBeaconResultsRows
                resultData={visibleResultData}
                beaconsInfo={beaconsInfo}
                lastSearchedFilters={lastSearchedFilters}
                lastSearchedPathSegment={lastSearchedPathSegment}
                getResponsiveColumnWidthById={getResponsiveColumnWidthById}
                hiddenOnTabletStyle={hiddenOnTabletStyle}
                onOpenDetails={handleOpenDetails}
              />
            ) : (
              <NetworkBeaconResultsRows
                resultData={visibleResultData}
                beaconsInfo={beaconsInfo}
                envMap={envMap}
                expandedRows={expandedRows}
                onToggleRow={handleToggleRow}
                onOpenDetails={handleOpenDetails}
                getResponsiveColumnWidthById={getResponsiveColumnWidthById}
                getColumnWidth={getColumnWidth}
                hiddenOnTabletStyle={hiddenOnTabletStyle}
              />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
