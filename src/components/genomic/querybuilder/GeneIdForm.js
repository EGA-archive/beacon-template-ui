import { Box, Typography } from "@mui/material";
import config from "../../../config/config.json";
import GenomicInputBox from "../GenomicInputBox";
import { mainBoxTypography } from "../styling/genomicInputBoxStyling";

export default function GeneIdForm({ selectedInput, setSelectedInput }) {
  return (
    <Box>
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 6,
          width: "100%",
        }}
      >
        {/* Left panel: Gene ID */}
        <Box sx={{ width: "30%" }}>
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
          <Typography sx={mainBoxTypography}>
            You need to fill in the fields with a (*)
          </Typography>
          <GenomicInputBox
            name="geneId"
            label="Gene ID"
            placeholder="ex. BRAF"
            required
          />
        </Box>

        {/* Right panel: Optional mutually exclusive inputs */}
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
          <Typography sx={mainBoxTypography}>Please select one:</Typography>

          {/* Mutually exclusive inputs */}
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

            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="basesChange"
                label="Bases Change"
                isSelectable
                isSelected={selectedInput === "basesChange"}
                onSelect={() => setSelectedInput("basesChange")}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="aminoacidChange"
                label="Aminoacid Change"
                isSelectable
                isSelected={selectedInput === "aminoacidChange"}
                onSelect={() => setSelectedInput("aminoacidChange")}
              />
            </Box>
          </Box>

          <Typography sx={mainBoxTypography}>
            You can add the Genomic Location
          </Typography>

          {/* Genomic location */}
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
                name="assemblyId"
                label="Assembly ID"
                description="Select the reference genome:"
                placeholder={config.assemblyId[0]}
                options={config.assemblyId}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="start"
                label="Start"
                description="Add the location start:"
                placeholder="ex. 7572837"
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <GenomicInputBox
                name="end"
                label="End"
                description="Add the location end:"
                placeholder="ex. 7578641"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
