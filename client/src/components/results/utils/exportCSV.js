import config from "../../../config/runtimeConfig";
import { downloadCsvFile } from "./downloadCsvFile";

/**
 * Maximum number of records allowed in a CSV download.
 * Configurable through runtime config.
 */
const MAX_DOWNLOAD_RECORDS =
  config.ui.download?.maxRecordsDownloadableLimit ?? 10000;

/**
 * Exports either:
 *
 * Download View:
 * - current/searched table rows
 * - selected/visible columns only
 *
 * Download All:
 * - all backend rows
 * - all available columns, including unselected columns
 */
export const exportCSV = async ({
  dataTable,
  sortedHeaders,
  visibleColumns,
  summarizeValue,
  searchTerm = "",
  entryTypeId,
  selectedPathSegment,
  queryBuilder,
  datasetId,
  authHeaders,
  selectedFilters = [],
  downloadMode = "view",
  onDownloadLimitReached,
  onProgress,
}) => {
  try {
    let results = [];
    let totalResults = 0;
    let downloadLimit = 0;
    let wasTruncated = false;

    /**
     * Keep download progress between 0 and 100.
     */
    const updateProgress = (value) => {
      if (typeof onProgress === "function") {
        onProgress(Math.max(0, Math.min(100, Math.round(value))));
      }
    };

    /**
     * Calculate progress according to the number of
     * records actually downloaded.
     */
    const updateRecordProgress = (downloaded, total) => {
      if (!total) {
        return;
      }

      const percentage = (Math.min(downloaded, total) / total) * 100;

      updateProgress(percentage);
    };

    updateProgress(0);

    /**
     * DOWNLOAD VIEW
     *
     * Export only the rows currently visible in the table.
     * Search is applied across the available headers.
     */
    if (downloadMode === "view") {
      results = searchTerm.trim()
        ? dataTable.filter((item) => {
            const rowString = sortedHeaders
              .map((header) => summarizeValue(item[header.id], header.id))
              .join(" ")
              .toLowerCase();

            return rowString.includes(searchTerm.toLowerCase());
          })
        : dataTable;

      totalResults = results.length;
      downloadLimit = results.length;
      wasTruncated = false;
    } else {
      /**
       * DOWNLOAD ALL
       *
       * Request all available records from the backend.
       */
      const fullQuery = queryBuilder(selectedFilters, entryTypeId);

      /**
       * Ask the backend for the first page.
       * The backend may still apply its own limits.
       */
      fullQuery.query.pagination = {
        skip: 0,
        limit: 0,
      };

      const fullUrl = `${config.apiUrl}/${selectedPathSegment}`;

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(fullQuery),
      });

      if (!response.ok) {
        console.error("Fetch failed with status:", response.status);

        alert("Failed to fetch data for export.");
        return;
      }

      const data = await response.json();

      const resultSets = data?.response?.resultSets ?? [];

      const selectedDataset = resultSets.find(
        (resultSet) =>
          resultSet.id === datasetId || resultSet.dataset === datasetId
      );

      if (!selectedDataset) {
        alert(`No dataset found for ID: ${datasetId}`);
        return;
      }

      const initialResults = selectedDataset.results || [];

      console.log("selectedDataset.resultsCount", selectedDataset.resultsCount);

      console.log("selectedDataset.results.length", initialResults.length);

      totalResults = selectedDataset.resultsCount ?? initialResults.length;

      /**
       * Number of records returned by the backend in one page.
       * We reuse this size when requesting the following pages.
       */
      const pageSize = initialResults.length;

      console.log({
        totalResults,
        pageSize,
      });

      downloadLimit = Math.min(totalResults, MAX_DOWNLOAD_RECORDS);

      wasTruncated = totalResults > MAX_DOWNLOAD_RECORDS;

      /**
       * Notify the UI if the download was limited.
       */
      if (wasTruncated && onDownloadLimitReached) {
        onDownloadLimitReached({
          totalResults,
          downloadLimit,
        });
      }

      if (!pageSize) {
        alert("No data available to export.");
        return;
      }

      const allResults = [...initialResults];

      /**
       * The first response already contains records,
       * so report the initial real progress.
       */
      updateRecordProgress(allResults.length, downloadLimit);

      /**
       * Beacon pagination:
       *
       * skip = page number
       * limit = page size
       *
       * Example:
       * skip: 0, limit: 100 → first page
       * skip: 1, limit: 100 → second page
       * skip: 2, limit: 100 → third page
       */
      let page = 1;

      /**
       * Keep requesting pages until:
       * - we reach the download limit
       * - or the backend has no more results.
       */
      while (allResults.length < downloadLimit) {
        console.log({
          page,
          pageSize,
          currentResults: allResults.length,
        });

        const nextQuery = JSON.parse(JSON.stringify(fullQuery));

        nextQuery.query.pagination = {
          skip: page,
          limit: pageSize,
        };

        const nextResponse = await fetch(fullUrl, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(nextQuery),
        });

        console.log("HTTP status:", nextResponse.status, "page:", page);

        if (!nextResponse.ok) {
          console.error("Fetch failed with status:", nextResponse.status);

          alert("Failed to fetch all data for export.");

          return;
        }

        const nextData = await nextResponse.json();

        console.log("page", page, {
          responseSummary: nextData.responseSummary,
        });

        const nextResultSets = nextData?.response?.resultSets ?? [];

        const nextDataset = nextResultSets.find(
          (resultSet) =>
            resultSet.id === datasetId || resultSet.dataset === datasetId
        );

        console.log("nextDataset:", {
          page,
          beaconId: nextDataset?.beaconId,
          exists: !!nextDataset,
          id: nextDataset?.id,
          results: nextDataset?.results?.length,
          resultsCount: nextDataset?.resultsCount,
        });

        console.log("expected datasetId:", datasetId);

        const nextResults = nextDataset?.results || [];

        console.log("nextResults returned:", nextResults.length);

        /**
         * Stop if there are no more records.
         */
        if (!nextResults.length) {
          console.log("STOPPING DOWNLOAD", {
            page,
            datasetId,
            nextDataset,
            responseSummary: nextData.responseSummary,
            availableDatasets: nextResultSets.map((resultSet) => ({
              id: resultSet.id,
              beaconId: resultSet.beaconId,
            })),
          });

          break;
        }

        allResults.push(...nextResults);

        /**
         * Update progress after every
         * successfully downloaded page.
         */
        updateRecordProgress(allResults.length, downloadLimit);

        console.log(
          "total so far:",
          allResults.length,
          "received:",
          nextResults.length
        );

        page += 1;
      }

      /**
       * Keep only the allowed number of records.
       */
      results = allResults.slice(0, downloadLimit);
    }

    /**
     * Nothing to export.
     */
    if (!results.length) {
      alert("No data available to export.");
      return;
    }

    /**
     * DOWNLOAD VIEW:
     * Export only columns currently selected/visible
     * in the table.
     *
     * DOWNLOAD ALL:
     * Export every available column, including columns
     * that are currently unselected/hidden.
     */
    const columnsToExport =
      downloadMode === "view"
        ? sortedHeaders.filter((header) => visibleColumns.includes(header.id))
        : sortedHeaders;

    const fileName = `beacon-${selectedPathSegment || "results"}-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    downloadCsvFile({
      rows: results,
      columns: columnsToExport,
      fileName,

      getCellValue: (row, column) =>
        summarizeValue(
          row[column.id] !== undefined && row[column.id] !== null
            ? row[column.id]
            : "",
          column.id
        ),
    });

    /**
     * CSV has been generated successfully.
     */
    updateProgress(100);

    return {
      totalResults,
      downloadLimit,
      wasTruncated,
    };
  } catch (err) {
    console.error("CSV export failed:", err);

    alert("CSV export failed. Check the console for details.");

    throw err;
  }
};
