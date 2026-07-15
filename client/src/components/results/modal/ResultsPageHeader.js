import { Box, Button, Typography } from "@mui/material";
import LocalPostOfficeOutlinedIcon from "@mui/icons-material/LocalPostOfficeOutlined";
import ChevronRight from "../../../assets/logos/chevron-right.svg";
import FilterLabelRemovable from "../../styling/FilterLabelRemovable";
import { formatEntryLabel } from "../../common/textFormatting";
import config from "../../../config/config.json";

export default function ResultsPageHeader({
  pageTitle,
  beaconName,
  datasetName,
  appliedQuery,
  showContactOwner = true,
  onContactOwner,
}) {
  const darkPrimaryColor = config.ui.colors.darkPrimary;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: 2,
          //   backgroundColor: {
          //     lg: "lightsalmon",
          //     md: "pink",
          //     sm: "lightgreen",
          //     xs: "lightblue",
          //   },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            rowGap: 0.5,
            mb: 2,
            flex: 1,
            minWidth: 0,
            fontSize: {
              xs: "12px",
              sm: "13px",
              md: "14px",
              lg: "16px",
            },
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "12px",
                sm: "13px",
                md: "14px",
                lg: "16px",
              },
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Results
          </Typography>

          <img
            src={ChevronRight}
            alt="breadcrumb separator"
            style={{
              width: "7px",
              height: "12px",
            }}
          />

          <Typography
            sx={{
              fontSize: {
                xs: "12px",
                sm: "13px",
                md: "14px",
                lg: "16px",
              },
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {pageTitle}
          </Typography>

          {config.beaconType === "networkBeacon" && (
            <>
              <Typography
                sx={{
                  fontSize: {
                    xs: "12px",
                    sm: "13px",
                    md: "14px",
                    lg: "16px",
                  },
                  fontWeight: 700,
                }}
              >
                |
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: "12px",
                    sm: "13px",
                    md: "14px",
                    lg: "16px",
                  },
                  whiteSpace: "nowrap",
                }}
              >
                Beacon: <b>{beaconName || "—"}</b>
              </Typography>
            </>
          )}

          <Typography
            sx={{
              fontSize: {
                xs: "12px",
                sm: "13px",
                md: "14px",
                lg: "16px",
              },
              fontWeight: 700,
            }}
          >
            |
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: "12px",
                sm: "13px",
                md: "14px",
                lg: "16px",
              },
              whiteSpace: "nowrap",
            }}
          >
            Dataset: <b>{datasetName || "—"}</b>
          </Typography>
        </Box>

        {showContactOwner && (
          <Button
            type="button"
            variant="outlined"
            aria-label="Contact Owner"
            startIcon={<LocalPostOfficeOutlinedIcon />}
            onClick={onContactOwner}
            sx={(theme) => ({
              width: "176px",
              height: "39px",
              minWidth: "176px",
              flexShrink: 0,
              borderRadius: "999px",
              borderColor: darkPrimaryColor,
              color: darkPrimaryColor,
              textTransform: "none",
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "12px",
              fontWeight: 400,
              px: 2,
              backgroundColor: "transparent",
              transition: "background-color 0.2s ease, border-color 0.2s ease",

              "& .MuiButton-startIcon": {
                mr: 1.5,
              },

              "& .MuiSvgIcon-root": {
                fontSize: "24px",
              },

              "& .contact-owner-label": {
                display: "inline",
              },

              "@media (max-width: 1316px)": {
                width: "48px",
                minWidth: "48px",
                px: 0,

                "& .MuiButton-startIcon": {
                  m: 0,
                },

                "& .contact-owner-label": {
                  display: "none",
                },
              },

              [theme.breakpoints.down("md")]: {
                width: "38px",
                minWidth: "38px",
                height: "34px",

                "& .MuiSvgIcon-root": {
                  fontSize: "20px",
                },
              },

              "&:hover": {
                borderColor: darkPrimaryColor,
                backgroundColor: `${darkPrimaryColor}0D`,
              },

              "&:focus-visible": {
                outline: `2px solid ${darkPrimaryColor}`,
                outlineOffset: "2px",
              },
            })}
          >
            <Box component="span" className="contact-owner-label">
              Contact Owner
            </Box>
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "14px",
          }}
        >
          Applied Query:
        </Typography>

        <FilterLabelRemovable
          variant="simple"
          label={formatEntryLabel(appliedQuery?.entryType)}
          scope="entryType"
        />

        {appliedQuery?.filters?.map((filter, index) => (
          <FilterLabelRemovable
            key={index}
            disableTooltip
            disableClick
            variant="simple"
            label={filter.label}
            type={filter.type}
            scope={filter.scope}
            scopes={filter.scopes}
            queryType={filter.queryType}
            queryParams={filter.queryParams}
            bgColor={filter.bgColor || "common"}
          />
        ))}
      </Box>
    </>
  );
}
