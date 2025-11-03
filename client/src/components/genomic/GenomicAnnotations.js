import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CommonMessage, {
  COMMON_MESSAGES,
} from "../../components/common/CommonMessage";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";
import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";
import { queryBuilder } from "../search/utils/queryBuilder";
import { filterLabels } from "../genomic/utils/GenomicFilterLabels";

// This component of predefined genomic example queries inside collapsible sections
// We can look at it as quick access menu
export default function GenomicAnnotations() {
  const [message, setMessage] = useState(null);

  // Extract from context the functions that update the app's global state
  const {
    setSelectedFilter,
    setLoadingData,
    setHasSearchResult,
    setResultData,
    selectedPathSegment,
    setQueryDirty,
  } = useSelectedEntry();

  // The full list of possible annotation categorie
  const allGenomicCategories = [
    "SNP Examples",
    "Genomic Variant Examples",
    "Protein Examples",
    "Molecular Effect",
  ];

  // Read from the config file which categories should actually be visible in the UI
  // This allows hiding entire sections via configuration, without editing the code
  const genomicVisibleCategories =
    config.ui.genomicAnnotations?.visibleGenomicCategories || [];

  // From the full list, keep only those that are marked as visible in the config
  const filterCategories = allGenomicCategories.filter((cat) =>
    genomicVisibleCategories.includes(cat)
  );

  // When the component first loads:
  // - Automatically open the first section that actually has content
  // - Keep all others closed
  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    let first = false;
    allGenomicCategories.forEach((t) => {
      const valid = filterLabels[t]?.filter((l) => l.label?.trim()) || [];
      if (valid.length && !first) {
        initial[t] = true;
        first = true;
      } else initial[t] = false;
    });
    return initial;
  });

  // Function that runs when a user clicks to open or close a section
  // It updates the "expanded" state to show only one accordion open at a time
  const handleChange = (panel) => (_, isExpanded) =>
    setExpanded({ [panel]: isExpanded });

  // Styling for the accordion headers to make it fit to the UI
  const summarySx = {
    px: 0,
    "& .MuiAccordionSummary-expandIconWrapper": {
      marginLeft: "auto",
      transition: "transform 0.2s ease-in-out",
    },
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)",
    },
    "& .MuiAccordionSummary-content": { mr: 1 },
  };

  // Main interaction handler of the component, it is called everytime a chip is clicked
  // Item is an object that represents that clicked chip
  const handleGenomicFilterChange = (item) => {
    // Take the label or id of the clicked chip and remove accidental extra spaces
    const value = (item.label || item.id)?.trim();

    // Check whether the item has "queryParams" or not
    // If it doesn’t, we assume this is a filtering term  ("Missense Variant") instead of a genomic query
    const isFilterTerm =
      !item.queryParams || Object.keys(item.queryParams).length === 0;

    //  Case 1. Filteting Term (This is a case specific example for the Molecual Effects)
    if (isFilterTerm) {
      // Update the global filter list stored in context
      // First, check if this filter already exists — if it does, show an error message and skip adding it
      setSelectedFilter((prev = []) => {
        const isDuplicate = prev.some((f) => f.id === item.id);
        if (isDuplicate) {
          setMessage(COMMON_MESSAGES.doubleValue);
          setTimeout(() => setMessage(null), 3000);
          return prev;
        }

        // After the check passes, then the filter gets added to the list
        return [
          ...prev,
          {
            key: item.key,
            id: item.id,
            label: value,
            value,
            type: "filter",
          },
        ];
      });

      // Automatically send a query to the Beacon API using only this filter
      // triggerGenomicQuery([
      //   {
      //     id: item.id,
      //     label: value,
      //     type: "filter",
      //   },
      // ]);
      setQueryDirty(true);
      return;
    }

    // Case 2. All the others Genomic Queries
    // Add the selected genomic filter to the context
    setSelectedFilter((prev = []) => {
      // Check if the exact same genomic filter already exists. If yes, we won't add it
      const isDuplicate = prev.some(
        (f) => f.type === "genomic" && f.id === item.field && f.label === value
      );
      if (isDuplicate) {
        setMessage(COMMON_MESSAGES.doubleValue);
        setTimeout(() => setMessage(null), 3000);
        return prev;
      }

      // Check if there’s already another genomic query active
      // The app only allows one genomic query at a time
      const alreadyHasGenomic = prev.some((f) => f.type === "genomic");
      if (alreadyHasGenomic) {
        setMessage(COMMON_MESSAGES.singleGenomicQuery);
        setTimeout(() => setMessage(null), 3000);
        return prev;
      }

      // If it’s not a duplicate and no other genomic query exists, add the genomic query finally
      return [
        ...prev,
        {
          key: item.key,
          id: item.field || "geneId",
          label: value,
          value,
          type: "genomic",
          bgColor: "genomic",
          queryParams: item.queryParams || {},
        },
      ];
    });

    // Wait to ansure the state id updated
    // Then send the Beacon API query with this genomic filter
    // This tells the Beacon to search variants that match this query
    // setTimeout(() => {
    //   triggerGenomicQuery([
    //     {
    //       key: item.key,
    //       id: item.field || "geneId",
    //       label: value,
    //       value,
    //       type: "genomic",
    //       bgColor: "genomic",
    //       queryParams: item.queryParams || {},
    //     },
    //   ]);
    // }, 150);
    setQueryDirty(true);
  };

  //  This helper function builds the actual Beacon request payload using
  //  the `queryBuilder()` utility and sends it to the backend
  //  It handles both genomic queries and filter-based queries
  const triggerGenomicQuery = async (filters) => {
    // Check if the list of filters contains at least one genomic query
    const genomic = filters.find((f) => f.type === "genomic");

    // Check if there are any filter-type terms, in this case Molecular Effects
    const hasFilterTerms = filters.some((f) => f.type === "filter");

    // If nothing is found, we do not query anything
    if (!genomic && !hasFilterTerms) {
      return;
    }

    try {
      setLoadingData(true);
      setHasSearchResult(false);
      setResultData([]);

      // Use the utility function to construct the Beacon query payload
      const builtQuery = queryBuilder(filters);
      console.log("[GenomicAnnotations] Built query ➜", builtQuery);

      // Make a POST request to the Beacon API endpoint
      // `${selectedPathSegment}` is the current entry
      const response = await fetch(`${config.apiUrl}/${selectedPathSegment}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(builtQuery),
      });

      // Parse the Beacon response
      const data = await response.json();

      if (data && Object.keys(data).length > 0) {
        setResultData(data);
        setHasSearchResult(true);
      }
    } catch (err) {
      console.warn("[GenomicAnnotations] Query request failed:", err);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <Box>
      {/* If there's an error show it above the filters */}
      {message && (
        <Box sx={{ mt: 2 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}

      {/* Loop through each visible category and render the content */}
      {filterCategories.map((topic) => {
        const valid = filterLabels[topic]?.filter((l) => l.label?.trim());
        if (!valid?.length) return null;

        return (
          <Accordion
            key={topic}
            expanded={!!expanded[topic]} // Open/close status
            onChange={handleChange(topic)} // Clicking toggles the accordion
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: "transparent",
              boxShadow: "none",
              "&::before": { display: "none" },
            }}
          >
            {/* Accordion Header */}
            <AccordionSummary
              expandIcon={<KeyboardArrowRightIcon />}
              sx={summarySx}
            >
              <Typography
                translate="no"
                sx={{ fontStyle: "italic", fontSize: "14px" }}
              >
                {topic}
              </Typography>
            </AccordionSummary>

            {/* Accordion Body */}
            <AccordionDetails sx={{ px: 0, pt: 0, mb: 3 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {/* For each label, render a clickable chip */}
                {valid.map((item) => (
                  <FilterLabelRemovable
                    variant="simple"
                    key={item.label}
                    label={item.label}
                    // When clicked, call the main handler with this item’s data
                    onClick={() =>
                      handleGenomicFilterChange({ ...item, bgColor: "genomic" })
                    }
                    bgColor="genomic"
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
