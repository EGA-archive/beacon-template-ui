import { Box } from "@mui/material";
import QueryAppliedItems from "../search/QueryAppliedItems";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import { formatEntryLabel } from "../common/textFormatting";

export default function ResultsFilters() {
  const {
    setHasSearchResult,
    lastSearchedFilters,
    setLastSearchedFilters,
    lastSearchedPathSegment,
  } = useSelectedEntry();

  const handleFilterRemove = (item) => {
    setLastSearchedFilters((prevFilters) =>
      prevFilters.filter((filter) => filter.key !== item.key)
    );
    setHasSearchResult(true);
  };

  const entryTypeChip = lastSearchedPathSegment
    ? {
        id: `entry-type-${lastSearchedPathSegment}`,
        key: `entry-type-${lastSearchedPathSegment}`,
        label: formatEntryLabel(lastSearchedPathSegment),
        type: "entryType",
        scope: "entryType",
        scopes: [],
        bgColor: "common",
      }
    : null;

  return (
    <Box
      sx={{
        pt: "5px",
        pb: "30px",
      }}
    >
      <QueryAppliedItems
        handleFilterRemove={handleFilterRemove}
        variant="readonly"
        customFilters={
          entryTypeChip
            ? [entryTypeChip, ...lastSearchedFilters]
            : lastSearchedFilters
        }
      />
    </Box>
  );
}
