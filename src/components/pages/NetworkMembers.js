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

export default function NetworkMembers() {
  const [beacons, setBeacons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: remove HTML tags from descriptions
  const stripHTML = (html) => html?.replace(/<[^>]*>/g, "") || "";

  // Fetch data on mount
  useEffect(() => {
    const fetchBeacons = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/`);
        const data = await response.json();

        // We take the "responses" array from your API
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
      <Founders />
      <Box
        sx={{
          p: "2rem",
          pt: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
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

          {/* Loader */}
          {loading && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Loading beacons...
            </Typography>
          )}

          {/* No beacons */}
          {!loading && beacons.length === 0 && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              No beacon networks found.
            </Typography>
          )}

          {/* Beacons grid */}
          <Grid container spacing={3}>
            {beacons.map((beacon, index) => {
              const beaconName = beacon?.response?.name || "Undefined";
              const beaconDescription = stripHTML(
                beacon?.response?.description || "No description available"
              );
              const beaconOrganization =
                beacon.response.organization?.name || "Undefined";

              // Define links for the buttons
              const informationLink =
                beacon.response.welcomeUrl || beacon.response.alternativeUrl;
              const websiteLink =
                beacon.response.organization?.welcomeUrl ||
                beacon.response.alternativeUrl;
              const beaconApiLink =
                beacon.response.alternativeUrl || beacon.response.welcomeUrl;
              const contactLink =
                beacon.response.organization?.contactUrl || "#";

              return (
                <Grid key={index} size={{ xs: 12, md: 6 }}>
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
                    <Box
                      sx={{
                        width: 120,
                        minWidth: 120,
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
                            width: 120,
                            height: "auto",
                            objectFit: "cotain",
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
                      <Box
                        component="img"
                        src="https://cancerimage.eu/wp-content/uploads/2023/03/exilir-logo-2.png"
                        alt="ELIXIR Network Logo"
                        sx={{
                          width: 120,
                          height: "auto",
                          objectFit: "contain",
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        flex: 1,
                      }}
                    >
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
                          <Chip
                            label={beacon?.meta?.apiVersion || "Undefined"}
                            color="primary"
                            size="small"
                            sx={{
                              borderRadius: "4px",
                              backgroundColor: config.ui.colors.primary,
                            }}
                          />
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

                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, mb: 2, fontSize: "14px" }}
                        >
                          {beaconOrganization}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{ fontSize: "12px", mb: 2 }}
                        >
                          {beaconDescription}
                        </Typography>
                      </CardContent>
                      <CardActions
                        sx={{
                          flexWrap: "wrap",
                          gap: 1,
                          px: 2,
                          pb: 2,
                        }}
                      >
                        {[
                          { label: "Information", link: informationLink },
                          { label: "Website", link: websiteLink },
                          { label: "Beacon API", link: beaconApiLink },
                          { label: "Contact", link: contactLink },
                        ].map(({ label, link }) => (
                          <Button
                            key={label}
                            variant="outlined"
                            size="small"
                            component="a"
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            disabled={!link || link === "#"}
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
