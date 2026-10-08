import { useState } from "react";
import { Box, TextField, Select, MenuItem, Typography } from "@mui/material";
import { useField } from "formik";
import config from "../../config/runtimeConfig";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
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
 * GenomicInputBox
 *
 * Reusable input component for the Genomic Query Builder.
 *
 * Primary responsibilities:
 * - Connect each genomic input to Formik.
 * - Render the appropriate field type depending on the input:
 *   standard text field, dropdown, Alternate Bases, Aminoacid Change,
 *   or Bracket Range.
 * - Handle selectable/inactive fields used by mutually exclusive query options.
 * - Apply consistent styling, validation, disabled states, and descriptions.
 *
 * Dropdown options are expected as a simple array of strings.
 */
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
  // Connect this field to Formik.
  const [field, meta, helpers] = useField(name);

  // Tracks whether a Select dropdown is currently open.
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Only display Formik errors after the user has interacted with the field.
  const error = meta.touched && meta.error;

  // Main UI color defined in the runtime configuration.
  const primaryDarkColor = config.ui.colors.darkPrimary;

  // Selectable fields are disabled until they become the active option.
  const isDisabled = (isSelectable && !isSelected) || disabled;

  // Differentiate between:
  // - unavailable fields disabled by query logic
  // - selectable fields that are simply not currently selected
  const isUnavailable = disabled;
  const isInactiveSelectable = isSelectable && !isSelected && !disabled;

  /**
   * Renders the appropriate input depending on the field type.
   */
  const renderFieldByType = () => {
    // Custom Alternate Bases input.
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

    // Custom Aminoacid Change input.
    if (name === "aminoacidChange") {
      return (
        <AminoAcidChangeFields
          isDisabled={isDisabled}
          isInactiveSelectable={isInactiveSelectable}
          isUnavailable={isUnavailable}
        />
      );
    }

    // Custom approximate genomic position input.
    if (name === "braketRangeFields") {
      return <BracketRangeFields isDisabled={isDisabled} />;
    }

    // Render a dropdown when options are provided.
    if (options.length > 0) {
      return (
        <Select
          fullWidth
          IconComponent={
            isOptionsOpen
              ? KeyboardArrowUpRoundedIcon
              : KeyboardArrowRightRoundedIcon
          }
          displayEmpty
          value={field.value}
          onChange={(e) => helpers.setValue(e.target.value)}
          onOpen={() => setIsOptionsOpen(true)}
          onClose={() => setIsOptionsOpen(false)}
          error={!!error}
          disabled={isDisabled}
          sx={{
            ...selectStyle,
            "& .MuiSelect-select": {
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "14px",
              color: field.value ? primaryDarkColor : "#999",
              padding: "12px 16px",
            },
          }}
          renderValue={(selected) =>
            selected ? (
              selected
            ) : (
              <span style={{ color: "#999" }}>{placeholder}</span>
            )
          }
        >
          <MenuItem value="" sx={{ fontSize: "12px" }}>
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

    // Default input type.
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

  return (
    <Box
      sx={{
        height: "auto",
        border: `${required ? 2 : 1}px solid ${
          isUnavailable
            ? "#E0E0E0"
            : isInactiveSelectable
            ? "#BDBDBD"
            : primaryDarkColor
        }`,
        borderRadius: "10px",
        padding: "12px",
        backgroundColor: isUnavailable
          ? "#F5F5F5"
          : isInactiveSelectable
          ? "#FAFAFA"
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
        if (isInactiveSelectable) {
          onSelect();
        }
      }}
    >
      {/* Field title and selectable-state control */}
      <FieldHeader
        label={label}
        required={required}
        isSelectable={isSelectable}
        isSelected={isSelected}
        onSelect={onSelect}
        isInactiveSelectable={isInactiveSelectable}
        isUnavailable={isUnavailable}
      />

      {/* Optional helper description */}
      {description && (
        <FieldLabel
          isInactiveSelectable={isInactiveSelectable}
          isUnavailable={isUnavailable}
        >
          {description}
        </FieldLabel>
      )}

      {/* Render the appropriate field */}
      {renderFieldByType()}
    </Box>
  );
}
