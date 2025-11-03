import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputBase,
  Button,
  FormControl,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";
import config from "../../config/config.json";
import CancelIcon from "@mui/icons-material/Cancel";

// FilterTermsExtra allows users to add a custom numeric filter
// It provides:
// - a dropdown to select the operator (> = <)
// - an input field to enter the value
// - a "+" button to confirm and add the filter
// - basic validation to prevent empty submissions

export default function FilterTermsExtra() {
  // Access global state and setters from context
  const { extraFilter, setExtraFilter, setSelectedFilter } = useSelectedEntry();

  // Local state to hold operator, input value, and error message
  const [selectedOperator, setSelectedOperator] = useState(">");
  const [selectedValue, setSelectedValue] = useState("");
  const [error, setError] = useState("");

  // Used to scroll the container into view when a new alphanumeric filter is active
  const { valueInputRef } = useSelectedEntry();

  // When a new filter is selected, scroll to this section smoothly
  useEffect(() => {
    if (extraFilter && valueInputRef?.current) {
      valueInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [extraFilter, valueInputRef]);

  // Main function that runs when the "+" button is clicked
  const handleAddFilter = () => {
    setError(""); // clear any previous errors

    // Step 1. If the input is empty, show an error and stop
    if (!selectedValue) {
      setError(COMMON_MESSAGES.fillFields);
      setSelectedValue(""); // clear the input
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Step 2. If there is a value, continue
    setSelectedFilter((prevFilters) => {
      // Create a guaranteed unique key for this new filter
      // This helps avoid problems when deleting or checking duplicates
      const uniqueId = `common-free-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      // Check if this same filter already exists (only for filters of type "alphanumeric")
      const isDuplicate =
        extraFilter.type === "alphanumeric" &&
        prevFilters.some(
          (f) =>
            f.type === "alphanumeric" &&
            f.operator === selectedOperator &&
            f.value === selectedValue &&
            (f.id === extraFilter.id || f.key === extraFilter.key)
        );

      // If it’s a duplicate, show an error, clear the input, and stop
      if (isDuplicate) {
        setError(COMMON_MESSAGES.doubleFilter);
        setSelectedValue("");
        setTimeout(() => setError(""), 3000);
        return prevFilters;
      }

      // Step 3. If no duplicates, create the new filter object
      let formattedOperator = selectedOperator;
      let formattedValue = selectedValue;

      // Handle LIKE and !LIKE (contains / does not contain)
      if (selectedOperator === "LIKE" || selectedOperator === "!LIKE") {
        // Add wildcards if missing
        if (!selectedValue.includes("%")) {
          formattedValue = `%${selectedValue}%`;
        }

        // Normalize operators for backend:
        formattedOperator = selectedOperator === "LIKE" ? "=" : "!";
      }

      const operatorDisplay =
        selectedOperator === "!"
          ? "is not"
          : selectedOperator === "LIKE"
          ? "contains"
          : selectedOperator === "!LIKE"
          ? "does not contain"
          : selectedOperator;

      const extraFilterCustom = {
        id: extraFilter.id,
        key: uniqueId,
        label: `${extraFilter.label} ${operatorDisplay} ${selectedValue}`,
        operator: formattedOperator,
        value: formattedValue,
        scope: extraFilter.scope || null,
        scopes: extraFilter.scopes || [],
        type: extraFilter.type || "alphanumeric",
        originalKey: extraFilter.key,
      };

      // Used to track recently added filters
      const newKey = `${extraFilter.id || uniqueId}-${
        extraFilter.scope || "noScope"
      }`;

      // Update setAddedFilters if it exists for short highlighting effect
      if (extraFilter.setAddedFilters) {
        extraFilter.setAddedFilters((prevSet) => {
          const newSet = new Set(prevSet);
          newSet.add(newKey);

          setTimeout(() => {
            extraFilter.setAddedFilters((current) => {
              const updated = new Set(current);
              updated.delete(newKey);
              return updated;
            });
          }, 3000);

          return newSet;
        });
      }

      // Step 4. Reset all local inputs after successfully adding the filter
      setExtraFilter(null);
      setSelectedOperator(">");
      setSelectedValue("");

      // Add the new filter to the list
      return [...prevFilters, extraFilterCustom];
    });
  };

  // Runs when user clicks the Cancel (X) button
  const handleCancelFilter = () => {
    // Reset local inputs
    setSelectedOperator(">");
    setSelectedValue("");
    setError("");

    // Remove the pending extra filter from global context
    setExtraFilter(null);
  };

  return (
    <Box
      ref={valueInputRef}
      sx={{
        display: "flex",
        gap: 2,
        pt: 2,
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Label */}
      <Box>
        <Typography
          sx={{
            color: "black",
            fontSize: "14px",
            fontFamily: '"Open Sans", sans-serif',
            minWidth: "80px",
          }}
        >
          Insert value for{" "}
          <strong>{extraFilter?.label || extraFilter?.key || "filter"}</strong>:
        </Typography>
      </Box>

      {/* Operator selector */}
      <Box>
        <FormControl
          sx={{
            minWidth: 60,
            border: `1px solid ${config.ui.colors.primary}`,
            borderRadius: "10px",
            transition: "flex 0.3s ease",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSelect-select": {
              padding: "5px 12px",
            },
          }}
          size="small"
        >
          <Select
            labelId="select-value"
            id="select-value"
            value={selectedOperator}
            displayEmpty
            onChange={(e) => setSelectedOperator(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                border: "none",
              },
              "& fieldset": {
                border: "none",
              },
              p: 0,
            }}
          >
            <MenuItem value=">">{">"}</MenuItem>
            <MenuItem value="=">{"="}</MenuItem>
            <MenuItem value="<">{"<"}</MenuItem>
            <MenuItem value="!">{"≠"}</MenuItem>
            <MenuItem value="LIKE">{"contains"}</MenuItem>
            <MenuItem value="!LIKE">{"does not contain"}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {/* Input field for numeric value */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          border: `1.5px solid ${config.ui.colors.primary}`,
          borderRadius: "10px",
          backgroundColor: "#fff",
          transition: "flex 0.3s ease",
          fontFamily: '"Open Sans", sans-serif',
          padding: "1px 12px",
          minWidth: "100px",
        }}
      >
        <InputBase
          placeholder="Value"
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          sx={{
            fontFamily: '"Open Sans", sans-serif',
            fontSize: "14px",
          }}
        />
      </Box>
      {/* Add button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          fontFamily: '"Open Sans", sans-serif',
          padding: "0px",
          maxWidth: "30px",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleAddFilter}
          sx={{
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 400,
            fontFamily: '"Open Sans", sans-serif',
            backgroundColor: "white",
            border: `1px solid ${config.ui.colors.primary}`,
            color: config.ui.colors.primary,
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            minWidth: "30px",
            minHeight: "30px",
            padding: 0,
            "&:hover": {
              backgroundColor: config.ui.colors.primary,
              color: "white",
            },
          }}
        >
          <AddIcon fontSize="small" />
        </Button>

        <CancelIcon
          onClick={handleCancelFilter}
          fontSize="small"
          sx={{
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 400,
            fontFamily: '"Open Sans", sans-serif',
            border: `1px solid #e0e0e0`,
            backgroundColor: "white",
            color: "#9e9e9e",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            minWidth: "30px",
            minHeight: "30px",
            padding: 0,
            "&:hover": {
              backgroundColor: "#8B0000",
              color: "white",
            },
          }}
        />
      </Box>

      {/* Display error message if needed */}
      {error && <CommonMessage text={error} type="error" />}
    </Box>
  );
}
