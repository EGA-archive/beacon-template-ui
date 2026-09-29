import { Box } from "@mui/material";
import { useRef, useEffect, useState } from "react";
import config from "../../config/runtimeConfig";
import GenomicSearchMessage from "./genomic/GenomicSearchMessage";
import { COMMON_MESSAGES } from "../common/CommonMessage";
import {
  buildGenomicLabel,
  buildSequenceQueryLabel,
} from "../genomic/genomicLabelHelper";
import { useSelectedEntry } from "../../components/context/SelectedEntryContext";
import {
  detectAndCleanVariant,
  isPossibleSequenceQuery,
  validateGenomicVariant,
  getGenomicInputExamples,
  formatQueryList,
  buildGenomicFilterId,
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
  const { openGenomicQueryBuilder } = useSelectedEntry();
  const inputRef = useRef(null); // For managing focus on the input field

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

  // Commit the draft query to filters
  const commitGenomicDraft = () => {
    const chromosomeLibrary =
      config?.ui?.genomicQueries?.chromosomeLibrary ?? [];

    const { isVariant, cleanedValue, detectedAssembly } = detectAndCleanVariant(
      genomicDraft,
      config?.assemblyId ?? [],
      chromosomeLibrary
    );

    if (!cleanedValue) return;

    if (detectedAssembly && detectedAssembly !== assembly) {
      setAssembly(detectedAssembly);
    }

    const finalAssembly = detectedAssembly || assembly;

    // Restrict to single genomic query
    const alreadyHasGenomic = selectedFilter.some(
      (f) => f.type === "genomic" && f.scope !== "editing"
    );
    if (alreadyHasGenomic) {
      setMessage(COMMON_MESSAGES.singleGenomicQuery);
      setTimeout(() => setMessage(null), 3000);
      setTimeout(() => setGenomicDraft(""), 3000);
      return;
    }

    // Prevent duplicates
    const labelForCheck = `${finalAssembly} | ${cleanedValue}`
      .replace(/\|{2,}/g, "|")
      .replace(/\|\s*\|/g, "|")
      .replace(/\|\s+$/, "")
      .replace(/^\s+\|/, "");

    const isDuplicate = selectedFilter.some(
      (f) => f.label.trim().toLowerCase() === labelForCheck.toLowerCase()
    );
    if (isDuplicate) {
      setMessage(COMMON_MESSAGES.doubleValue);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Case 1: Variant-like structure detected
    if (isVariant) {
      const validationError = validateGenomicVariant(
        cleanedValue,
        chromosomeLibrary
      );

      if (validationError) {
        setMessage(validationError);
        setTimeout(() => setMessage(null), 9000);
        return;
      }
    } else {
      // Case 2: Query is not a valid SNV/SNP format
      setMessage(COMMON_MESSAGES.invalidGenomicQuery);
      setTimeout(() => setMessage(null), 9000);
      return;
    }

    // If everything passes, build the Beacon-compliant query
    const [chromosome, position, ref, alt] = cleanedValue.split("-");
    const queryParams = {
      assemblyId: finalAssembly,
      referenceName: chromosome,
      start: [Number(position)],
      referenceBases: ref,
      alternateBases: alt,
    };

    // Build deterministic ID from query parameters
    const id = buildGenomicFilterId("Sequence Query", queryParams);

    const combinedLabel = buildSequenceQueryLabel(queryParams);

    const newGenomicFilter = {
      id,
      key: "Sequence Query",
      label: combinedLabel,
      scope: "genomicVariant",
      bgColor: "genomic",
      type: "genomic",
      queryType: "Sequence Query",
      queryParams,
    };

    setSelectedFilter((prev) => [...prev, newGenomicFilter]);
    setGenomicDraft("");
  };

  const [isAssemblyOpen, setIsAssemblyOpen] = useState(false);

  const commitStringQuery = (queryType) => {
    const value = genomicDraft.trim();

    if (!value) return;

    const alreadyHasGenomic = selectedFilter.some(
      (filter) => filter.type === "genomic" && filter.scope !== "editing"
    );

    if (alreadyHasGenomic) {
      setMessage(COMMON_MESSAGES.singleGenomicQuery);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const queryParams =
      queryType === "Gene ID"
        ? { geneId: value }
        : { genomicAlleleShortForm: value };

    const id = buildGenomicFilterId(queryType, queryParams);
    const combinedLabel = buildGenomicLabel(queryParams);

    const newGenomicFilter = {
      id,
      key: queryType,
      label: combinedLabel,
      scope: "genomicQueryBuilder",
      bgColor: "genomic",
      type: "genomic",
      queryType,
      queryParams,
    };

    setSelectedFilter((prev) => [...prev, newGenomicFilter]);
    setGenomicDraft("");
    setMessage(null);
  };

  const handleOpenGenomicQueryBuilder = () => {
    openGenomicQueryBuilder?.();
    setMessage(null);
    setGenomicDraft("");
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
        onInputClick={() => setActiveInput("genomic")}
        onInputChange={setGenomicDraft}
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

      {/*
       * Compact layout only:
       * Show the Genomic Query Builder button below the input.
       *
       * It stays hidden when:
       * - the screen is outside the 600px to 870px range
       * - there is no Result Type selector
       */}
      {/*
       * From 870px downward, move the Genomic Query Builder
       * below the genomic input when the Result Type selector exists.
       */}
      {action && (
        <Box
          sx={{
            display: "none",
            justifyContent: "center",
            width: "100%",
            maxWidth: "220px",
            mx: "auto",
            mt: 1.5,

            // Multi-entry layouts move the button outside from 870px downward.
            [buttonsOutsideInputLayout]: {
              display: hasEntryTypeSelector ? "flex" : "none",
            },

            // On xs, always move the button outside.
            [mobileSearchLayout]: {
              display: "flex",
            },

            // GenomicQueryBuilderButton has its own outer Box.
            "& > *": {
              width: "100%",
            },

            // Keep the button on one line and fill the wrapper.
            "& .MuiButton-root": {
              width: "100%",
              whiteSpace: "nowrap",
            },
          }}
        >
          {action}
        </Box>
      )}

      {/* Show suggestions and actions when the user has typed a genomic query */}
      {activeInput === "genomic" && genomicDraft?.trim() && (
        <>
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
          />

          <GenomicSearchMessage
            message={message}
            hasGenomicBuilderQueries={hasGenomicBuilderQueries}
            genomicBuilderWarningList={genomicBuilderWarningList}
            onOpenBuilder={handleOpenGenomicQueryBuilder}
          />
        </>
      )}
    </Box>
  );
}
