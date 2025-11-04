import { Box, Typography, Grid } from "@mui/material";
import config from "../../config/config.json";

/**
 * About page for the Beacon instance or network.
 * Uses config.json to render About info: logos, descriptions, etc.
 */

export default function About() {
  const logos = config.ui.about?.logos || [];
  const descriptions = config.ui.about?.descriptions || [];
  const secondTitle = config.ui.about?.fundingOrgs?.[0]?.title || "";
  const secondaryLogos = config.ui.about?.fundingOrgs?.[0]?.logos || [];

  return (
    <>
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

          {/* Logos row */}
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
                  <Box
                    component="img"
                    src={logo}
                    alt={`About logo ${index + 1}`}
                    sx={{
                      maxWidth: "120px",
                      maxHeight: "55px",
                      width: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      console.warn(`⚠️ Failed to load logo: ${logo}`);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </Grid>
              ))}
          </Grid>

          {/* Descriptions */}
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
          {/* Logos row */}
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
                  <Box
                    component="img"
                    src={logo}
                    alt={`Funding org logo ${index + 1}`}
                    sx={{
                      maxWidth: "150px",
                      width: "100%",
                      maxHeight: "55px",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      console.warn(`⚠️ Failed to load logo: ${logo}`);
                      e.currentTarget.style.display = "none";
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
