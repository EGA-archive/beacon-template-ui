import config from "../../../config/config.json";

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
}) => {
  try {
    console.log("========== EXPORT START ==========");
    console.log("downloadMode:", downloadMode);

    let results = [];

    // Case 1: Download View
    if (downloadMode === "view") {
      console.log("DOWNLOAD VIEW");

      results = searchTerm.trim()
        ? dataTable.filter((item) => {
            const rowString = sortedHeaders
              .map((h) => summarizeValue(item[h.id], h.id))
              .join(" ")
              .toLowerCase();

            return rowString.includes(searchTerm.toLowerCase());
          })
        : dataTable;

      console.log("View results length:", results.length);
    }

    // Case 2: Download All
    else {
      console.log("DOWNLOAD ALL");

      const fullQuery = queryBuilder(selectedFilters, entryTypeId);

      // limit=0 => ask backend for all results.
      // Backend may still apply its own protection cap.
      fullQuery.query.pagination = {
        skip: 0,
        limit: 0,
      };

      console.log("Query after override:", fullQuery);

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

      console.log("Response received:", data);

      const resultSets = data?.response?.resultSets ?? [];

      console.log(
        "Datasets returned:",
        resultSets.map((r) => ({
          id: r.id,
          results: r.results?.length,
        }))
      );

      const selectedDataset = resultSets.find(
        (r) => r.id === datasetId || r.dataset === datasetId
      );

      if (!selectedDataset) {
        alert(`No dataset found for ID: ${datasetId}`);
        return;
      }

      console.log("Selected dataset:", selectedDataset);

      const initialResults = selectedDataset.results || [];
      const totalResults =
        selectedDataset.resultsCount ?? initialResults.length;
      const PAGE_SIZE = initialResults.length;

      const MAX_DOWNLOAD_RECORDS = 5000;

      const downloadLimit = Math.min(totalResults, MAX_DOWNLOAD_RECORDS);

      if (totalResults > MAX_DOWNLOAD_RECORDS) {
        alert(
          `This query contains ${totalResults.toLocaleString()} records. Only the first ${MAX_DOWNLOAD_RECORDS.toLocaleString()} records will be downloaded.`
        );
      }

      if (!PAGE_SIZE) {
        alert("No data available to export.");
        return;
      }

      const allResults = [...initialResults];

      let page = 1;

      while (allResults.length < downloadLimit) {
        const nextQuery = JSON.parse(JSON.stringify(fullQuery));

        nextQuery.query.pagination = {
          skip: page,
          limit: PAGE_SIZE,
        };

        console.log(
          `Fetching next export page: skip=${page}, limit=${PAGE_SIZE}`
        );

        const nextResponse = await fetch(fullUrl, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(nextQuery),
        });

        if (!nextResponse.ok) {
          console.error("Fetch failed with status:", nextResponse.status);
          alert("Failed to fetch all data for export.");
          return;
        }

        const nextData = await nextResponse.json();
        const nextResultSets = nextData?.response?.resultSets ?? [];

        const nextDataset = nextResultSets.find(
          (r) => r.id === datasetId || r.dataset === datasetId
        );

        console.log("Next dataset:", nextDataset);

        const nextResults = nextDataset?.results || [];

        console.log(
          `pagination sent: skip=${page}, limit=${PAGE_SIZE}`,
          "nextResults length:",
          nextResults.length
        );

        if (!nextResults.length) {
          console.warn("No more results returned. Stopping export pagination.");
          break;
        }

        allResults.push(...nextResults);

        console.log(`Fetched ${allResults.length}/${downloadLimit} rows`);

        page += 1;
      }

      results = allResults.slice(0, downloadLimit);
    }

    if (!results.length) {
      alert("No data available to export.");
      return;
    }

    // Use only visible columns
    const visibleHeaderObjects = sortedHeaders.filter((h) =>
      visibleColumns.includes(h.id)
    );

    const headers = visibleHeaderObjects.map((h) => h.id);
    const headerLabels = visibleHeaderObjects.map((h) => h.name);

    // Build CSV
    const csvRows = [
      headerLabels.join(","),
      ...results.map((row) =>
        headers
          .map((field) => {
            const value = summarizeValue(
              row[field] !== undefined && row[field] !== null ? row[field] : "",
              field
            );

            if (typeof value === "string") {
              return `"${value.replace(/"/g, '""')}"`;
            }

            return value;
          })
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    // Create file
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const fileName = `beacon-${selectedPathSegment || "results"}-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", fileName);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    console.log("========== EXPORT END ==========");
  } catch (err) {
    console.error("CSV export failed:", err);
    alert("CSV export failed. Check the console for details.");
  }
};
