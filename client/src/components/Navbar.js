import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PropTypes from "prop-types";
import config from "../config/config.json";
import { Link } from "react-router-dom";
import { useAuth } from "oidc-react";

/**
 * Displays a responsive navigation bar with a title, logo, and links.
 * On small screens, it shows a burger menu that opens a drawer.
 * On larger screens, links are shown directly in the toolbar.
 */

export default function Navbar({ title, main, navItems }) {
  // State to control mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  // Retrieves the authentication context provided by the oidc-react context
  const auth = useAuth();

  // Checks if a user is authenticated by verifying if user data exists
  const isLoggedIn = !!auth?.userData;

  // Extracts the user's name from the authentication profile
  const userName = auth?.userData?.profile?.given_name || "User";

  // Triggers logout by clearing session and redirecting to the logout endpoint
  const handleLogout = () => {
    localStorage.setItem("isLoggingOut", "true");
    auth.signOut();
    auth.signOutRedirect();
  };

  // Common text style used for all nav links
  const textStyle = {
    fontFamily: '"Open Sans", sans-serif',
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0%",
    color: "white",
    "@media (max-width: 1080px)": {
      fontSize: "14px",
    },
  };

  // Renders the top navbar with title, logo, navigation links, and login/logout logic
  return (
    <>
      {/* Top fixed app bar with toolbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: config.ui.colors.primary,
          color: "white",
          px: 1,
          minHeight: "68px",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            gap: 2,
            px: "9px",
            minHeight: "68px",
          }}
        >
          {/* Left section: logo + title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minWidth: "fit-content",
              flexShrink: 0,
              "@media (min-width: 768px)": {
                gap: 2.5,
              },
            }}
          >
            {/* Hide logo if screen too small */}
            <Box
              component="span"
              sx={{
                display: { xs: "block" },
                "@media (max-width: 385px)": {
                  display: "none",
                },
              }}
            >
              <img
                src={main}
                alt="Logo"
                className="w-logo-w h-logo-h object-contain logo-small"
                data-cy="navbar-logo"
              />
            </Box>
            {/* Title text linking to homepage */}
            <Typography
              data-cy="navbar-title"
              className="font-sans"
              component={Link}
              to="/"
              sx={{
                fontWeight: "bold",
                fontFamily: '"Open Sans", sans-serif',
                color: "white",
                cursor: "pointer",
                fontSize: "15px",
                whiteSpace: "nowrap",
                "@media (max-width: 410px)": {
                  fontSize: "14px",
                },
                "@media (min-width: 768px)": {
                  fontSize: "16px",
                },
                "@media (max-width: 930px) and (min-width: 900px)": {
                  fontSize: "15.7px",
                },
              }}
            >
              {title}
            </Typography>
          </Box>
          {/* Right section: nav links + burger menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              data-cy="burger-menu"
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { md: "none" }, flexShrink: 0 }}
            >
              <MenuIcon />
            </IconButton>
            {/* Desktop navigation links are shown on md+ screens only */}
            <Box
              data-cy="navbar-links"
              className="nav-items-box"
              sx={{
                display: {
                  xs: "none",
                  sm: "none",
                  md: "flex",
                },
                gap: 2,
                "@media (max-width: 968px) and (min-width: 900px)": {
                  gap: 0,
                },
                alignItems: "center",
              }}
            >
              {navItems
                .filter((item) => item.label && item.label.trim() !== "")
                .map((item) => {
                  // Hide "Log in" in drawer if logged in
                  if (item.label.toLowerCase() === "log in" && isLoggedIn)
                    return null;

                  const isLogin = item.label.toLowerCase() === "log in";

                  const buttonProps = {
                    key: item.label,
                    sx: { ...textStyle, textTransform: "none" },
                    className: isLogin ? "login-button" : undefined,
                    children: item.label,
                  };

                  return item.url?.startsWith("http") ? (
                    <Button
                      {...buttonProps}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cy={`nav-link-external-${item.label
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    />
                  ) : (
                    <Button
                      {...buttonProps}
                      component={Link}
                      to={item.url}
                      data-cy={`nav-link-internal-${item.label
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    />
                  );
                })}
              {/* If logged in, show Hello + user name and logout icon */}
              {isLoggedIn && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ color: "white" }}>
                    Hello, <strong>{userName}</strong>
                  </Typography>
                  <IconButton
                    onClick={handleLogout}
                    color="inherit"
                    size="small"
                    aria-label="logout"
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Drawer menu for mobile screens */}
      <Drawer
        data-cy="navbar-drawer"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { md: "none" } }}
      >
        <List sx={{ width: 240, pt: 3 }}>
          <ListItem
            sx={{
              px: 3,
              py: 1,
              justifyContent: "flex-start",
              textTransform: "none",
              fontFamily: '"Open Sans", sans-serif',
              fontWeight: 700,
              fontSize: "16px",
              color: config.ui.colors.primary,
            }}
          >
            {title}
          </ListItem>

          {/* Navigation items in drawer */}
          {navItems
            .filter((item) => item.label && item.label.trim() !== "")
            .map((item) => {
              if (item.label.toLowerCase() === "log in" && isLoggedIn)
                return null;

              const isLogin = item.label.toLowerCase() === "log in";

              return (
                <ListItem key={item.label} disablePadding>
                  {item.url?.startsWith("http") ? (
                    <Button
                      fullWidth
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={isLogin ? "login-button" : undefined}
                      sx={{
                        px: 3,
                        py: 1,
                        justifyContent: "flex-start",
                        textTransform: "none",
                        fontFamily: '"Open Sans", sans-serif',
                        fontWeight: 400,
                        fontSize: "16px",
                        color: config.ui.colors.primary,
                      }}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      component={Link}
                      to={item.url}
                      className={isLogin ? "login-button" : undefined}
                      sx={{
                        px: 3,
                        py: 1,
                        justifyContent: "flex-start",
                        textTransform: "none",
                        fontFamily: '"Open Sans", sans-serif',
                        fontWeight: 400,
                        fontSize: "16px",
                        color: config.ui.colors.primary,
                      }}
                    >
                      {item.label}
                    </Button>
                  )}
                </ListItem>
              );
            })}

          {/* Logout icon inside mobile drawer */}
          {isLoggedIn && (
            <ListItem
              sx={{
                px: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <IconButton
                onClick={handleLogout}
                color="inherit"
                size="small"
                aria-label="logout"
                sx={{ color: config.ui.colors.primary }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
}

// Define expected props and their types
Navbar.propTypes = {
  title: PropTypes.string.isRequired,
  main: PropTypes.string.isRequired,
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      url: PropTypes.string,
    })
  ),
};
