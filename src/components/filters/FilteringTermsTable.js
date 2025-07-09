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

export default function FilteringTermsTable({
  filteringTerms,
  defaultScope,
  searchWasPerformed,
  loading,
  handleChangePage,
  handleChangeRowsPerPage,
  page,
  rowsPerPage
}) {

  const [selectedScopes, setSelectedScopes] = useState({});
  const [message, setMessage] = useState(null);
  const {
    setExtraFilter,
    setSelectedFilter,
    selectedPathSegment: selectedEntryType,
  } = useSelectedEntry();

  const scopeAlias = {
    individuals: "individual",
    biosamples: "biosample",
    analyses: "analysis",
    cohorts: "cohort",
    datasets: "dataset",
    g_variants: "Genomic Variation",
    genomicVariations: "Genomic Variation",
  };

  useEffect(() => {
    const defaults = assignDefaultScopesToTerms(
      filteringTerms?.response?.filteringTerms ?? [],
      defaultScope,
      scopeAlias
    );
    setSelectedScopes(defaults);
  }, [filteringTerms, defaultScope]);

  const bgPrimary = lighten(config.ui.colors.primary, 0.8);

  const allFilteringTerms = filteringTerms?.response?.filteringTerms ?? [];

  const handleScopeClick = (termId, scope) => {
    setSelectedScopes((prev) => ({
      ...prev,
      [termId]: scope,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Loader message={COMMON_MESSAGES.loadingTerms} />
      </Box>
    );
  }

  return (
    <>
      {message && (
        <Box sx={{ mb: 2 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}
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
                allFilteringTerms
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((term) => {
                    const { displayLabel, selectedScope, allScopes } =
                      getDisplayLabelAndScope(term, selectedEntryType);

                    const activeScope =
                      selectedScopes[term.id] ||
                      selectedScope ||
                      allScopes?.[0] ||
                      null;

                    const item = {
                      key: term.id,
                      label: displayLabel?.trim()
                        ? displayLabel
                        : term.label || term.id,
                      type: term.type,
                      scope: activeScope,
                      scopes: allScopes || [],
                    };

                    return (
                      <TableRow
                        key={term.id}
                        onClick={() => {
                          if (item.type === "alphanumeric") {
                            setExtraFilter(item);
                            return;
                          }

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
                        <TableCell>{term.id}</TableCell>
                        <TableCell>{`${item.label} (${item.type})`}</TableCell>
                        <TableCell>
                          {item.scopes.length > 0 &&
                            item.scopes.map((scope, i) => {
                              const isSelected =
                                selectedScopes[term.id] === scope;
                              return (
                                <Box
                                  key={i}
                                  component="span"
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
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
