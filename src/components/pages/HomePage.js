import { useState } from "react";
import { Box } from "@mui/material";
import Founders from "../Founders";
import FiltersContainer from "../filters/FiltersContainer";
import Search from "../Search";
import AllFilteringTermsComponent from "../filters/AllFilteringTermsComponent";
import ResultsContainer from "../results/ResultsContainer";
import config from "../../config/config.json";

export default function HomePage({ selectedTool, setSelectedTool }) {
  const [searchHeight, setSearchHeight] = useState(null);

  const hasGenomicAnnotationsConfig =
    !!config.ui?.genomicAnnotations?.visibleGenomicCategories;

  const hasCommonFiltersConfig =
    !!config.ui?.commonFilters?.filterCategories?.length &&
    !!config.ui?.commonFilters?.filterLabels &&
    Object.keys(config.ui.commonFilters.filterLabels).length > 0;

  const shouldShowFilters =
    hasGenomicAnnotationsConfig || hasCommonFiltersConfig;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
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

        {shouldShowFilters && (
          <Box
            sx={{
              width: { xs: "100%", md: "338px" },
              maxWidth: "338px",
              flexShrink: 0,
              mt: { xs: "0px", md: "42px" },
              mb: { xs: "50px", md: "40px", lg: "0px" },
              alignSelf: "flex-start",
              height: `${searchHeight}px`,
              p: 0,
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <FiltersContainer
              searchHeight={searchHeight}
              hasCommonFiltersConfig={hasCommonFiltersConfig}
              hasGenomicAnnotationsConfig={hasGenomicAnnotationsConfig}
            />
          </Box>
        )}
      </Box>
      <Box>
        {selectedTool === "allFilteringTerms" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              paddingBottom: "40px",
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
