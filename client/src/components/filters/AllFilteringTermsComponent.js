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

// Component: Displays a searchable and paginated list of filtering terms
export default function AllFilteringTermsComponent({
  setSelectedTool,
  selectedTool,
}) {
  // Store all filtering terms fetched from API with id, label, scope, scopes, type
  const [filteringTerms, setFilteringTerms] = useState([]);

  // Track loading state during fetch
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    selectedPathSegment,
    filteringTermsRef,
    isFilteringTermsOpen,
    setIsFilteringTermsOpen,
    filteringButtonRef,
  } = useSelectedEntry();

  // Ensure the panel opens whenever the tool becomes active
  useEffect(() => {
    if (selectedTool === "allFilteringTerms") {
      setIsFilteringTermsOpen(true);
    }
  }, [selectedTool, setIsFilteringTermsOpen]);

  // Filtered list of terms after applying search
  const [filteredTerms, setFilteredTerms] = useState([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const primaryDarkColor = config.ui.colors.darkPrimary;
  const primaryColor = config.ui.colors.primary;

  const unselectedBorderColor = alpha(primaryColor, 0.15);

  // Handle table pagination: page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle table pagination: rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  // This hook loads the filtering terms from the backend once when the page loads, saves them in state, and updates a loading flag when finished.
  //  Runs on components mount
  useEffect(() => {
    const fetchFilteringTerms = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/filtering_terms?limit=0`);
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

  // This hook filters the terms based on what the user typed. If no search is entered, it shows all terms. If something is typed, it updates the list to only show matches.
  // This useEffect runs every time either:
  // searchQuery changes (user types in the search box), or
  // filteringTerms changes.
  useEffect(() => {
    const allTerms = filteringTerms?.response?.filteringTerms ?? [];
    if (searchQuery.trim() === "") {
      setFilteredTerms(allTerms);
    } else {
      const results = searchFilteringTerms(allTerms, searchQuery);
      setFilteredTerms(results);
    }
  }, [searchQuery, filteringTerms]);

  // Hide the entire section when the user closes it
  // if (!isFilteringTermsOpen) return null;

  if (!isFilteringTermsOpen) {
    return null;
  }

  // UI: search bar + table of filtering terms
  return (
    <Box
      ref={filteringTermsRef}
      // Outer container styling
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

        marginBottom: "20px",
      }}
    >
      {/* Section for title and closure button of the table */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
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

        <IconButton
          size="small"
          onClick={() => {
            setIsFilteringTermsOpen(false);
            setSelectedTool(null);

            setTimeout(() => {
              filteringButtonRef?.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 0);
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Search bar aligned to the right */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <TextField
          placeholder="Search Filtering Terms"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update state on input
          variant="outlined"
          InputProps={{
            // Left side: search icon
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: primaryDarkColor, mr: 1 }} />
              </InputAdornment>
            ),
            // Right side: clear button, only visible when query is not empty
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setSearchQuery("")} // Clear search
                  size="small"
                  sx={{ color: primaryDarkColor }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          // Styling for rounded search bar
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

      {/* Table that lists filtering terms (paginated) */}
      <Box
        sx={{
          width: "100%",
          mb: 3,
          mt: 1,
        }}
      >
        <FilteringTermsTable
          filteringTerms={{ response: { filteringTerms: filteredTerms } }} // Pass filtered results
          defaultScope={selectedPathSegment} // Scope comes from selected entry
          searchWasPerformed={searchQuery.trim().length > 0} // Used for conditional rendering
          loading={loading} // Show loader while fetching
          handleChangePage={handleChangePage} // Pagination: change page
          handleChangeRowsPerPage={handleChangeRowsPerPage} // Pagination: rows per page
          page={page}
          rowsPerPage={rowsPerPage}
        />
      </Box>
    </Box>
  );
}
