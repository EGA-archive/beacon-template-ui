// Reusable form input component for text fields with labels
// Integrates with Formik for value, error, and touched state handling
// Supports optional multiline input

import { Box, Typography, TextField } from "@mui/material";

export default function FormTextField({
  label, // Label text shown above the field
  name, // Field name (used by Formik for value + validation)
  placeholder, // Placeholder text inside the input
  multiline = false, // Enables multiline (textarea-like) field
  minRows = 1, // Minimum number of rows if multiline is enabled
  formik, // Formik object for value, error, and event handlers
  sx = {}, // Optional custom styles for label and text field
}) {
  return (
    // Container for label + input, stacked vertically with spacing
    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {/* Field label with styling, allowing override via sx.label */}
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 700,
          color: "#1E88E5", // fallback color if none is passed via sx
          ...sx.label, // allows custom label styles via props
        }}
      >
        {label}
      </Typography>

      {/* MUI TextField bound to Formik form state */}
      <TextField
        fullWidth
        name={name}
        placeholder={placeholder}
        multiline={multiline} // enables textarea mode if true
        minRows={minRows} // applies only when multiline is true
        value={formik.values[name]} // controlled input via Formik
        onChange={formik.handleChange} // update value on change
        onBlur={formik.handleBlur} // mark field as "touched"
        error={formik.touched[name] && Boolean(formik.errors[name])} // show red border if touched + error
        helperText={formik.touched[name] && formik.errors[name]} // show error message below input
        sx={sx.textField} // allows custom styling from parent
      />
    </Box>
  );
}
