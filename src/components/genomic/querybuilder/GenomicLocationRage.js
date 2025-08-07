import { Box, Typography } from "@mui/material";
import config from "../../../config/config.json";
import GenomicInputBox from "../GenomicInputBox";
import { mainBoxTypography } from "../styling/genomicInputBoxStyling";

// This component renders the "Genetic Location (Range)" form
// It is used inside the Genomic Query Builder dialog
// It receives the currently selected optional input from the parent component
export default function GenomicLocationRage({
  selectedInput,
  setSelectedInput,
}) {
  return (
    <Box>
      {/* Main container split in two sections: Main and Optional parameters */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 6,
          width: "100%",
        }}
      >
        {/* Left side - Main Parameters (required inputs) */}
        <Box sx={{ width: "30%" }}>
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
            You need to fill in the fields with a (*)
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
              placeholder={config.assemblyId[0]}
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
        <Box sx={{ width: "70%" }}>
          <Typography
            variant="h6"
            sx={{
              ...mainBoxTypography,
              mt: 0,
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            Optional parameters
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
              justifyContent: "space-between",
              borderRadius: "10px",
            }}
          >
            {/* Variation Type dropdown */}
            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="variationType"
                label="Variation Type"
                description="Select the Variation Type"
                placeholder={config.variationType[0]}
                options={config.variationType}
                isSelectable
                isSelected={selectedInput === "variationType"}
                onSelect={() => setSelectedInput("variationType")}
              />
            </Box>

            {/* Bases Change text input */}
            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="basesChange"
                label="Bases Change"
                placeholder="ex. BRAF"
                isSelectable
                isSelected={selectedInput === "basesChange"}
                onSelect={() => setSelectedInput("basesChange")}
              />
            </Box>

            {/* Aminoacid Change text input */}
            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="aminoacidChange"
                label="Aminoacid Change"
                placeholder="ex. BRAF"
                isSelectable
                isSelected={selectedInput === "aminoacidChange"}
                onSelect={() => setSelectedInput("aminoacidChange")}
              />
            </Box>
          </Box>

          {/* Min and Max variant length are not exclusive, both can be filled */}
          <Typography sx={mainBoxTypography}>
            You can add the Variant Length
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              width: "100%",
              justifyContent: "space-between",
              borderRadius: "10px",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="minVariantLength"
                label="Min Variant Length"
                description="Select the Min Variant Length in bases"
                placeholder="ex. 5"
                endAdornmentLabel="Bases"
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="maxVariantLength"
                label="Max Variant Length"
                description="Select the Max Variant Length in bases"
                placeholder="ex. 125"
                endAdornmentLabel="Bases"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
