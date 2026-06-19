import { useEffect, useRef, useState } from "react";
import { Box, Typography, Tooltip, CircularProgress } from "@mui/material";
import config from "../config/config.json";
import { lighten } from "@mui/system";
import { useSelectedEntry } from "./context/SelectedEntryContext";
import GenomicQueryBuilderButton from "./genomic/GenomicQueryBuilderButton";
import GenomicQueryBuilderDialog from "./genomic/GenomicQueryBuilderDialog";
import AllFilteringTermsButton from "./filters/AllFilteringTermsButton";
import QueryApplied from "./search/QueryApplied";
import SearchButton from "./search/SearchButton";
import FilterTermsExtra from "./search/FilterTemsExtra";
import SearchFiltersInput from "../components/search/SearchFiltersInput";
import SearchGenomicInput from "../components/search/SearchGenomicInput";
import EntryTypeSelector from "./search/EntryTypeSelector";
import useAuthHeaders from "../hooks/useAuthHeaders";
import InfoTooltip from "./search/utils/InfoTooltip";
import { getGenomicTooltipContent } from "./search/utils/genomicTooltipContent";
import {
  formatEntryLabel,
  singleEntryCustomLabels,
  prioritizeEntries,
  entryTypeDescriptions,
  FilteringTermsInfoTooltip,
  SearchBarsInfoTooltip,
} from "../components/common/textFormatting";
import mockEntryTypes from "./search/mockEntryTypes.json";

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

  const FILTERING_PLACEHOLDERS = {
    individuals:
      "Search by Filtering Terms. Examples: sex, diseases, treatment.",

    biosamples:
      "Search by sample origin, sample processing, diagnostic markers, etc.",

    runs: "Search by library strategy, platform, run date, etc.",

    analyses: "Search by variant caller, pipeline reference, aligner, etc.",

    cohorts: "Search by Filtering Terms. Examples: sex, diseases, treatment.",

    datasets: "Search by Filtering Terms. Examples: sex, diseases, treatment.",

    g_variants:
      "Search by Filtering Terms. Examples: sex, diseases, treatment.",
  };

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
        // const data = await res.json();
        const data = mockEntryTypes;

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
  // const isSingleNonGenomic =
  //   isSingleEntryType && onlyEntryPath !== "g_variants";

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

  const isGenomicFirstOrOnly =
    entryTypes.length === 1 ||
    entryTypes[0]?.pathSegment === "g_variants" ||
    selectedPathSegment === "g_variants";

  const isFirstEntryGenomic = entryTypes[0]?.pathSegment === "g_variants";

  const primaryColor = config.ui.colors.primary;
  const primaryDarkColor = config.ui.colors.darkPrimary;
  const selectedBgColor = lighten(primaryDarkColor, 0.9);

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

  const getGenomicQueryDescription = () => {
    // Available genomic query types configured by the deployer
    const queryTypes = config.ui.genomicQueries?.genomicQueryTypes || {};
    const description = [];
    // Sequence Query enables direct SNV/INDEL searches
    if (queryTypes.sequenceQuery) {
      description.push("Search by SNV or INDEL.");
    }
    // Query types available through the Genomic Query Builder
    const rangeBracket = [];
    if (queryTypes.rangeQuery) rangeBracket.push("Range");
    if (queryTypes.bracketQuery) rangeBracket.push("Bracket");
    const annotations = [];
    if (queryTypes.geneId) annotations.push("Gene");
    if (queryTypes.hgvsQuery) annotations.push("HGVS annotation");
    if (rangeBracket.length || annotations.length) {
      let text = "Use Genomic Query Builder to ";
      if (rangeBracket.length) {
        text += `do ${rangeBracket.join("/")} quer${
          rangeBracket.length > 1 ? "ies" : "y"
        }`;
      }
      if (annotations.length) {
        if (rangeBracket.length) {
          text += ` or search by ${annotations.join(" or ")}`;
        } else {
          text += `search by ${annotations.join(" or ")}`;
        }
      }
      text += ".";
      description.push(text);
    }
    return description.join(" ");
  };

  const genomicQueryDescription = getGenomicQueryDescription();
  const genomicTooltipContent = getGenomicTooltipContent();

  const filteringTermsSection = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 3,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "14px",
            fontFamily: '"Open Sans", sans-serif',
          }}
        >
          Filtering Terms
        </Typography>
        <InfoTooltip testId="filtering-terms-tooltip">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "12px",
              fontFamily: '"Open Sans", sans-serif',
            }}
          >
            Filtering Terms
          </Typography>

          <Box
            component="ul"
            data-testid="filtering-terms-tooltip-content"
            sx={{
              listStyleType: "disc",
              pl: "20px",
              fontFamily: '"Open Sans", sans-serif',
            }}
          >
            <li>
              Use filtering terms to narrow down your search results (e.g.
              diseases, sex, age, or clinical characteristics).
            </li>

            <li>
              Filtering terms are provided by data owners and reflect the
              information available in their datasets.
            </li>

            <li>
              Filtering terms are{" "}
              <strong>independent of the Result Type</strong> (e.g. Individuals,
              Biosamples, etc.) selected.
            </li>
          </Box>
        </InfoTooltip>
      </Box>
      <Typography
        sx={{
          fontSize: "12px",
          mt: 0.5,
          mb: 2,
        }}
      >
        Filtering options available for this dataset.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <SearchFiltersInput
          activeInput={activeInput}
          setActiveInput={setActiveInput}
          placeholder={getFilteringPlaceholder(selectedPathSegment)}
        />
      </Box>
    </>
  );

  const genomicSearchSection = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "14px",
            fontFamily: '"Open Sans", sans-serif',
          }}
        >
          {genomicCoordinateLabel}
        </Typography>

        <InfoTooltip testId="genomic-query-tooltip">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "12px",
              fontFamily: '"Open Sans", sans-serif',
            }}
          >
            Genomic Query
          </Typography>

          <Box
            component="ul"
            data-testid="genomic-query-tooltip-content"
            sx={{
              listStyleType: "disc",
              pl: "20px",
              fontFamily: '"Open Sans", sans-serif',
            }}
          >
            {genomicTooltipContent.sequenceQuery && (
              <li>
                Search for a specific single nucleotide variant or INDEL.{" "}
                <strong>(Chr - Position - Ref. bases - Alt. bases)</strong>{" "}
                using the Search Bar.
              </li>
            )}

            {(genomicTooltipContent.rangeQuery ||
              genomicTooltipContent.bracketQuery ||
              genomicTooltipContent.geneId ||
              genomicTooltipContent.hgvsQuery) && (
              <li>
                Use the Genomic Query Builder to search by:{" "}
                {[
                  genomicTooltipContent.geneId && (
                    <strong key="gene">Gene ID</strong>
                  ),
                  genomicTooltipContent.rangeQuery && (
                    <strong key="range">Genomic region (Range Query)</strong>
                  ),
                  genomicTooltipContent.bracketQuery && (
                    <strong key="bracket">Bracket Query</strong>
                  ),
                  genomicTooltipContent.hgvsQuery && (
                    <strong key="hgvs">HGVS expression</strong>
                  ),
                ]
                  .filter(Boolean)
                  .reduce((acc, item, index, array) => {
                    if (index === 0) return [item];

                    if (index === array.length - 1) {
                      return [...acc, " or ", item];
                    }

                    return [...acc, ", ", item];
                  }, [])}
                .
              </li>
            )}

            <li>Only one genomic query is accepted per search.</li>
          </Box>
        </InfoTooltip>
      </Box>

      <Typography
        sx={{
          fontSize: "12px",
          mt: 0.5,
        }}
      >
        {genomicQueryDescription}
      </Typography>

      <Box sx={{ mt: 2 }}>
        <SearchGenomicInput
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
      </Box>
    </>
  );

  console.log({
    isSingleNonGenomic,
    isSingleGenomic,
    isMultiNonGenomic,
    isMultiGenomic,
  });

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
          <Box sx={{ mt: 2 }}>{filteringTermsSection}</Box>
        )}
        {!isSingleEntryType && (
          <Box
            sx={{
              display: "flex",
              gap: 3,
              alignItems: "flex-start",
              mb: 2,
              backgroundColor: "blueviolet",
            }}
          >
            <Box
              sx={{
                width: "260px",
                flexShrink: 0,
                backgroundColor: "pink",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                {/* Accounts for a title change when there is only one entry type */}
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontFamily: '"Open Sans", sans-serif',
                    fontSize: entryTypes.length === 1 ? "16px" : "14px",
                  }}
                >
                  {isSingleEntryType
                    ? `Result Type: ${
                        singleEntryCustomLabels[onlyEntryPath] ||
                        formatEntryLabel(onlyEntryPath)
                      }`
                    : "Result Type"}
                </Typography>
                <InfoTooltip testId="entrytypes-tooltip-trigger">
                  <Box
                    component="ul"
                    data-testid="entrytypes-tooltip-content"
                    sx={{
                      listStyleType: "disc",
                      pl: "20px",
                      fontFamily: '"Open Sans", sans-serif',
                    }}
                  >
                    {entryTypes.map((entry) => (
                      <li key={entry.pathSegment}>
                        <b>{formatEntryLabel(entry.pathSegment)}</b>:{" "}
                        {entryTypeDescriptions[entry.pathSegment] ||
                          `No description for ${entry.pathSegment}`}
                      </li>
                    ))}
                  </Box>
                </InfoTooltip>
              </Box>
              {!isSingleEntryType && (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: '"Open Sans", sans-serif',
                      fontSize: "14px",
                    }}
                  >
                    Which information do you want to get?
                  </Typography>
                </Box>
              )}
              {!isSingleEntryType && (
                <Box
                  sx={{
                    width: "260px",
                    flexShrink: 0,
                  }}
                >
                  <EntryTypeSelector
                    entryTypes={entryTypes}
                    selectedPathSegment={selectedPathSegment}
                    setSelectedPathSegment={setSelectedPathSegment}
                  />
                </Box>
              )}
            </Box>
            <Box
              sx={{
                flex: 1,
                backgroundColor: "lightblue",
              }}
            >
              {showGenomicSearch && genomicSearchSection}
              {filteringTermsSection}
            </Box>
          </Box>
        )}
        {isSingleGenomic && (
          <Box sx={{ mt: 2 }}>
            {genomicSearchSection}
            {filteringTermsSection}
          </Box>
        )}
        {extraFilter && <FilterTermsExtra />}
        {selectedFilter.length > 0 && <QueryApplied />}
        <Box
          sx={{
            backgroundColor: "green",
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
