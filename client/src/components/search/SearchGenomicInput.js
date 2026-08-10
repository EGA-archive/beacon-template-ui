import { Box, InputBase, MenuItem, Select } from "@mui/material";
import { alpha } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { useRef, useEffect, useState } from "react";
import config from "../../config/runtimeConfig";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { GENOMIC_LABELS_MAP } from "../genomic/genomicLabelHelper";
import { useSelectedEntry } from "../../components/context/SelectedEntryContext";

// This component renders an input bar for adding free-text genomic queries.
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

  // Buttons move outside the inputs from 870px downward.
  const buttonsOutsideInputLayout = "@media (max-width:870px)";

  // Additional mobile rearrangement begins below 600px.
  const mobileSearchLayout = "@media (max-width:599px)";

  const GENOMIC_QUERY_BUILDER_OPTIONS = [
    {
      configKey: "geneId",
      ctaLabel: "Gene ID",
      warningLabel: "gene",
    },
    {
      configKey: "rangeQuery",
      ctaLabel: "Range",
      warningLabel: "range",
    },
    {
      configKey: "bracketQuery",
      ctaLabel: "Bracket",
      warningLabel: "bracket",
    },
    {
      configKey: "hgvsQuery",
      ctaLabel: "HGVS",
      warningLabel: "HGVS",
    },
  ];

  const formatQueryList = (labels = []) => {
    if (labels.length === 0) return "";
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return `${labels[0]} or ${labels[1]}`;

    return `${labels.slice(0, -1).join(", ")} or ${labels.at(-1)}`;
  };

  const enabledBuilderQueries = GENOMIC_QUERY_BUILDER_OPTIONS.filter(
    ({ configKey }) => genomicQueryTypes?.[configKey]
  );

  const genomicBuilderCtaList = formatQueryList(
    enabledBuilderQueries.map(({ ctaLabel }) => ctaLabel)
  );

  const genomicBuilderWarningList = formatQueryList(
    enabledBuilderQueries.map(({ warningLabel }) => warningLabel)
  );

  const hasGenomicBuilderQueries = enabledBuilderQueries.length > 0;

  const IUPAC_BASE_PATTERN = /^[ACGTUNRYSWKMBDHV\-.]+$/i;
  const IUPAC_BASE_CLASS = "ACGTUNRYSWKMBDHV";

  // Detect and normalize genomic variant format (e.g., 17:7674945G>A -> 17-7674945-G-A)
  const detectAndCleanVariant = (
    input = "",
    assemblies = [],
    chromosomeLibrary = []
  ) => {
    if (!input)
      return { isVariant: false, cleanedValue: "", detectedAssembly: null };

    let raw = input.trim();

    // Split input by spaces/tabs
    const tokens = raw.split(/\s+/);
    let detectedAssembly = null;

    if (tokens.length > 1) {
      const assembliesLower = assemblies.map((a) => a.toLowerCase());

      // Check first token
      const firstToken = tokens[0].replace(/[,\s;:]+$/g, "");
      if (assembliesLower.includes(firstToken.toLowerCase())) {
        detectedAssembly =
          assemblies[assembliesLower.indexOf(firstToken.toLowerCase())];
        tokens.shift(); // remove assembly from beginning
        raw = tokens.join("-");
      }

      // If no assembly found at start, check last token
      if (!detectedAssembly) {
        const lastToken = tokens[tokens.length - 1].replace(/[,\s;:]+$/g, "");
        if (assembliesLower.includes(lastToken.toLowerCase())) {
          detectedAssembly =
            assemblies[assembliesLower.indexOf(lastToken.toLowerCase())];
          tokens.pop(); // remove assembly from end
          raw = tokens.join("-");
        }
      }
    }

    // Step 1: Replace symbols to make formats consistent
    const normalised = raw
      .replace(/:/g, "-") // colon → dash
      .replace(/>/g, "-"); // greater-than → dash

    // Step 2: If ref/alt bases are stuck together (e.g., G>A → G-A)
    const withSplitBases = normalised.replace(
      new RegExp(
        `(\\d+)([${IUPAC_BASE_CLASS}\\-.]+)-([${IUPAC_BASE_CLASS}\\-.]+)$`,
        "i"
      ),
      "$1-$2-$3"
    );

    // Step 3: Final cleanup and uppercasing
    const cleaned = withSplitBases
      .toUpperCase()
      .replace(/\./g, "")
      .replace(/\//g, "")
      .replace(/\t+/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .replace(/^[-|]+|[-|]+$/g, "");

    // Dynamically validate the referenceName against chromosomeLibrary
    const chromPattern = chromosomeLibrary
      .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // escape regex chars
      .join("|");

    const variantRegex = new RegExp(
      `^(?:CHR)?(?:${chromPattern})-\\d+-[ACGTUNRYSWKMBDHV\\-.]+-[ACGTUNRYSWKMBDHV\\-.]+$`,
      "i"
    );

    if (variantRegex.test(cleaned)) {
      return {
        isVariant: true,
        cleanedValue: cleaned.toUpperCase(),
        detectedAssembly,
      };
    }

    return {
      isVariant: false,
      cleanedValue: raw.trim(),
      detectedAssembly,
    };
  };

  // Validate genomic variant: checks chromosome and base validity
  const validateGenomicVariant = (cleanedValue, chromosomeLibrary) => {
    const [chrom, pos, ref, alt] = cleanedValue.split("-");

    const validChromosomes = chromosomeLibrary.map((c) => c.toUpperCase());
    const basePattern = IUPAC_BASE_PATTERN;

    const invalidChromosome = !validChromosomes.includes(chrom.toUpperCase());

    const invalidBases = !basePattern.test(ref) || !basePattern.test(alt);

    if (invalidChromosome || invalidBases) {
      return COMMON_MESSAGES.invalidGenomicQuery;
    }

    return null;
  };

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
    config?.ui?.genomicQueries?.genomicQueryBuilder?.chromosomeLibrary ?? []
  );

  // Keep dropdown synced with detected assembly
  useEffect(() => {
    if (detectedAssembly && detectedAssembly !== assembly) {
      setAssembly(detectedAssembly);
    }
  }, [detectedAssembly, assembly, setAssembly]);

  const buildSequenceQueryLabel = (queryParams = {}) => {
    const orderedKeys = [
      "assemblyId",
      "referenceName",
      "start",
      "alternateBases",
      "referenceBases",
    ];

    return orderedKeys
      .filter(
        (key) => queryParams[key] !== undefined && queryParams[key] !== null
      )
      .map((key) => {
        const normalizedKey = key === "referenceName" ? "chromosome" : key;
        const displayKey = GENOMIC_LABELS_MAP[normalizedKey] || normalizedKey;

        const rawValue = queryParams[key];
        const displayValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;

        return `${displayKey}: ${displayValue}`;
      })
      .join(" | ")
      .replace(/\|{2,}/g, "|")
      .replace(/\|\s*\|/g, "|")
      .replace(/\|\s+$/, "")
      .replace(/^\s+\|/, "");
  };

  // Commit the draft query to filters
  const commitGenomicDraft = () => {
    const chromosomeLibrary =
      config?.ui?.genomicQueries?.genomicQueryBuilder?.chromosomeLibrary ?? [];

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
    const validEntries = Object.entries(queryParams).filter(
      ([_, value]) =>
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "")
    );

    const idLabel = validEntries
      .map(([key, value]) => `${key}:${value}`)
      .join("-");

    const id = `genomic-Sequence Query-${idLabel}`;

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

  const AssemblyArrowIcon = (props) =>
    isAssemblyOpen ? (
      <KeyboardArrowDownIcon {...props} />
    ) : (
      <KeyboardArrowRightRoundedIcon {...props} />
    );
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
      {/* Main genomic input container */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${primaryDarkColor}`,
          borderRadius: "999px",
          backgroundColor: "#fff",
          transition: "flex 0.3s ease",
          pr: 2,
          py: 1,
          height: "47px",
        }}
      >
        {/* Genome assembly dropdown */}
        <Select
          value={assembly}
          onChange={(event) => setAssembly(event.target.value)}
          onOpen={() => setIsAssemblyOpen(true)}
          onClose={() => setIsAssemblyOpen(false)}
          variant="standard"
          disableUnderline
          IconComponent={AssemblyArrowIcon}
          sx={{
            backgroundColor: "black",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: '"Open Sans", sans-serif',
            pl: 3,
            pr: 2,
            py: 0,
            height: "47px",
            borderTopLeftRadius: "999px",
            borderBottomLeftRadius: "999px",

            ".MuiSelect-icon": {
              color: "#fff",
              mr: 1,
            },

            ".MuiSelect-iconOpen": {
              transform: "none",
            },
          }}
        >
          {config.assemblyId.map((id) => (
            <MenuItem
              key={id}
              value={id}
              sx={{
                fontSize: "12px",
              }}
            >
              {id}
            </MenuItem>
          ))}
        </Select>

        {/* Search icon */}
        <Box
          sx={{
            width: "48px",
            height: "47px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: primaryDarkColor,
          }}
        >
          <SearchIcon />
        </Box>

        {/* Main genomic query input */}
        <Box
          sx={{
            position: "relative",
            flex: 1,
            minWidth: 0,
          }}
        >
          <InputBase
            onClick={() => {
              setActiveInput("genomic");
            }}
            inputRef={inputRef}
            placeholder="Examples: 22-16050527-C-A or 22:16050527C>A"
            fullWidth
            value={genomicDraft}
            onChange={(event) => setGenomicDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commitGenomicDraft();
              }
            }}
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "12px",
              height: "47px",
            }}
          />

          {/* Show the clear icon only when the input contains text */}
          {activeInput === "genomic" && genomicDraft?.trim() && (
            <Box
              role="button"
              aria-label="Clear genomic query"
              onClick={() => setGenomicDraft("")}
              sx={{
                position: "absolute",
                top: "50%",
                right: 8,
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: alpha(primaryDarkColor, 0.1),
                color: primaryDarkColor,
                cursor: "pointer",

                "&:hover": {
                  backgroundColor: alpha(primaryDarkColor, 0.2),
                },
              }}
            >
              <ClearIcon
                sx={{
                  fontSize: "16px",
                }}
              />
            </Box>
          )}
        </Box>

        {/*
         * Normal layout:
         * Keep the Genomic Query Builder button inside the input.
         *
         * Compact layout:
         * Hide it inside the input when the Result Type selector is visible.
         */}
        {action && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              [buttonsOutsideInputLayout]: {
                display: hasEntryTypeSelector ? "none" : "flex",
              },
            }}
          >
            {action}
          </Box>
        )}
      </Box>

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
      {action && hasEntryTypeSelector && (
        <Box
          sx={{
            display: "none",
            justifyContent: "center",
            width: "100%",
            maxWidth: "220px",
            mx: "auto",
            mt: 1.5,

            [buttonsOutsideInputLayout]: {
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
        <Box>
          <Box
            role="button"
            onClick={commitGenomicDraft}
            sx={{
              border: `1px solid ${primaryDarkColor}`,
              borderRadius: "21px",
              cursor: "pointer",
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "12px",
              p: 0,
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            {/* Example genomic queries */}
            <Box
              sx={{
                width: "100%",
                backgroundColor: "#F1F1F1",
                px: 6,
                py: 1,
              }}
            >
              Examples:&nbsp;
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  setGenomicDraft("22-16050527-C-A");
                }}
                style={{
                  color: config.ui.colors.primary,
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                22-16050527-C-A
              </span>
              &nbsp;or&nbsp;
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  setGenomicDraft("22:16050527C>A");
                }}
                style={{
                  color: config.ui.colors.primary,
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                22:16050527C&gt;A
              </span>
            </Box>

            {/* Option to add the detected genomic variant */}
            {hasGenomicBuilderQueries && (
              <Box
                sx={{
                  width: "100%",
                  px: 3,
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: 16,
                    height: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isVariant ? "pointer" : "default",

                    "& .unchecked": {
                      display: "block",
                    },

                    "& .checked": {
                      display: "none",
                    },

                    "&:hover .unchecked": {
                      display: isVariant ? "none" : "block",
                    },

                    "&:hover .checked": {
                      display: isVariant ? "block" : "none",
                    },
                  }}
                >
                  <RadioButtonUncheckedIcon
                    className="unchecked"
                    sx={{
                      color: isVariant ? config.ui.colors.primary : "grey",
                      fontSize: 16,
                    }}
                  />

                  <CheckCircleIcon
                    className="checked"
                    sx={{
                      color: alpha(config.ui.colors.primary, 0.6),
                      fontSize: 16,
                    }}
                  />
                </Box>

                {isVariant ? (
                  <>
                    Add <b>genomic variant:</b> <code>{cleanedValue}</code>
                  </>
                ) : (
                  <>
                    Add <b>genomic query:</b> <code>{genomicDraft}</code>
                  </>
                )}
              </Box>
            )}

            {/* Option to open the Genomic Query Builder */}
            <Box
              sx={{
                width: "100%",
                px: 3,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                onClick={() => {
                  openGenomicQueryBuilder?.();
                  setMessage(null);
                  setGenomicDraft("");
                }}
                sx={{
                  position: "relative",
                  width: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",

                  "& .unchecked": {
                    display: "block",
                  },

                  "& .checked": {
                    display: "none",
                  },

                  "&:hover .unchecked": {
                    display: "none",
                  },

                  "&:hover .checked": {
                    display: "block",
                  },
                }}
              >
                <RadioButtonUncheckedIcon
                  className="unchecked"
                  sx={{
                    color: isVariant ? config.ui.colors.primary : "grey",
                    fontSize: 16,
                  }}
                />

                <CheckCircleIcon
                  className="checked"
                  sx={{
                    color: alpha(config.ui.colors.primary, 0.6),
                    fontSize: 16,
                  }}
                />
              </Box>

              <Box
                onClick={() => {
                  openGenomicQueryBuilder?.();
                  setMessage(null);
                  setGenomicDraft("");
                }}
                sx={{
                  cursor: "pointer",
                }}
              >
                Open <b>Genomic Query Builder</b> for the following query:{" "}
                <b>{genomicBuilderCtaList}.</b>
              </Box>
            </Box>
          </Box>

          {/* Validation or error message */}
          <Box
            sx={{
              mt: message ? 2 : 0,
            }}
          >
            {message === COMMON_MESSAGES.invalidGenomicQuery ? (
              <CommonMessage
                type="warning"
                text={
                  <>
                    This search bar only supports{" "}
                    <b>single nucleotide variants (SNVs/SNPs)</b>.
                    <br />
                    {hasGenomicBuilderQueries && (
                      <>
                        To search by {genomicBuilderWarningList} queries, use
                        the{" "}
                        <span
                          onClick={() => {
                            setMessage(null);
                            setGenomicDraft("");
                            openGenomicQueryBuilder?.();
                          }}
                          style={{
                            fontWeight: 700,
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                        >
                          Genomic Query Builder
                        </span>
                        .
                      </>
                    )}
                  </>
                }
              />
            ) : (
              message && <CommonMessage text={message} type="error" />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
