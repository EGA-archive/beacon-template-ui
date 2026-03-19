import { Box } from "@mui/material";
import QueryAppliedItems from "../search/QueryAppliedItems";
import { useSelectedEntry } from "../context/SelectedEntryContext";

export default function ResultsFilters() {
  const { setHasSearchResult, lastSearchedFilters, setLastSearchedFilters } =
    useSelectedEntry();

  const handleFilterRemove = (item) => {
    setLastSearchedFilters((prevFilters) =>
      prevFilters.filter((filter) => filter.key !== item.key)
    );
    setHasSearchResult(true);
  };

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
        customFilters={lastSearchedFilters}
      />
    </Box>
  );
}
