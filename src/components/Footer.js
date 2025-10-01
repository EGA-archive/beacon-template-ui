import { Box, Typography, Link as MuiLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "oidc-react"; // Authentication context

// Logos shown in the footer
import maingrey from "../assets/logos/maingrey.svg";
import crg from "../assets/logos/crg.svg";
import bsc from "../assets/logos/bsc.svg";

// Footer component shows credits, the same items as in the navbar, and logout if logged in
export default function Footer({ navItems }) {
  const auth = useAuth();
  const isLoggedIn = !!auth?.userData; // True if user is logged in

  //  Function to log the user out
  const handleLogout = () => {
    auth.signOut();
    auth.signOutRedirect();
  };

  return (
    // Main footer container with background and padding
    <Box
      component="footer"
      sx={{
        backgroundColor: "#eee",
        py: 2,
        px: 4,
        minHeight: "68px",
        mt: "auto", // pushes footer to bottom if using flex layout
      }}
    >
      {/* Inside layout – responsive flex: stacked on small screens */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "column", md: "row" },
          "@media (max-width: 1044px) and (min-width: 900px)": {
            flexDirection: "column",
          },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mr: 1,
        }}
      >
        {/* Left Side — Text and institution logos */}
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
          {/* Small credit text */}
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

          {/* Logos with links to partner websites */}
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

        {/* Right Side — Navigation links or logout icon */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {navItems
            .filter((item) => item.label && item.label.trim() !== "")
            .filter((item) => {
              // Don't show "Log in" if already logged in
              return !(isLoggedIn && item.label.toLowerCase() === "log in");
            })
            .map((item) =>
              // External links open in new tab
              item.url && item.url.startsWith("http") ? (
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
                // Internal links use RouterLink
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

          {/* If user is logged in, show logout icon */}
          {isLoggedIn && (
            <LogoutIcon
              onClick={handleLogout}
              sx={{
                color: "#444",
                cursor: "pointer",
                fontSize: "20px",
                "&:hover": { color: "#000" },
              }}
              titleAccess="Log out"
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
