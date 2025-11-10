import config from "../../../config/config.json";

/**
 * Exports either:
 * - All backend rows (if no search term)
 * - Or only visible filtered rows (if user searched)
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
}) => {
  try {
    let results = [];

    // Case 1: user typed a search term: export only filtered rows
    if (searchTerm.trim()) {
      results = dataTable.filter((item) => {
        const rowString = sortedHeaders
          .map((h) => summarizeValue(item[h.id]))
          .join(" ")
          .toLowerCase();
        return rowString.includes(searchTerm.toLowerCase());
      });
      // console.log(`📄 Exporting ${results.length} filtered rows`);
    }

    // Case 2: no search: fetch everything from backend
    else {
      // console.log("🌐 Fetching full dataset for export...");
      const fullQuery = queryBuilder([], entryTypeId);
      fullQuery.query.pagination = { skip: 0, limit: 10000 };

      const fullUrl = `${config.apiUrl}/${selectedPathSegment}`;
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullQuery),
      });

      if (!response.ok) {
        console.error("Fetch failed with status:", response.status);
        alert("Failed to fetch data for export.");
        return;
      }

      const data = await response.json();
      const resultSets = data?.response?.resultSets ?? [];
      results = resultSets.flatMap((r) => r.results || []);
      // console.log(`🌍 Downloaded ${results.length} rows from backend`);
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
          .map((field) =>
            JSON.stringify(
              summarizeValue(
                row[field] !== undefined && row[field] !== null
                  ? row[field]
                  : ""
              )
            )
          )
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    // Create file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
  } catch (err) {
    console.error("CSV export failed:", err);
    alert("CSV export failed. Check the console for details.");
  }
};
