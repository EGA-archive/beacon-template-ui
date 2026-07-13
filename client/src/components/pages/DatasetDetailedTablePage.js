import React, { useState, useEffect } from "react";
import { Box, TablePagination, Typography } from "@mui/material";
import ResultsTableModalBody from "../results/modal/ResultsTableModalBody";
import ChevronRight from "../../assets/logos/chevron-right.svg";
import FilterLabelRemovable from "../../components/styling/FilterLabelRemovable";
import { formatEntryLabel } from "../../components/common/textFormatting";
import config from "../../config/config.json";

export default function DatasetDetailedTablePage() {
  const searchParams = new URLSearchParams(window.location.search);

  const beaconId = searchParams.get("beaconId");
  const datasetId = searchParams.get("datasetId");
  const entryType = searchParams.get("entryType");
  const filterIds = searchParams.get("filterIds");
  const queryId = searchParams.get("queryId");

  const storageKey = `datasetDetailedTable_${queryId}`;

  const storedData = localStorage.getItem(storageKey);
  const data = storedData ? JSON.parse(storedData) : {};

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

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

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
            flexWrap: "wrap",
            gap: 1,
            rowGap: 0.5,
            mb: 2,
            fontSize: { xs: "12px", sm: "13px", md: "14px", lg: "16px" },
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "13px", md: "14px", lg: "16px" },
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Results
          </Typography>

          <img
            src={ChevronRight}
            alt="breadcrumb separator"
            style={{ width: "7px", height: "12px" }}
          />

          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "13px", md: "14px", lg: "16px" },
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Dataset Detailed Table
          </Typography>

          {config.beaconType === "networkBeacon" && (
            <>
              <Typography
                sx={{
                  fontSize: { xs: "12px", sm: "13px", md: "14px", lg: "16px" },
                  fontWeight: 700,
                }}
              >
                |
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "12px", sm: "13px", md: "14px", lg: "16px" },
                  whiteSpace: "nowrap",
                }}
              >
                Beacon: <b>{data.beaconName || data.beaconId || "—"}</b>
              </Typography>
            </>
          )}

          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "13px", md: "14px", lg: "16px" },
              fontWeight: 700,
            }}
          >
            |
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "12px", sm: "13px", md: "14px", lg: "16px" },
              whiteSpace: "nowrap",
            }}
          >
            Dataset: <b>{data.datasetId || "—"}</b>
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
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
              disableClick
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
          entryTypeId={data.entryTypeId || data.appliedQuery?.entryType || ""}
          selectedPathSegment={
            data.selectedPathSegment || data.appliedQuery?.entryType || ""
          }
          selectedFilters={data.selectedFilters || []}
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
