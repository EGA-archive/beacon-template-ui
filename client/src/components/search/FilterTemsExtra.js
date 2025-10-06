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
import { useEffect, useRef, useState } from "react";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import CommonMessage, { COMMON_MESSAGES } from "../common/CommonMessage";
import config from "../../config/config.json";

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

  const containerRef = useRef(null);

  useEffect(() => {
    if (extraFilter && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [extraFilter]);

  // Function to validate and add the new filter
  const handleAddFilter = () => {
    setError("");
    if (!selectedValue) {
      setError(COMMON_MESSAGES.fillFields);
    } else {
      setSelectedFilter((prevFilters) => {
        if (prevFilters.some((filter) => filter.key === extraFilter.key)) {
          return prevFilters;
        }

        const extraFilterCustom = {
          id: extraFilter.id,
          key: extraFilter.key,
          label: `${extraFilter.label} ${selectedOperator} ${selectedValue}`,
          operator: selectedOperator,
          value: selectedValue,
          scope: extraFilter.scope || null,
          scopes: extraFilter.scopes || [],
          type: extraFilter.type || "alphanumeric",
        };

        console.log("extraFilterCustom ", extraFilterCustom);

        const newKey = `${extraFilter.id || extraFilter.key}-${
          extraFilter.scope || "noScope"
        }`;

        console.log("newKey", newKey);

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

        setExtraFilter(null);
        setSelectedOperator(">");
        setSelectedValue("");

        return [...prevFilters, extraFilterCustom];
      });
    }
  };

  return (
    <Box
      ref={containerRef}
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
      </Box>

      {/* Display error message if needed */}
      {error && <CommonMessage text={error} type="error" />}
    </Box>
  );
}
