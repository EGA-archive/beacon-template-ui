import { Box, Typography, Link as MuiLink } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link } from "react-router-dom";
import { isLoginEnabled } from "../components/pages/login/authHelpers";
import { useAuthSafe as useAuth } from "../components/pages/login/useAuthSafe";

// Logos shown in the footer
import maingrey from "../assets/logos/maingrey.svg";
import crg from "../assets/logos/crg.svg";
import bsc from "../assets/logos/bsc.svg";

/**
 * Footer component
 * Displays:
 *  - Credits and institutional logos (EGA, CRG, BSC)
 *  - Log in / Log out control depending on authentication state
 */
export default function Footer() {
  const auth = useAuth();
  const isLoggedIn = !!auth?.userData; // True if user is logged in
  const loginEnabled = isLoginEnabled();

  // Function to log the user out
  const handleLogout = () => {
    localStorage.setItem("isLoggingOut", "true");
    auth.signOut();
    auth.signOutRedirect();
  };

  // Function to redirect to login
  const handleLogin = () => {
    auth.signIn();
  };

  return (
    // Main footer container with background and padding
    <Box
      component="footer"
      data-testid="footer"
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
          data-testid="footer-left"
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
            data-testid="footer-credit-text"
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
            data-testid="footer-logo-ega"
            href="https://ega-archive.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={maingrey} alt="EGA Logo" style={{ height: 34 }} />
          </MuiLink>
          <MuiLink
            data-testid="footer-logo-crg"
            href="https://www.crg.eu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={crg} alt="CRG Logo" style={{ height: 34 }} />
          </MuiLink>
          <MuiLink
            data-testid="footer-logo-bsc"
            href="https://www.bsc.es/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={bsc} alt="BSC Logo" style={{ height: 34 }} />
          </MuiLink>
        </Box>

        {/* Right Side — Only login / logout controls */}
        {loginEnabled && (
          <Box
            data-testid="footer-right"
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            {/* If not logged in, show "Log in" link */}
            {!isLoggedIn && (
              <MuiLink
                data-testid="footer-login-button"
                component={Link}
                to="/login"
                underline="none"
                className="login-button"
                sx={{
                  fontFamily: '"Open Sans", sans-serif',
                  fontSize: "14px",
                  "@media (max-width: 452px)": { fontSize: "12px" },
                  color: "#333",
                  "&:hover": { textDecoration: "underline" },
                  cursor: "pointer",
                }}
                onClick={handleLogin}
              >
                Log in
              </MuiLink>
            )}

            {/* If logged in, show logout icon */}
            {isLoggedIn && (
              <LogoutIcon
                data-testid="footer-logout-icon"
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
        )}
      </Box>
    </Box>
  );
}
