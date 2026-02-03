import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import { Grid } from "@mui/material";
import { darken } from "@mui/system";
import { useEffect, useState } from "react";
import config from "../../config/config.json";
import Founders from "../Founders";

/**
 * Generic UI page to display a list of Beacon network members.
 * Fetches Beacon data from the configured API endpoint.
 * Renders each Beacon inside a responsive card layout.
 * Shows logos, metadata, descriptions, and useful action links.
 */

export default function NetworkMembers() {
  const [beacons, setBeacons] = useState([]);
  const [networkLogoUrl, setNetworkLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Utility: remove unwanted HTML tags from descriptions
  const stripHTML = (html) => html?.replace(/<[^>]*>/g, "") || "";

  // On mount: fetch Beacon network members
  useEffect(() => {
    const fetchBeacons = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/`);
        const data = await response.json();

        // Save top-level network logo
        setNetworkLogoUrl(data?.response?.organization?.logoUrl || null);

        // Use "responses" array from the API if present
        if (data.responses && Array.isArray(data.responses)) {
          setBeacons(data.responses);
        } else {
          setBeacons([]);
        }
      } catch (error) {
        console.error("Error fetching beacon networks:", error);
        setBeacons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBeacons();
  }, []);

  return (
    <>
      {/* Renders founders on top, configured in the config file */}
      <Founders />

      {/* Main container for the page */}
      <Box
        sx={{
          p: "2rem",
          pt: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Page title */}
        <Box sx={{ width: "90%", maxWidth: 1200 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 700,
              fontSize: "16px",
              color: config.ui.colors.primary,
            }}
          >
            Beacon Network Members
          </Typography>

          {/* Loading state */}
          {loading && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Loading beacons...
            </Typography>
          )}

          {/* Empty state */}
          {!loading && beacons.length === 0 && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              No beacon networks found.
            </Typography>
          )}

          {/* Beacons rendered as cards in a grid */}
          <Grid container spacing={3}>
            {beacons.map((beacon, index) => {
              // Extract data safely with fallbacks
              const beaconName = beacon?.response?.name || "Undefined";
              const beaconDescription = stripHTML(
                beacon?.response?.description || "No description available"
              );
              const beaconOrganization =
                beacon.response.organization?.name || "Undefined";

              // Define external links (fallbacks where missing)
              const informationLink =
                beacon.response.welcomeUrl || beacon.response.alternativeUrl;
              const websiteLink =
                beacon.response.organization?.welcomeUrl ||
                beacon.response.alternativeUrl;
              const beaconApiLink =
                beacon.response.alternativeUrl || beacon.response.welcomeUrl;
              const contactLink =
                beacon.response.organization?.contactUrl || "#";
              const beaconEnvironment = beacon.response.environment;

              const actionLinks = [
                // { label: "Information", link: informationLink },
                { label: "Website", link: websiteLink },
                { label: "Beacon API", link: beaconApiLink },
                { label: "Contact", link: contactLink },
              ].filter(
                ({ link }) => typeof link === "string" && link.trim() !== ""
              );

              return (
                <Grid
                  key={index}
                  data-cy="network-beacon-card"
                  size={{ xs: 12, md: 6 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      boxShadow: 3,
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    {/* Left side: Beacon + network logos */}
                    <Box
                      sx={{
                        width: 100,
                        minWidth: 100,
                        display: "flex",
                        justifyContent: "flex-start",
                        flexDirection: "column",
                        borderRadius: 1,
                        mr: 2,
                        gap: 2,
                        p: 2,
                      }}
                    >
                      {beacon?.response?.organization?.logoUrl ? (
                        <Box
                          component="img"
                          src={beacon.response.organization.logoUrl}
                          alt={`${beaconName} logo`}
                          onError={(e) => (e.target.style.display = "none")}
                          sx={{
                            width: 100,
                            height: "auto",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "10px",
                            textAlign: "center",
                            color: "#888",
                          }}
                        >
                          No Logo
                        </Typography>
                      )}

                      {/* Shared network logo (from API, not hardcoded) */}
                      {networkLogoUrl && (
                        <Box
                          component="img"
                          src={networkLogoUrl}
                          alt="Network Logo"
                          sx={{
                            width: 100,
                            height: "auto",
                            objectFit: "contain",
                          }}
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                    </Box>

                    {/* Right side: Beacon details */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        flex: 1,
                      }}
                    >
                      {/* Metadata (API version + Beacon name) */}
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: 2,
                            alignItems: "start",
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Chip
                              label={` API version: ${
                                beacon?.meta?.apiVersion || "Undefined"
                              }`}
                              color="primary"
                              size="small"
                              sx={{
                                borderRadius: "4px",
                                backgroundColor: config.ui.colors.primary,
                              }}
                            />
                            <Chip
                              label={`Environment: ${
                                beaconEnvironment || "Undefined"
                              }`}
                              color="primary"
                              size="small"
                              sx={{
                                borderRadius: "4px",
                                backgroundColor: config.ui.colors.primary,
                              }}
                            />
                          </Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color: "black",
                              fontSize: "14px",
                            }}
                          >
                            {beaconName}
                          </Typography>
                        </Box>

                        {/* Organization name */}
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, mb: 2, fontSize: "14px" }}
                        >
                          {beaconOrganization}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "12px", mb: 2 }}
                        >
                          {beaconDescription}
                        </Typography>
                      </CardContent>

                      {/* Action buttons (links) */}
                      <CardActions
                        sx={{
                          flexWrap: "wrap",
                          gap: 1,
                          px: 2,
                          pb: 2,
                        }}
                      >
                        {actionLinks.map(({ label, link }) => (
                          <Button
                            key={label}
                            variant="outlined"
                            size="small"
                            component="a"
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              borderRadius: "999px",
                              fontWeight: 700,
                              textTransform: "none",
                              fontFamily: '"Open Sans", sans-serif',
                              fontSize: "12px",
                              backgroundColor: "#FFFFFF",
                              color: config.ui.colors.primary,
                              border: `1px solid ${config.ui.colors.primary}`,
                              boxShadow: "none",
                              marginLeft: "0px !important",
                              "&:hover": {
                                backgroundColor: darken("#FFFFFF", 0.05),
                              },
                            }}
                          >
                            {label}
                          </Button>
                        ))}
                      </CardActions>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
