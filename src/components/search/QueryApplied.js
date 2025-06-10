import { Box, Typography, Button } from "@mui/material";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import QueryAppliedItems from "./QueryAppliedItems";
import config from "../../config/config.json";

export default function QueryApplied() {
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
  };

  return (
    <Box
      sx={{
        display: "block",
        backgroundColor: "white",
        mt: 3,
        borderRadius: "10px",
        border: "1px solid #E0E0E0",
      }}
    >
      <Box
        sx={{
          padding: "5px 15px 15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            paddingBottom: "1px",
          }}
        >
          <Typography
            sx={{
              mb: 2,
              pt: 1,
              fontWeight: 700,
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
            }}
          >
            Query Applied
          </Typography>
          <Box
            sx={{
              color: config.ui.colors.primary,
            }}
          >
            <Button
              sx={{
                textTransform: "none",
                fontSize: "14px",
                pl: 2,
                ml: 2,
              }}
              startIcon={<DeleteOutlineIcon />}
            >
              Clear All
            </Button>
          </Box>
        </Box>
        <QueryAppliedItems handleFilterRemove={handleFilterRemove} />
      </Box>
    </Box>
  );
}
