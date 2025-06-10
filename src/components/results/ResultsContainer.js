import { Box } from "@mui/material";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import Loader from "../common/Loader";
import ResultsBox from "./ResultsBox";
import ResultsEmpty from "./ResultsEmpty";

export default function ResultsContainer() {
  const { loadingData, resultData, hasSearchResults } = useSelectedEntry();

  return (
    <>
      {(loadingData || hasSearchResults) && (
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0px 8px 11px 0px #9BA0AB24",
            minBlockSize: "400px",
            paddingBottom: "30px",
          }}
        >
          {loadingData && <Loader message="Loading data..." />}

          {!loadingData && hasSearchResults && resultData.length == 0 && (
            <>
              <ResultsEmpty />
            </>
          )}
          {!loadingData && hasSearchResults && resultData.length > 0 && (
            <>
              <ResultsBox />
            </>
          )}
        </Box>
      )}
    </>
  );
}
