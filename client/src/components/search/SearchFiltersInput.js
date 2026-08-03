import { useState } from "react";
import { Box, InputBase } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import FilteringTermsDropdownResults from "../filters/FilteringTermsDropdownResults";
import config from "../../config/runtimeConfig";

// This component displays a filtering term input bar where users can type in text-based filters.
// It includes a search icon, an input field, a "clear" icon, and a button to commit the filter.
// When the user presses Enter or clicks the "Add" button, the filter is added to the list of selected filters.
export default function SearchFiltersInput({
  activeInput,
  setActiveInput,
  placeholder,
  action,
}) {
  const [searchInput, setSearchInput] = useState(""); // Local state to track the text typed by the user
  const primaryDarkColor = config.ui.colors.darkPrimary;

  return (
    <Box
      // onClick={() => setActiveInput("filter")} // When user clicks this area, it becomes the active input
      onClick={() => {
        setActiveInput("filter");
      }}
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          minWidth: 0,
        }}
      >
        {/* Search icon */}
        <SearchIcon
          sx={{
            color: primaryDarkColor,
            mr: 1.5,
            flexShrink: 0,
          }}
        />

        {/* Text input */}
        <InputBase
          data-testid="filtering-input"
          placeholder={placeholder}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          sx={{
            flex: 1,
            minWidth: 0,
            fontFamily: '"Open Sans", sans-serif',
            fontSize: "12px",
          }}
        />

        {/* Clear button appears only when text has been entered */}
        {searchInput.trim() && (
          <Box
            role="button"
            aria-label="Clear filtering terms search"
            onClick={(event) => {
              event.stopPropagation();
              setSearchInput("");
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: "24px",
              height: "24px",
              mr: 1,
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

        {/* Optional action displayed inside the search bar */}
        {action && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              ml: 1,
            }}
          >
            {action}
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
