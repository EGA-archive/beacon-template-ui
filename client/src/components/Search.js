import { useEffect, useRef, useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import config from "../config/runtimeConfig";
import { useSelectedEntry } from "./context/SelectedEntryContext";
import GenomicQueryBuilderButton from "./genomic/GenomicQueryBuilderButton";
import GenomicQueryBuilderDialog from "./genomic/GenomicQueryBuilderDialog";
import QueryApplied from "./search/QueryApplied";
import SearchButton from "./search/SearchButton";
import FilterTermsExtra from "./search/FilterTemsExtra";
import GenomicSearchSection from "./search/utils/GenomicSearchSection";
import FilteringTermsSection from "./search/utils/FilteringTermsSection";
import ResultTypeSection from "./search/utils/ResultTypeSection";
import useAuthHeaders from "../hooks/useAuthHeaders";
import FILTERING_PLACEHOLDERS from "./search/utils/filteringPlaceholders";
import getGenomicQueryDescription from "./search/utils/getGenomicQueryDescription";
import { getGenomicTooltipContent } from "./search/utils/genomicTooltipContent";
import {
  formatEntryLabel,
  singleEntryCustomLabels,
  singleEntryTypeDescriptions,
  prioritizeEntries,
} from "../components/common/textFormatting";
import mockEntryTypes from "./search/mockEntryTypes.json";

/**
 * Return the placeholder configured for the selected Entry Type.
 * A generic placeholder is used when no specific one is available.
 */
const getFilteringPlaceholder = (pathSegment) =>
  FILTERING_PLACEHOLDERS[pathSegment] || "Search by Filtering Terms.";

/**
 * Below 600px, the Search area uses its mobile layout.
 */
const MOBILE_SEARCH_QUERY = "(max-width:599px)";

/**
 * Between 600px and 870px, the Search area uses an intermediate layout.
 *
 * In this layout, up to 6 Entry Types can stay in one column.
 */
const INTERMEDIATE_SEARCH_QUERY = "(min-width:600px) and (max-width:870px)";

/**
 * Existing layout adjustment for the Search box bottom margin.
 */
const SEARCH_MARGIN_QUERY = "@media (min-width:900px) and (max-width:1180px)";

export default function Search({
  activeInput,
  setActiveInput,
  onHeightChange,
  selectedTool,
  setSelectedTool,
}) {
  const {
    // Entry Types and configuration
    entryTypes,
    setEntryTypes,
    entryTypesConfig,
    setEntryTypesConfig,

    // Applied filters
    selectedFilter,
    setSelectedFilter,
    extraFilter,

    // Beacon information
    setBeaconsInfo,

    // Currently selected Entry Type
    selectedPathSegment,
    setSelectedPathSegment,

    // Draft genomic query
    genomicDraft,
    setGenomicDraft,

    // Search state
    hasSearchResults,
    setQueryDirty,
    lastSearchedPathSegment,

    // Loading state
    isLoaded,
    setIsLoaded,

    // Shared references and actions
    filteringButtonRef,
    setOpenGenomicQueryBuilder,
  } = useSelectedEntry();

  const [loading, setLoading] = useState(true);
  const [assembly, setAssembly] = useState(config.assemblyId[0]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [isGenomicDescriptionMultiline, setIsGenomicDescriptionMultiline] =
    useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);

  /**
   * Responsive Search layouts.
   */
  const isMobileSearchLayout = useMediaQuery(MOBILE_SEARCH_QUERY);

  const isIntermediateSearchLayout = useMediaQuery(INTERMEDIATE_SEARCH_QUERY);

  // Includes a Bearer token when the user is logged in.
  const authHeaders = useAuthHeaders();

  /**
   * Load information about the available Beacon or Beacons.
   */
  const handleBeaconsInfo = async () => {
    try {
      const url = `${config.apiUrl}/info`;
      const response = await fetch(url, {
        headers: authHeaders,
      });

      const data = await response.json();
      let normalizedData = [];

      if (Array.isArray(data.responses)) {
        normalizedData = data.responses;
      } else if (data.response) {
        if (Array.isArray(data.response)) {
          normalizedData = data.response;
        } else if (
          typeof data.response === "object" &&
          data.response !== null
        ) {
          normalizedData = [data.response];
        }
      }

      setBeaconsInfo(normalizedData);
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  /**
   * Load the Entry Type configuration used when building requests.
   */
  const fetchConfiguration = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/configuration`, {
        headers: authHeaders,
      });

      const data = await response.json();

      setEntryTypesConfig({
        entryTypes: data.response?.entryTypes || data.entryTypes || {},
        maturityAttributes: data.response?.maturityAttributes || {},
      });
    } catch (error) {
      console.error("Error fetching configuration:", error);
    }
  };

  /**
   * Focus the genomic input when it becomes active.
   */
  useEffect(() => {
    if (activeInput === "genomic" && inputRef.current) {
      inputRef.current.focus();
      setActiveInput(null);
    }
  }, [activeInput, setActiveInput]);

  /**
   * Report the Search box height to HomePage.
   *
   * HomePage uses this height to align the filters sidebar.
   */
  useEffect(() => {
    if (!searchRef.current || !onHeightChange) return;

    const observer = new ResizeObserver(() => {
      onHeightChange(searchRef.current.offsetHeight);
    });

    observer.observe(searchRef.current);

    return () => observer.disconnect();
  }, [onHeightChange]);

  /**
   * Load and normalize the available Entry Types.
   */
  useEffect(() => {
    const fetchEntryTypes = async () => {
      setLoading(true);

      try {
        await handleBeaconsInfo();

        const response = await fetch(`${config.apiUrl}/map`, {
          headers: authHeaders,
        });

        // Use this when testing with the real API response:
        // const data = await response.json();

        const data = mockEntryTypes;

        const endpointSets = data.response.endpointSets || {};
        const seen = new Set();

        setIsLoaded(false);

        const entries = Object.entries(endpointSets)
          // Ignore endpoint helper entries.
          .filter(([key]) => !key.includes("Endpoints"))

          // Convert API entries into the format used by the UI.
          .map(([key, value]) => {
            const originalSegment = value.rootUrl?.split("/").pop();

            const normalizedSegment =
              originalSegment === "genomicVariations"
                ? "g_variants"
                : originalSegment;

            return {
              id: key,
              pathSegment: normalizedSegment,
              originalPathSegment: originalSegment,
            };
          })

          // Remove duplicated Entry Types.
          .filter((entry) => {
            if (seen.has(entry.pathSegment)) {
              return false;
            }

            seen.add(entry.pathSegment);
            return true;
          });

        const configuredOrder = config.ui.entryTypesOrder || [];
        const sortedEntries = prioritizeEntries(entries, configuredOrder);

        setEntryTypes(sortedEntries);

        // Select the first available Entry Type by default.
        if (sortedEntries.length > 0) {
          setSelectedPathSegment(sortedEntries[0].pathSegment);
        }

        await handleBeaconsInfo();
        setIsLoaded(true);
      } catch (error) {
        // Keep the existing behavior if Entry Types cannot be loaded.
      } finally {
        setLoading(false);
      }
    };

    fetchEntryTypes();
  }, []);

  /**
   * Load the Beacon configuration.
   */
  useEffect(() => {
    const fetchAll = async () => {
      await fetchConfiguration();
      setLoading(false);
    };

    fetchAll();
  }, []);

  /**
   * Update the active input when the selected Entry Type changes.
   *
   * Also mark the query as changed when the user selects a different
   * Entry Type after already running a search.
   */
  useEffect(() => {
    setActiveInput(selectedPathSegment === "g_variants" ? "genomic" : "filter");

    if (hasSearchResults && selectedPathSegment !== lastSearchedPathSegment) {
      setQueryDirty(true);
    }
  }, [
    selectedPathSegment,
    hasSearchResults,
    lastSearchedPathSegment,
    setActiveInput,
    setQueryDirty,
  ]);

  /**
   * Allow other components to open the Genomic Query Builder.
   */
  const openGenomicQueryBuilder = () => {
    setSelectedTool("genomicQueryBuilder");
    setOpen(true);
  };

  useEffect(() => {
    setOpenGenomicQueryBuilder(() => openGenomicQueryBuilder);
  }, [setOpenGenomicQueryBuilder]);

  /**
   * HERE
   * Entry Type information.
   */
  const entryTypeCount = entryTypes.length;
  const isSingleEntryType = entryTypeCount === 1;
  const hasEntryTypeSelector = entryTypeCount > 1;

  const onlyEntryPath = entryTypes[0]?.pathSegment;

  const singleEntryDescription = isSingleEntryType
    ? singleEntryTypeDescriptions[onlyEntryPath]
    : null;

  /**
   * Check whether Genomic Variants is available.
   */
  const hasGenomic = entryTypes.some(
    (entry) => entry.pathSegment === "g_variants"
  );

  /**
   * Multiple ontology Entry Types with no Genomic Variants available.
   */
  const isOntologyOnlyLayout = hasEntryTypeSelector && !hasGenomic;

  /**
   * Ontology-only with more than two Entry Types:
   * between 600px and 870px, use the stacked mobile-style layout.
   */
  const shouldStackOntologyLayout =
    isOntologyOnlyLayout && entryTypeCount > 2 && isIntermediateSearchLayout;

  /**
   * Single Entry Type layouts.
   */
  const isSingleNonGenomic = isSingleEntryType && !hasGenomic;

  const isSingleGenomic = isSingleEntryType && hasGenomic;

  /**
   * Decide how many Entry Types can remain in one column.
   *
   * Between 600px and 870px:
   * - 1 to 6 Entry Types use one column
   * - 7 or more Entry Types use two columns
   *
   * Outside that range:
   * - 1 to 4 Entry Types use one column
   * - 5 or more Entry Types use two columns
   */
  const maxEntryTypesInOneColumn = isIntermediateSearchLayout ? 8 : 4;

  const hasTwoColumns = entryTypeCount > maxEntryTypesInOneColumn;

  // HERE
  const hasOneEntryTypeColumn =
    hasEntryTypeSelector && !isOntologyOnlyLayout && !hasTwoColumns;

  /**
   * Existing mobile behavior for a single non-genomic Entry Type.
   *
   * Below 600px, All Filtering Terms moves below its input.
   */
  const moveAllFilteringTermsBelowInput =
    isSingleNonGenomic && isMobileSearchLayout;

  /**
   * Show the Genomic Query input whenever Genomic Variants exists.
   */
  const showGenomicSearch = hasGenomic;

  const primaryDarkColor = config.ui.colors.darkPrimary;

  /**
   * Open or close the All Filtering Terms section.
   */
  const handleAllFilteringClick = () => {
    setSelectedTool((previousTool) =>
      previousTool === "allFilteringTerms" ? null : "allFilteringTerms"
    );
  };

  /**
   * Open the Genomic Query Builder dialog.
   */
  const handleClickOpen = () => {
    setOpen(true);
  };

  /**
   * Close the Genomic Query Builder dialog.
   */
  const handleClose = () => {
    setOpen(false);
    setSelectedTool(null);
  };

  /**
   * Build the Genomic Query title.
   */
  const is0Based = config.queryCoordinatesAre0Based ?? true;

  const genomicCoordinateLabel = is0Based
    ? "Genomic Query (0-based)"
    : "Genomic Query (1-based)";

  const genomicQueryDescription = getGenomicQueryDescription();

  const genomicTooltipContent = getGenomicTooltipContent();

  /**
   * Shared Genomic Query and Filtering Terms sections.
   *
   * When the Result Type selector has one column, this container
   * uses flex to align the top and bottom inputs with the selector.
   */
  const searchInputsSection = (
    <Box
      sx={{
        flex: hasOneEntryTypeColumn ? 1 : "initial",

        display: hasOneEntryTypeColumn ? "flex" : "block",

        flexDirection: "column",

        /**
         * Put Genomic Query at the top and Filtering Terms at the bottom.
         * The remaining height becomes the dynamic space between them.
         */
        justifyContent: hasOneEntryTypeColumn ? "space-between" : "initial",
      }}
    >
      {showGenomicSearch && (
        <Box>
          <GenomicSearchSection
            hasEntryTypeSelector={hasEntryTypeSelector}
            hasOneEntryTypeColumn={hasOneEntryTypeColumn}
            setIsGenomicDescriptionMultiline={setIsGenomicDescriptionMultiline}
            isGenomicDescriptionMultiline={isGenomicDescriptionMultiline}
            genomicCoordinateLabel={genomicCoordinateLabel}
            genomicTooltipContent={genomicTooltipContent}
            genomicQueryDescription={genomicQueryDescription}
            activeInput={activeInput}
            setActiveInput={setActiveInput}
            genomicDraft={genomicDraft}
            setGenomicDraft={setGenomicDraft}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            assembly={assembly}
            setAssembly={setAssembly}
            primaryDarkColor={primaryDarkColor}
            message={message}
            setMessage={setMessage}
            genomicAction={
              <GenomicQueryBuilderButton
                onClick={() => {
                  setSelectedTool((previousTool) =>
                    previousTool === "genomicQueryBuilder"
                      ? null
                      : "genomicQueryBuilder"
                  );

                  handleClickOpen();
                }}
                selected={selectedTool === "genomicQueryBuilder"}
                selectedFilter={selectedFilter}
              />
            }
          />
        </Box>
      )}

      <Box>
        <FilteringTermsSection
          hasGenomicSectionAbove={showGenomicSearch}
          hasOneEntryTypeColumn={hasOneEntryTypeColumn}
          isGenomicDescriptionMultiline={isGenomicDescriptionMultiline}
          isOntologyOnlyLayout={isOntologyOnlyLayout}
          activeInput={activeInput}
          setActiveInput={setActiveInput}
          selectedPathSegment={selectedPathSegment}
          getFilteringPlaceholder={getFilteringPlaceholder}
          onAllFilteringClick={handleAllFilteringClick}
          filteringButtonRef={filteringButtonRef}
          hasEntryTypeSelector={hasEntryTypeSelector}
        />
      </Box>
    </Box>
  );

  const isEntryTypesLoading = loading || !isLoaded;

  return (
    <>
      <Box
        ref={searchRef}
        sx={{
          mb: {
            lg: 6,
            md: 6,
            sm: 2,
            xs: 2,
          },
          borderRadius: "10px",
          boxShadow: "0px 8px 11px 0px #9BA0AB24",
          p: "24px",
          backgroundColor: "#FFFFFF",

          /**
           * Temporary debugging colors.
           * Remove these when the responsive layout is complete.
           */
          backgroundColor: {
            lg: "lightsalmon",
            md: "pink",
            sm: "lightgreen",
            xs: "lightblue",
          },

          [SEARCH_MARGIN_QUERY]: {
            mb: 0,
          },
        }}
      >
        {/* Main Search title */}
        <Typography
          sx={{
            mb: singleEntryDescription ? 1 : 2,
            fontWeight: 700,
            fontFamily: '"Open Sans", sans-serif',
            fontSize: isSingleEntryType ? "18px" : "16px",
          }}
        >
          {isSingleEntryType
            ? `Search ${
                singleEntryCustomLabels[onlyEntryPath] ||
                formatEntryLabel(onlyEntryPath)
              }`
            : "Search"}
        </Typography>

        {/* Description shown for recognized single Entry Types */}
        {singleEntryDescription && (
          <Typography
            sx={{
              fontSize: "12px",
              mb: 2,
            }}
          >
            {singleEntryDescription}
          </Typography>
        )}

        {/*
         * Case 1:
         * One non-genomic Entry Type.
         */}
        {isSingleNonGenomic && (
          <Box>
            <FilteringTermsSection
              moveAllFilteringTermsBelowInput={moveAllFilteringTermsBelowInput}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
              selectedPathSegment={selectedPathSegment}
              getFilteringPlaceholder={getFilteringPlaceholder}
              onAllFilteringClick={handleAllFilteringClick}
              filteringButtonRef={filteringButtonRef}
            />
          </Box>
        )}

        {/*
         * Case 2:
         * Multiple Entry Types.
         *
         * From 600px upward:
         * Result Type stays on the left and the search inputs stay on the right.
         *
         * Below 600px:
         * Result Type, Genomic Query, and Filtering Terms stack vertically.
         */}
        {hasEntryTypeSelector && (
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: shouldStackOntologyLayout ? "column" : "row",
              },
              gap: {
                xs: 3,
                sm: 3,
              },
              alignItems: {
                xs: "stretch",
                sm: shouldStackOntologyLayout
                  ? "stretch"
                  : hasOneEntryTypeColumn
                  ? "stretch"
                  : "flex-start",
              },
              mb: 2,
            }}
          >
            <ResultTypeSection
              entryTypes={entryTypes}
              selectedPathSegment={selectedPathSegment}
              setSelectedPathSegment={setSelectedPathSegment}
              isSingleEntryType={isSingleEntryType}
              onlyEntryPath={onlyEntryPath}
              hasTwoColumns={hasTwoColumns}
              isIntermediateSearchLayout={isIntermediateSearchLayout}
              isOntologyOnlyLayout={isOntologyOnlyLayout}
              shouldStackOntologyLayout={shouldStackOntologyLayout}
              loading={isEntryTypesLoading}
            />

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                width: {
                  xs: "100%",
                  sm: shouldStackOntologyLayout ? "100%" : "auto",
                },
                display: "flex",
                flexDirection: "column",
              }}
            >
              {searchInputsSection}
            </Box>
          </Box>
        )}

        {/*
         * Case 3:
         * One genomic Entry Type.
         */}
        {isSingleGenomic && <Box>{searchInputsSection}</Box>}

        {/* Custom alphanumeric filter input */}
        {extraFilter && <FilterTermsExtra />}

        {/* Currently applied query filters */}
        {selectedPathSegment && <QueryApplied />}

        {/* Bottom actions */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            textAlign: "center",

            flexDirection: {
              xs: "column",
              sm: "row",
              md: "row",
            },

            justifyContent: {
              xs: "center",
              sm: "space-between",
              md: "space-between",
            },

            "@media (max-width:1008px) and (min-width:900px)": {
              flexDirection: "column",
            },

            "@media (max-width:653px)": {
              flexDirection: "column",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 4,

              "@media (max-width:1008px) and (min-width:900px)": {
                width: "100%",
                justifyContent: "center",
                gap: 8,
              },

              "@media (max-width:653px)": {
                width: "100%",
                justifyContent: "center",
                gap: 8,
              },

              "@media (max-width:433px)": {
                gap: 2,
              },
            }}
          >
            {hasGenomic && (
              <GenomicQueryBuilderDialog
                open={open}
                handleClose={handleClose}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                setActiveInput={setActiveInput}
              />
            )}
          </Box>

          <Box>
            <SearchButton
              setSelectedTool={setSelectedTool}
              entryTypesConfig={entryTypesConfig}
              selectedPathSegment={selectedPathSegment}
              selectedFilter={selectedFilter}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
