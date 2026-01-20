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
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  assignDefaultScopesToTerms,
  handleFilterSelection,
  getDisplayLabelAndScope,
} from "../common/filteringTermsHelpers";
import { getSelectableScopeStyles } from "../styling/selectableScopeStyles";
import { alpha } from "@mui/material/styles";

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
  const [addedFilters, setAddedFilters] = useState(new Set());
  const [changedScopes, setChangedScopes] = useState(new Set());
  const [manuallySelectedScopes, setManuallySelectedScopes] = useState({});

  // Optional message to show errors to the user
  const [message, setMessage] = useState(null);

  // Gets shared states and functions from the context
  const {
    selectedFilter,
    extraFilter,
    setExtraFilter,
    setSelectedFilter,
    selectedPathSegment: selectedEntryType,
    valueInputRef,
    filteringTermsRef,
  } = useSelectedEntry();

  // A mapping to make scope names more human-readable
  const scopeAlias = {
    individuals: "individuals",
    individual: "individual",
    biosamples: "biosample",
    analyses: "analysis",
    cohorts: "cohort",
    datasets: "dataset",
    g_variants: "Genomic Variation",
    genomicVariations: "Genomic Variation",
    genomicVariation: "Genomic Variation",
  };

  // When the filtering terms or the default scope changes, this code figures out which scope should be selected by default for each filtering term, and then stores that in state.
  // This useEffect runs automatically when detects changes
  useEffect(() => {
    const terms = filteringTerms?.response?.filteringTerms ?? [];
    const defaults = assignDefaultScopesToTerms(
      terms,
      defaultScope,
      scopeAlias
    );

    // Merge with manually selected scopes
    const mergedScopes = {};
    terms.forEach((term) => {
      mergedScopes[term.id] =
        manuallySelectedScopes[term.id] || defaults[term.id];
    });

    setSelectedScopes(mergedScopes);
  }, [filteringTerms, defaultScope, manuallySelectedScopes]);

  // Lighten the primary color from config for table styling
  const bgPrimary = lighten(config.ui.colors.primary, 0.8);
  const bgPrimaryLight = alpha(config.ui.colors.primary, 0.05);

  // Make sure filteringTerms is not undefined
  const allFilteringTerms = filteringTerms?.response?.filteringTerms ?? [];

  // Handle user click on a different scope for a filtering term
  const handleScopeClick = (termId, scope) => {
    setSelectedScopes((prev) => ({
      ...prev,
      [termId]: scope,
    }));

    setManuallySelectedScopes((prev) => ({
      ...prev,
      [termId]: scope,
    }));

    const scopeKey = `${termId}-${scope}`;
    setChangedScopes((prevSet) => {
      const newSet = new Set(prevSet);
      newSet.add(scopeKey);

      setTimeout(() => {
        setChangedScopes((current) => {
          const updated = new Set(current);
          updated.delete(scopeKey);
          return updated;
        });
      }, 5000);

      return newSet;
    });
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
      <Box ref={filteringTermsRef}>
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
                <TableRow data-cy="filtering-term-row">
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

                      const uniqueId = `common-free-${Date.now().toString(
                        36
                      )}-${Math.random().toString(36).slice(2, 7)}`;

                      const item = {
                        id: term.id,
                        key: uniqueId,
                        bgColor: "common",
                        label: displayLabel?.trim() ? displayLabel : term.id,
                        type: term.type,
                        scope: activeScope,
                        scopes: allScopes || [],
                      };

                      const hasMultipleScopes = item.scopes.length > 1;

                      return (
                        <TableRow
                          // key={item.key}
                          key={term.id}
                          onClick={() => {
                            if (extraFilter && !extraFilter.value) {
                              setMessage(COMMON_MESSAGES.incompleteFilter);

                              setTimeout(() => {
                                setMessage(null);
                                if (valueInputRef?.current) {
                                  valueInputRef.current.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                                }
                              }, 3000);
                              return;
                            }
                            if (item.type === "alphanumeric") {
                              setExtraFilter({ ...item, setAddedFilters });
                              return;
                            }
                            setSelectedFilter((prev) => {
                              const isDuplicate = prev.some(
                                (filter) =>
                                  filter.id === item.id &&
                                  filter.scope === item.scope
                              );
                              if (isDuplicate) {
                                setMessage(COMMON_MESSAGES.doubleFilter);
                                setTimeout(() => {
                                  setMessage(null);
                                  if (valueInputRef?.current) {
                                    valueInputRef.current.scrollIntoView({
                                      behavior: "smooth",
                                      block: "center",
                                    });
                                  }
                                }, 3000);
                                return prev;
                              }

                              const newKey = `${item.id}-${item.scope}`;
                              setAddedFilters((prevSet) => {
                                const newSet = new Set(prevSet);
                                newSet.add(newKey);
                                setTimeout(() => {
                                  setAddedFilters((current) => {
                                    const updated = new Set(current);
                                    updated.delete(newKey);
                                    return updated;
                                  });
                                }, 5000);

                                return newSet;
                              });
                              return handleFilterSelection({
                                item,
                                prevFilters: prev,
                                setMessage,
                              });
                            });
                          }}
                          sx={{
                            cursor: "pointer",
                            opacity: message ? 0.6 : 1,
                            pointerEvents: message ? "none" : "auto",
                            transition:
                              "opacity 0.2s ease, background-color 0.2s ease-in-out",
                            "&:hover td": {
                              backgroundColor: bgPrimaryLight,
                            },
                          }}
                        >
                          {/* Column 1: Empty placeholder for Selector */}
                          {/* Column 1: Toggle selection icon */}
                          <TableCell
                            align="left"
                            onClick={(e) => {
                              e.stopPropagation();

                              if (extraFilter && !extraFilter.value) {
                                setMessage(COMMON_MESSAGES.incompleteFilter);
                                setTimeout(() => {
                                  setMessage(null);
                                  if (valueInputRef?.current) {
                                    valueInputRef.current.scrollIntoView({
                                      behavior: "smooth",
                                      block: "center",
                                    });
                                  }
                                }, 3000);
                                return;
                              }

                              if (item.type === "alphanumeric") {
                                if (extraFilter?.id === item.id) {
                                  setExtraFilter(null);
                                  return;
                                }

                                setExtraFilter({ ...item, setAddedFilters });
                                return;
                              }

                              const isSelected = selectedFilter.some(
                                (filter) =>
                                  filter.label === item.label &&
                                  filter.scope === item.scope
                              );

                              if (isSelected) {
                                setSelectedFilter((prev) =>
                                  prev.filter(
                                    (filter) =>
                                      !(
                                        filter.label === item.label &&
                                        filter.scope === item.scope
                                      )
                                  )
                                );
                              } else {
                                setSelectedFilter((prev) =>
                                  handleFilterSelection({
                                    item,
                                    prevFilters: prev,
                                    setMessage,
                                  })
                                );
                              }
                            }}
                          >
                            {/* Check whether this filter is currently applied */}
                            {selectedFilter.some(
                              (filter) =>
                                filter.label === item.label &&
                                filter.scope === item.scope
                            ) ? (
                              <CheckCircleIcon
                                sx={{
                                  color: config.ui.colors.primary,
                                  fontSize: 20,
                                }}
                              />
                            ) : (
                              <RadioButtonUncheckedIcon
                                sx={{
                                  color: "grey",
                                  fontSize: 20,
                                }}
                              />
                            )}
                          </TableCell>

                          {/* Column 2: ID */}
                          <TableCell data-cy="filtering-term-id">
                            {term.id}
                          </TableCell>
                          {/* Column 3: Label + Type */}
                          <TableCell data-cy="filtering-term-label">
                            {" "}
                            {displayLabel?.trim() ? item.label : "–"}
                          </TableCell>
                          {/* Column 4: Rendering Filter Types*/}
                          <TableCell>{capitalize(item.type)}</TableCell>
                          {/* Column 5: Available scopes as selectable chips */}
                          <TableCell data-cy="filtering-term-scope">
                            {item.scopes.length > 0 &&
                              item.scopes.map((scope, i) => {
                                const isSelected =
                                  selectedScopes[term.id] === scope;

                                return (
                                  <Box
                                    key={i}
                                    component="span"
                                    data-cy={
                                      isSelected
                                        ? "scope-pill-selected"
                                        : "scope-pill"
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleScopeClick(term.id, scope);
                                    }}
                                    sx={getSelectableScopeStyles(isSelected)}
                                  >
                                    {capitalize(scopeAlias[scope] || scope)}
                                  </Box>
                                );
                              })}
                            {hasMultipleScopes &&
                              changedScopes.has(`${item.id}-${item.scope}`) && (
                                <Box
                                  sx={{
                                    mt: 2,
                                    fontSize: "12px",
                                    fontStyle: "italic",
                                    color: config.ui.colors.primary,
                                  }}
                                >
                                  New scope applied
                                </Box>
                              )}
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
            showFirstButton
            showLastButton
          />
        </Paper>
      </Box>
    </>
  );
}
