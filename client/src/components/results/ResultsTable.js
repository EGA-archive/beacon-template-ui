import { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import config from "../../config/runtimeConfig";
import useBeaconMetadata from "../../hooks/useBeaconMetaData";

import { useSelectedEntry } from "../context/SelectedEntryContext";
import CohortsTable from "./CohortsTable";
import DatasetsTable from "./DatasetsTable";
import NetworkBeaconResultsRows from "./table/NetworkBeaconResultsRows";
import SingleBeaconResultsRows from "./table/SingleBeaconResultsRows";
import useResultsTableColumns from "./table/useResultsTableColumns";

import {
  hiddenOnTabletStyle,
  resultsTableHeaderCellStyle,
  resultsTablePaperStyle,
  resultsTableStyle,
} from "./table/resultsTableStyles";

import { openDatasetDetailedTablePage } from "./utils/openDatasetDetailedTablePage";
import { findBeaconEmail } from "./utils/resultsTableUtils";

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
   * Build the columns and responsive widths
   * required by the current Beacon type.
   */
  const {
    tableColumns,
    getColumnWidth,
    getResponsiveColumnWidth,
    getResponsiveColumnWidthById,
  } = useResultsTableColumns({
    isSingleBeacon,
    entryType: lastSearchedPathSegment,
  });

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
   * Open the selected dataset in its dedicated detailed-table page.
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

  // Entry types with dedicated Results tables.
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
