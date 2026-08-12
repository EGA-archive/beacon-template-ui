import { Box, Button, Typography } from "@mui/material";
import LocalPostOfficeOutlinedIcon from "@mui/icons-material/LocalPostOfficeOutlined";

import ChevronRight from "../../../assets/logos/chevron-right.svg";
import FilterLabelRemovable from "../../styling/FilterLabelRemovable";
import { formatEntryLabel } from "../../common/textFormatting";
import config from "../../../config/runtimeConfig";

const breadcrumbFontSize = {
  xs: "12px",
  sm: "13px",
  md: "14px",
  lg: "16px",
};

/**
 * Beacon contact metadata may contain an email, mailto link, or URL.
 */
const getContactHref = (contact) => {
  if (!contact) return null;

  if (
    contact.startsWith("mailto:") ||
    contact.startsWith("http://") ||
    contact.startsWith("https://")
  ) {
    return contact;
  }

  return `mailto:${contact}`;
};

export default function ResultsPageHeader({
  pageTitle,
  beaconName,
  datasetName,
  appliedQuery,
  showContactOwner = true,
  onContactOwner,
  contactEmail,
}) {
  const darkPrimaryColor = config.ui.colors.darkPrimary;
  const contactHref = getContactHref(contactEmail);

  const handleContactOwner = () => {
    if (contactHref) {
      window.open(contactHref, "_blank", "noopener,noreferrer");
      return;
    }

    onContactOwner?.();
  };

  return (
    <>
      {/* Breadcrumb and contact control */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: 2,
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
          }}
        >
          <Typography
            sx={{
              fontSize: breadcrumbFontSize,
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
              fontSize: breadcrumbFontSize,
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
                  fontSize: breadcrumbFontSize,
                  fontWeight: 700,
                }}
              >
                |
              </Typography>

              <Typography
                sx={{
                  fontSize: breadcrumbFontSize,
                  whiteSpace: "nowrap",
                }}
              >
                Beacon: <b>{beaconName || "—"}</b>
              </Typography>
            </>
          )}

          <Typography
            sx={{
              fontSize: breadcrumbFontSize,
              fontWeight: 700,
            }}
          >
            |
          </Typography>

          <Typography
            sx={{
              fontSize: breadcrumbFontSize,
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
            onClick={handleContactOwner}
            disabled={!contactHref && !onContactOwner}
            sx={(theme) => ({
              width: "176px",
              minWidth: "176px",
              height: "39px",
              flexShrink: 0,
              px: 2,

              borderRadius: "999px",
              borderColor: darkPrimaryColor,
              color: darkPrimaryColor,
              backgroundColor: "transparent",

              textTransform: "none",
              fontFamily: '"Open Sans", sans-serif',
              fontSize: "12px",
              fontWeight: 400,

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

              // Collapse to an icon-only contact button.
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

      {/* Each chip is its own flex item.
          When space runs out, the whole chip moves to the next row
          instead of squeezing its text into a narrow column. */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          columnGap: 2,
          rowGap: 1,
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "14px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Applied Query:
        </Typography>

        <FilterLabelRemovable
          variant="simple"
          label={formatEntryLabel(appliedQuery?.entryType)}
          scope="entryType"
          preventWrap
        />

        {appliedQuery?.filters?.map((filter, index) => (
          <FilterLabelRemovable
            key={index}
            disableTooltip
            disableClick
            preventWrap
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
