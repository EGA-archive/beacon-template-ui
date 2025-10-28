import { Box, TextField } from "@mui/material";
import BaseInputBox from "./BaseInputBox";
import { useField } from "formik";
import { textFieldStyle, FieldLabel } from "../styling/genomicInputBoxStyling";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

/*
AlternateBasesFields displays two text inputs side-by-side:
  1. Ref. Bases (e.g. "A")
  2. Alt. Bases (e.g. "T")

  It connects both inputs to Formik, supports validation, 
  and uses BaseInputBox to reduce code repetition.
*/
export default function AlternateBasesFields({
  isDisabled, // global toggle to disable inputs
  customRefLabel, // optional custom label for Ref
  customAltLabel, // optional custom label for Alt
  customRefPlaceholder, // optional placeholder for Ref
  customAltPlaceholder, // optional placeholder for Alt
  customPaddingTop, // optional spacing above arrow icon
  variant = "sequence",
  isInactiveSelectable,
  isUnavailable,
}) {
  // Connect Ref. Base input to Formik
  const [refField, refMeta] = useField("refBases");

  // Connect Alt. Base input to Formik
  const [altField, altMeta] = useField("alternateBases");

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {/* Case 1: Sequence Query */}
      {variant === "sequence" && (
        <>
          <BaseInputBox
            fieldProps={refField}
            metaProps={refMeta}
            label={customRefLabel || "Reference Bases"}
            placeholder={customRefPlaceholder || "ex. T"}
            isDisabled={isDisabled}
            isInactiveSelectable={isInactiveSelectable}
            isUnavailable={isUnavailable}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              pt: customPaddingTop || "8%",
            }}
          >
            <KeyboardArrowRightIcon sx={{ color: "#999", fontSize: "24px" }} />
          </Box>
        </>
      )}

      {/* Case 2: Gene ID / Range Query */}
      {variant === "gene" || variant === "range" ? (
        <BaseInputBox
          fieldProps={altField}
          metaProps={altMeta}
          label={customAltLabel || "Enter the Alternate Bases"}
          placeholder={customAltPlaceholder || "Ex. G"}
          isDisabled={isDisabled}
          isInactiveSelectable={isInactiveSelectable}
          isUnavailable={isUnavailable}
        />
      ) : (
        <BaseInputBox
          fieldProps={altField}
          metaProps={altMeta}
          label={customAltLabel || "Enter the Alternate Bases"}
          placeholder={customAltPlaceholder || "Ex. G"}
          isDisabled={isDisabled}
          isInactiveSelectable={isInactiveSelectable}
          isUnavailable={isUnavailable}
        />
      )}
    </Box>
  );
}
