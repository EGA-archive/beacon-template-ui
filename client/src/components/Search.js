import { useEffect, useRef, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import config from "../config/config.json";
import { useSelectedEntry } from "./context/SelectedEntryContext";
import GenomicQueryBuilderButton from "./genomic/GenomicQueryBuilderButton";
import GenomicQueryBuilderDialog from "./genomic/GenomicQueryBuilderDialog";
import AllFilteringTermsButton from "./filters/AllFilteringTermsButton";
import QueryApplied from "./search/QueryApplied";
import SearchButton from "./search/SearchButton";
import FilterTermsExtra from "./search/FilterTemsExtra";
import GenomicSearchSection from "./search/utils/GenomicSearchSection";
import useAuthHeaders from "../hooks/useAuthHeaders";
import FILTERING_PLACEHOLDERS from "./search/utils/filteringPlaceholders";
import getGenomicQueryDescription from "./search/utils/getGenomicQueryDescription";
import { getGenomicTooltipContent } from "./search/utils/genomicTooltipContent";
import ResultTypeSection from "./search/utils/ResultTypeSection";
import {
  formatEntryLabel,
  singleEntryCustomLabels,
  prioritizeEntries,
} from "../components/common/textFormatting";
import mockEntryTypes from "./search/mockEntryTypes.json";
import FilteringTermsSection from "./search/utils/FilteringTermsSection";

export default function Search({
  activeInput,
  setActiveInput,
  onHeightChange,
  selectedTool,
  setSelectedTool,
}) {
  const {
    // entry types + config
    entryTypes,
    setEntryTypes,
    entryTypesConfig,
    setEntryTypesConfig,

    // filters
    selectedFilter,
    setSelectedFilter,
    extraFilter,

    // where results go
    setBeaconsInfo,

    // selected tab
    selectedPathSegment,
    setSelectedPathSegment,

    // the text staged for the left genomic input
    genomicDraft,
    setGenomicDraft,
    hasSearchResults,
    setQueryDirty,
    lastSearchedPathSegment,
    isLoaded,
    setIsLoaded,
    filteringButtonRef,
    setOpenGenomicQueryBuilder,
  } = useSelectedEntry();

  const [loading, setLoading] = useState(true);
  const [assembly, setAssembly] = useState(config.assemblyId[0]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Get authentication headers (includes Bearer token if user is logged in)
  const authHeaders = useAuthHeaders();

  useEffect(() => {
    if (activeInput === "genomic" && inputRef.current) {
      inputRef.current.focus();
      setActiveInput(null);
    }
  }, [activeInput, setActiveInput]);

  useEffect(() => {
    if (searchRef.current && onHeightChange) {
      const observer = new ResizeObserver(() => {
        onHeightChange(searchRef.current.offsetHeight);
      });
      observer.observe(searchRef.current);

      return () => observer.disconnect();
    }
  }, [onHeightChange]);

  useEffect(() => {
    const fetchEntryTypes = async () => {
      try {
        await handleBeaconsInfo();
        const res = await fetch(`${config.apiUrl}/map`, {
          headers: authHeaders,
        });
        const data = await res.json();
        // const data = mockEntryTypes;

        const endpointSets = data.response.endpointSets || {};
        const seen = new Set();

        setIsLoaded(false);

        const entries = Object.entries(endpointSets)

          .filter(([key]) => !key.includes("Endpoints"))
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

          .filter((entry) => {
            if (seen.has(entry.pathSegment)) return false;
            seen.add(entry.pathSegment);
            return true;
          });

        const configuredOrder = config.ui.entryTypesOrder || [];

        const sorted = prioritizeEntries(entries, configuredOrder);
        setEntryTypes(sorted);

        if (sorted.length > 0) {
          setSelectedPathSegment(sorted[0].pathSegment);
        }

        await handleBeaconsInfo();

        setIsLoaded(true);
      } catch (err) {
        console.error("Error fetching entry types:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntryTypes();
  }, []);

  const fetchConfiguration = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/configuration`, {
        headers: authHeaders,
      });
      const data = await res.json();
      setEntryTypesConfig({
        entryTypes: data.response?.entryTypes || data.entryTypes || {},
        maturityAttributes: data.response?.maturityAttributes || {},
      });
    } catch (err) {
      console.error("Error fetching configuration:", err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await fetchConfiguration();
      setLoading(false);
    };

    fetchAll();
  }, []);

  const handleBeaconsInfo = async () => {
    try {
      let url = `${config.apiUrl}/info`;
      let response = await fetch(url, { headers: authHeaders });
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
      // TODO
      console.error("Search failed", error);
    }
  };

  useEffect(() => {
    setActiveInput(selectedPathSegment === "g_variants" ? "genomic" : "filter");
    if (hasSearchResults && selectedPathSegment !== lastSearchedPathSegment) {
      setQueryDirty(true);
    }
  }, [selectedPathSegment, hasSearchResults, setActiveInput, setQueryDirty]);

  const isSingleEntryType = entryTypes.length === 1;
  const onlyEntryPath = entryTypes[0]?.pathSegment;

  const hasGenomic = entryTypes.some((e) => e.pathSegment === "g_variants");

  // CASE A
  const isSingleNonGenomic = isSingleEntryType && !hasGenomic;

  // CASE C
  const isSingleGenomic = isSingleEntryType && hasGenomic;

  // CASE B
  const isMultiNonGenomic = !isSingleEntryType && !hasGenomic;

  // CASE D
  const isMultiGenomic = !isSingleEntryType && hasGenomic;

  const showGenomicSearch = hasGenomic;

  const primaryDarkColor = config.ui.colors.darkPrimary;

  const handleAllFilteringClick = () => {
    setSelectedTool((prev) =>
      prev === "allFilteringTerms" ? null : "allFilteringTerms"
    );
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTool(null);
  };

  const openGenomicQueryBuilder = () => {
    setSelectedTool("genomicQueryBuilder");
    setOpen(true);
  };

  useEffect(() => {
    setOpenGenomicQueryBuilder(() => openGenomicQueryBuilder);
  }, [setOpenGenomicQueryBuilder]);

  const is0Based = config.queryCoordinatesAre0Based ?? true;

  const genomicCoordinateLabel = is0Based
    ? "Genomic Query (0-based)"
    : "Genomic Query (1-based)";

  const getFilteringPlaceholder = (pathSegment) =>
    FILTERING_PLACEHOLDERS[pathSegment] || "Search by Filtering Terms.";

  const genomicQueryDescription = getGenomicQueryDescription();
  const genomicTooltipContent = getGenomicTooltipContent();

  const hasTwoColumns = entryTypes.length > 4;

  const searchInputsSection = (
    <>
      {showGenomicSearch && (
        <GenomicSearchSection
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
        />
      )}

      <FilteringTermsSection
        activeInput={activeInput}
        setActiveInput={setActiveInput}
        selectedPathSegment={selectedPathSegment}
        getFilteringPlaceholder={getFilteringPlaceholder}
      />
    </>
  );

  return (
    <>
      <Box
        ref={searchRef}
        sx={{
          mb: { lg: 6, md: 6, sm: 2, xs: 3 },
          borderRadius: "10px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 8px 11px 0px #9BA0AB24",
          p: "24px 32px",
        }}
      >
        <Typography
          sx={{
            mb: 2,
            fontWeight: 700,
            fontFamily: '"Open Sans", sans-serif',
            fontSize: entryTypes.length === 1 ? "18px" : "16px",
          }}
        >
          {isSingleEntryType
            ? `Search ${
                singleEntryCustomLabels[onlyEntryPath] ||
                formatEntryLabel(onlyEntryPath)
              }`
            : "Search"}
        </Typography>
        {isSingleNonGenomic && (
          <Box sx={{ mt: 2 }}>
            <FilteringTermsSection
              activeInput={activeInput}
              setActiveInput={setActiveInput}
              selectedPathSegment={selectedPathSegment}
              getFilteringPlaceholder={getFilteringPlaceholder}
            />
          </Box>
        )}
        {!isSingleEntryType && (
          <Box
            sx={{
              display: "flex",
              gap: hasTwoColumns ? 5 : 2,
              alignItems: "flex-start",
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
            />
            <Box
              sx={{
                flex: 1,
                height: "100%",
                // backgroundColor: "palevioletred",
              }}
            >
              {searchInputsSection}
            </Box>
          </Box>
        )}
        {isSingleGenomic && <Box sx={{ mt: 2 }}>{searchInputsSection}</Box>}
        {extraFilter && <FilterTermsExtra />}
        {selectedFilter.length > 0 && <QueryApplied />}
        <Box
          sx={{
            mt: 5,
            mb: 2,
            gap: 2,
            flexWrap: "wrap",
            display: "flex",
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
            alignItems: "center",
            textAlign: "center",
            "@media (max-width: 1008px) and (min-width: 900px)": {
              flexDirection: "column",
            },
            "@media (max-width: 653px)": {
              flexDirection: "column",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 4,
              "@media (max-width: 1008px) and (min-width: 900px)": {
                width: "100%",
                justifyContent: "center",

                gap: 8,
              },
              "@media (max-width: 653px)": {
                width: "100%",
                justifyContent: "center",
                gap: 8,
              },
              "@media (max-width: 433px)": {
                gap: 2,
              },
            }}
          >
            {hasGenomic && (
              <>
                <GenomicQueryBuilderButton
                  onClick={() => {
                    setSelectedTool((prev) =>
                      prev === "genomicQueryBuilder"
                        ? null
                        : "genomicQueryBuilder"
                    );
                    handleClickOpen();
                  }}
                  selected={selectedTool === "genomicQueryBuilder"}
                  selectedFilter={selectedFilter}
                />
                <GenomicQueryBuilderDialog
                  open={open}
                  handleClose={handleClose}
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                  setActiveInput={setActiveInput}
                />
              </>
            )}
            <Box ref={filteringButtonRef}>
              <AllFilteringTermsButton
                onClick={handleAllFilteringClick}
                selected={selectedTool === "allFilteringTerms"}
              />
            </Box>
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
