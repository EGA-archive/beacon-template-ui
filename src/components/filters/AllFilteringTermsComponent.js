import { useEffect, useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import config from "../../config/config.json";
import SearchIcon from "@mui/icons-material/Search";
import { alpha } from "@mui/material/styles";
import FilteringTermsTable from "./FilteringTermsTable";
import { useSelectedEntry } from "../context/SelectedEntryContext";

import { InputAdornment, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { searchFilteringTerms } from "../common/filteringTermsHelpers";

export default function AllFilteringTermsComponent() {
  const [filteringTerms, setFilteringTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedPathSegment } = useSelectedEntry();
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const primaryDarkColor = config.ui.colors.darkPrimary;
  const primaryColor = config.ui.colors.primary;

  const unselectedBorderColor = alpha(primaryColor, 0.15);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  useEffect(() => {
    const fetchFilteringTerms = async () => {
      try {
        // const res = await fetch(`${config.apiUrl}/filtering_terms`);
        const res = await fetch("/api.json");
        const data = await res.json();
        setFilteringTerms(data);
      } catch (err) {
        console.error("Failed to fetch filtering terms", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteringTerms();
  }, []);

  useEffect(() => {
    const allTerms = filteringTerms?.response?.filteringTerms ?? [];
    if (searchQuery.trim() === "") {
      setFilteredTerms(allTerms);
    } else {
      const results = searchFilteringTerms(allTerms, searchQuery);
      setFilteredTerms(results);
    }
  }, [searchQuery, filteringTerms]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "auto",
        gap: "16px",
        borderRadius: "10px",
        px: "32px",
        pt: "24px",
        pb: "48px",
        backgroundColor: "white",
        boxShadow: "0px 8px 11px 0px #9BA0AB24",
      }}
    >
      <Typography
        sx={{
          color: "black",
          fontWeight: 700,
          fontSize: "16px",
        }}
      >
        Filtering Terms
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <TextField
          placeholder="Search Filtering Terms"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: primaryDarkColor, mr: 1 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setSearchQuery("")}
                  size="small"
                  sx={{ color: primaryDarkColor }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            cursor: "text",
            mb: 3,
            mt: 1,
            width: "100%",
            maxWidth: 400,
            borderRadius: "999px",
            "& .MuiOutlinedInput-root": {
              height: "40px",
              borderRadius: "999px",
              backgroundColor: "white",
              border: `1px solid ${unselectedBorderColor}`,
              "&:hover": {
                border: `1px solid ${primaryDarkColor}`,
              },
              "&.Mui-focused": {
                border: `1px solid ${primaryDarkColor}`,
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& input::placeholder": {
              fontSize: "14px",
            },
          }}
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          mb: 3,
          mt: 1,
          width: "100%",
        }}
      >
        <FilteringTermsTable
          filteringTerms={{ response: { filteringTerms: filteredTerms } }}
          defaultScope={selectedPathSegment}
          searchWasPerformed={searchQuery.trim().length > 0}
          loading={loading}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
        />
      </Box>
    </Box>
  );
}
