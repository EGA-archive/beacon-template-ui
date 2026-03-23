import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Tooltip,
  Button,
  CircularProgress,
} from "@mui/material";
import config from "../config/config.json";
import { darken, lighten } from "@mui/system";
import { useSelectedEntry } from "./context/SelectedEntryContext";
import GenomicQueryBuilderButton from "./genomic/GenomicQueryBuilderButton";
import GenomicQueryBuilderDialog from "./genomic/GenomicQueryBuilderDialog";
import AllFilteringTermsButton from "./filters/AllFilteringTermsButton";
import QueryApplied from "./search/QueryApplied";
import SearchButton from "./search/SearchButton";
import FilterTermsExtra from "./search/FilterTemsExtra";
import SearchFiltersInput from "../components/search/SearchFiltersInput";
import SearchGenomicInput from "../components/search/SearchGenomicInput";
import useAuthHeaders from "../hooks/useAuthHeaders";
import {
  formatEntryLabel,
  singleEntryCustomLabels,
  prioritizeEntries,
  entryTypeDescriptions,
  FilteringTermsInfoTooltip,
  SearchBarsInfoTooltip,
} from "../components/common/textFormatting";

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
        // const data = mockMapResonse;

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
  const isSingleNonGenomic =
    isSingleEntryType && onlyEntryPath !== "g_variants";

  const hasGenomic = entryTypes.some((e) => e.pathSegment === "g_variants");

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
            fontSize: entryTypes.length === 1 ? "16px" : "14px",
          }}
        >
          {isSingleEntryType
            ? `Search ${
                singleEntryCustomLabels[onlyEntryPath] ||
                formatEntryLabel(onlyEntryPath)
              }`
            : "Search"}
        </Typography>
        {!isSingleEntryType && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography
              variant="body1"
              sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: "14px" }}
            >
              1. Choose the <b>result type</b> for your search.
            </Typography>

            <Tooltip
              title={
                <Box
                  component="ul"
                  data-testid="entrytypes-tooltip-content"
                  sx={{
                    listStyleType: "disc",
                    pl: { xs: "5px", lg: "20px" },
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
              }
              placement="top-start"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    py: 1,
                    backgroundColor: "#fff",
                    color: "#000",
                    border: "1px solid black",
                    minWidth: {
                      xs: "361px",
                      sm: "400px",
                    },
                  },
                },
                arrow: {
                  sx: {
                    color: "#fff",
                    "&::before": { border: "1px solid black" },
                  },
                },
              }}
            >
              <Box
                component="span"
                data-testid="entrytypes-tooltip-trigger"
                sx={{
                  cursor: "pointer",
                  ml: 3,
                  mb: "4px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "30px",
                  backgroundColor: primaryColor,
                  color: "white",
                  textAlign: "center",
                  fontSize: "14px",
                }}
              >
                i
              </Box>
            </Tooltip>
          </Box>
        )}

        {loading || !isLoaded ? (
          <CircularProgress />
        ) : !isSingleEntryType ? (
          <Box
            data-testid="entrytype-buttons"
            sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}
          >
            {entryTypes.map((entry) => (
              <Button
                key={entry.id}
                data-testid={`entrytype-${entry.pathSegment}`}
                onClick={() => {
                  if (entry.pathSegment !== selectedPathSegment) {
                    setSelectedPathSegment(entry.pathSegment);
                  }
                }}
                variant="outlined"
                sx={{
                  borderRadius: "999px",
                  fontWeight: 700,
                  textTransform: "none",
                  fontFamily: '"Open Sans", sans-serif',
                  fontSize: "14px",
                  backgroundColor:
                    selectedPathSegment === entry.pathSegment
                      ? selectedBgColor
                      : "#FFFFFF",
                  color:
                    selectedPathSegment === entry.pathSegment
                      ? "black"
                      : primaryColor,
                  border: `1px solid ${
                    selectedPathSegment === entry.pathSegment
                      ? "black"
                      : primaryColor
                  }`,
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor:
                      selectedPathSegment === entry.pathSegment
                        ? selectedBgColor
                        : darken("#FFFFFF", 0.05),
                  },
                }}
              >
                {formatEntryLabel(entry.pathSegment)}
              </Button>
            ))}
          </Box>
        ) : null}
        {/* Here */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 4 }}>
          {isSingleNonGenomic ? (
            <>
              <Typography
                variant="body1"
                sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: "14px" }}
              >
                Add the <b>Filtering Terms</b> you need for your search.
              </Typography>

              {FilteringTermsInfoTooltip}
            </>
          ) : (
            <>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Open Sans", sans-serif',
                  fontSize: "14px",
                }}
              >
                {isSingleEntryType ? "" : "2. "}
                Use the following search bars to narrow down your search using{" "}
                <b>
                  {isFirstEntryGenomic ? "Genomic Query" : "Filtering Terms"}
                </b>{" "}
                and/or{" "}
                <b>
                  {isFirstEntryGenomic ? "Filtering Terms" : "Genomic Query"}
                </b>
                .
              </Typography>
              {SearchBarsInfoTooltip}
            </>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          {isSingleNonGenomic ? (
            <SearchFiltersInput
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />
          ) : hasGenomic ? (
            isFirstEntryGenomic ? (
              <>
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

                <SearchFiltersInput
                  activeInput={activeInput}
                  setActiveInput={setActiveInput}
                />
              </>
            ) : (
              <>
                <SearchFiltersInput
                  activeInput={activeInput}
                  setActiveInput={setActiveInput}
                />

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
              </>
            )
          ) : (
            <SearchFiltersInput
              activeInput={activeInput}
              setActiveInput={setActiveInput}
            />
          )}
        </Box>
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
                />
              </>
            )}
            {/* <AllFilteringTermsButton
              onClick={handleAllFilteringClick}
              selected={selectedTool === "allFilteringTerms"}
            /> */}
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
