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

  // Automatically focuses the input when genomic input becomes active
  useEffect(() => {
    if (activeInput === "genomic" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeInput]);

  // Function to add the current genomicDraft to the selected filters
  const commitGenomicDraft = () => {
    const val = (genomicDraft || "").trim(); // Clean up the input
    console.log("💡 Genomic draft submitted:", val);
    if (!val) return; // Don't do anything if it's empty

    console.log("🧪 Current selectedFilter array:", selectedFilter);

    // Check if this exact value already exists in the filters
    const isDuplicate = selectedFilter.some(
      (f) => f.label.trim().toLowerCase() === val.toLowerCase()
    );

    // If it's a duplicate, show an error message and return
    if (isDuplicate) {
      setMessage(COMMON_MESSAGES.doubleValue);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Generate a unique ID for the new filter
    const uniqueId = `genomic-free-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    // Create the new filter object
    const newGenomicFilter = {
      id: uniqueId,
      key: uniqueId,
      label: val,
      scope: "genomicQuery",
      bgColor: "genomic",
    };

    console.log("✅ Adding new genomic filter:", newGenomicFilter);
    // Add the new filter to the list
    setSelectedFilter((prev) => [...prev, newGenomicFilter]);
    setGenomicDraft(""); // Clear the input field
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
            placeholder="Search by Genomic Query"
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
            Add the genomic query: <b>{genomicDraft}</b>
          </Box>

          {/* Show duplicate error message if necessary */}
          {message === COMMON_MESSAGES.doubleValue && (
            <CommonMessage text={message} type="error" />
          )}
        </Box>
      )}
    </Box>
  );
}
