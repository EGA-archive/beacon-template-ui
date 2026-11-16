import FilterLabelRemovable from "../styling/FilterLabelRemovable";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import changequerySvg from "../../assets/logos/change-query.svg";
import CommonMessage, {
  COMMON_MESSAGES,
} from "../../components/common/CommonMessage";

export default function QueryAppliedItems({
  handleFilterRemove,
  variant = "removable",
  intialEntryTypeFiltertoRender,
  showQueryWarning = false,
}) {
  // Get the current filters and setter from context
  const {
    selectedFilter,
    setSelectedFilter,
    lastSearchedFilters,
    selectedPathSegment,
    lastSearchedPathSegment,
    hasSearchResults,
    setQueryDirty,
    queryDirty,
  } = useSelectedEntry();

  // Track which label is expanded (if any)
  const [expandedKey, setExpandedKey] = useState(false);
  // Error message if user tries to select the same scope twice
  const [message, setMessage] = useState(null);

  // Handle when a user changes the scope inside an expanded label
  const handleScopeChange = (keyValue, newScope) => {
    const [baseKey, prevScope] = keyValue.split("__");

    // Find the filter being changed
    const target = selectedFilter.find(
      (filter) => filter.key === baseKey && filter.scope === prevScope
    );
    if (!target) return;

    // Prevent duplicates: same label + new scope already exists
    // const isDuplicate = selectedFilter.some(
    //   (filter) => filter.label === target.label && filter.scope === newScope
    // );
    const isDuplicate = selectedFilter.some(
      (filter) => filter.id === target.id && filter.scope === newScope
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

    const initialEntrySelection =
      lastSearchedPathSegment === null && selectedFilter.length === 1;

    const entryChanged =
      lastSearchedPathSegment !== null &&
      selectedPathSegment !== lastSearchedPathSegment;

    const dirty = !sameContent || entryChanged;
    if (initialEntrySelection) {
      setQueryDirty(false);
      return;
    }

    setQueryDirty(dirty);
  }, [
    selectedFilter,
    lastSearchedFilters,
    selectedPathSegment,
    lastSearchedPathSegment,
    setQueryDirty,
  ]);

  const filtersToRender = intialEntryTypeFiltertoRender || selectedFilter;

  return (
    <Box>
      {/* Show error message if there's a duplicate */}
      {message && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}

      {/* Applied query filters and warning */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {filtersToRender.map((filter) => {
          const isGenomic = filter.scope === "genomicQueryBuilder";

          const keyValue = isGenomic
            ? filter.id
            : `${filter.key}__${filter.scope}`;

          return (
            <FilterLabelRemovable
              key={isGenomic ? filter.id : `${filter.key}__${filter.scope}`}
              keyValue={keyValue}
              label={filter.label}
              type={filter.type}
              scope={filter.scope}
              scopes={filter.scopes}
              queryType={filter.queryType}
              queryParams={filter.queryParams}
              onDelete={() => {
                if (hasSearchResults) {
                  setQueryDirty(true);
                }
                handleFilterRemove(filter);
              }}
              onScopeChange={handleScopeChange}
              bgColor={filter.bgColor || "common"}
              expandedKey={expandedKey}
              setExpandedKey={setExpandedKey}
              variant={variant}
              disableTooltip={variant === "readonly"}
              disableClick={variant === "readonly"}
            />
          );
        })}

        {/* Warning displayed only when enabled and query is modified */}
        {showQueryWarning && queryDirty && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minHeight: "32px",
              px: 1.5,
              py: 0.5,
              ml: "auto",
              maxWidth: "100%",
              backgroundColor: "#FEF2D7",
              borderRadius: "34px",
              border: "1px solid #FDDA8F",
              color: "#825B0D",
            }}
          >
            <Box
              component="img"
              src={changequerySvg}
              alt=""
              sx={{
                width: "18px",
                height: "18px",
                flexShrink: 0,
              }}
            />

            <Typography
              sx={{
                fontFamily: '"Open Sans", sans-serif',
                fontSize: "12px",
                color: "inherit",
                whiteSpace: { xs: "normal", sm: "nowrap" },
              }}
            >
              Query modified - <i>Click “Search” to update results</i>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
