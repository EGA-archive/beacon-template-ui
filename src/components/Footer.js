import { Box, Typography, Link as MuiLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

// Logos of institutions providing the UI
import maingrey from "../assets/logos/maingrey.svg";
import crg from "../assets/logos/crg.svg";
import bsc from "../assets/logos/bsc.svg";

// Footer component for the Beacon UI
// Displays logos and dynamic navigation links
// Responsive layout handled with MUI's sx and media queries
export default function Footer({ navItems }) {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#eee",
        py: 2,
        px: 4,
        minHeight: "68px",
        mt: "auto", // Push footer to bottom if using flex layout
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "column", md: "row" }, // Stack on small screens
          "@media (max-width: 1044px) and (min-width: 900px)": {
            flexDirection: "column", // Force column in awkward mid-breakpoint
          },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mr: 1,
        }}
      >
        {/* Left side: logos and credits */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 2, md: 3 },
            "@media (max-width: 1044px) and (min-width: 721px)": {
              gap: 6,
            },
            "@media (max-width: 648px) and (min-width:633px)": {
              gap: 4,
            },
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            color="black"
            sx={{
              fontSize: {
                xs: "12px",
                sm: "14px",
              },
              "@media (max-width: 648px) and (min-width:600px)": {
                fontSize: "12px",
              },
            }}
          >
            Beacon User Interface template provided by:
          </Typography>

          {/* Logos with external links */}
          <MuiLink
            href="https://ega-archive.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={maingrey} alt="EGA Logo" style={{ height: 34 }} />
          </MuiLink>

          <MuiLink
            href="https://www.crg.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={crg} alt="CRG Logo" style={{ height: 34 }} />
          </MuiLink>

          <MuiLink
            href="https://www.bsc.es/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={bsc} alt="BSC Logo" style={{ height: 34 }} />
          </MuiLink>
        </Box>

        {/* Right side: optional nav links (internal or external) */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {navItems
            .filter((item) => item.label && item.label.trim() !== "") // Skip empty labels
            .map((item) =>
              item.url && item.url.startsWith("http") ? (
                // External link
                <MuiLink
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                  sx={{
                    fontFamily: '"Open Sans", sans-serif',
                    fontSize: "14px",
                    "@media (max-width: 452px)": {
                      fontSize: "12px",
                    },
                    color: "#333",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {item.label}
                </MuiLink>
              ) : (
                // Internal link using React Router
                <MuiLink
                  key={item.label}
                  component={RouterLink}
                  to={item.url}
                  underline="none"
                  sx={{
                    fontFamily: '"Open Sans", sans-serif',
                    fontSize: "14px",
                    "@media (max-width: 452px)": {
                      fontSize: "12px",
                    },
                    color: "#333",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {item.label}
                </MuiLink>
              )
            )}
        </Box>
      </Box>
    </Box>
  );
}
