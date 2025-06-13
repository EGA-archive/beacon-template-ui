import { useState } from "react";
import { Box } from "@mui/material";
import Founders from "../Founders";
import FiltersContainer from "../filters/FiltersContainer";
import Search from "../Search";
import AllFilteringTermsComponent from "../filters/AllFilteringTermsComponent";
import ResultsContainer from "../results/ResultsContainer";

export default function HomePage({ selectedTool, setSelectedTool }) {
  const [searchHeight, setSearchHeight] = useState(null);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          flexWrap: "wrap",
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            flexGrow: { xs: 0, md: 1 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Founders />
          <Search
            onHeightChange={setSearchHeight}
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
          />
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: "338px" },
            maxWidth: "338px",
            flexShrink: 0,
            // top: { md: "122px" },
            mt: { xs: "0px", md: "42px" },
            mb: { xs: "50px", md: "40px", lg: "0px" },
            alignSelf: "flex-start",
            height: `${searchHeight}px`,
            backgroundColor: "white",
            p: 0,
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <FiltersContainer searchHeight={searchHeight} />
        </Box>
        {selectedTool === "allFilteringTerms" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              marginTop: "-40px",
              marginBottom: "40px",
            }}
          >
            <AllFilteringTermsComponent />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          marginBottom: "30px",
        }}
      >
        <ResultsContainer />
      </Box>
    </>
  );
}
