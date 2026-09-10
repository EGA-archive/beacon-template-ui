import { useState } from "react";
import {
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import config from "../../../config/runtimeConfig";
import { alpha } from "@mui/material/styles";

export default function DownloadTablePopover({ handleExport }) {
  const colors = config.ui.colors;
  const primaryColor = colors.primary;
  const hoverBg = alpha(primaryColor, 0.15);

  const [downloadMode, setDownloadMode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
    if (!isOpen) {
      setDownloadMode("");
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        zIndex: "999",
        position: "relative",
      }}
    >
      {isOpen && (
        <ClickAwayListener
          onClickAway={() => {
            if (!isDownloading) {
              handleClose();
            }
          }}
        >
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
              disabled={isDownloading}
              onChange={async (e) => {
                const selectedMode = e.target.value;

                setDownloadMode(selectedMode);
                setIsDownloading(true);

                // Close popup immediately so only the button remains visible
                handleClose();

                try {
                  await handleExport(selectedMode);
                } catch (error) {
                  console.error("Download failed:", error);
                } finally {
                  setIsDownloading(false);
                  setDownloadMode("");
                }
              }}
            >
              <FormControlLabel
                value="view"
                control={<Radio sx={radioStyle} />}
                label={
                  <Box>
                    {" "}
                    <Typography sx={optionTitleStyle}>
                      Download View{" "}
                    </Typography>
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
        </ClickAwayListener>
      )}

      <Button
        variant="outlined"
        fullWidth
        onClick={handleButtonClick}
        disabled={isDownloading}
        startIcon={
          isDownloading ? (
            <CircularProgress
              size={16}
              sx={{
                color: "white",
              }}
            />
          ) : (
            <DownloadRoundedIcon />
          )
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
          width: {
            xs: "160px",
            sm: "170px",
            md: "170px",
            lg: "237px",
          },
          "&:hover": {
            backgroundColor: isOpen ? colors.darkPrimary : hoverBg,
            borderColor: colors.darkPrimary,
          },
          "&.Mui-disabled": {
            backgroundColor: colors.darkPrimary,
            borderColor: colors.darkPrimary,
            color: "white",
            cursor: "not-allowed",
            pointerEvents: "all",
          },
        }}
      >
        {isDownloading
          ? `Downloading Table (${downloadMode === "all" ? "All" : "View"})`
          : downloadMode
          ? `Download Table (${downloadMode === "all" ? "All" : "View"})`
          : "Download Table"}
      </Button>
    </Box>
  );
}
