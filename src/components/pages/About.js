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
 * About page for the Beacon instance or network.
 * Fetches info from the Beacon API and displays dynamic metadata.
 */

export default function About() {
  const [serviceInfo, setServiceInfo] = useState(null);
  const [beaconInfo, setBeaconInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: fetch Beacon network members
  useEffect(() => {
    const fetchAboutInfo = async () => {
      try {
        const [serviceRes, infoRes] = await Promise.all([
          fetch(`${config.apiUrl}/service-info`),
          fetch(`${config.apiUrl}/info`),
        ]);

        const serviceData = await serviceRes.json();
        const infoData = await infoRes.json();

        setServiceInfo(serviceData);
        setBeaconInfo(infoData);
      } catch (error) {
        console.error("Error fetching about page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutInfo();
  }, []);

  const title = serviceInfo?.name || "Beacon Service";
  const description = serviceInfo?.description || "No description provided.";
  const contactUrl = serviceInfo?.contactUrl;
  const version = serviceInfo?.version;
  const organization = beaconInfo?.organization?.name || "Unknown organization";
  const logoUrl = beaconInfo?.response?.organization?.logoUrl || null;

  return (
    <>
      <Box
        sx={{
          mt: "90px",
          p: "2rem",
          pt: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* Page title */}
        <Box sx={{ width: "80%" }}>
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
          {logoUrl && (
            <Box
              sx={{ mt: 1, display: "flex", justifyContent: "flex-end", mb: 3 }}
            >
              <img
                src={logoUrl}
                alt={`${organization} logo`}
                style={{
                  width: 130,
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          <Box>
            <Typography sx={{ fontWeight: 400, fontSize: "14px" }}>
              {description}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
