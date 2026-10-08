import { Box, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { useFormikContext } from "formik";
import config from "../../../config/runtimeConfig";
import GenomicInputBox from "../GenomicInputBox";
import { mainBoxTypography } from "../styling/genomicInputBoxStyling";
import { normalizeVariantType } from "../utils/variantType";

/**
 * GenomicLocationRage
 *
 * Renders the "Genomic Location (Range)" form used inside the
 * Genomic Query Builder.
 *
 * Primary responsibilities:
 * - Require Assembly ID, Chromosome, Start, and End coordinates.
 * - Allow the user to select one optional genomic parameter:
 *   Variant Type, Alternate Bases, or Aminoacid Change.
 * - Allow optional minimum and maximum variant length values.
 * - Disable and clear variant length fields when the selected
 *   Variant Type is SNP, since length is not applicable.
 * - Automatically select Aminoacid Change when amino-acid values
 *   are already present in the form.
 */
export default function GenomicLocationRage({
  selectedInput,
  setSelectedInput,
}) {
  const { values, setFieldValue } = useFormikContext();

  // Prevent the Aminoacid Change input from being auto-selected repeatedly.
  const hasAutoSelectedRef = useRef(false);

  /**
   * If amino-acid values already exist in the form, automatically
   * select the Aminoacid Change input.
   *
   * This is useful when reopening or restoring an existing query.
   */
  useEffect(() => {
    if (hasAutoSelectedRef.current) return;

    const hasAminoAcidChange =
      values.refAa || values.aaPosition || values.altAa;

    if (hasAminoAcidChange) {
      setSelectedInput("aminoacidChange");
      hasAutoSelectedRef.current = true;
    }
  }, [values.refAa, values.aaPosition, values.altAa, setSelectedInput]);

  /**
   * SNP queries do not support variant length.
   *
   * normalizeVariantType keeps this check reliable regardless
   * of how the Variant Type value is represented internally.
   */
  const isSNP = normalizeVariantType(values?.variantType) === "SNP";
  const lengthEnabled = !isSNP;

  /**
   * Clear any existing variant length values when the selected
   * Variant Type does not support them.
   */
  useEffect(() => {
    if (!lengthEnabled) {
      setFieldValue("minVariantLength", "");
      setFieldValue("maxVariantLength", "");
    }
  }, [lengthEnabled, setFieldValue]);

  return (
    <Box>
      {/* Main responsive layout: required parameters on the left,
          optional parameters on the right */}
      <Box
        sx={{
          mt: 0,
          display: "flex",
          gap: 6,
          width: "100%",
          "@media (max-width:1095px)": {
            flexDirection: "column",
          },
        }}
      >
        {/* Required genomic location parameters */}
        <Box
          sx={{
            width: "30%",
            "@media (max-width:1095px)": {
              width: "100%",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              ...mainBoxTypography,
              mt: 0,
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Main Parameters
          </Typography>

          <Typography sx={{ ...mainBoxTypography, mt: 0 }}>
            Required (*)
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}
          >
            {/* Reference genome assembly */}
            <GenomicInputBox
              name="assemblyId"
              label="Assembly ID"
              placeholder="Select Assembly ID"
              options={config.assemblyId}
              required
            />

            {/* Chromosome */}
            <GenomicInputBox
              name="chromosome"
              label="Chromosome"
              placeholder="ex. 22"
              required
            />

            {/* Exact genomic start and end coordinates */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ flex: 1, minWidth: "120px" }}>
                <GenomicInputBox
                  name="start"
                  label="Start"
                  required
                  placeholder="ex. 7572837"
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: "120px" }}>
                <GenomicInputBox
                  name="end"
                  label="End"
                  required
                  placeholder="ex. 7578641"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Optional genomic query parameters */}
        <Box
          sx={{
            width: "70%",
            "@media (max-width:1095px)": {
              width: "100%",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              ...mainBoxTypography,
              mt: 0,
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Optional Parameters
          </Typography>

          <Typography sx={{ ...mainBoxTypography, mt: 0 }}>
            Please select one:
          </Typography>

          {/* Mutually exclusive optional inputs */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              width: "100%",
              flexWrap: "wrap",
              borderRadius: "10px",
            }}
          >
            {/* Variant Type dropdown */}
            <Box sx={{ flex: "1 1 200px" }}>
              <GenomicInputBox
                name="variantType"
                label="Variant Type"
                description="Select the Variant Type"
                placeholder="Select variant type"
                options={config?.variantType || []}
                isSelectable
                isSelected={selectedInput === "variantType"}
                onSelect={() => setSelectedInput("variantType")}
              />
            </Box>

            {/* Alternate Bases */}
            <Box sx={{ flex: "1 1 200px" }}>
              <GenomicInputBox
                variant="range"
                name="alternateBases"
                label="Alternate Bases"
                isSelectable
                isSelected={selectedInput === "alternateBases"}
                onSelect={() => setSelectedInput("alternateBases")}
              />
            </Box>

            {/* Aminoacid Change */}
            {config.ui.genomicQueries.queryByAminoacidChange && (
              <Box sx={{ flex: "1 1 200px" }}>
                <GenomicInputBox
                  name="aminoacidChange"
                  label="Aminoacid Change"
                  isSelectable
                  isSelected={selectedInput === "aminoacidChange"}
                  onSelect={() => setSelectedInput("aminoacidChange")}
                />
              </Box>
            )}
          </Box>

          <Typography
            sx={{
              ...mainBoxTypography,
              mt: 7.5,
            }}
          >
            You can add the Variant Length:
          </Typography>

          {/* Optional variant length range */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              width: "100%",
              flexWrap: "wrap",
              borderRadius: "10px",
            }}
          >
            <Box sx={{ flex: "1 1 200px" }}>
              <GenomicInputBox
                name="minVariantLength"
                label="Min Variant Length"
                description="Select the Min Variant Length in bases"
                placeholder="ex. 5"
                endAdornmentLabel="Bases"
                disabled={!lengthEnabled}
              />
            </Box>

            <Box sx={{ flex: "1 1 200px" }}>
              <GenomicInputBox
                name="maxVariantLength"
                label="Max Variant Length"
                description="Select the Max Variant Length in bases"
                placeholder="ex. 125"
                endAdornmentLabel="Bases"
                disabled={!lengthEnabled}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
