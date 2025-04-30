import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Tooltip,
  Button,
  CircularProgress,
  InputBase,
  Select,
  MenuItem,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import config from "../config/config.json";
import { darken, lighten } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import { useSelectedEntry } from "./context/SelectedEntryContext";
import GenomicQueryBuilderButton from "./GenomicQueryBuilderButton";
import AllFilteringTermsButton from "./AllFilteringTermsButton";
import FilteringTermsDropdownResults from "./FilteringTermsDropdownResults";

export default function Search({
  onHeightChange,
  selectedTool,
  setSelectedTool,
}) {
  const { entryTypes, setEntryTypes } = useSelectedEntry();
  const [loading, setLoading] = useState(true);
  const [activeInput, setActiveInput] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const { selectedPathSegment, setSelectedPathSegment } = useSelectedEntry();
  const [assembly, setAssembly] = useState(config.assemblyId[0]);

  const searchRef = useRef(null);

  useEffect(() => {
    if (searchRef.current && onHeightChange) {
      const height = searchRef.current.offsetHeight;
      onHeightChange(height);
    }
  }, []);

  const configuredOrder = config.ui.entryTypesOrder;

  const sortEntries = (entries) =>
    configuredOrder?.length > 0 && entries.length > 1
      ? [...entries].sort(
          (a, b) =>
            configuredOrder.indexOf(a.pathSegment) -
            configuredOrder.indexOf(b.pathSegment)
        )
      : entries;

  useEffect(() => {
    const fetchEntryTypes = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/map`);
        // const res = await fetch("/api.json");
        const data = await res.json();
        const endpointSets = data.response.endpointSets || {};

        const entries = Object.entries(endpointSets).map(([key, value]) => {
          const pathSegment = value.rootUrl?.split("/").pop();
          return { id: key, pathSegment };
        });

        const sorted = sortEntries(entries);
        setEntryTypes(sorted);

        if (sorted.length > 0) {
          setSelectedPathSegment(sorted[0].pathSegment);
        }
      } catch (err) {
        console.error("Error fetching entry types:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntryTypes();
  }, []);

  useEffect(() => {
    setActiveInput(selectedPathSegment === "g_variants" ? "genomic" : "filter");
  }, [selectedPathSegment]);

  const selectedEntry = entryTypes.find(
    (e) => e.pathSegment === selectedPathSegment
  );

  const isSingleEntryType = entryTypes.length === 1;
  const onlyEntryPath = entryTypes[0]?.pathSegment;
  const isSingleNonGenomic =
    isSingleEntryType && onlyEntryPath !== "g_variants";

  const singleEntryCustomLabels = {
    g_variants: "Genomic Variants",
    individuals: "Individual Level Data",
    biosamples: "Biosamples",
    runs: "Runs",
    analyses: "Analysis",
    cohorts: "Cohorts",
    datasets: "Datasets",
  };

  const hasGenomic = entryTypes.some((e) => e.pathSegment === "g_variants");

  const isGenomicFirstOrOnly =
    entryTypes.length === 1 ||
    entryTypes[0]?.pathSegment === "g_variants" ||
    selectedPathSegment === "g_variants";

  const formatEntryLabel = (segment) => {
    if (!segment) return "Unknown";
    return segment === "g_variants"
      ? "Genomic Variants"
      : segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const primaryColor = config.ui.colors.primary;
  const primaryDarkColor = config.ui.colors.darkPrimary;
  const selectedBgColor = lighten(primaryDarkColor, 0.9);

  const entryTypeDescriptions = {
    analyses: "Text for analysis",
    biosamples: "query biosample data (e.g. histological samples).",
    cohorts: "Text for cohort",
    datasets: "Text for dataset",
    g_variants: "query genomic variants across individuals.",
    individuals: "query individual-level data (e.g. phenotypes, ancestry).",
    runs: "Text for run",
  };

  const handleAllFilteringClick = () => {
    setSelectedTool((prev) =>
      prev === "allFilteringTerms" ? null : "allFilteringTerms"
    );
  };

  const renderInput = (type) => {
    if (type === "genomic") {
      return (
        <Box
          onClick={() => setActiveInput(type)}
          sx={{
            flex: activeInput === type ? 1 : 0.3,
            display: "flex",
            alignItems: "center",
            border: `1.5px solid ${primaryDarkColor}`,
            borderRadius: "999px",
            backgroundColor: "#fff",
            transition: "flex 0.3s ease",
          }}
        >
          {activeInput === "genomic" && (
            <Select
              value={assembly}
              onChange={(e) => setAssembly(e.target.value)}
              variant="standard"
              disableUnderline
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                backgroundColor: "black",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: '"Open Sans", sans-serif',
                pl: 3,
                pr: 2,
                py: 0,
                height: "100%",
                borderTopLeftRadius: "999px",
                borderBottomLeftRadius: "999px",
                ".MuiSelect-icon": {
                  color: "#fff",
                  mr: 1,
                },
              }}
            >
              {config.assemblyId.map((id) => (
                <MenuItem key={id} value={id} sx={{ fontSize: "12px" }}>
                  {id}
                </MenuItem>
              ))}
            </Select>
          )}

          <Box sx={{ px: 1, color: primaryDarkColor }}>
            <SearchIcon />
          </Box>

          <InputBase
            placeholder="Search by Genomic Query"
            fullWidth
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
              pr: 2,
            }}
          />
        </Box>
      );
    }

    return (
      // <Box>
      // <Box
      //   onClick={() => setActiveInput(type)}
      //   sx={{
      //     flex: activeInput === type ? 1 : 0.3,
      //     display: "flex",
      //     alignItems: "center",
      //     border: `1.5px solid ${primaryDarkColor}`,
      //     borderRadius: "999px",
      //     px: 2,
      //     py: 1,
      //     cursor: "text",
      //     backgroundColor: "#fff",
      //     transition: "flex 0.3s ease",
      //   }}
      // >
      //   <SearchIcon sx={{ color: primaryDarkColor, mr: 1 }} />
      //   <InputBase
      //     placeholder="Search by Filtering Terms"
      //     fullWidth
      //     value={searchInput}
      //     onChange={(e) => setSearchInput(e.target.value)}
      //     sx={{
      //       fontFamily: '"Open Sans", sans-serif',
      //       fontSize: "14px",
      //     }}
      //   />
      //   <FilteringTermsDropdownResults searchInput={searchInput} />
      // </Box>

      // </Box>

      <Box
        onClick={() => setActiveInput(type)}
        sx={{
          flex: activeInput === type ? 1 : 0.3,
          display: "flex",
          flexDirection: "column", // Important: allow dropdown to appear below
          alignItems: "stretch",
          border: `1.5px solid ${primaryDarkColor}`,
          borderRadius: "999px",
          backgroundColor: "#fff",
          transition: "flex 0.3s ease",
          position: "relative", // anchors dropdown here
          px: 2,
          py: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SearchIcon sx={{ color: primaryDarkColor, mr: 1 }} />
          <InputBase
            placeholder="Search by Filtering Terms"
            fullWidth
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
            }}
          />
        </Box>

        <FilteringTermsDropdownResults
          searchInput={searchInput}
          onCloseDropdown={() => setSearchInput("")}
        />
      </Box>
    );
  };

  return (
    <>
      <Box
        ref={searchRef}
        sx={{
          mazWidth: "1056px",
          mb: 6,
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
                  sx={{ pl: "20px", fontFamily: '"Open Sans", sans-serif' }}
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
                    backgroundColor: "#fff",
                    color: "#000",
                    border: "1px solid black",
                    minWidth: "400px",
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

        {loading ? (
          <CircularProgress />
        ) : !isSingleEntryType ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {entryTypes.map((entry) => (
              <Button
                key={entry.id}
                onClick={() => setSelectedPathSegment(entry.pathSegment)}
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

        <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 4 }}>
          {isSingleNonGenomic ? (
            <Typography
              variant="body1"
              sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: "14px" }}
            >
              Add the <b>Filtering Terms</b> you need for your search:
            </Typography>
          ) : (
            <Typography
              variant="body1"
              sx={{ fontFamily: '"Open Sans", sans-serif', fontSize: "14px" }}
            >
              {isSingleEntryType ? "" : "2. "}
              Use the search bar on the left to add{" "}
              <b>
                {isGenomicFirstOrOnly ? "Genomic query" : "Filtering terms"}
              </b>{" "}
              or the search bar on the right to add a{" "}
              <b>
                {isGenomicFirstOrOnly ? "Filtering terms" : "Genomic query"}:
              </b>
            </Typography>
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
            renderInput("filter")
          ) : isGenomicFirstOrOnly ? (
            hasGenomic && (
              <>
                {renderInput("genomic")}
                {renderInput("filter")}
              </>
            )
          ) : hasGenomic ? (
            <>
              {renderInput("filter")}
              {renderInput("genomic")}
            </>
          ) : (
            renderInput("filter")
          )}
        </Box>
        <Box sx={{ mt: 5, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {hasGenomic && (
            <GenomicQueryBuilderButton
              onClick={() =>
                setSelectedTool((prev) =>
                  prev === "genomicQueryBuilder" ? null : "genomicQueryBuilder"
                )
              }
              selected={selectedTool === "genomicQueryBuilder"}
            />
          )}
          <AllFilteringTermsButton
            onClick={handleAllFilteringClick}
            selected={selectedTool === "allFilteringTerms"}
          />
        </Box>
      </Box>
    </>
  );
}
