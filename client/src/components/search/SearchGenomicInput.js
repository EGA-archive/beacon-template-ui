import { Box, InputBase, MenuItem, Select } from "@mui/material";
import { alpha } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useRef, useEffect } from "react";
import config from "../../config/config.json";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";

// This component renders an input bar for adding free-text genomic queries.
// It includes a dropdown for selecting the genome assembly coming from the config
// a search input field, a "clear" icon to reset input, and a button to add the query.
// When the user presses Enter or clicks the "Add" button, the query is added to the filters.
// There is also a functionlaity that auto-detects the assmebly ID in the input
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

  // This function checks if the input is a valid variant
  // It also looks for an assembly ID  either at the start or end of the input
  const detectAndCleanVariant = (input = "", assemblies = []) => {
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
          raw = tokens.join("");
        }
      }
    }

    // Clean the input into standard format
    const cleaned = raw
      .replace(/\./g, "") // remove dots
      .replace(/\//g, "") // remove slashes
      .replace(/\t+/g, "-") // tabs to hyphens
      .replace(/\s+/g, "-") // spaces to hyphens
      .replace(/-+/g, "-") // collapse multiple hyphens
      .replace(/^-|-$/g, "") // remove hyphens at start/end
      .replace(/^[-|]+|[-|]+$/g, ""); // removes leading/trailing hyphens *or* pipes

    // Regex to check if it looks like a genomic variant
    const variantRegex =
      /^(?:chr)?(?:[1-9]|1\d|2[0-2]|X|Y|MT)-\d+-[ACGT]+-[ACGT]+$/i;

    if (variantRegex.test(cleaned)) {
      return {
        isVariant: true,
        cleanedValue: cleaned.toUpperCase(), // cleaned variant (no assembly)
        detectedAssembly,
      };
    }

    return {
      isVariant: false,
      cleanedValue: raw.trim(), // just plain query (not a variant)
      detectedAssembly,
    };
  };

  // Automatically focuses the input when genomic input becomes active
  useEffect(() => {
    if (activeInput === "genomic" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeInput]);

  // Live detection
  const { isVariant, cleanedValue, detectedAssembly } = detectAndCleanVariant(
    genomicDraft,
    config?.assemblyId ?? []
  );

  // Keep the dropdown synced if user typed it
  useEffect(() => {
    if (detectedAssembly && detectedAssembly !== assembly) {
      setAssembly(detectedAssembly);
    }
  }, [detectedAssembly, assembly, setAssembly]);

  // This function is called when the user presses Enter or clicks "Add"
  // It detects if the input is a genomic variant, cleans it if needed, checks for duplicates,
  // and then adds it to the selected filters list.
  const commitGenomicDraft = () => {
    const { isVariant, cleanedValue, detectedAssembly } = detectAndCleanVariant(
      genomicDraft,
      config?.assemblyId ?? []
    );
    if (!cleanedValue) return;

    // If user typed an assembly, sync it with dropdown
    if (detectedAssembly && detectedAssembly !== assembly) {
      setAssembly(detectedAssembly);
    }

    // Use typed assembly or fallback to current dropdown
    const finalAssembly = detectedAssembly || assembly;

    const alreadyHasGenomic = selectedFilter.some(
      (f) => f.queryType === "genomic"
    );

    if (alreadyHasGenomic) {
      setMessage(COMMON_MESSAGES.singleGenomicQuery);
      setTimeout(() => setMessage(null), 3000);
      setTimeout(() => setGenomicDraft(""), 3000);
      return;
    }

    // Avoid duplicates
    const labelForCheck = `${finalAssembly} | ${cleanedValue}`
      .replace(/\|{2,}/g, "|") // collapse double/more pipes
      .replace(/\|\s*\|/g, "|") // just in case spaced pipes
      .replace(/\|\s+$/, "") // no trailing pipe
      .replace(/^\s+\|/, ""); // no leading pipe

    const isDuplicate = selectedFilter.some(
      (f) => f.label.trim().toLowerCase() === labelForCheck.toLowerCase()
    );
    if (isDuplicate) {
      setMessage(COMMON_MESSAGES.doubleValue);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Create unique ID for this new filter
    const uniqueId = `genomic-free-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    // Build new filter item with final label
    const newGenomicFilter = {
      id: uniqueId,
      key: uniqueId,
      label: labelForCheck,
      scope: isVariant ? "genomicVariant" : "genomicQuery",
      bgColor: "genomic",
      queryType: "genomic",
    };

    // Add to list and clear input
    setSelectedFilter((prev) => [...prev, newGenomicFilter]);
    setGenomicDraft("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        flex: activeInput === "genomic" ? 1 : 0.3,
      }}
    >
      {/* Input container */}
      <Box
        onClick={() => setActiveInput("genomic")} // Make this input active on click
        sx={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${primaryDarkColor}`,
          borderRadius: "999px",
          backgroundColor: "#fff",
          transition: "flex 0.3s ease",
        }}
      >
        {/* Genome assembly dropdown (only visible when input is active) */}
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
            {/* Load the options from config */}
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

        {/* Main text input */}
        <Box sx={{ position: "relative", flex: 1 }}>
          <InputBase
            inputRef={inputRef}
            placeholder="Search by Genomic Query. Example: 17:7674945G>A"
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

          {/* Clear icon to reset the input */}
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

      {/* "Add" button and error message (only show if input is not empty) */}
      {genomicDraft?.trim() && (
        <Box>
          <Box
            role="button"
            onClick={commitGenomicDraft}
            sx={{
              border: `1px solid ${primaryDarkColor}`,
              borderRadius: "999px",
              backgroundColor: "#fff",
              px: 2,
              py: 1,
              cursor: "pointer",
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "12px",
            }}
          >
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
          <Box
            sx={{
              mt: message ? 2 : 0,
            }}
          >
            {/* Show duplicate error message if necessary */}
            {message && <CommonMessage text={message} type="error" />}
          </Box>
        </Box>
      )}
    </Box>
  );
}
