import { Box } from "@mui/material";
import { useRef, useEffect, useState } from "react";
import config from "../../config/runtimeConfig";
import GenomicSearchMessage from "./genomic/GenomicSearchMessage";
import useGenomicSearch from "./genomic/useGenomicSearch";
import GenomicSearchAction from "./genomic/GenomicSearchAction";
import { useSelectedEntry } from "../../components/context/SelectedEntryContext";
import {
  detectAndCleanVariant,
  isPossibleSequenceQuery,
  getGenomicInputExamples,
  formatQueryList,
  GENOMIC_QUERY_BUILDER_OPTIONS,
  STRING_QUERY_OPTIONS,
} from "./genomicSearchUtils";
import GenomicSearchSuggestions from "./genomic/GenomicSearchSuggestions";
import GenomicSearchInputField from "./genomic/GenomicSearchInputField";

// This component renders an input bar for adding free-text/ copy and paste genomic queries .
// It includes a dropdown for selecting the genome assembly coming from the config,
// a search input field, a "clear" icon to reset input, and a button to add the query.
// When the user presses Enter or clicks the "Add" button, the query is added to the filters.
// It also auto-detects assembly IDs and normalizes genomic variant formats.

export default function SearchGenomicInput({
  activeInput,
  setActiveInput,
  primaryDarkColor,
  assembly,
  setAssembly,
  genomicDraft,
  setGenomicDraft,
  selectedFilter,
  setSelectedFilter,
  message,
  setMessage,
  action,
  isGenomicDescriptionMultiline,
  hasOneEntryTypeColumn,
  hasEntryTypeSelector = false,
}) {
  const { openGenomicQueryBuilder, setExtraFilter } = useSelectedEntry();
  const inputRef = useRef(null); // For managing focus on the input field
  const suggestionsRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const genomicQueryTypes = config?.ui?.genomicQueries?.genomicQueryTypes ?? {};

  const genomicInputExample = config?.ui?.genomicQueries?.searchInputExample;

  const genomicInputExamples = getGenomicInputExamples(genomicInputExample);

  const genomicInputPlaceholder =
    genomicInputExamples.length > 0
      ? `Examples: ${genomicInputExamples.join(" or ")}`
      : "Enter genomic variant";

  // Buttons move outside the inputs from 870px downward.
  const buttonsOutsideInputLayout = "@media (max-width:870px)";

  // Additional mobile rearrangement begins below 600px.
  const mobileSearchLayout = "@media (max-width:599px)";

  const enabledStringQueryOptions = STRING_QUERY_OPTIONS.filter(
    ({ configKey }) => genomicQueryTypes?.[configKey]
  );

  const enabledBuilderQueries = GENOMIC_QUERY_BUILDER_OPTIONS.filter(
    ({ configKey }) =>
      genomicQueryTypes?.[configKey] &&
      !["geneId", "hgvsQuery"].includes(configKey)
  );

  const genomicBuilderCtaList = formatQueryList(
    enabledBuilderQueries.map(({ ctaLabel }) => ctaLabel)
  );

  const genomicBuilderWarningList = formatQueryList(
    enabledBuilderQueries.map(({ warningLabel }) => warningLabel)
  );

  const hasGenomicBuilderQueries = enabledBuilderQueries.length > 0;

  // Automatically focuses the input when genomic input becomes active
  useEffect(() => {
    if (activeInput === "genomic" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeInput]);

  // Live detection of variant structure
  const { isVariant, cleanedValue, detectedAssembly } = detectAndCleanVariant(
    genomicDraft,
    config?.assemblyId ?? [],
    config?.ui?.genomicQueries?.chromosomeLibrary ?? []
  );

  const isPossibleSequence =
    !isVariant &&
    isPossibleSequenceQuery(
      genomicDraft,
      config?.ui?.genomicQueries?.chromosomeLibrary ?? []
    );

  const isStringQuery =
    Boolean(genomicDraft.trim()) && !isVariant && !isPossibleSequence;

  // Keep dropdown synced with detected assembly
  useEffect(() => {
    if (detectedAssembly && detectedAssembly !== assembly) {
      setAssembly(detectedAssembly);
    }
  }, [detectedAssembly, assembly, setAssembly]);

  const [isAssemblyOpen, setIsAssemblyOpen] = useState(false);

  const { commitGenomicDraft, commitStringQuery } = useGenomicSearch({
    assembly,
    setAssembly,
    genomicDraft,
    setGenomicDraft,
    selectedFilter,
    setSelectedFilter,
    setMessage,
  });

  const handleOpenGenomicQueryBuilder = () => {
    openGenomicQueryBuilder?.();
    setMessage(null);
    setGenomicDraft("");
  };

  const handleAddAlleleFrequency = () => {
    setGenomicDraft("Allele Frequency");
    setShowSuggestions(false);
    setMessage(null);

    setExtraFilter({
      id: "alleleFrequency",
      key: "alleleFrequency",
      label: "Allele Frequency",
      type: "alphanumeric",
      scope: "genomicVariation",
      scopes: ["genomicVariation"],

      // Clear the genomic search once the AF filter is completed or cancelled.
      onComplete: () => setGenomicDraft(""),
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: activeInput === "genomic" ? 1 : 0.3,
        fontSize: "12px",
        mt: hasOneEntryTypeColumn
          ? 1
          : isGenomicDescriptionMultiline
          ? 1
          : "15px",
      }}
    >
      <Box
        ref={suggestionsRef}
        sx={{
          position: "relative",
          width: "100%",
          minWidth: 0,
        }}
      >
        <GenomicSearchInputField
          assembly={assembly}
          assemblyIds={config.assemblyId}
          genomicDraft={genomicDraft}
          genomicInputPlaceholder={genomicInputPlaceholder}
          primaryDarkColor={primaryDarkColor}
          isAssemblyOpen={isAssemblyOpen}
          inputRef={inputRef}
          onAssemblyChange={setAssembly}
          onAssemblyOpen={() => setIsAssemblyOpen(true)}
          onAssemblyClose={() => setIsAssemblyOpen(false)}
          onInputClick={() => {
            setActiveInput("genomic");
            setShowSuggestions(true);
          }}
          onInputChange={(value) => {
            setGenomicDraft(value);
            setShowSuggestions(true);
          }}
          onInputKeyDown={(event) => {
            if (event.key === "Enter") {
              commitGenomicDraft();
            }
          }}
          onClear={() => setGenomicDraft("")}
        >
          {action && (
            <Box
              sx={{
                display: "none",
                alignItems: "center",
                flexShrink: 0,
                [buttonsOutsideInputLayout]: {
                  display: "none",
                  backgroundColor: "black",
                },
                [mobileSearchLayout]: {
                  display: "none",
                },
              }}
            >
              {action}
            </Box>
          )}
        </GenomicSearchInputField>

        {/* Suggestions overlap the content below the genomic input */}
        {showSuggestions && genomicDraft?.trim() && (
          <GenomicSearchSuggestions
            genomicDraft={genomicDraft}
            genomicInputExamples={genomicInputExamples}
            isVariant={isVariant}
            isPossibleSequence={isPossibleSequence}
            isStringQuery={isStringQuery}
            cleanedValue={cleanedValue}
            enabledStringQueryOptions={enabledStringQueryOptions}
            genomicBuilderCtaList={genomicBuilderCtaList}
            primaryColor={config.ui.colors.primary}
            primaryDarkColor={primaryDarkColor}
            onSelectExample={setGenomicDraft}
            onAddSequence={commitGenomicDraft}
            onAddString={commitStringQuery}
            onOpenBuilder={handleOpenGenomicQueryBuilder}
            onAddAlleleFrequency={handleAddAlleleFrequency}
          />
        )}
      </Box>

      <GenomicSearchAction
        action={action}
        hasEntryTypeSelector={hasEntryTypeSelector}
      />

      {activeInput === "genomic" && genomicDraft?.trim() && (
        <GenomicSearchMessage
          message={message}
          hasGenomicBuilderQueries={hasGenomicBuilderQueries}
          genomicBuilderWarningList={genomicBuilderWarningList}
          onOpenBuilder={handleOpenGenomicQueryBuilder}
        />
      )}
    </Box>
  );
}
