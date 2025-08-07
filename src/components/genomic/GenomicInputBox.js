import { Box, TextField, Select, MenuItem, Typography } from "@mui/material";
import { useField } from "formik";
import config from "../../config/config.json";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  selectStyle,
  textFieldStyle,
  FieldLabel,
  FieldHeader,
} from "./styling/genomicInputBoxStyling";
import AminoAcidChangeFields from "./sharedFields/AminoAcidChangeFields";
import BasesChangeFields from "./sharedFields/BasesChangeFields";

/**
 * This is a reusable input component tailored for genomic query building.
 * Dynamically renders a TextField, Select, or customized components
 * like `BasesChangeFields` or `AminoAcidChangeFields` based on the `name` or passed props.
 **/
export default function GenomicInputBox({
  name,
  label,
  placeholder,
  description,
  required = false,
  options = [],
  isSelectable = false,
  isSelected = false,
  onSelect = () => {},
  endAdornmentLabel = "",
  customRefLabel,
  customAltLabel,
  customRefPlaceholder,
  customAltPlaceholder,
  customPaddingTop,
}) {
  // Connect this field to Formik (value, error, helpers)
  const [field, meta, helpers] = useField(name);
  // Show error only if user touched the field
  const error = meta.touched && meta.error;
  // Main color imported from the config.file
  const primaryDarkColor = config.ui.colors.darkPrimary;
  // Disable input if it's selectable but not the active one
  const isDisabled = isSelectable && !isSelected;

  // This function returns different field types based on input name or options
  const renderFieldByType = () => {
    // Show custom fields if name is "basesChange"
    if (name === "basesChange") {
      return (
        <BasesChangeFields
          isDisabled={isDisabled}
          customRefLabel={customRefLabel}
          customAltLabel={customAltLabel}
          customRefPlaceholder={customRefPlaceholder}
          customAltPlaceholder={customAltPlaceholder}
          customPaddingTop={customPaddingTop}
        />
      );
    }
    // Show custom fields if name is "aminoacidChange"
    if (name === "aminoacidChange")
      return <AminoAcidChangeFields isDisabled={isDisabled} />;
    // If the input requires options, then it renders a dropdown menu
    if (options.length > 0) {
      return (
        <Select
          fullWidth
          IconComponent={KeyboardArrowDownIcon}
          displayEmpty
          {...field}
          onChange={(e) => helpers.setValue(e.target.value)} // Update Formik value
          error={!!error}
          disabled={isDisabled}
          sx={{
            ...selectStyle,
            "& .MuiSelect-select": {
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
              color: field.value ? config.ui.colors.darkPrimary : "#999",
              padding: "12px 16px",
            },
          }}
          renderValue={(selected) =>
            selected ? (
              selected
            ) : (
              <span
                style={{
                  fontFamily: '"Open Sans", sans-serif',
                  fontSize: "14px",
                  color: "#999",
                }}
              >
                {placeholder}
              </span>
            )
          }
        >
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option} value={option} sx={{ fontSize: "12px" }}>
              {option}
            </MenuItem>
          ))}
        </Select>
      );
    }

    // Default case: render a standard text field
    return (
      <TextField
        fullWidth
        placeholder={placeholder}
        {...field}
        error={!!error}
        helperText={error}
        disabled={isDisabled}
        sx={textFieldStyle}
        InputProps={{
          endAdornment: endAdornmentLabel ? (
            <Typography
              sx={{
                fontSize: "12px",
                color: primaryDarkColor,
                fontFamily: '"Open Sans", sans-serif',
                mr: 1,
              }}
            >
              {endAdornmentLabel}
            </Typography>
          ) : null,
        }}
      />
    );
  };

  // Final return: wrapper box with label and dynamic input
  return (
    <Box
      sx={{
        border: `1px solid ${primaryDarkColor}`,
        borderRadius: "10px",
        padding: "12px",
        backgroundColor: isDisabled ? "#F0F0F0" : "white",
        opacity: isDisabled ? 0.5 : 1,
      }}
    >
      {/* Top label + optional select logic */}
      <FieldHeader
        label={label}
        required={required}
        isSelectable={isSelectable}
        isSelected={isSelected}
        onSelect={onSelect}
      />
      {/* Optional description */}
      {description && <FieldLabel>{description}</FieldLabel>}
      {/* Render the correct input */}
      {renderFieldByType()}
    </Box>
  );
}
