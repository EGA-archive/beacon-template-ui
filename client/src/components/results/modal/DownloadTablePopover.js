import { useState } from "react";
import {
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import config from "../../../config/config.json";
import { alpha } from "@mui/material/styles";

export default function DownloadTablePopover({ handleExport }) {
  const colors = config.ui.colors;
  const primaryColor = colors.primary;
  const hoverBg = alpha(primaryColor, 0.15);

  const [downloadMode, setDownloadMode] = useState("view");
  const [isOpen, setIsOpen] = useState(false);

  const radioStyle = {
    color: "white",
    "&.Mui-checked": {
      color: "white",
    },
  };

  const optionTitleStyle = {
    fontSize: "12px",
    fontWeight: 400,
  };

  const optionSubtitleStyle = {
    fontSize: "12px",
    fontWeight: 400,
    opacity: 0.8,
    fontStyle: "italic",
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: "240px",
        position: "relative",
      }}
    >
      {isOpen && (
        <Box
          sx={{
            position: "absolute",
            bottom: "40px",
            left: 0,
            right: 0,

            backgroundColor: colors.darkPrimary,
            color: "white",

            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",

            px: 2,
            py: 2,

            zIndex: 10,
          }}
        >
          <RadioGroup
            value={downloadMode}
            // onChange={(e) => {
            //   const selectedMode = e.target.value;

            //   setDownloadMode(selectedMode);

            //   console.log("Selected download mode:", selectedMode);

            //   handleExport(selectedMode);

            //   handleClose();
            // }}
            onChange={(e) => {
              const selectedMode = e.target.value;

              setDownloadMode(selectedMode);

              handleExport(selectedMode);

              handleClose();
            }}
          >
            <FormControlLabel
              value="view"
              control={<Radio sx={radioStyle} />}
              label={
                <Box>
                  {" "}
                  <Typography sx={optionTitleStyle}>Download View </Typography>
                  <Typography sx={optionSubtitleStyle}>
                    Selected columns
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              value="all"
              control={<Radio sx={radioStyle} />}
              label={
                <Box>
                  <Typography sx={optionTitleStyle}>Download All</Typography>

                  <Typography sx={optionSubtitleStyle}>
                    It can take a few minutes
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </Box>
      )}

      <Button
        variant="outlined"
        fullWidth
        onClick={handleButtonClick}
        startIcon={
          <DownloadRoundedIcon
            sx={{
              color: isOpen ? "white" : colors.darkPrimary,
            }}
          />
        }
        sx={{
          borderRadius: isOpen ? "0 0 24px 24px" : "24px",

          backgroundColor: isOpen ? colors.darkPrimary : "white",

          borderColor: colors.darkPrimary,

          color: isOpen ? "white" : colors.darkPrimary,

          textTransform: "none",

          fontSize: "12px",
          fontWeight: 400,

          height: "40px",

          "&:hover": {
            backgroundColor: isOpen ? colors.darkPrimary : hoverBg,
            borderColor: colors.darkPrimary,
          },
        }}
      >
        Download Table
      </Button>
    </Box>
  );
}
