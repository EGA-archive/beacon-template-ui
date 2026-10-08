import { Box, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { useFormikContext } from "formik";
import config from "../../../config/runtimeConfig";
import GenomicInputBox from "../GenomicInputBox";
import { mainBoxTypography } from "../styling/genomicInputBoxStyling";
import { normalizeVariantType } from "../utils/variantType";

/**
 * GeneIdForm
 *
 * Renders the Gene ID section of the Genomic Query Builder (GQB).
 *
 * Primary responsibilities:
 * - Require a Gene ID as the main query parameter.
 * - Allow the user to select one optional genomic parameter:
 *   Variant Type, Alternate Bases, or Aminoacid Change.
 * - Optionally allow minimum and maximum variant length values.
 * - Disable and clear variant length fields when the selected
 *   Variant Type is SNP, since length is not applicable.
 * - Automatically select Aminoacid Change when amino-acid values
 *   are already present in the form.
 */
export default function GeneIdForm({ selectedInput, setSelectedInput }) {
  const { values, setFieldValue } = useFormikContext();

  // Prevents the Aminoacid Change input from being auto-selected
  // repeatedly after the initial detection.
  const hasAutoSelectedRef = useRef(false);

  /**
   * If amino-acid values already exist in the form, automatically
   * select the Aminoacid Change input.
   *
   * This is useful when reopening or restoring an existing genomic query.
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
   * normalizeVariantType is used here so the check remains reliable
   * regardless of how the Variant Type value is represented internally.
   */
  const isSNP = normalizeVariantType(values?.variatType) === "SNP";
  const lengthEnabled = !isSNP;

  /**
   * Clear any existing length values when Variant Type changes to SNP.
   * This prevents stale unsupported values from remaining in the query.
   */
  useEffect(() => {
    if (!lengthEnabled) {
      setFieldValue("minVariantLength", "");
      setFieldValue("maxVariantLength", "");
    }
  }, [lengthEnabled, setFieldValue]);

  return (
    <Box>
      <Box
        sx={{
          mt: 0,
          display: "flex",
          "@media (max-width:1108px)": {
            flexDirection: "column",
          },
          gap: 6,
          width: "100%",
        }}
      >
        {/* Main required query parameter: Gene ID */}
        <Box
          sx={{
            width: "30%",
            "@media (max-width:1108px)": {
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

          <Typography
            sx={{
              ...mainBoxTypography,
              mt: 0,
            }}
          >
            Required (*)
          </Typography>

          <GenomicInputBox
            name="geneId"
            label="Gene ID"
            placeholder="ex. BRAF"
            required
          />
        </Box>

        {/* Optional query parameters and genomic location */}
        <Box
          sx={{
            width: "70%",
            "@media (max-width:1108px)": {
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

          <Typography
            sx={{
              ...mainBoxTypography,
              mt: 0,
            }}
          >
            Please select one:
          </Typography>

          {/* Mutually exclusive optional query inputs */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              width: "100%",
              borderRadius: "10px",
              flexWrap: "wrap",
            }}
          >
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
              mt: 2,
              mb: 1,
            }}
          >
            You can add the Genomic Location:
          </Typography>

          {/* Optional genomic location constraints */}
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
