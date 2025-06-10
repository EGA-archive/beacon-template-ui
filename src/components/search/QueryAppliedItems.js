import { Box } from "@mui/material";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";
import { useSelectedEntry } from "../context/SelectedEntryContext";

export default function QueryAppliedItems({ handleFilterRemove }) {
  const { selectedFilter } = useSelectedEntry();

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {selectedFilter.map((filter) => (
        <FilterLabelRemovable
          key={filter.label}
          label={filter.label}
          onDelete={() => handleFilterRemove(filter)}
          bgColor="filter"
        />
      ))}
    </Box>
  );
}
