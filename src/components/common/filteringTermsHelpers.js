import Fuse from "fuse.js";
import { COMMON_MESSAGES } from "../common/CommonMessage";

export function assignDefaultScopesToTerms(
  terms,
  defaultScope,
  scopeAlias = {}
) {
  if (!terms || terms.length === 0 || !defaultScope) return {};

  const normalized = scopeAlias[defaultScope] || defaultScope;
  const defaults = {};

  terms.forEach((term) => {
    const match = term.scopes?.find(
      (scope) => scope.toLowerCase() === normalized.toLowerCase()
    );

    if (match) {
      defaults[term.id] = match;
    } else if (term.scopes?.length > 0) {
      defaults[term.id] = term.scopes[0];
    }
  });

  return defaults;
}

export function searchFilteringTerms(terms, searchInput) {
  if (!terms || terms.length === 0 || !searchInput) return [];

  const fuse = new Fuse(terms, {
    keys: ["label", "id"],
    threshold: 0.3,
  });

  return fuse.search(searchInput).map((r) => r.item);
}

// export function handleFilterSelection({
//   item,
//   prevFilters,
//   setMessage,
//   onSuccess = () => {},
// }) {
//   const isDuplicate = prevFilters.some((f) => f.key === item.key);

//   if (isDuplicate) {
//     setMessage(COMMON_MESSAGES.doubleFilter);
//     setTimeout(() => setMessage(null), 3000);
//     return prevFilters;
//   }

//   onSuccess();
//   return [...prevFilters, item];
// }

export function handleFilterSelection({
  item,
  prevFilters,
  setMessage,
  onSuccess = () => {},
}) {
  const isDuplicate = prevFilters.some(
    (f) => f.key === item.key && f.scope === item.scope
  );

  if (isDuplicate) {
    setMessage(COMMON_MESSAGES.doubleFilter);
    setTimeout(() => setMessage(null), 3000);
    return prevFilters;
  }

  onSuccess();
  return [...prevFilters, item];
}

export function getDisplayLabelAndScope(term, selectedEntryType) {
  const scopes = term.scopes || [];

  if (!selectedEntryType) selectedEntryType = "";

  const aliasMap = {
    individuals: "individual",
    biosamples: "biosample",
    cohorts: "cohort",
    datasets: "dataset",
    runs: "run",
    analyses: "analysis",
    g_variants: "genomic_variant",
  };

  const normalizedEntryType =
    aliasMap[selectedEntryType.toLowerCase()] ||
    selectedEntryType.toLowerCase();

  if (scopes.length === 0) {
    return {
      displayLabel: term.label,
      selectedScope: null,
      allScopes: [],
      needsSelection: false,
    };
  }

  if (scopes.length === 1) {
    return {
      displayLabel: term.label,
      selectedScope: scopes[0],
      allScopes: scopes,
      needsSelection: false,
    };
  }

  const preselected =
    scopes.find(
      (scope) => scope.toLowerCase() === normalizedEntryType.toLowerCase()
    ) || scopes[0];

  return {
    displayLabel: term.label,
    selectedScope: preselected,
    allScopes: scopes,
    needsSelection: true,
  };
}
