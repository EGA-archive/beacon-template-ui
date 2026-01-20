import { useState } from "react";
import { Box, InputBase } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import FilteringTermsDropdownResults from "../filters/FilteringTermsDropdownResults";
import config from "../../config/config.json";

// This component displays a filtering term input bar where users can type in text-based filters.
// It includes a search icon, an input field, a "clear" icon, and a button to commit the filter.
// When the user presses Enter or clicks the "Add" button, the filter is added to the list of selected filters.
export default function SearchFiltersInput({ activeInput, setActiveInput }) {
  const [searchInput, setSearchInput] = useState(""); // Local state to track the text typed by the user
  const primaryDarkColor = config.ui.colors.darkPrimary;
  return (
    <Box
      onClick={() => setActiveInput("filter")} // When user clicks this area, it becomes the active input
      sx={{
        flex: activeInput === "filter" ? 1 : 0.3,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        border: `1.5px solid ${primaryDarkColor}`,
        borderRadius: "999px",
        backgroundColor: "#fff",
        transition: "flex 0.3s ease",
        position: "relative",
        px: 2,
        py: 1,
        height: "47px",
      }}
    >
      <Box sx={{ position: "relative", flex: 1 }}>
        {/* Search icon and text input */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SearchIcon sx={{ color: primaryDarkColor, mr: 1 }} />
          <InputBase
            data-testid="filtering-input"
            placeholder="Search by Filtering Terms. Examples: sex, breast cancer"
            fullWidth
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)} // Update local state as user types
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
            }}
          />
        </Box>

        {/* Clear button shown only if there's input */}
        {searchInput?.trim() && (
          <Box
            role="button"
            onClick={() => setSearchInput("")} // Clear the input when clicked
            sx={{
              position: "absolute",
              top: "50%",
              right: 8,
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: alpha(primaryDarkColor, 0.1),
              color: primaryDarkColor,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: alpha(primaryDarkColor, 0.2),
              },
            }}
          >
            <ClearIcon sx={{ fontSize: "16px" }} />
          </Box>
        )}
      </Box>

      {/* Dropdown component that shows matching filtering terms */}
      <FilteringTermsDropdownResults
        searchInput={searchInput}
        onCloseDropdown={() => setSearchInput("")}
      />
    </Box>
  );
}
