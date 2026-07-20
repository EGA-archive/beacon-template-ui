import config from "../../../config/config.json";
import { downloadCsvFile } from "./downloadCsvFile";

/**
 * Maximum number of records allowed in a CSV download.
 * This protects the browser from downloading extremely large datasets.
 */
const MAX_DOWNLOAD_RECORDS = 1000;

/**
 * Exports either:
 * - Current visible table rows (Download View)
 * - Or all backend rows (Download All)
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
}) => {
  try {
    let results = [];
    let totalResults = 0;
    let downloadLimit = 0;
    let wasTruncated = false;

    /**
     * DOWNLOAD VIEW
     * Export only the rows currently visible in the table.
     */
    if (downloadMode === "view") {
      results = searchTerm.trim()
        ? dataTable.filter((item) => {
            const rowString = sortedHeaders
              .map((h) => summarizeValue(item[h.id], h.id))
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
       * Request all available records from the backend.
       */
      const fullQuery = queryBuilder(selectedFilters, entryTypeId);

      /**
       * Ask the backend for all records.
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
        (r) => r.id === datasetId || r.dataset === datasetId
      );

      if (!selectedDataset) {
        alert(`No dataset found for ID: ${datasetId}`);
        return;
      }

      const initialResults = selectedDataset.results || [];

      console.log("selectedDataset.resultsCount", selectedDataset.resultsCount);

      console.log(
        "selectedDataset.results.length",
        selectedDataset.results.length
      );

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
       * Beacon pagination works slightly differently:
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
       * - or the backend has no more results
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
          (r) => r.id === datasetId || r.dataset === datasetId
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
            availableDatasets: nextResultSets.map((r) => ({
              id: r.id,
              beaconId: r.beaconId,
            })),
          });

          break;
        }
        allResults.push(...nextResults);
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
     * Export only the columns currently visible in the table.
     */
    const visibleHeaderObjects = sortedHeaders.filter((h) =>
      visibleColumns.includes(h.id)
    );

    const fileName = `beacon-${selectedPathSegment || "results"}-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    downloadCsvFile({
      rows: results,
      columns: visibleHeaderObjects,
      fileName,
      getCellValue: (row, column) =>
        summarizeValue(
          row[column.id] !== undefined && row[column.id] !== null
            ? row[column.id]
            : "",
          column.id
        ),
    });

    return {
      totalResults,
      downloadLimit,
      wasTruncated,
    };
  } catch (err) {
    console.error("CSV export failed:", err);
    alert("CSV export failed. Check the console for details.");
  }
};
