import { Box, TextField } from "@mui/material";
import { textFieldStyle, FieldLabel } from "../styling/genomicInputBoxStyling";

/*
  BaseInputBox is a reusable building block for rendering a labeled input field.
  - It displays a label (e.g., "Ref. Bases", "Alt. Bases", "Start Min", etc.)
  - Shows validation errors if any
  - Applies consistent styling
*/
export default function BaseInputBox({
  fieldProps, // field bindings from Formik (e.g., name, value, onChange)
  metaProps, // metadata from Formik (e.g., error, touched)
  label, // label to show above the input
  placeholder, // placeholder text for the input field
  isDisabled, // whether the field is disabled
}) {
  return (
    <Box sx={{ width: "100%" }}>
      <FieldLabel>{label}</FieldLabel>
      <TextField
        {...fieldProps}
        error={metaProps.touched && Boolean(metaProps.error)}
        helperText={metaProps.touched && metaProps.error}
        placeholder={placeholder}
        disabled={isDisabled}
        sx={{ ...textFieldStyle, width: "100%" }}
      />
    </Box>
  );
}
