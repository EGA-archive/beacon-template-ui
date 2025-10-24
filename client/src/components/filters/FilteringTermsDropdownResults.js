/**
 * This component shows a dropdown list of filtering terms
 * that match the user’s search input. It’s triggered when the user
 * types in the search field and dynamically filters the results.
 * It supports both regular filters and numeric/alphanumeric filters (handled differently).
 *
 * Shared hooks and logic:
 * - Uses context to update selected filters
 * - Uses `useFilteringTerms()` hook to access all available terms
 * - Reuses filtering logic from filteringTermsHelpers
 */

import React, { useEffect, useRef, useState } from "react";
import { Paper, List, ListItem, Box } from "@mui/material";
import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";
import useFilteringTerms from "../../hooks/useFilteringTerms";
import Loader from "../common/Loader";
import AddTaskIcon from "@mui/icons-material/AddTask";

// Helper functions for filtering/searching terms
import {
  searchFilteringTerms,
  handleFilterSelection,
  getDisplayLabelAndScope,
} from "../common/filteringTermsHelpers";

const FilteringTermsDropdownResults = ({ searchInput, onCloseDropdown }) => {
  // Access setters from global context to update filters
  const { extraFilter, setExtraFilter, setSelectedFilter } = useSelectedEntry();

  const [message, setMessage] = useState(null); // For validation or feedback
  const [filteredTerms, setFilteredTerms] = useState([]); // Search result terms
  const [filtering, setFiltering] = useState(false); // Loading state
  const [addedFilters, setAddedFilters] = useState(new Set());

  // Get all filtering terms from API or local state
  const { filteringTerms } = useFilteringTerms();
  const { selectedPathSegment: selectedEntryType } = useSelectedEntry();

  // Ref for detecting outside clicks (to close dropdown)
  const containerRef = useRef();

  // Close dropdown if user clicks outside the dropdown box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onCloseDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const primaryDarkColor = config.ui.colors.darkPrimary;

  // Filter terms based on user input
  useEffect(() => {
    if (searchInput.length > 0 && filteringTerms.length > 0) {
      setFiltering(true);

      // Add delay before applying search
      const timeout = setTimeout(() => {
        const results = searchFilteringTerms(filteringTerms, searchInput);
        setFilteredTerms(results);
        setFiltering(false);
      }, 300);

      return () => clearTimeout(timeout);
    } else {
      setFilteredTerms([]);
    }
  }, [searchInput, filteringTerms]);

  // Don't render anything if input is empty
  if (searchInput.trim().length === 0) return null;

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        width: "100%",
        zIndex: 5,
      }}
    >
      <Paper
        sx={{
          maxHeight: 200,
          overflowY: "auto",
          mt: 1,
          borderRadius: "21px",
          backgroundColor: "white",
          boxShadow: "none",
          border: `1px solid ${primaryDarkColor}`,
        }}
      >
        {/* Show error message if present */}
        {message && (
          <Box sx={{ mb: 2, mt: 2 }}>
            <CommonMessage text={message} type="error" />
          </Box>
        )}

        <List disablePadding>
          {filtering ? (
            // Show loader while filtering
            <Box sx={{ p: 3, pt: 0 }}>
              <Loader
                message={COMMON_MESSAGES.filteringResults}
                variant="inline"
              />
            </Box>
          ) : filteredTerms.length > 0 ? (
            // Show filtered results
            filteredTerms.map((term, index) => {
              const { displayLabel, selectedScope, allScopes } =
                getDisplayLabelAndScope(term, selectedEntryType);

              const uniqueId = `common-free-${Date.now().toString(
                36
              )}-${Math.random().toString(36).slice(2, 7)}`;

              const item = {
                id: term.id,
                key: uniqueId,
                bgColor: "common",
                label: displayLabel?.trim() ? displayLabel : term.id,
                type: term.type,
                scope: selectedScope || null,
                scopes: allScopes || [],
              };

              return (
                <ListItem
                  key={item.key}
                  onClick={() => {
                    if (extraFilter && !extraFilter.value) {
                      setMessage(COMMON_MESSAGES.incompleteFilter);
                      setTimeout(() => {
                        setMessage(null);
                        onCloseDropdown();
                      }, 3000);
                      return;
                    }
                    if (item.type === "alphanumeric") {
                      setExtraFilter(item);
                      onCloseDropdown();
                      return;
                    }

                    setSelectedFilter((prev) => {
                      const isDuplicate = prev.some(
                        (filter) =>
                          filter.label === item.label &&
                          filter.scope === item.scope
                      );
                      if (isDuplicate) {
                        setMessage(COMMON_MESSAGES.doubleFilter);
                        setTimeout(() => {
                          setMessage(null);
                          onCloseDropdown();
                        }, 3000);

                        return prev;
                      }
                      return handleFilterSelection({
                        item,
                        prevFilters: prev,
                        setMessage,
                        onSuccess: onCloseDropdown,
                      });
                    });
                  }}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom:
                      index !== filteredTerms.length - 1
                        ? "1px solid #E0E0E0"
                        : "none",
                    px: 2,
                    py: 1,
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: `${config.ui.colors.primary}20`,
                    },
                  }}
                >
                  {/* Show display label on the left */}
                  <Box
                    sx={{
                      fontSize: "12px",
                      fontFamily: '"Open Sans", sans-serif',
                      color: "#000",
                    }}
                  >
                    {displayLabel}
                  </Box>

                  {/* Show term ID on the right */}
                  <Box
                    sx={{
                      fontSize: "12px",
                      fontFamily: '"Open Sans", sans-serif',
                      color: "#666",
                    }}
                  >
                    {term.id}
                  </Box>
                </ListItem>
              );
            })
          ) : (
            // No matching results
            <Box sx={{ p: 2 }}>
              <CommonMessage text={COMMON_MESSAGES.noMatch} type="error" />
            </Box>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default FilteringTermsDropdownResults;
