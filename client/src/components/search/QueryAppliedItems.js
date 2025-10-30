import { Box } from "@mui/material";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { useState, useEffect } from "react";
import CommonMessage, {
  COMMON_MESSAGES,
} from "../../components/common/CommonMessage";

export default function QueryAppliedItems({
  handleFilterRemove,
  variant = "removable",
  customFilters,
}) {
  // Get the current filters and setter from context
  const {
    selectedFilter,
    setSelectedFilter,
    lastSearchedFilters,
    setQueryDirty,
  } = useSelectedEntry();

  const filtersToRender = customFilters || selectedFilter;

  // Track which label is expanded (if any)
  const [expandedKey, setExpandedKey] = useState(false);
  // Error message if user tries to select the same scope twice
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setQueryDirty(selectedFilter.length > 0);
    console.log("📌 Applied filters:", selectedFilter);
  }, [selectedFilter, setQueryDirty]);

  // Handle when a user changes the scope inside an expanded label
  const handleScopeChange = (keyValue, newScope) => {
    const [baseKey, prevScope] = keyValue.split("__");

    // Find the filter being changed
    const target = selectedFilter.find(
      (filter) => filter.key === baseKey && filter.scope === prevScope
    );
    if (!target) return;

    // Prevent duplicates: same label + new scope already exists
    const isDuplicate = selectedFilter.some(
      (filter) => filter.label === target.label && filter.scope === newScope
    );

    if (isDuplicate) {
      setMessage(COMMON_MESSAGES.doubleFilter);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Otherwise update the scope
    setSelectedFilter((prevFilters) =>
      prevFilters.map((filter) =>
        filter.key === baseKey && filter.scope === prevScope
          ? { ...filter, scope: newScope }
          : filter
      )
    );

    setExpandedKey(null);
  };

  useEffect(() => {
    const sameLength = selectedFilter.length === lastSearchedFilters.length;

    const sameContent =
      sameLength &&
      selectedFilter.every((f, index) => {
        const g = lastSearchedFilters[index];
        return (
          g &&
          f.id === g.id &&
          f.operator === g.operator &&
          f.value === g.value &&
          f.scope === g.scope
        );
      });

    const dirty = !sameContent;
    setQueryDirty(dirty);

    console.log("📌 Applied filters:", selectedFilter, { dirty });
  }, [selectedFilter, lastSearchedFilters, setQueryDirty]);

  return (
    <Box>
      {/* Show error message if there's a duplicate */}
      {message && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}

      {/* Render all selected filters as removable labels */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {filtersToRender.map((filter) => {
          const isGenomic = filter.scope === "genomicQueryBuilder";

          // Unique key for identifying and expanding a label
          const keyValue = isGenomic
            ? filter.id // use unique id for genomicQueryBuilder
            : `${filter.key}__${filter.scope}`;

          return (
            <FilterLabelRemovable
              key={isGenomic ? filter.id : `${filter.key}__${filter.scope}`}
              keyValue={keyValue}
              label={filter.label}
              scope={filter.scope}
              scopes={filter.scopes}
              onDelete={() => {
                console.log("❌ Removing filter:", filter);
                handleFilterRemove(filter);
              }}
              onScopeChange={handleScopeChange}
              bgColor={filter.bgColor || "common"}
              expandedKey={expandedKey}
              setExpandedKey={setExpandedKey}
              variant={variant}
            />
          );
        })}
      </Box>
    </Box>
  );
}
