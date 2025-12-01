import { Box, Typography, Grid } from "@mui/material";
import config from "../../config/config.json";
import { logosHelper } from "../../lib/logosHelper";

/**
 * About page for the Beacon or Beacon Network.
 * Reads all content (logos, descriptions, funding orgs) from config.json.
 */
export default function About() {
  // Primary logos shown at top (supports external + static paths)
  const logos = config.ui.about?.logos || [];

  // List of paragraph descriptions supporting <b> tags
  const descriptions = config.ui.about?.descriptions || [];

  // Funding organizations title + secondary logos
  const secondTitle = config.ui.about?.fundingOrgs?.[0]?.title || "";
  const secondaryLogos = config.ui.about?.fundingOrgs?.[0]?.logos || [];

  return (
    <>
      {/* Main container with padding and centered content */}
      <Box
        sx={{
          mt: 5,
          mb: 5,
          p: "2rem",
          pt: 7,
          display: "flex",
          justifyContent: "center",
          backgroundColor: "white",
          borderRadius: 3,
        }}
      >
        {/* Limits content width for cleaner layout */}
        <Box sx={{ width: "80%" }}>
          {/* Page title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: "16px",
              color: config.ui.colors.primary,
            }}
          >
            About
          </Typography>

          {/* Row of primary logos */}
          <Grid
            container
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
            sx={{ mt: 2, mb: 3 }}
          >
            {logos
              .filter((logo) => typeof logo === "string" && logo.trim() !== "")
              .map((logo, index) => (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  key={`primary-logo-${index}`}
                  sx={{ textAlign: "center" }}
                >
                  {/* Logo images */}
                  <Box
                    component="img"
                    src={logosHelper(logo)}
                    alt={`About logo ${index + 1}`}
                    sx={{
                      maxWidth: "120px",
                      maxHeight: "55px",
                      width: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none"; // hide broken logos
                    }}
                  />
                </Grid>
              ))}
          </Grid>

          {/* Descriptions section */}
          <Box>
            {descriptions.map((text, index) => (
              <Typography
                key={index}
                sx={{
                  fontWeight: 400,
                  fontSize: "14px",
                  mb: 2,
                  textAlign: "justify",
                  "& b, & strong": {
                    color: config.ui.colors.primary,
                    fontWeight: 700,
                  },
                }}
                dangerouslySetInnerHTML={{ __html: text }}
              ></Typography>
            ))}
          </Box>

          {/* Funding organizations title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mt: 6,
              fontSize: "16px",
              color: config.ui.colors.primary,
            }}
          >
            {secondTitle}
          </Typography>

          {/* Secondary logos row */}
          <Grid
            container
            spacing={{
              xs: 4,
              sm: 4,
              md: 8,
              lg: 14,
            }}
            justifyContent="center"
            alignItems="center"
            sx={{
              mt: 2,
              mb: 3,
            }}
          >
            {secondaryLogos
              .filter((logo) => typeof logo === "string" && logo.trim() !== "")
              .map((logo, index) => (
                <Grid
                  item
                  xs={12}
                  sm={4}
                  key={`secondary-logo-${index}`}
                  sx={{ textAlign: "center" }}
                >
                  {/* Funding org logo */}
                  <Box
                    component="img"
                    src={logosHelper(logo)}
                    alt={`Funding org logo ${index + 1}`}
                    sx={{
                      maxWidth: "150px",
                      width: "100%",
                      maxHeight: "55px",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none"; // remove broken images
                    }}
                  />
                </Grid>
              ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
