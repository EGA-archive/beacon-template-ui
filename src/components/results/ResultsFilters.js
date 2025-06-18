import { Box } from "@mui/material";
import QueryAppliedItems from '../search/QueryAppliedItems';
import { useSelectedEntry } from "../context/SelectedEntryContext";

export default function ResultsFilters() {
  const {
    setSelectedFilter,
    setLoadingData,
    setResultData,
    setHasSearchResult 
  } = useSelectedEntry();

  const handleFilterRemove = (item) => {
    // If something has change, reload filter
    setLoadingData(false);
    setResultData([]);
    setHasSearchResult(false);

    setSelectedFilter((prevFilters) =>
      prevFilters.filter((filter) => filter.key !== item.key)
    );
  }

  return (
    <Box
      sx={{
        p: 2
      }}>
      <QueryAppliedItems handleFilterRemove={handleFilterRemove} />
    </Box>
  )
}