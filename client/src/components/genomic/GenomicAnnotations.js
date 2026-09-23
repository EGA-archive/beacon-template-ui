import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState, useMemo } from "react";
import config from "../../config/runtimeConfig";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import CommonMessage from "../../components/common/CommonMessage";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";
import { filterLabels } from "../genomic/utils/GenomicFilterLabels";
import { useGenomicAnnotationClick } from "../genomic/utils/useGenomicAnnotationClick";

/**
 * This component renders predefined genomic example queries inside collapsible sections
 * Includes dynamic Molecular Effect examples taken from /filtering_terms
 */
export default function GenomicAnnotations() {
  const [message, setMessage] = useState(null);

  const {
    selectedFilter,
    setSelectedFilter,
    setQueryDirty,
    hasSearchResults,
    molecularEffects,
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

  const molecularEffectsToRender = useMemo(() => {
    const predefined = filterLabels["Molecular Effects"] || [];

    /**
     * Convert a backend molecular effect into the same shape
     * used by the predefined genomic annotation filters.
     *
     * This is important because useGenomicAnnotationClick
     * needs to know that the item is an ontology filter
     * scoped to genomic variations.
     */
    const normalizeMolecularEffect = (backendEffect) => {
      const predefinedEffect = predefined.find(
        (item) => item.id === backendEffect.id
      );

      return {
        ...predefinedEffect,
        ...backendEffect,

        key: backendEffect.key ?? predefinedEffect?.key ?? backendEffect.id,

        id: backendEffect.id,

        label:
          backendEffect.label ?? predefinedEffect?.label ?? backendEffect.id,

        type: "ontology",

        scope:
          backendEffect.scope ?? predefinedEffect?.scope ?? "genomicVariation",
      };
    };

    const normalizedBackendEffects = filteredBackendEffects.map(
      normalizeMolecularEffect
    );

    const predefinedIds = predefined.map((item) => item.id);

    /**
     * Prioritize predefined molecular effects when they
     * are available from the backend.
     */
    const matches = predefinedIds
      .map((id) => normalizedBackendEffects.find((item) => item.id === id))
      .filter(Boolean);

    if (matches.length > 0) {
      const result = [...matches];

      /**
       * Always display at least two molecular effects when
       * enough allowed effects are available from the backend.
       */
      if (result.length < 2) {
        const remaining = normalizedBackendEffects.filter(
          (item) => !predefinedIds.includes(item.id)
        );

        return [...result, ...remaining.slice(0, 2 - result.length)];
      }

      return result;
    }

    /**
     * If none of the predefined effects are available,
     * use the first two allowed backend effects.
     */
    return normalizedBackendEffects.slice(0, 2);
  }, [filteredBackendEffects]);

  // All possible genomic annotation categories available in the UI
  const allCategories =
    config.ui.genomicAnnotations?.annotationCategories || [];

  // Filter configured categories based on backend availability.
  const categoriesToRender = allCategories.filter((cat) => {
    if (cat === "Molecular Effects" && filteredBackendEffects.length === 0) {
      return false;
    }

    return true;
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
  const handleAccordion = (cat) => (_, isExpanded) => {
    const nextExpanded = {};
    allCategories.forEach((category) => {
      nextExpanded[category] = category === cat ? isExpanded : false;
    });
    setExpanded(nextExpanded);
  };
  // Main click handler for selecting molecular effects or genomic example filters
  // This function decides WHAT to do depending on the type of the clicked filter.
  // It supports three cases:
  // 1) Items that need an extra user input (alphanumeric)
  // 2) Simple ontology terms (e.g. molecular effects)
  // 3) Full genomic queries (e.g. SNP positions)

  const handleGenomicFilter = useGenomicAnnotationClick({
    selectedFilter,
    setSelectedFilter,
    setMessage,
    setQueryDirty,
    hasSearchResults,
  });

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
          topic === "Molecular Effects"
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
                    onClick={() => handleGenomicFilter(item)}
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
