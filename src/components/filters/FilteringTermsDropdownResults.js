import React, { useEffect, useRef, useState } from "react";
import { Paper, List, ListItem, Box } from "@mui/material";
import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";
import useFilteringTerms from "../../hooks/useFilteringTerms";
import Loader from "../common/Loader";
import {
  searchFilteringTerms,
  handleFilterSelection,
  getDisplayLabelAndScope,
} from "../common/filteringTermsHelpers";

const FilteringTermsDropdownResults = ({ searchInput, onCloseDropdown }) => {
  const { setExtraFilter, setSelectedFilter } = useSelectedEntry();
  const [message, setMessage] = useState(null);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [filtering, setFiltering] = useState(false);

  const { filteringTerms } = useFilteringTerms();
  const { selectedPathSegment: selectedEntryType } = useSelectedEntry();

  const containerRef = useRef();

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

  useEffect(() => {
    if (searchInput.length > 0 && filteringTerms.length > 0) {
      setFiltering(true);
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
        {message && (
          <Box sx={{ mb: 2, mt: 2 }}>
            <CommonMessage text={message} type="error" />
          </Box>
        )}
        <List disablePadding>
          {filtering ? (
            <Box sx={{ p: 3, pt: 0 }}>
              <Loader
                message={COMMON_MESSAGES.filteringResults}
                variant="inline"
              />
            </Box>
          ) : filteredTerms.length > 0 ? (
            filteredTerms.map((term, index) => {
              const { displayLabel, selectedScope, allScopes } =
                getDisplayLabelAndScope(term, selectedEntryType);

              const item = {
                key: term.id,
                label: displayLabel?.trim() ? displayLabel : term.id,
                type: term.type,
                scope: selectedScope || null,
                scopes: allScopes || [],
              };

              return (
                <ListItem
                  key={term.id}
                  onClick={() => {
                    if (item.type === "alphanumeric") {
                      setExtraFilter(item);
                      onCloseDropdown();
                      return;
                    }

                    setSelectedFilter((prev) =>
                      handleFilterSelection({
                        item,
                        prevFilters: prev,
                        setMessage,
                        onSuccess: onCloseDropdown,
                      })
                    );
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
                  }}
                >
                  <Box
                    sx={{
                      fontSize: "12px",
                      fontFamily: '"Open Sans", sans-serif',
                      color: "#000",
                    }}
                  >
                    {displayLabel}
                  </Box>
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
