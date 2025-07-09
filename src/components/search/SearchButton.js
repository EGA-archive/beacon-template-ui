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
    setHasSearchResult,
    selectedFilter
  } = useSelectedEntry();

  const handleSearch = async () => {
    setLoadingData(true);
    setResultData([]);

    try {
      // TODO filters items
      let url = `${config.apiUrl}/${selectedPathSegment}`;
      let response;
      if(selectedFilter.length > 0) {
        let query = queryBuilder(selectedFilter);

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query
          })
        };
        response = await fetch(url, requestOptions);
      } else {
        response = await fetch(url);
      }

      if(!response.ok) {
        // TODO show error!
      }
      
      const data = await response.json();

      // group beacons
      const rawItems = data?.response?.resultSets ?? data?.response?.collections ?? [];

      const groupedArray = Object.values(
        Object.values(rawItems).reduce((acc, item) => {
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
              description: item.description ?? "",
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

  const queryBuilder = (params) => {
    let filter = {
      "meta": {
        "apiVersion": "2.0"
      },
      "query": {
        "filters": []
      },
      "includeResultsetResponses": "HIT",
        "pagination": {
          "skip": 0,
          "limit": 10
      },
      "testMode": false,
      "requestedGranularity": "record"
    }

    let filterData = params.map((item) =>  
      {
        if(item.operator) {
          return {
            id: item.field,
            operator: item.operator,
            value: item.value
          }
        } else {
          return {
            id: item.key ?? item.id,
            scope: selectedPathSegment
          }
        }
      }
    );

    filter.query.filters = filterData;

    return filter;
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