import { Box } from "@mui/material";
import config from "../config/config.json";

// Get the founders' logos array from config.json
// If it's not defined, default to an empty array
export default function Founders() {
  const founderLogos = (config?.ui?.logos?.founders || []).filter(
    (logo) => typeof logo === "string" && logo.trim() !== ""
  );

  return (
    // Outer container for the founders section
    <Box
      sx={{
        py: 3,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 3,
        maxWidth: "992px",
      }}
    >
      {/* Inner flex container for logos */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {founderLogos.map((logo, index) => (
          <Box
            key={`logo-${index}`}
            component="img"
            src={logo}
            alt={`Founder ${index + 1}`}
            sx={{
              maxHeight: "37px",
              width: "auto",
              objectFit: "contain",
            }}
            onError={(e) => {
              console.warn(`⚠️ Founder logo failed to load: ${logo}`);
              e.currentTarget.style.display = "none"; // hide broken logo
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
