import { Box, Select, MenuItem, TextField } from "@mui/material";
import { useFormikContext, useField } from "formik";
import {
  VALID_SINGLE_CODES,
  VALID_THREE_LETTER,
} from "../../common/textFormatting";
import {
  selectStyle,
  textFieldStyle,
  FieldLabel,
} from "../styling/genomicInputBoxStyling";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

/* 
 This component renders three input fields:
 1. Ref AA (Reference Amino Acid) - dropdown
 2. Position - number-only input
 3. Alt AA (Alternate Amino Acid) - dropdown

 It checks the format of Ref and Alt (1-letter or 3-letter),
 and only shows valid matching amino acid options in the dropdowns.
*/

export default function AminoAcidChangeFields({ isDisabled }) {
  // Get access to values coming from the form and a function to update them
  const { values, setFieldValue } = useFormikContext();

  // Connects the 'aaPosition' field to Formik so we can manage its value and show validation errors
  const [positionField, aaPositionMeta] = useField("aaPosition");

  // Determine what type of code (1-letter or 3-letter) was selected for Ref AA based on user's choice
  const refIsThreeLetter = VALID_THREE_LETTER.includes(values.refAa);
  const refIsOneLetter = VALID_SINGLE_CODES.includes(values.refAa);

  // Determine what type of code was selected in Alt AA, used if Ref AA is empty
  const altIsThreeLetter = VALID_THREE_LETTER.includes(values.altAa);
  const altIsOneLetter = VALID_SINGLE_CODES.includes(values.altAa);

  // Generate the Alt AA options to match Ref AA format
  const altAminoAcidOptions = refIsThreeLetter
    ? VALID_THREE_LETTER
    : refIsOneLetter
    ? VALID_SINGLE_CODES
    : [...VALID_SINGLE_CODES, ...VALID_THREE_LETTER]; // if Ref AA is empty or invalid then both lists are shown

  // Generate the Ref AA options to match Alt AA format if Ref AA is empty
  const refAminoAcidOptions = [...VALID_SINGLE_CODES, ...VALID_THREE_LETTER]
    .filter((aa) => !["*", "X", "Ter"].includes(aa)) // Ref AA options should exclude invalid values (*, X, Ter)
    .filter((aa) =>
      values.refAa
        ? true
        : altIsThreeLetter
        ? VALID_THREE_LETTER.includes(aa)
        : altIsOneLetter
        ? VALID_SINGLE_CODES.includes(aa)
        : true
    );

  return (
    // Wrapper box for the 3 fields, aligned horizontally
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {/* REF AA dropdown */}
      <Box sx={{ flex: 1 }}>
        <FieldLabel>Ref AA</FieldLabel>
        <Select
          fullWidth
          value={values.refAa || ""}
          onChange={(e) => setFieldValue("refAa", e.target.value)}
          disabled={isDisabled}
          IconComponent={KeyboardArrowDownIcon}
          sx={selectStyle}
        >
          {refAminoAcidOptions.map((aa) => (
            // For each valid Ref AA option, create a dropdown item
            <MenuItem key={aa} value={aa} sx={{ fontSize: "12px" }}>
              {aa}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Position input */}
      <Box sx={{ flex: 1 }}>
        <FieldLabel>Position</FieldLabel>
        <TextField
          fullWidth
          {...positionField}
          error={aaPositionMeta.touched && Boolean(aaPositionMeta.error)}
          helperText={aaPositionMeta.touched && aaPositionMeta.error}
          placeholder="600"
          disabled={isDisabled}
          sx={textFieldStyle}
        />
      </Box>

      {/* ALT AA dropdown */}
      <Box sx={{ flex: 1 }}>
        <FieldLabel>Alt AA</FieldLabel>
        <Select
          fullWidth
          value={values.altAa || ""}
          onChange={(e) => setFieldValue("altAa", e.target.value)}
          disabled={isDisabled}
          IconComponent={KeyboardArrowDownIcon}
          sx={selectStyle}
        >
          {altAminoAcidOptions.map((aa) => (
            // For each valid Alt AA option, create a dropdown item
            <MenuItem key={aa} value={aa} sx={{ fontSize: "12px" }}>
              {aa}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}
