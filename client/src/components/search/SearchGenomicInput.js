import { Box, InputBase, MenuItem, Select } from "@mui/material";
import { alpha } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useRef, useEffect } from "react";
import config from "../../config/config.json";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
}) {
  const inputRef = useRef(null); // For managing focus on the input field

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
    const errors = [];

    const validChromosomes = chromosomeLibrary.map((c) => c.toUpperCase());
    const basePattern = IUPAC_BASE_PATTERN;

    // Invalid chromosome
    if (!validChromosomes.includes(chrom.toUpperCase())) {
      errors.push(
        `${
          COMMON_MESSAGES.invalidChromosome
        } ("${chrom}"). Allowed: ${validChromosomes.join(", ")}.`
      );
    }

    // Invalid bases
    if (!basePattern.test(ref) || !basePattern.test(alt)) {
      errors.push(`${COMMON_MESSAGES.invalidBases} (Found ${ref}/${alt}).`);
    }

    if (errors.length > 0) {
      return errors.join(" ");
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
    const alreadyHasGenomic = selectedFilter.some((f) => f.type === "genomic");
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
        setTimeout(() => setMessage(null), 4000);
        return;
      }
    } else {
      // Case 2: No proper variant structure. It detects if user tried but failed
      const draft = genomicDraft.trim().toUpperCase();

      // Check chromosome portion
      const chrom = draft.replace(/^CHR/i, "").split(/[-:]/)[0];
      const validChromosomes = chromosomeLibrary.map((c) => c.toUpperCase());

      let errors = [];

      if (!validChromosomes.includes(chrom)) {
        errors.push(COMMON_MESSAGES.invalidChromosome);
      }

      // Try to extract bases from something like 17:7674945C>G
      const match = draft.match(
        new RegExp(
          `([${IUPAC_BASE_CLASS}\\-.])[\\->]([${IUPAC_BASE_CLASS}\\-.])`,
          "i"
        )
      );

      if (!match) {
        errors.push(COMMON_MESSAGES.invalidBases);
      }
      // If nothing matches any known pattern, fallback to format error
      if (errors.length === 0) {
        errors.push(COMMON_MESSAGES.invalidFormat);
      }

      setMessage(errors.join(" "));
      setTimeout(() => setMessage(null), 4000);
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

    // Create unique ID
    const uniqueId = `genomic-free-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    const newGenomicFilter = {
      id: uniqueId,
      key: uniqueId,
      label: labelForCheck,
      scope: "genomicVariant",
      bgColor: "genomic",
      type: "genomic",
      queryParams,
    };

    setSelectedFilter((prev) => [...prev, newGenomicFilter]);
    setGenomicDraft("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        flex: activeInput === "genomic" ? 1 : 0.3,
      }}
    >
      {/* Input container */}
      <Box
        onClick={() => setActiveInput("genomic")}
        sx={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${primaryDarkColor}`,
          borderRadius: "999px",
          backgroundColor: "#fff",
          transition: "flex 0.3s ease",
        }}
      >
        {/* Genome assembly dropdown */}
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
              height: "47px",
              borderTopLeftRadius: "999px",
              borderBottomLeftRadius: "999px",
              ".MuiSelect-icon": { color: "#fff", mr: 1 },
            }}
          >
            {config.assemblyId.map((id) => (
              <MenuItem key={id} value={id} sx={{ fontSize: "12px" }}>
                {id}
              </MenuItem>
            ))}
          </Select>
        )}

        {/* Search icon */}
        <Box sx={{ px: 1, color: primaryDarkColor }}>
          <SearchIcon />
        </Box>

        {/* Main input */}
        <Box sx={{ position: "relative", flex: 1 }}>
          <InputBase
            inputRef={inputRef}
            placeholder={
              activeInput === "genomic"
                ? "Search by Genomic Query. Examples: 17-7674945-G-A or 17:7674945G>A"
                : "Search by Genomic Query."
            }
            fullWidth
            value={genomicDraft}
            onChange={(e) => setGenomicDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitGenomicDraft();
            }}
            sx={{
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
              height: "47px",
            }}
          />

          {/* Clear icon */}
          {genomicDraft?.trim() && (
            <Box
              role="button"
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
              <ClearIcon sx={{ fontSize: "16px" }} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Add button and message */}
      {genomicDraft?.trim() && (
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
                onClick={(e) => {
                  e.stopPropagation();
                  setGenomicDraft("17-7674945-G-A");
                }}
                style={{
                  color: config.ui.colors.primary,
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                17-7674945-G-A
              </span>
              &nbsp;or&nbsp;
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setGenomicDraft("17:7674945G>A");
                }}
                style={{
                  color: config.ui.colors.primary,
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                17:7674945G&gt;A
              </span>
            </Box>

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
          </Box>
          <Box sx={{ mt: message ? 2 : 0 }}>
            {message && <CommonMessage text={message} type="error" />}
          </Box>
        </Box>
      )}
    </Box>
  );
}
