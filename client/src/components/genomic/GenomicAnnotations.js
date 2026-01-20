import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState, useMemo } from "react";

import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import CommonMessage, {
  COMMON_MESSAGES,
} from "../../components/common/CommonMessage";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";
import { filterLabels } from "../genomic/utils/GenomicFilterLabels";

/**
 * GenomicAnnotations
 * Renders predefined genomic example queries inside collapsible sections.
 * Includes dynamic Molecular Effect examples taken from /filtering_terms.
 */
export default function GenomicAnnotations() {
  const [message, setMessage] = useState(null);

  const {
    setSelectedFilter,
    setQueryDirty,
    hasSearchResults,
    molecularEffects,
    setExtraFilter,
    openGenomicQueryBuilder,
    setGenomicPrefill,
  } = useSelectedEntry();

  // Only molecular effects with these IDs are allowed to appear in the UI
  const ALLOWED_IDS = [
    "ENSGLOSSARY:0000150",
    "ENSGLOSSARY:0000161",
    "SO:0001631",
    "SO:0001623",
    "SO:0001819",
    "SO:0001632",
    "SO:0001792",
    "SO:0001988",
    "SO:0001630",
    "SO:0000605",
    "SO:0001575",
    "SO:0001624",
    "SO:0001574",
    "SO:0001567",
    "SO:0001580",
  ];

  // Filter molecular effects coming from the backend to keep only items in the allowed list
  const filteredBackendEffects = useMemo(
    () => molecularEffects.filter((t) => ALLOWED_IDS.includes(t.id)),
    [molecularEffects]
  );

  /**
   * STEP 2:
   * Build the list of molecular effect items to display
   * Rules:
   * - Use backend versions of predefined labels when available
   * - Always show at least two items if backend contains enough
   */
  const molecularEffectsToRender = useMemo(() => {
    const predefined = filterLabels["Molecular Effect"] || [];
    const predefinedIds = predefined.map((p) => p.id);

    // Try to match predefined molecular effect IDs with backend results
    const matches = predefinedIds
      .map((id) => filteredBackendEffects.find((t) => t.id === id))
      .filter(Boolean);

    if (matches.length > 0) {
      const result = [...matches];

      // If fewer than 2, fill from backend
      if (result.length < 2) {
        const remaining = filteredBackendEffects.filter(
          (b) => !predefinedIds.includes(b.id)
        );
        return [...result, ...remaining.slice(0, 2 - result.length)];
      }
      return result;
    }

    // If predefined items are missing, fallback to first 2 backend molecular effects
    return filteredBackendEffects.slice(0, 2);
  }, [filteredBackendEffects]);

  // All possible genomic annotation categories available in the UI
  const allCategories = [
    "SNP Examples",
    "Genomic Variant Examples",
    "Protein Examples",
    "Molecular Effect",
  ];

  // Categories that the deployer chose to show in the UI (defined in config.json)
  const visibleFromConfig =
    config.ui.genomicAnnotations?.visibleGenomicCategories || [];

  // Filter categories based on deployer configuration and backend availability
  const categoriesToRender = allCategories.filter((cat) => {
    if (cat === "Molecular Effect" && filteredBackendEffects.length === 0)
      return false;
    return visibleFromConfig.includes(cat);
  });

  // Tracks which accordion category is open
  // The first valid one opens by default
  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    let opened = false;

    allCategories.forEach((cat) => {
      const labels = filterLabels[cat]?.filter((l) => l.label?.trim()) || [];
      if (!opened && labels.length > 0) {
        initial[cat] = true;
        opened = true;
      } else {
        initial[cat] = false;
      }
    });
    return initial;
  });

  // Handles accordion expand/collapse state by replacing the whole state with one open panel
  const handleAccordion = (cat) => (_, isExpanded) =>
    setExpanded({ [cat]: isExpanded });

  // Main click handler for selecting molecular effects or genomic example filters
  // This function decides WHAT to do depending on the type of the clicked filter.
  // It supports three cases:
  // 1) Items that need an extra user input (alphanumeric)
  // 2) Simple ontology terms (e.g. molecular effects)
  // 3) Full genomic queries (e.g. SNP positions)

  const handleGenomicFilter = (item) => {
    // Case 2: Genomic annotation example opens the Genomic Query Builder tool
    if (item.type === "genomic" && item.queryParams) {
      setGenomicPrefill(item);
      openGenomicQueryBuilder();
      return;
    }

    // Case 1: simple alphanumeric filter (opens input box)
    if (item.type === "alphanumeric") {
      setExtraFilter(item);
      return;
    }

    // Case 3: filtering term (ontology)
    // These items do NOT contain queryParams. They represent a simple keyword.
    const isFilterTerm =
      !item.queryParams || Object.keys(item.queryParams).length === 0;
    if (isFilterTerm) {
      setSelectedFilter((prev = []) => {
        if (prev.some((f) => f.id === item.id)) {
          // Avoid duplicates
          setMessage(COMMON_MESSAGES.doubleValue);
          setTimeout(() => setMessage(null), 3000);
          return prev;
        }
        // Add the ontology term as a simple filter
        return [...prev, { ...item, bgColor: "genomic" }];
      });

      // If a search already exists, mark the UI as "dirty" as the user will see a message
      if (hasSearchResults) setQueryDirty(true);
      return;
    }

    return;
  };

  // Render collapsible categories and their labels as clickable filter chips
  return (
    <Box>
      {/* Display error message if the user tries to add a duplicate */}
      {message && (
        <Box sx={{ mt: 2 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}

      {/* Loop through each genomic category that should be shown in the UI */}
      {categoriesToRender.map((topic) => {
        // Static labels come from predefined lists in filterLabels (excluding dynamic molecular effects)
        const staticLabels = filterLabels[topic]?.filter((l) =>
          l.label?.trim()
        );
        const items =
          topic === "Molecular Effect"
            ? molecularEffectsToRender
            : staticLabels || [];

        // Skip this category if there are no items to display
        if (!items.length) return null;

        // Each category is wrapped inside its own collapsible accordion section
        return (
          <Accordion
            key={topic}
            expanded={expanded[topic]}
            onChange={handleAccordion(topic)}
            disableGutters
            elevation={0}
            sx={{ background: "transparent", "&::before": { display: "none" } }}
          >
            {/* Accordion header showing the category title */}
            <AccordionSummary
              expandIcon={<KeyboardArrowRightIcon />}
              sx={{
                px: 0,
                "& .MuiAccordionSummary-expandIconWrapper": {
                  marginLeft: "auto",
                  transition: "transform 0.2s",
                },
                "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                  transform: "rotate(90deg)",
                },
              }}
            >
              <Typography sx={{ fontStyle: "italic", fontSize: "14px" }}>
                {topic}
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 0, pt: 0, mb: 3, pb: 0 }}>
              {/* Render all filter chips for this category, shown as selectable labels */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {items.map((item) => (
                  <FilterLabelRemovable
                    key={item.id || item.label}
                    variant="simple"
                    label={item.label}
                    bgColor="genomic"
                    onClick={() =>
                      handleGenomicFilter({ ...item, bgColor: "genomic" })
                    }
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
