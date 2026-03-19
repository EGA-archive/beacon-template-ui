import { Box } from "@mui/material";
import config from "../config/config.json";
import { logosHelper } from "../lib/logosHelper";

/*
  This component renders the logos of the founders.
  The logos are defined in the configuration file so deployers can easily change them.
*/
export default function Founders() {
  // Read the founders logos from the config file.
  // If the field does not exist, use an empty array.
  // We also filter the list to keep only valid logos that contain a "src".
  const founderLogos = (config?.ui?.logos?.founders || []).filter(
    (logo) => typeof logo?.src === "string" && logo.src.trim() !== ""
  );

  return (
    // Main container for the founders section
    <Box
      sx={{
        py: 3,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 3, // space between logos
        maxWidth: "992px", // keeps the row from becoming too wide
      }}
    >
      {/* Container that holds the logos in a horizontal row */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {founderLogos.map((logo, index) => (
          <Box
            key={`logo-${index}`}
            component="a" // makes the logo clickable
            href={logo.url} // external link associated with the logo set in the config file
            target="_blank" // open the link in a new tab
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              maxWidth: "140px", // prevents very wide logos from taking too much space
            }}
          >
            <Box
              component="img"
              src={logosHelper(logo.src)} // helper handles local or external logo paths
              alt={`Founder ${index + 1}`}
              sx={{
                maxHeight: "37px", // keeps logos visually aligned
                maxWidth: "140px", // prevents logos from becoming too wide
                width: "auto",
                objectFit: "contain", // ensures the logo keeps its proportions

                // By default logos appear greyed out
                // greyscale controls how much color is removed
                // brightness controls the how light/dark the grey is
                // opacity controls how strong the logo appears
                filter: "grayscale(100%) brightness(1.05)",
                opacity: 0.6,

                // Smooth transition when hovering
                transition: "filter 0.2s ease, opacity 0.2s ease",

                // On hover the logo becomes fully colored
                // greyscale controls how much color is removed
                // brightness controls the how light/dark the grey is
                // opacity controls how strong the logo appears
                "&:hover": {
                  filter: "grayscale(0%) brightness(1)",
                  opacity: 1,
                },
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
