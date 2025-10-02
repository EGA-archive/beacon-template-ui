import { Box, TextField } from "@mui/material";
import { useField } from "formik";
import { textFieldStyle, FieldLabel } from "../styling/genomicInputBoxStyling";

/*
  BracketRangeFields renders two groups of inputs:
  - Start Min / Start Max
  - End Min / End Max

  Each pair is displayed side-by-side, similar to AminoAcidChangeFields.
*/
export default function BracketRangeFields({ isDisabled }) {
  // Formik fields
  const [startMinField, startMinMeta] = useField("startMin");
  const [startMaxField, startMaxMeta] = useField("startMax");
  const [endMinField, endMinMeta] = useField("endMin");
  const [endMaxField, endMaxMeta] = useField("endMax");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Start Bracket group */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel>Start Min</FieldLabel>
          <TextField
            fullWidth
            {...startMinField}
            error={startMinMeta.touched && Boolean(startMinMeta.error)}
            helperText={startMinMeta.touched && startMinMeta.error}
            placeholder="ex. 5000000"
            disabled={isDisabled}
            sx={textFieldStyle}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel>Start Max</FieldLabel>
          <TextField
            fullWidth
            {...startMaxField}
            error={startMaxMeta.touched && Boolean(startMaxMeta.error)}
            helperText={startMaxMeta.touched && startMaxMeta.error}
            placeholder="ex. 7676592"
            disabled={isDisabled}
            sx={textFieldStyle}
          />
        </Box>
      </Box>

      {/* End Bracket group */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel>End Min</FieldLabel>
          <TextField
            fullWidth
            {...endMinField}
            error={endMinMeta.touched && Boolean(endMinMeta.error)}
            helperText={endMinMeta.touched && endMinMeta.error}
            placeholder="ex. 7669607"
            disabled={isDisabled}
            sx={textFieldStyle}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel>End Max</FieldLabel>
          <TextField
            fullWidth
            {...endMaxField}
            error={endMaxMeta.touched && Boolean(endMaxMeta.error)}
            helperText={endMaxMeta.touched && endMaxMeta.error}
            placeholder="ex. 10000000"
            disabled={isDisabled}
            sx={textFieldStyle}
          />
        </Box>
      </Box>
    </Box>
  );
}
