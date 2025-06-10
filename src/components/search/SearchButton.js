import {
  Button
} from "@mui/material";
import config from '../../config/config.json';
import SearchIcon from "@mui/icons-material/Search";
import { useSelectedEntry } from "../context/SelectedEntryContext";

export default function SearchButton() {
  const {
    selectedPathSegment, 
    setLoadingData,
    setResultData,
    setHasSearchResult 
  } = useSelectedEntry();

  const handleSearch = async () => {
    setLoadingData(true);
    setResultData([]);

    try {
      // TODO filters items
      const response = await fetch(`${config.apiUrl}/${selectedPathSegment}`);
      const data = await response.json();  

      // group beacons
      const groupedArray = Object.values(
        Object.values(data.response.resultSets).reduce((acc, item) => {
          const isBeaconNetwork = !!item.beaconId;
          const key = isBeaconNetwork ? item.beaconId : item.id;

          if (!acc[key]) {
            acc[key] = {
              ...(isBeaconNetwork
                ? { beaconId: item.beaconId, id: item.id }
                : { id: item.id }),
              exists: item.exists,
              info: item.info || null,
              totalResultsCount: 0,
              setType: item.setType,
              items: []
            };
          }

          const count = Number(item.resultsCount) || 0;
          acc[key].totalResultsCount += count;

          if (Array.isArray(item.results)) {
            acc[key].items.push({
              dataset: item.id,
              results: item.results
            });
          }

          return acc;
        }, {})
      );

      setResultData(groupedArray);
    } catch (error) {
      // TODO show msg to user!
      console.error("Search failed", error);
    } finally {
      setHasSearchResult(true)
      setLoadingData(false);
    }
  }
  
  return (
    <Button
      variant="contained"
      sx={{
        borderRadius: "999px",
        textTransform: "none",
        fontSize: "14px",
        pl: 2,
        ml: 2,
        backgroundColor: config.ui.colors.primary,
        border: `1px solid ${config.ui.colors.primary}`,
        boxShadow: 'none',
        "&:hover": {
          backgroundColor: 'white',
          border: `1px solid ${config.ui.colors.primary}`,
          color: config.ui.colors.primary
        },
      }}
      startIcon={ <SearchIcon /> }
      onClick={ handleSearch }
    >
      Search
    </Button>
  )
}