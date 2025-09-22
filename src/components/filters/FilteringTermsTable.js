import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { lighten } from "@mui/material/styles";
import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import Loader from "../common/Loader";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";
import { FILTERING_TERMS_COLUMNS } from "../../lib/constants";
import { capitalize } from "../common/textFormatting";
import {
  assignDefaultScopesToTerms,
  handleFilterSelection,
  getDisplayLabelAndScope,
} from "../common/filteringTermsHelpers";
import { getSelectableScopeStyles } from "../styling/selectableScopeStyles";

// This component displays a table of filtering terms.
// It also lets users select a scope (like individual or biosample) when a filtering term is linked to multiple scopes.
export default function FilteringTermsTable({
  filteringTerms,
  defaultScope,
  searchWasPerformed,
  loading,
  handleChangePage,
  handleChangeRowsPerPage,
  page,
  rowsPerPage,
}) {
  // State to keep track of which scope was selected per filtering term
  const [selectedScopes, setSelectedScopes] = useState({});

  // Optional message to show errors to the user
  const [message, setMessage] = useState(null);

  // Gets shared states and functions from the context
  const {
    setExtraFilter,
    setSelectedFilter,
    selectedPathSegment: selectedEntryType,
  } = useSelectedEntry();

  // A mapping to make scope names more human-readable
  const scopeAlias = {
    individuals: "individual",
    biosamples: "biosample",
    analyses: "analysis",
    cohorts: "cohort",
    datasets: "dataset",
    g_variants: "Genomic Variation",
    genomicVariations: "Genomic Variation",
  };

  // When the filtering terms or the default scope changes, this code figures out which scope should be selected by default for each filtering term, and then stores that in state.
  // This useEffect runs automatically when detects changes
  useEffect(() => {
    const defaults = assignDefaultScopesToTerms(
      filteringTerms?.response?.filteringTerms ?? [],
      defaultScope,
      scopeAlias
    );
    setSelectedScopes(defaults);
  }, [filteringTerms, defaultScope]);

  // Lighten the primary color from config for table styling
  const bgPrimary = lighten(config.ui.colors.primary, 0.8);

  // Make sure filteringTerms is not undefined
  const allFilteringTerms = filteringTerms?.response?.filteringTerms ?? [];

  // Handle user click on a different scope for a filtering term
  const handleScopeClick = (termId, scope) => {
    setSelectedScopes((prev) => ({
      ...prev,
      [termId]: scope,
    }));
  };

  // Show a loading spinner if the data is still loading
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Loader message={COMMON_MESSAGES.loadingTerms} />
      </Box>
    );
  }

  return (
    <>
      {/* Show an error message if needed */}
      {message && (
        <Box sx={{ mb: 2 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}

      {/* Table container */}
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          boxShadow: "none",
          borderRadius: 0,
        }}
      >
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="filtering terms table">
            {/* Table header */}
            <TableHead>
              <TableRow>
                {FILTERING_TERMS_COLUMNS.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{
                      backgroundColor: bgPrimary,
                      fontWeight: 700,
                      width: col.width,
                      textAlign: col.align,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* If search was done but no terms found */}
              {allFilteringTerms.length === 0 && searchWasPerformed ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CommonMessage
                      text={COMMON_MESSAGES.noMatch}
                      type="error"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                // Loop through filtering terms and render rows
                allFilteringTerms
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((term) => {
                    // Get label and scopes from helper
                    const { displayLabel, selectedScope, allScopes } =
                      getDisplayLabelAndScope(term, selectedEntryType);

                    // Figure out which scope is selected
                    const activeScope =
                      selectedScopes[term.id] ||
                      selectedScope ||
                      allScopes?.[0] ||
                      null;

                    // const item = {
                    //   key: term.id,
                    //   label: displayLabel?.trim()
                    //     ? displayLabel
                    //     : term.label || term.id,
                    //   type: term.type,
                    //   scope: activeScope,
                    //   scopes: allScopes || [],
                    // };

                    const uniqueId = `common-free-${Date.now().toString(
                      36
                    )}-${Math.random().toString(36).slice(2, 7)}`;

                    const item = {
                      id: uniqueId,
                      key: uniqueId,
                      bgColor: "common",
                      label: displayLabel?.trim() ? displayLabel : term.id,
                      type: term.type,
                      scope: activeScope,
                      scopes: allScopes || [],
                    };

                    return (
                      <TableRow
                        key={term.id}
                        // For alphanumeric terms, set as extra filter
                        onClick={() => {
                          if (item.type === "alphanumeric") {
                            setExtraFilter(item);
                            return;
                          }
                          // Otherwise, add to selected filters directly
                          setSelectedFilter((prev) =>
                            handleFilterSelection({
                              item,
                              prevFilters: prev,
                              setMessage,
                            })
                          );
                        }}
                        sx={{
                          cursor: "pointer",
                          "&:hover td": {
                            backgroundColor: bgPrimary,
                          },
                          transition: "background-color 0.2s ease-in-out",
                        }}
                      >
                        {/* Column 1: ID */}
                        <TableCell>{term.id}</TableCell>
                        {/* Column 2: Label + Type */}
                        <TableCell>{`${item.label} (${item.type})`}</TableCell>
                        {/* Column 3: Available scopes as selectable chips */}
                        <TableCell>
                          {item.scopes.length > 0 &&
                            item.scopes.map((scope, i) => {
                              const isSelected =
                                selectedScopes[term.id] === scope;
                              return (
                                <Box
                                  key={i}
                                  component="span"
                                  // When the user clicks this scope "pill"...
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleScopeClick(term.id, scope); // Update the selected scope for this term
                                  }}
                                  // Apply dynamic styles based on whether this scope is selected or not
                                  sx={getSelectableScopeStyles(isSelected)}
                                >
                                  {capitalize(scopeAlias[scope] || scope)}
                                </Box>
                              );
                            })}
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination controls */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={allFilteringTerms.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  );
}
