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
import AlternateBasesFields from "./sharedFields/AlternateBasesFields";
import BracketRangeFields from "./sharedFields/BracketRangeFields";

/**
 * This is a reusable input component tailored for genomic query building.
 * Dynamically renders a TextField, Select, or customized components
 * like `Alternate BasesFields` or `AminoAcidChangeFields` based on the `name` or passed props.
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
  disabled = false,
  variant,
  containerSx,
}) {
  // Connect this field to Formik (value, error, helpers)
  const [field, meta, helpers] = useField(name);

  // Show error only if user touched the field
  const error = meta.touched && meta.error;
  // Main color imported from the config.file
  const primaryDarkColor = config.ui.colors.darkPrimary;
  // Disable input if it's selectable but not the active one
  const isDisabled = (isSelectable && !isSelected) || disabled;

  // Differentiate unavailable (disabled) vs inactive (selectable but not chosen)
  const isUnavailable = disabled; // explicitly passed from parent (e.g. SNP logic)
  const isInactiveSelectable = isSelectable && !isSelected && !disabled;

  // This function returns different field types based on input name or options
  const renderFieldByType = () => {
    // Show custom fields if name is "alternateBases"
    if (name === "alternateBases") {
      return (
        <AlternateBasesFields
          field={field}
          meta={meta}
          helpers={helpers}
          isDisabled={isDisabled}
          isInactiveSelectable={isInactiveSelectable}
          isUnavailable={isUnavailable}
          customRefLabel={customRefLabel}
          customAltLabel={customAltLabel}
          customRefPlaceholder={customRefPlaceholder}
          customAltPlaceholder={customAltPlaceholder}
          customPaddingTop={customPaddingTop}
          variant={variant}
        />
      );
    }
    // Show custom fields if name is "aminoacidChange"
    if (name === "aminoacidChange")
      return (
        <AminoAcidChangeFields
          isDisabled={isDisabled}
          isInactiveSelectable={isInactiveSelectable}
          isUnavailable={isUnavailable}
        />
      );
    if (name === "braketRangeFields")
      return <BracketRangeFields isDisabled={isDisabled} />;

    const normalizedOptions = options.map((opt) =>
      typeof opt === "string" ? { jsonName: opt, displayName: opt } : opt
    );
    // If the input requires options, then it renders a dropdown menu
    if (normalizedOptions.length > 0) {
      return (
        <Select
          fullWidth
          IconComponent={KeyboardArrowDownIcon}
          displayEmpty
          value={field.value}
          onChange={(e) => helpers.setValue(e.target.value)}
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
              normalizedOptions.find((o) => o.jsonName === selected)
                ?.displayName || selected
            ) : (
              <span style={{ color: "#999" }}>{placeholder}</span>
            )
          }
        >
          <MenuItem value="" sx={{ fontSize: "12px" }}>
            {placeholder}
          </MenuItem>
          {normalizedOptions.map((option) => (
            <MenuItem
              key={option.jsonName}
              value={option.jsonName}
              sx={{ fontSize: "12px" }}
            >
              {option.displayName}
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
        height: "auto",
        border: `1px solid ${
          isUnavailable
            ? "#E0E0E0" // pale border for unavailable
            : isInactiveSelectable
            ? "#BDBDBD" // medium gray for inactive (clickable)
            : primaryDarkColor // normal active border
        }`,

        borderRadius: "10px",
        padding: "12px",
        backgroundColor: isUnavailable
          ? "#F5F5F5" // light gray for unavailable
          : isInactiveSelectable
          ? "#FAFAFA" // softer gray for inactive selectable
          : "white",
        opacity: isUnavailable ? 0.4 : 1,
        cursor: isInactiveSelectable ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": isInactiveSelectable
          ? {
              borderColor: primaryDarkColor,
              backgroundColor: "#fff",
            }
          : {},
        ...(containerSx || {}),
      }}
      onClick={() => {
        if (isInactiveSelectable) onSelect(); // make selectable boxes clickable
      }}
    >
      {/* Top label + optional select logic */}
      <FieldHeader
        label={label}
        required={required}
        isSelectable={isSelectable}
        isSelected={isSelected}
        onSelect={onSelect}
        isInactiveSelectable={isInactiveSelectable}
        isUnavailable={isUnavailable}
      />
      {/* Optional description */}
      {description && (
        <FieldLabel
          isInactiveSelectable={isInactiveSelectable}
          isUnavailable={isUnavailable}
        >
          {description}
        </FieldLabel>
      )}
      {/* Render the correct input */}
      {renderFieldByType()}
    </Box>
  );
}
