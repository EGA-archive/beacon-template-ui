import { Box } from "@mui/material";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import Loader from "../common/Loader";
import ResultsBox from "./ResultsBox";
import ResultsEmpty from "./ResultsEmpty";
import { useEffect, useRef } from "react";
import { COMMON_MESSAGES } from "../common/CommonMessage";

export default function ResultsContainer() {
  const { loadingData, resultData, hasSearchResults, message } =
    useSelectedEntry();

  const showBox = loadingData || hasSearchResults || message;

  // console.log("message", message);

  const tableRef = useRef(null);

  useEffect(() => {
    if (loadingData && tableRef.current) {
      setTimeout(() => {
        tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [loadingData]);

  return (
    <>
      {showBox && (
        <Box
          ref={tableRef}
          sx={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0px 8px 11px 0px #9BA0AB24",
            minBlockSize: "400px",
            paddingBottom: "30px",
          }}
        >
          {loadingData && <Loader message={COMMON_MESSAGES.loadingData} />}

          {!loadingData && hasSearchResults && resultData.length === 0 && (
            <ResultsEmpty message={message || "We don't have results"} />
          )}

          {!loadingData && hasSearchResults && resultData.length > 0 && (
            <ResultsBox />
          )}
        </Box>
      )}
    </>
  );
}
