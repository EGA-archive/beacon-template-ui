import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { useFormikContext } from "formik";
import config from "../../../config/config.json";
import GenomicInputBox from "../GenomicInputBox";
import { mainBoxTypography } from "../styling/genomicInputBoxStyling";
import { normalizeVariationType } from "../../genomic/utils/variationType";

// This component renders the "Genetic Location (Range)" form
// It is used inside the Genomic Query Builder dialog
// It receives the currently selected optional input from the parent component
export default function GenomicLocationRage({
  selectedInput,
  setSelectedInput,
}) {
  const { values, setFieldValue } = useFormikContext();

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
      {/* Main container split in two sections: Main and Optional parameters */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 6,
          width: "100%",
          "@media (max-width:1095px)": {
            flexDirection: "column",
          },
        }}
      >
        {/* Left side - Main Parameters (required inputs) */}
        <Box
          sx={{
            width: "30%",
            "@media (max-width:1095px)": {
              width: "100%",
            },
          }}
        >
          {/* Title and helper text */}
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

          {/* Required fields like assemblyId, chromosome, start and end */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}
          >
            {/* Dropdown for Assembly ID */}
            <GenomicInputBox
              name="assemblyId"
              label="Assembly ID"
              placeholder="Select Assembly ID"
              options={config.assemblyId}
              required={true}
            />

            {/* Text input for Chromosome */}
            <GenomicInputBox
              name="chromosome"
              label="Chromosome"
              placeholder="ex. Chr 1 (NC_000001.11)"
              required={true}
            />

            {/* Start and End fields rendered side-by-side */}
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
                  required={true}
                  placeholder="ex. 7572837"
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: "120px" }}>
                <GenomicInputBox
                  name="end"
                  label="End"
                  required={true}
                  placeholder="ex. 7578641"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right side - Optional Parameters (select only one of the three mutually exclusive ones) */}
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

          {/* Optional inputs: only one should be selected at a time */}
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
            {/* Variation Type dropdown */}
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

            {/* Bases Change text input */}
            {config.ui.genomicQueries.genomicQueryBuilder
              .showAlternateBases && (
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
            )}

            {/* Aminoacid Change text input */}
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

          {/* Min and Max variant length are not exclusive, both can be filled */}
          <Typography sx={mainBoxTypography}>
            You can add the Variant Length:
          </Typography>

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
