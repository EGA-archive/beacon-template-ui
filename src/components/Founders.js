import { Box } from "@mui/material";
import config from "../config/config.json";

export default function Founders() {
  // Get the founders' logos array from config.json
  // If it's not defined, default to an empty array
  const founderLogos = config?.ui?.logos?.founders || [];

  return (
    // Outer container for the founders section
    <Box
      sx={{
        py: 3, // padding
        display: "flex", // flex layout
        alignItems: "center", // vertically center items
        flexWrap: "wrap", // allow wrapping on smaller screens
        gap: 3, // spacing between child elements
        maxWidth: "992px", // limit the section width
      }}
    >
      {/* Inner flex container for logos */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Loop through each logo and render it as an image */}
        {founderLogos.map((logo, index) => (
          <Box
            key={`logo-${index}`} // unique key per logo
            component="img" // render this Box as an <img> element
            src={logo} // image source from config
            alt={`Founder ${index + 1}`} // accessible alt text
            sx={{
              minHeight: "68x", // ❗️(typo: should be "68px")
              width: "auto", // keep image ratio
              objectFit: "contain", // scale logos without cropping
            }}
            // Handle failed image loads gracefully
            onError={(e) => {
              console.error(`Failed to load logo: ${logo}`);
              e.target.style.opacity = 0.5; // fade broken logos
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
