import { Box, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { useFormikContext } from "formik";
import config from "../../../config/config.json";
import GenomicInputBox from "../GenomicInputBox";
import {
  mainBoxTypography,
  textFieldStyle,
} from "../styling/genomicInputBoxStyling";
import { normalizeVariationType } from "../../genomic/utils/variationType";

export default function GeneIdForm({ selectedInput, setSelectedInput }) {
  const { values, setFieldValue } = useFormikContext();
  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    if (hasAutoSelectedRef.current) return;

    const hasAminoAcidChange =
      values.refAa || values.aaPosition || values.altAa;

    if (hasAminoAcidChange) {
      setSelectedInput("aminoacidChange");
      hasAutoSelectedRef.current = true;
    }
  }, [values.refAa, values.aaPosition, values.altAa, setSelectedInput]);

  const isSNP = normalizeVariationType(values?.variationType) === "SNP";
  const lengthEnabled = !isSNP;
  // Clear stale values when the selected variation type doesn't support length
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
          mt: 2,
          display: "flex",
          "@media (max-width:1108px)": {
            flexDirection: "column",
          },
          gap: 6,
          width: "100%",
        }}
      >
        {/* Left panel: Gene ID */}
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
            containerSx={
              {
                // height: "135px",
              }
            }
          />
        </Box>

        {/* Right panel: Optional mutually exclusive inputs */}
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

          {/* Mutually exclusive inputs */}
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
                name="variationType"
                label="Variation Type"
                description="Select the Variation Type"
                placeholder="Select variation type"
                options={(config?.variationType || []).map((opt) => ({
                  jsonName: opt.jsonName,
                  displayName: opt.displayName,
                }))}
                isSelectable
                isSelected={selectedInput === "variationType"}
                onSelect={() => setSelectedInput("variationType")}
              />
            </Box>
            {config.ui.genomicQueries.genomicQueryBuilder
              .showAlternateBases && (
              <Box sx={{ flex: "1 1 200px" }}>
                <GenomicInputBox
                  variant="gene"
                  name="alternateBases"
                  label="Alternate Bases"
                  isSelectable
                  isSelected={selectedInput === "alternateBases"}
                  onSelect={() => setSelectedInput("alternateBases")}
                />
              </Box>
            )}

            {config.ui.genomicQueries.genomicQueryBuilder
              .showAminoacidChange && (
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

          <Typography sx={mainBoxTypography}>
            You can add the Genomic Location:
          </Typography>

          {/* Genomic location */}
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
                disabled={
                  selectedInput === "variationType" &&
                  values.variationType === "SNP"
                }
              />
            </Box>

            <Box sx={{ flex: "1 1 200px" }}>
              <GenomicInputBox
                name="maxVariantLength"
                label="Max Variant Length"
                description="Select the Max Variant Length in bases"
                placeholder="ex. 125"
                endAdornmentLabel="Bases"
                disabled={
                  selectedInput === "variationType" &&
                  values.variationType === "SNP"
                }
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
