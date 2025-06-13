import Fuse from "fuse.js";

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

export function handleFilterSelection({
  item,
  prevFilters,
  setMessage,
  onSuccess = () => {},
}) {
  const isDuplicate = prevFilters.some((f) => f.key === item.key);

  if (isDuplicate) {
    setMessage(
      "This filter is already in use. Choose another one to continue."
    );
    setTimeout(() => setMessage(null), 3000);
    return prevFilters;
  }

  onSuccess();
  return [...prevFilters, item];
}
