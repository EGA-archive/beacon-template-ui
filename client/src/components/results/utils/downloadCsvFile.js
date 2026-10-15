/**
 * Converts one value into a safe CSV value.
 *
 * Quotes and commas inside text are handled correctly.
 * Missing values are exported as an empty value.
 */
const escapeCsvValue = (value) => {
  const safeValue = value === null || value === undefined ? "" : String(value);

  return `"${safeValue.replace(/"/g, '""')}"`;
};

/**
 * Creates and downloads a CSV file.
 *
 * This utility only creates the file.
 * It does not decide where the rows come from.
 *
 * It can therefore be reused by:
 * - the Results table;
 * - the Allele Frequency table;
 * - future tables.
 */
export const downloadCsvFile = ({
  rows = [],
  columns = [],
  fileName = "table.csv",
  getCellValue,
}) => {
  if (!rows.length || !columns.length) {
    alert("No data available to export.");
    return false;
  }

  const headerRow = columns
    .map((column) => escapeCsvValue(column.name))
    .join(",");

  const dataRows = rows.map((row) =>
    columns
      .map((column) => {
        const value = getCellValue ? getCellValue(row, column) : row[column.id];

        return escapeCsvValue(value);
      })
      .join(",")
  );

  const csvContent = [headerRow, ...dataRows].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const downloadUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.setAttribute("download", fileName);

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(downloadUrl);

  return true;
};
