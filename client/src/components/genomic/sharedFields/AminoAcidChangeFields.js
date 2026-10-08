import { useState } from "react";
import { Box, Select, MenuItem, TextField } from "@mui/material";
import { useFormikContext, useField } from "formik";
import config from "../../../config/runtimeConfig";
import {
  selectStyle,
  textFieldStyle,
  FieldLabel,
} from "../styling/genomicInputBoxStyling";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import {
  getCompatibleAltAminoAcids,
  isAltAminoAcidCompatible,
} from "./aminoAcidUtils";

/*
  This component renders the Amino Acid Change fields in the Genomic Query Builder.

  The deployer controls whether this input is available and which amino-acid
  notations are supported through the configuration.

  It includes:
  1. Ref AA (Reference Amino Acid) dropdown.
  2. Position numeric input.
  3. Alt AA (Alternate Amino Acid) dropdown.

  Ref AA and Alt AA may contain the same amino acid.
  Alt AA options follow the notation format selected in Ref AA.
  Custom deployer values remain available.
*/

export default function AminoAcidChangeFields({
  isDisabled,
  isInactiveSelectable,
  isUnavailable,
}) {
  const { values, setFieldValue } = useFormikContext();
  const [positionField, aaPositionMeta] = useField("aaPosition");
  const [refAaField] = useField("refAa");
  const [altAaField, altAaMeta] = useField("altAa");
  const [openSelect, setOpenSelect] = useState(null);

  // The amino acid list from configuration
  const aminoAcidList = config.ui.genomicQueries.aminoAcidNotation || [];

  // Alt AA follows the notation selected in Ref AA.
  // Custom deployer values remain available.
  const altAminoAcidList = getCompatibleAltAminoAcids(
    values.refAa,
    aminoAcidList
  );

  return (
    <Box sx={{ width: "100%" }}>
      {/* Inline row containing all input fields */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Reference Amino Acid (Ref AA) dropdown */}
        <Box sx={{ flex: 1 }}>
          <FieldLabel
            isInactiveSelectable={isInactiveSelectable}
            isUnavailable={isUnavailable}
          >
            Ref AA
          </FieldLabel>
          <Select
            fullWidth
            {...refAaField}
            value={values.refAa || ""}
            onChange={(e) => {
              const newRefAa = e.target.value;
              setFieldValue("refAa", newRefAa);
              if (
                values.altAa &&
                !isAltAminoAcidCompatible(newRefAa, values.altAa, aminoAcidList)
              ) {
                setFieldValue("altAa", "");
              }
            }}
            onBlur={() => refAaField.onBlur({ target: { name: "refAa" } })}
            onOpen={() => setOpenSelect("ref")}
            onClose={() => setOpenSelect(null)}
            disabled={isDisabled}
            IconComponent={
              openSelect === "ref"
                ? KeyboardArrowUpRoundedIcon
                : KeyboardArrowRightRoundedIcon
            }
            sx={selectStyle}
          >
            {aminoAcidList.map((aa) => (
              <MenuItem key={aa} value={aa} sx={{ fontSize: "12px" }}>
                {aa}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Amino Acid Position (numeric input) */}
        <Box sx={{ flex: 1 }}>
          <FieldLabel
            isInactiveSelectable={isInactiveSelectable}
            isUnavailable={isUnavailable}
          >
            Position
          </FieldLabel>
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

        {/* Alternate Amino Acid (Alt AA) dropdown */}
        <Box sx={{ flex: 1 }}>
          <FieldLabel
            isInactiveSelectable={isInactiveSelectable}
            isUnavailable={isUnavailable}
          >
            Alt AA
          </FieldLabel>
          <Select
            fullWidth
            {...altAaField}
            value={values.altAa || ""}
            onChange={(e) => setFieldValue("altAa", e.target.value)}
            onBlur={() => altAaField.onBlur({ target: { name: "altAa" } })}
            onOpen={() => setOpenSelect("alt")}
            onClose={() => setOpenSelect(null)}
            disabled={isDisabled}
            IconComponent={
              openSelect === "alt"
                ? KeyboardArrowUpRoundedIcon
                : KeyboardArrowRightRoundedIcon
            }
            sx={selectStyle}
          >
            {altAminoAcidList.map((aa) => (
              <MenuItem key={aa} value={aa} sx={{ fontSize: "12px" }}>
                {aa}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Validation message for Alt AA full-width of the row */}
      {altAaMeta.touched && altAaMeta.error && (
        <Box
          sx={{
            width: "100%",
            fontSize: "12px",
            mt: 0.5,
            textAlign: "left",
          }}
        >
          {altAaMeta.error}
        </Box>
      )}
    </Box>
  );
}
