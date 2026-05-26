import { Box, Typography, Link as MuiLink } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link } from "react-router-dom";
import config from "../config/config.json";
import { isLoginEnabled } from "../components/pages/login/authHelpers";
import { useAuthSafe as useAuth } from "../components/pages/login/useAuthSafe";
import maingrey from "../assets/logos/maingrey.svg";
import crg from "../assets/logos/crg.svg";
import bsc from "../assets/logos/bsc.svg";

// Footer component with dynamic legal links, institutional logos,
// documentation links and login/logout controls
export default function Footer() {
  const auth = useAuth();

  const isLoggedIn = !!auth?.userData;
  const loginEnabled = isLoginEnabled();

  // Legal links come from the same config used by the cookie banner
  const legalLinks = config.ui?.cookies?.links || [];
  const hasLegalLinks = legalLinks.length > 0;

  const handleLogout = () => {
    localStorage.setItem("isLoggingOut", "true");
    auth.signOut();
    auth.signOutRedirect();
  };

  const handleLogin = () => {
    auth.signIn();
  };

  // Shared style used for all footer links
  const sharedLinkStyles = {
    color: "#111",
    fontSize: "12px",
    textDecorationColor: "#111",
    fontFamily: '"Open Sans", sans-serif',
  };

  // Reusable institutions logos block for ega, crg and bsc
  const renderInstitutionLogos = () => (
    <>
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
    </>
  );

  // Login/Logout is shown only if enabled in config
  const renderLoginSection = () => (
    <>
      {loginEnabled && !isLoggedIn && (
        <MuiLink
          component={Link}
          to="/login"
          underline="none"
          onClick={handleLogin}
          sx={{
            ...sharedLinkStyles,
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          Log in
        </MuiLink>
      )}

      {loginEnabled && isLoggedIn && (
        <LogoutIcon
          onClick={handleLogout}
          sx={{
            color: "#444",
            cursor: "pointer",
            fontSize: "20px",
            "&:hover": {
              color: "#000",
            },
          }}
          titleAccess="Log out"
        />
      )}
    </>
  );

  return (
    <Box
      component="footer"
      data-testid="footer"
      sx={{
        backgroundColor: "#EAEAEA",
        py: 2,
        px: 4,
        minHeight: "68px",
        mt: "auto",
      }}
    >
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
        {/* Left section: if legal links exist, show them here. Otherwise skipt the section */}
        {hasLegalLinks ? (
          <Box
            data-testid="footer-left"
            sx={{
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {legalLinks.map((link, index) => (
              <MuiLink
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="always"
                sx={sharedLinkStyles}
              >
                {link.label}
              </MuiLink>
            ))}
          </Box>
        ) : (
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
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                color: "#111",
                fontFamily: '"Open Sans", sans-serif',
              }}
            >
              Beacon User Interface template provided by:
            </Typography>

            {renderInstitutionLogos()}
          </Box>
        )}

        {/* Center section only exists when legal links are present */}
        {hasLegalLinks && (
          <Box
            data-testid="footer-center"
            sx={{
              display: "flex",
              gap: { xs: 2, md: 3 },
              "@media (max-width: 1044px) and (min-width: 784px)": {
                gap: 6,
              },
              "@media (max-width: 783px) and (min-width: 633px)": {
                gap: 3,
              },

              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                color: "#111",
                fontFamily: '"Open Sans", sans-serif',
              }}
            >
              Beacon Template User Interface provided by:
            </Typography>

            {renderInstitutionLogos()}
          </Box>
        )}

        {/* Right section with docs and login/logout */}
        <Box
          data-testid="footer-right"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, md: 2 },
            flexWrap: "wrap",
            justifyContent: { xs: "center", md: "flex-end" },
            fontFamily: '"Open Sans", sans-serif',
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              fontSize: "12px",
            }}
          >
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                lineHeight: "16px",
                color: "#111",
              }}
            >
              Beacon Template User Interface:
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 3,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <MuiLink
                href="https://beacon-documentation-demo.ega-archive.org/ui-introduction"
                target="_blank"
                rel="noopener noreferrer"
                underline="always"
                sx={sharedLinkStyles}
              >
                Documentation
              </MuiLink>

              <MuiLink
                href="https://www.youtube.com/watch?v=nXMr_DXtzI8"
                target="_blank"
                rel="noopener noreferrer"
                underline="always"
                sx={sharedLinkStyles}
              >
                UI Walkthrough
              </MuiLink>

              {renderLoginSection()}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
