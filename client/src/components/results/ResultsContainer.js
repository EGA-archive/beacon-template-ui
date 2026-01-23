import { Box, Typography } from "@mui/material";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import Loader from "../common/Loader";
import ResultsBox from "./ResultsBox";
import ResultsEmpty from "./ResultsEmpty";
import { useEffect, useRef } from "react";
import { COMMON_MESSAGES } from "../common/CommonMessage";

export default function ResultsContainer() {
  const { loadingData, resultData, hasSearchResults, message, queryDirty } =
    useSelectedEntry();

  const showBox = loadingData || hasSearchResults || message;
  const tableRef = useRef(null);

  useEffect(() => {
    if (loadingData && tableRef.current) {
      setTimeout(() => {
        tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [loadingData]);

  const positiveResults = resultData.filter((item) => {
    if (item.exists !== undefined) {
      return item.exists === true && !item.info?.error;
    }

    return !item.info?.error;
  });

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
            overflow: "hidden",
          }}
        >
          {queryDirty &&
            (() => {
              return (
                <Box
                  sx={{
                    width: "100%",
                    backgroundColor: "#FFF3CD",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                    padding: "10px 16px",
                    borderBottom: "1px solid #F0E2A1",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Open Sans", sans-serif',
                      fontSize: "14px",
                      color: "#856404",
                    }}
                  >
                    Your query has changed. Click Search to update results.
                  </Typography>
                </Box>
              );
            })()}
          <Box
            sx={{
              opacity: queryDirty ? 0.4 : 1,
              transition: "opacity 0.3s ease",
              pointerEvents: queryDirty ? "none" : "auto",
            }}
          >
            {loadingData && <Loader message={COMMON_MESSAGES.loadingData} />}

            {!loadingData &&
              hasSearchResults &&
              positiveResults.length === 0 && (
                <ResultsEmpty message={message || "No results"} />
              )}

            {!loadingData && hasSearchResults && positiveResults.length > 0 && (
              <ResultsBox />
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
