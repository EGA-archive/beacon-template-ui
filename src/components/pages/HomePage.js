import { useState } from "react";
import { Box } from "@mui/material";
import Founders from "../Founders";
import FiltersContainer from "../filters/FiltersContainer";
import Search from "../Search";
import AllFilteringTermsComponent from "../filters/AllFilteringTermsComponent";
import ResultsContainer from "../results/ResultsContainer";
import config from "../../config/config.json";
import BeaconTypeBanner from "../homepageBanner/BeaconTypeBanner";

// Import context to access whether a search was triggered
import { useSelectedEntry } from "../context/SelectedEntryContext";

// This is the main HomePage component
// It shows the Search bar, optional filters, and results.
// It changes based on config settings and which tool is selected.
export default function HomePage({ selectedTool, setSelectedTool }) {
  // State to store the height of the Search component, for aligning filters
  const [searchHeight, setSearchHeight] = useState(null);

  // Get from context whether the user already submitted a search
  const { hasSearchBeenTriggered } = useSelectedEntry();

  // Check if Genomic Annotations filters should be shown based on the config file
  const hasGenomicAnnotationsConfig =
    !!config.ui?.genomicAnnotations?.visibleGenomicCategories;

  // Check if Common Filters should be shown based on config
  const hasCommonFiltersConfig =
    !!config.ui?.commonFilters?.filterCategories?.length &&
    !!config.ui?.commonFilters?.filterLabels &&
    Object.keys(config.ui.commonFilters.filterLabels).length > 0;

  // If at least one group of filters is configured, show the filters sidebar
  const shouldShowFilters =
    hasGenomicAnnotationsConfig || hasCommonFiltersConfig;

  return (
    <>
      {/* Main container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { lg: 4, md: 4, sm: 0 },
          flexWrap: "wrap",
          flexGrow: 1,
        }}
      >
        {/* Left section: Founders and Search bar */}
        <Box
          sx={{
            flexGrow: { xs: 0, md: 1 },
            display: "flex",
            flexDirection: "column",
            width: { lg: "60%", md: "60%" },
            // backgroundColor: {
            //   lg: "lightsalmon",
            //   md: "pink",
            //   sm: "lightgreen",
            //   xs: "lightblue",
            // },
          }}
        >
          {/* Show founders section on top left */}
          <Founders />

          {/* Main Search input component */}
          <Search
            onHeightChange={setSearchHeight} // Updates the height of the search box
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
          />
        </Box>

        {/* Right section: Filters sidebar, only shown if needed */}
        {shouldShowFilters && (
          <Box
            sx={{
              width: { xs: "100%", sm: "100%", md: "290px", lg: "338px" },
              flexShrink: 0,
              mt: { xs: "0px", md: "42px" },
              mb: { xs: "25px", lg: "0px" },
              alignSelf: "flex-start",
              height: {
                lg: `${searchHeight}px`, // Match height with search bar
                md: `${searchHeight}px`, // Match height with search bar
                sm: "auto",
                xs: "auto",
              },
              p: 0,
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Filters section with optional groups (common and/or genomic) */}
            <FiltersContainer
              searchHeight={searchHeight}
              hasCommonFiltersConfig={hasCommonFiltersConfig}
              hasGenomicAnnotationsConfig={hasGenomicAnnotationsConfig}
            />
          </Box>
        )}

        {/* Banner only shown before a search is triggered and if the user isn't on "allFilteringTerms" tool */}
        {!hasSearchBeenTriggered && selectedTool !== "allFilteringTerms" && (
          <BeaconTypeBanner />
        )}
      </Box>

      {/* Show All Filtering Terms view if selected */}
      <Box>
        {selectedTool === "allFilteringTerms" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              marginTop: { lg: "-32px", md: "-32px", sm: "0px", xs: "0px" },
              marginBottom: { lg: "30px", md: "30px", sm: "30px", xs: "30px" },
            }}
          >
            <AllFilteringTermsComponent />
          </Box>
        )}
      </Box>

      {/* Results section, always shown below */}
      <Box
        sx={{
          marginTop: { lg: "-30px", md: "-30px", sm: "20px", xs: "0px" },
          marginBottom: "30px",
        }}
      >
        <ResultsContainer />
      </Box>
    </>
  );
}
