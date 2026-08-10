import { useState } from "react";
import { Box, InputBase } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import FilteringTermsDropdownResults from "../filters/FilteringTermsDropdownResults";
import config from "../../config/runtimeConfig";

/**
 * Displays the Filtering Terms search input.
 *
 * On larger screens, the optional All Filtering Terms button stays
 * inside the input.
 *
 * From 870px downward, the button is hidden inside the input when
 * the Result Type selector is present. FilteringTermsSection then
 * displays the same button underneath the input.
 */
export default function SearchFiltersInput({
  activeInput,
  setActiveInput,
  placeholder,
  action,
  hasEntryTypeSelector = false,
}) {
  // Store the text currently entered by the user.
  const [searchInput, setSearchInput] = useState("");

  const primaryDarkColor = config.ui.colors.darkPrimary;

  /**
   * From 870px downward, action buttons move outside their inputs
   * when the Result Type selector is visible.
   */
  const buttonsOutsideInputLayout = "@media (max-width:870px)";

  return (
    <Box
      onClick={() => {
        setActiveInput("filter");
      }}
      sx={{
        flex: activeInput === "filter" ? 1 : 0.3,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        position: "relative",
        height: "47px",
        px: 2,
        py: 1,
        border: `1.5px solid ${primaryDarkColor}`,
        borderRadius: "999px",
        backgroundColor: "#fff",
        transition: "flex 0.3s ease",
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
        {/* Filtering Terms search icon */}
        <SearchIcon
          sx={{
            color: primaryDarkColor,
            mr: 1.5,
            flexShrink: 0,
          }}
        />

        {/* Filtering Terms text input */}
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

        {/* Clear the current text */}
        {searchInput.trim() && (
          <Box
            role="button"
            aria-label="Clear filtering terms search"
            onClick={(event) => {
              // Prevent the click from activating the parent input again.
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
            <ClearIcon
              sx={{
                fontSize: "16px",
              }}
            />
          </Box>
        )}

        {/*
         * Above 870px:
         * keep All Filtering Terms inside the input.
         *
         * From 870px downward:
         * hide it here when the Result Type selector is visible.
         * FilteringTermsSection displays the external copy instead.
         */}
        {action && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              ml: 1,

              [buttonsOutsideInputLayout]: {
                display: hasEntryTypeSelector ? "none" : "flex",
              },
            }}
          >
            {action}
          </Box>
        )}
      </Box>

      {/* Display matching Filtering Terms underneath the input */}
      <FilteringTermsDropdownResults
        searchInput={searchInput}
        onCloseDropdown={() => setSearchInput("")}
      />
    </Box>
  );
}
