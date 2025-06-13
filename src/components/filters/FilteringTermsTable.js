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
import CommonMessage from "../common/CommonMessage";
import { FILTERING_TERMS_COLUMNS } from "../../lib/constants";
import { capitalize } from "../common/textFormatting";
import {
  assignDefaultScopesToTerms,
  handleFilterSelection,
} from "../common/filteringTermsHelpers";

export default function FilteringTermsTable({ filteringTerms, defaultScope }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedScopes, setSelectedScopes] = useState({});
  const [message, setMessage] = useState(null);
  const { setExtraFilter, setSelectedFilter } = useSelectedEntry();

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

  const headerCellStyle = {
    backgroundColor: bgPrimary,
    fontWeight: 700,
  };

  const allFilteringTerms = filteringTerms?.response?.filteringTerms ?? [];

  const handleScopeClick = (termId, scope) => {
    setSelectedScopes((prev) => ({
      ...prev,
      [termId]: scope,
    }));
  };

  /* MUI settings for pagination */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      {/* Renders error message if needed */}
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
                      ...headerCellStyle,
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
              {allFilteringTerms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <CommonMessage
                      text="No match found. Try another filter."
                      type="error"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                allFilteringTerms
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((term) => (
                    <TableRow
                      key={term.id}
                      onClick={() => {
                        const item = {
                          key: term.id,
                          label: term.label || term.id,
                          type: term.type,
                          scope: selectedScopes[term.id],
                        };

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
                      <TableCell>
                        {(term.label || "") + ` (${term.type})`}
                      </TableCell>
                      <TableCell>
                        {term.scopes?.map((scope, i) => {
                          const isSelected = selectedScopes[term.id] === scope;
                          return (
                            <Box
                              key={i}
                              component="span"
                              onClick={() => handleScopeClick(term.id, scope)}
                              sx={{
                                display: "inline-block",
                                backgroundColor: isSelected
                                  ? config.ui.colors.primary
                                  : "#fff",
                                color: isSelected
                                  ? "#fff"
                                  : config.ui.colors.darkPrimary,
                                border: `1px solid ${
                                  isSelected
                                    ? config.ui.colors.primary
                                    : config.ui.colors.darkPrimary
                                }`,
                                borderRadius: "7px",
                                fontSize: "12px",
                                px: 1.5,
                                py: 0.3,
                                mr: 1,
                                mb: 0.5,
                                fontFamily: '"Open Sans", sans-serif',
                                textTransform: "capitalize",
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                              }}
                            >
                              {capitalize(scopeAlias[scope] || scope)}
                            </Box>
                          );
                        })}
                      </TableCell>
                    </TableRow>
                  ))
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
