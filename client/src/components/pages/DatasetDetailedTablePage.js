import React, { useState } from "react";
import { Box, TablePagination, Typography } from "@mui/material";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import ResultsTableModalBody from "../results/modal/ResultsTableModalBody";
import ChevronRight from "../../assets/logos/chevron-right.svg";
import FilterLabelRemovable from "../../components/styling/FilterLabelRemovable";
import { formatEntryLabel } from "../../components/common/textFormatting";

export default function DatasetDetailedTablePage() {
  const searchParams = new URLSearchParams(window.location.search);
  const beaconId = searchParams.get("beaconId");
  const datasetId = searchParams.get("datasetId");
  const storageKey = `datasetDetailedTable_${beaconId}_${datasetId}`;
  const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
  const { selectedFilter, selectedPathSegment } = useSelectedEntry();

  const [visibleColumns, setVisibleColumns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCount, setSearchCount] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box
      sx={{
        py: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          minHeight: "90vh",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
            fontSize: "14px",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
            }}
          >
            Results
          </Typography>

          <img
            src={ChevronRight}
            alt="breadcrumb separator"
            style={{
              width: "7px",
              height: "12px",
            }}
          />

          <Typography sx={{ fontWeight: 700 }}>
            Dataset Detailed Table
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Applied Query:
          </Typography>

          <FilterLabelRemovable
            variant="simple"
            label={formatEntryLabel(data.appliedQuery?.entryType)}
            scope="entryType"
          />
          {data.appliedQuery?.filters?.map((filter, index) => (
            <FilterLabelRemovable
              key={index}
              disableTooltip
              variant="simple"
              label={filter.label}
              type={filter.type}
              scope={filter.scope}
              scopes={filter.scopes}
              queryType={filter.queryType}
              queryParams={filter.queryParams}
              bgColor={filter.bgColor || "common"}
            />
          ))}
        </Box>

        <ResultsTableModalBody
          dataTable={data.dataTable || []}
          entryTypeId=""
          selectedPathSegment=""
          beaconId={data.beaconId}
          datasetId={data.datasetId}
          displayedCount={data.displayedCount}
          headers={[]}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          page={page}
          rowsPerPage={rowsPerPage}
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
          setSearchCount={setSearchCount}
        />
        <TablePagination
          component="div"
          count={searchTerm ? searchCount ?? 0 : data.dataTable?.length || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
}
