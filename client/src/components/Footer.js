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
 *  - Documentation + UI walkthrough links
 *  - Log in / Log out control depending on authentication state
 */
export default function Footer() {
  const auth = useAuth();

  const isLoggedIn = !!auth?.userData;
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
    <Box
      component="footer"
      data-testid="footer"
      sx={{
        backgroundColor: "#eee",
        py: 2,
        px: 4,
        minHeight: "68px",
        mt: "auto",
      }}
    >
      {/* Main responsive container */}
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
          <Typography
            data-testid="footer-credit-text"
            variant="body2"
            color="black"
            sx={{
              fontSize: { xs: "12px", sm: "14px" },
              "@media (max-width: 648px) and (min-width:600px)": {
                fontSize: "12px",
              },
            }}
          >
            Beacon User Interface template provided by:
          </Typography>

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

        {/* Right Side — Documentation + login/logout */}
        <Box
          data-testid="footer-right"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: { xs: "center", md: "flex-end" },
            fontFamily: '"Open Sans", sans-serif',
            marginRight: 0,
          }}
        >
          {/* Documentation links */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: "13px",
            }}
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                lineHeight: "16px",
              }}
            >
              Beacon Template User Interface
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 8,
              }}
            >
              <MuiLink
                href="https://github.com/EGA-archive/beacon-template-ui"
                target="_blank"
                rel="noopener noreferrer"
                underline="always"
                sx={{
                  color: "#333",
                  fontSize: "13px",
                  textDecorationColor: "black",
                }}
              >
                Git Hub
              </MuiLink>

              <MuiLink
                href="https://www.youtube.com/watch?v=nXMr_DXtzI8"
                target="_blank"
                rel="noopener noreferrer"
                underline="always"
                sx={{
                  color: "#333",
                  fontSize: "13px",
                  textDecorationColor: "black",
                }}
              >
                UI Walkthrough
              </MuiLink>
            </Box>
          </Box>

          {/* Login / Logout controls */}
          {loginEnabled && (
            <>
              {!isLoggedIn && (
                <MuiLink
                  data-testid="footer-login-button"
                  component={Link}
                  to="/login"
                  underline="none"
                  className="login-button"
                  sx={{
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
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
