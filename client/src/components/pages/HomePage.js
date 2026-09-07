import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Founders from "../Founders";
import FiltersContainer from "../filters/FiltersContainer";
import Search from "../Search";
import AllFilteringTermsComponent from "../filters/AllFilteringTermsComponent";
import ResultsContainer from "../results/ResultsContainer";
import config from "../../config/runtimeConfig";
import BeaconTypeBanner from "../homepageBanner/BeaconTypeBanner";
import { useLocation } from "react-router-dom";
import { useAuthSafe as useAuth } from "../pages/login/useAuthSafe";

// Import context to access whether a search was triggered
import { useSelectedEntry } from "../context/SelectedEntryContext";

// This is the main HomePage component
// It shows the Search bar, optional filters, and results.
// It changes based on config settings and which tool is selected.
export default function HomePage({
  selectedTool,
  setSelectedTool,
  setLoginModalOpen,
}) {
  // State to store the height of the Search component, for aligning filters
  const [searchHeight, setSearchHeight] = useState(null);
  const auth = useAuth();
  const isLoggedIn = !!auth?.userData;
  const location = useLocation();
  const isOnLoginPage = location.pathname === "/login";

  useEffect(() => {
    localStorage.removeItem("isLoggingOut");
  }, []);

  useEffect(() => {
    // Authentication protection is not needed when login is disabled.
    if (!config.ui.showLogin) return undefined;

    // Keep the existing Cypress behaviour for now.
    if (window.Cypress) return undefined;

    const isLoggingOut = localStorage.getItem("isLoggingOut") === "true";

    if (isLoggingOut || isLoggedIn || isOnLoginPage) {
      return undefined;
    }

    /**
     * Intercept unauthenticated interactions BEFORE they reach
     * React components.
     *
     * Using the capture phase is important here.
     * Without it, a component such as All Filtering Terms can
     * update its state and start an API request before the
     * Login Required modal appears.
     */
    const handleUnauthenticatedInteraction = (event) => {
      const target = event.target;

      /**
       * Allow the user to explicitly open the login flow.
       */
      const isLoginButton = target?.closest?.(".login-button");

      /**
       * Allow the responsive navigation menu to open so the
       * user can still reach the Login button on mobile.
       */
      const isBurgerMenu = target?.closest?.('[data-cy="burger-menu"]');

      if (isLoginButton || isBurgerMenu) {
        return;
      }

      /**
       * Stop the interaction before React handlers receive it.
       *
       * This prevents actions such as:
       * - opening All Filtering Terms;
       * - opening the Genomic Query Builder;
       * - running Search;
       * - triggering other query-related UI actions.
       */
      event.preventDefault();
      event.stopPropagation();

      setLoginModalOpen(true);
    };

    /**
     * capture: true means this listener runs before React's
     * normal click/keyboard handlers.
     */
    window.addEventListener("click", handleUnauthenticatedInteraction, true);

    window.addEventListener("keydown", handleUnauthenticatedInteraction, true);

    return () => {
      window.removeEventListener(
        "click",
        handleUnauthenticatedInteraction,
        true
      );

      window.removeEventListener(
        "keydown",
        handleUnauthenticatedInteraction,
        true
      );
    };
  }, [isLoggedIn, isOnLoginPage, setLoginModalOpen]);

  // Get from context whether the user already submitted a search
  const { hasSearchBeenTriggered } = useSelectedEntry();

  const showBeaconBanner =
    !hasSearchBeenTriggered && selectedTool !== "allFilteringTerms";

  // Check if Genomic Annotations filters should be shown based on the config file
  const hasGenomicAnnotationsConfig =
    !!config.ui?.genomicAnnotations?.visibleGenomicCategories;

  // Check if Common Filters should be shown based on config
  const hasCommonFiltersConfig =
    !!config.ui?.commonFilters?.filterCategories?.length &&
    !!config.ui?.commonFilters?.filterLabels &&
    Object.keys(config.ui.commonFilters.filterLabels).length > 0;

  const [activeInput, setActiveInput] = useState(null);

  // If at least one group of filters is configured, show the filters sidebar
  const shouldShowFilters =
    hasGenomicAnnotationsConfig || hasCommonFiltersConfig;

  useEffect(() => {
    const handler = (e) => setActiveInput(e.detail);
    window.addEventListener("setActiveInput", handler);
    return () => window.removeEventListener("setActiveInput", handler);
  }, []);

  const stackSearchandCommonFilters = "@media (max-width:1180px)";

  const twoValuesStackSearchandCommonFilters =
    "@media (min-width:900px) and (max-width:1180px)";

  return (
    <>
      {/* Main container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          [stackSearchandCommonFilters]: {
            flexDirection: "column",
          },
          gap: { lg: 4, md: 4, sm: 0 },
          flexWrap: "wrap",
          flexGrow: 1,
        }}
      >
        {/* Left section: Founders and Result Type radio selector, search bars, search button */}
        <Box
          sx={{
            flexGrow: { xs: 0, md: 1 },
            display: "flex",
            flexDirection: "column",
            // width: { lg: "60%", md: "60%" },
            width: "60%",
            [stackSearchandCommonFilters]: {
              width: "100%",
            },
          }}
        >
          {/* Show founders section on top left */}
          <Founders />
          {/* Main Search input component, this contains Result Type Radio selector, Genomic Query and Filtering Terms searchers */}
          <Search
            onHeightChange={setSearchHeight} // Updates the height of the search box
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            activeInput={activeInput}
            setActiveInput={setActiveInput}
          />
        </Box>

        {/* Right section: Common Filters and Genomic Annotations sidebar, only shown if needed */}
        {shouldShowFilters && (
          <Box
            sx={{
              width: { md: "290px", lg: "338px" },
              flexShrink: 0,
              mt: { xs: "0px", md: "42px" },
              mb: { xs: "20px", lg: "0px" },
              alignSelf: "flex-start",
              height: {
                lg: `${searchHeight}px`,
                md: `${searchHeight}px`,
                sm: "auto",
                xs: "auto",
              },
              p: 0,
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              [stackSearchandCommonFilters]: {
                width: "100%",
                height: "auto !important",
              },
              [twoValuesStackSearchandCommonFilters]: {
                mt: "-18px",
                mb: "45px",
              },
            }}
          >
            {/* Filters section with optional groups (common and/or genomic) */}
            <FiltersContainer
              searchHeight={searchHeight}
              hasCommonFiltersConfig={hasCommonFiltersConfig}
              hasGenomicAnnotationsConfig={hasGenomicAnnotationsConfig}
              setActiveInput={setActiveInput}
              activeInput={activeInput}
            />
          </Box>
        )}

        {/* Banner only shown before a search is triggered and if the user isn't on "allFilteringTerms" tool */}
        {showBeaconBanner && <BeaconTypeBanner />}
      </Box>

      {/* Show All Filtering Terms table if selected */}
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
            <AllFilteringTermsComponent
              setSelectedTool={setSelectedTool}
              selectedTool={selectedTool}
            />
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
