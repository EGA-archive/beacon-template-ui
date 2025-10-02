import Fuse from "fuse.js";
import { COMMON_MESSAGES } from "../common/CommonMessage";

/**
 * Utility functions for working with filtering terms.
 * - assignDefaultScopesToTerms: sets a default scope for each term.
 * - searchFilteringTerms: finds matching terms using fuzzy search.
 * - handleFilterSelection: adds a term IF it's not a duplicate.
 * - getDisplayLabelAndScope: returns label/scope info for display.
 */
// Set default scope for each term
export function assignDefaultScopesToTerms(
  terms,
  defaultScope,
  scopeAlias = {}
) {
  if (!terms?.length || !defaultScope) return {};
  const normalized = scopeAlias[defaultScope] || defaultScope,
    defaults = {};
  terms.forEach((term) => {
    const match = term.scopes?.find(
      (s) => s.toLowerCase() === normalized.toLowerCase()
    );
    defaults[term.id] = match || term.scopes?.[0];
  });
  return defaults;
}

// Fuzzy search terms by label or id
export function searchFilteringTerms(terms, searchInput) {
  if (!terms?.length || !searchInput) return [];
  return new Fuse(terms, { keys: ["label", "id"], threshold: 0.3 })
    .search(searchInput)
    .map((r) => r.item);
}

// Add term if not duplicate
export function handleFilterSelection({
  item,
  prevFilters,
  setMessage,
  onSuccess = () => {},
}) {
  if (prevFilters.some((f) => f.key === item.key && f.scope === item.scope)) {
    setMessage(COMMON_MESSAGES.doubleFilter);
    setTimeout(() => setMessage(null), 3000);
    return prevFilters;
  }
  onSuccess();
  return [...prevFilters, item];
}

// Get display label, selected scope, and selection state
export function getDisplayLabelAndScope(term, selectedEntryType) {
  const scopes = term.scopes || [],
    aliasMap = {
      individuals: "individual",
      biosamples: "biosample",
      cohorts: "cohort",
      datasets: "dataset",
      runs: "run",
      analyses: "analysis",
      g_variants: "genomic_variant",
    };
  const type =
    aliasMap[selectedEntryType?.toLowerCase()] ||
    selectedEntryType?.toLowerCase() ||
    "";
  if (!scopes.length)
    return {
      displayLabel: term.label,
      selectedScope: null,
      allScopes: [],
      needsSelection: false,
    };
  if (scopes.length === 1)
    return {
      displayLabel: term.label,
      selectedScope: scopes[0],
      allScopes: scopes,
      needsSelection: false,
    };
  return {
    displayLabel: term.label,
    selectedScope: scopes.find((s) => s.toLowerCase() === type) || scopes[0],
    allScopes: scopes,
    needsSelection: true,
  };
}
