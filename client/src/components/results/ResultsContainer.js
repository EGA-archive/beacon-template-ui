import { Box } from "@mui/material";
import { useEffect, useRef } from "react";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import Loader from "../common/Loader";
import ResultsBox from "./ResultsBox";
import ResultsEmpty from "./ResultsEmpty";
import { COMMON_MESSAGES } from "../common/CommonMessage";

export default function ResultsContainer() {
  const { loadingData, resultData, hasSearchResults, message, queryDirty } =
    useSelectedEntry();

  const showBox = loadingData || hasSearchResults || message;
  const tableRef = useRef(null);

  useEffect(() => {
    if (loadingData && tableRef.current) {
      const timeout = setTimeout(() => {
        tableRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [loadingData]);

  const positiveResults = resultData.filter((item) => {
    if (item.exists !== undefined) {
      return item.exists === true && !item.info?.error;
    }

    return !item.info?.error;
  });

  if (!showBox) return null;

  return (
    <Box
      ref={tableRef}
      sx={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0px 8px 11px 0px #9BA0AB24",
        minBlockSize: "400px",
        paddingBottom: "30px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {loadingData && <Loader message={COMMON_MESSAGES.loadingData} />}

      {!loadingData && hasSearchResults && positiveResults.length === 0 && (
        <ResultsEmpty message={message || ""} />
      )}

      {!loadingData && hasSearchResults && positiveResults.length > 0 && (
        <ResultsBox />
      )}
    </Box>
  );
}
