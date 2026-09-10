import { useEffect, useState } from "react";
import { Box, TablePagination } from "@mui/material";
import Loader from "../common/Loader";
import ResultsEmpty from "../results/ResultsEmpty";
import ResultsTableModalBody from "../results/modal/ResultsTableModalBody";
import ResultsPageHeader from "../results/modal/ResultsPageHeader";
import { useDatasetDetailedRecordsTransfer } from "../results/hooks/useDatasetDetailedRecordsTransfer";
import { useDatasetDetailedRecordsFallback } from "../results/hooks/useDatasetDetailedRecordsFallback";
import { openAlleleFrequencyPage } from "../results/utils/openAlleleFrequencyPage";
import { useDatasetDetailedTableContext } from "../results/hooks/useDatasetDetailedTableContext";
/**
 It displays the detailed records for one selected dataset from the main results table.
 When the page first opens, it tries to receive the 100 records that were already loaded on the Results page. This makes the table appear quickly and avoids storing large amounts of data in localStorage.
 If the page is refreshed, those transferred records are no longer available.
 In that case, the page sends the same query to the Beacon API and loads the records again, in this step the user will see a loader.
 *
 * The page also manages:
 * - visible table columns;
 * - search;
 * - pagination;
 * - loading and error states;
 * - opening the Allele Frequency page for a selected variant.
 */
export default function DatasetDetailedTablePage() {
  /**
   * Read the information needed by this page.
   * This includes the selected Beacon, dataset, entry type, filters, applied query and the unique query ID that is created to keep each tab unique.
   */
  const {
    queryId,
    storedContext,
    selectedFilters,
    selectedEntryTypePath,
    beaconId,
    datasetId,
    entryTypeId,
  } = useDatasetDetailedTableContext();

  /**
   * Actual contact information for the selected Beacon.
   * This was resolved from beaconsInfo in the main Results page
   * and saved as part of the dataset detailed table context.
   */
  const contactEmail = storedContext?.contactEmail || null;

  /**
   * Store the detailed records shown in the table.
   * loading is used when the page must request the records again.
   * fetchError contains a message when the request fails.
   */
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  /**
   * Total number of results reported by the selected dataset.
   *
   * When the page is opened from the Results table, the count is already
   * available in the stored context.
   *
   * When the page is opened directly or refreshed, the fallback request
   * updates this value from the fresh Beacon response.
   */
  const [totalResults, setTotalResults] = useState(
    storedContext.displayedCount ?? null
  );

  /**
   * Try to receive the records that are already loaded in the main Results table.
   *
   * isWaitingForTransferredRecords:
   * The page is waiting for the original Results tab to send the records.
   *
   * hasTransferredRecords:
   * The records were successfully received from the original tab.
   *
   * shouldFetchRecords:
   * The transfer was not possible, so the page must request the records
   * from the Beacon API.
   */
  const {
    isWaitingForTransferredRecords,
    hasTransferredRecords,
    shouldFetchRecords,
  } = useDatasetDetailedRecordsTransfer({
    queryId,
    setRecords: setDataTable,
    setLoading,
    setError: setFetchError,
  });

  /**
   * Request the records from the Beacon API only when the main result table cannot send them.
   *
   * This normally happens when the user refreshes the detailed-table page or opens it without the original Results tab.
   */
  useDatasetDetailedRecordsFallback({
    shouldFetchRecords,
    hasTransferredRecords,
    entryTypePath: selectedEntryTypePath,
    queryFilters: selectedFilters,
    beaconId,
    datasetId,
    setRecords: setDataTable,
    setTotalResults,
    setLoading,
    setError: setFetchError,
  });
  /**
   * State used by the dataset detailed table interface.
   * visibleColumns: The columns currently selected by the user.
   * searchTerm: The text entered in the table search field.
   * searchCount: The number of records matching the search.
   * page and rowsPerPage: Control the table pagination.
   */
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCount, setSearchCount] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /**
   * Return to the first page whenever the user changes the search text.
   * This prevents the user from remaining on a page that may no longer exist after filtering the records.
   */
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  /**
   * Make sure the current page is still valid.
   *
   * For example, if the user is on page 5 and the number of records becomes smaller, this moves them to the last available page.
   */
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(dataTable.length / rowsPerPage) - 1);

    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [dataTable.length, page, rowsPerPage]);

  /**
   * Move to another table page.
   */
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  /**
   * Change how many records are displayed on each page.
   * The table returns to the first page after this value changes.
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Open the Allele Frequency page for the row selected by the user.
   * The selected variant, dataset, applied query and Beacon contact information are passed to the Allele Frequency page.
   */
  const handleOpenAlleleFrequency = (item) => {
    openAlleleFrequencyPage({
      item,
      beaconId,
      beaconName: storedContext.beaconName,
      datasetId,
      entryTypeId,
      appliedQuery: storedContext.appliedQuery,
      contactEmail: storedContext.contactEmail,
    });
  };

  /**
   * Use the filtered record count while searching.
   * Otherwise, use the complete number of loaded records.
   */
  const paginationCount = searchTerm ? searchCount ?? 0 : dataTable.length;

  /**
   * Decide which content should currently be displayed.
   */
  const hasRecords = dataTable.length > 0;
  const isReady = !isWaitingForTransferredRecords && !loading && !fetchError;

  const canRenderTable = isReady && hasRecords;
  const showEmptyState = isReady && !hasRecords;

  return (
    <Box
      sx={{
        py: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* Main white page container */}
      <Box
        sx={{
          width: "100%",
          minHeight: "90vh",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
          p: 3,
          mb: 2,
        }}
      >
        {/* Shared header with page title, Beacon, dataset and applied query, same as per the AF Page*/}
        <ResultsPageHeader
          pageTitle="Dataset Detailed Table"
          beaconName={storedContext.beaconName || beaconId}
          datasetName={datasetId}
          appliedQuery={storedContext.appliedQuery}
          contactEmail={storedContext.contactEmail}
        />

        {/* Shown only when the API fallback request is loading */}
        {loading && <Loader message="Loading detailed records..." />}

        {/* Shown when the fallback request fails */}
        {!loading && fetchError && <ResultsEmpty message={fetchError} />}

        {/* Show the table only when the records are ready */}
        {canRenderTable && (
          <>
            <ResultsTableModalBody
              dataTable={dataTable}
              entryTypeId={entryTypeId}
              selectedPathSegment={selectedEntryTypePath}
              selectedFilters={selectedFilters}
              beaconId={beaconId}
              datasetId={datasetId}
              contactEmail={contactEmail}
              displayedCount={totalResults}
              headers={[]}
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
              page={page}
              rowsPerPage={rowsPerPage}
              setSearchTerm={setSearchTerm}
              searchTerm={searchTerm}
              setSearchCount={setSearchCount}
              onOpenAlleleFrequency={handleOpenAlleleFrequency}
            />

            {/* Controls the current page and number of rows shown */}
            <TablePagination
              component="div"
              count={paginationCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20]}
              showFirstButton
              showLastButton
            />
          </>
        )}

        {/* Shown when loading is finished but no records were returned */}
        {showEmptyState && (
          <ResultsEmpty message="No detailed records were found." />
        )}
      </Box>
    </Box>
  );
}
