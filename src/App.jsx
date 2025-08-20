import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./components/pages/About";
import Contact from "./components/pages/Contact";
import NetworkMembers from "./components/pages/NetworkMembers";
import Login from "./components/pages/Login";
import HomePage from "./components/pages/HomePage";
import { CssBaseline, Box } from "@mui/material";
import config from "./config/config.json";
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SelectedEntryProvider } from "./components/context/SelectedEntryContext";

export default function App() {
  const [selectedTool, setSelectedTool] = useState(null);

  const baseNavItems = [
    { label: "Network Members", url: "/network-members" },
    ...(config.ui.showAboutPage ? [{ label: "About", url: "/about" }] : []),
    ...(config.ui.showContactPage
      ? [{ label: "Contact", url: "/contact" }]
      : []),
    { label: "Log in", url: "/login" },
  ];

  const filteredBaseItems =
    config.beaconType !== "networkBeacon"
      ? baseNavItems.filter((item) => item.label !== "Network Members")
      : baseNavItems;

  const cleanedExternalLinks =
    config.ui.showExternalNavBarLink &&
    Array.isArray(config.ui.externalNavBarLink)
      ? config.ui.externalNavBarLink.filter(
          (link) => link.label && link.label.trim() !== ""
        )
      : [];

  const navItems = [...cleanedExternalLinks, ...filteredBaseItems];

  return (
    <SelectedEntryProvider>
      <Router>
        <Box
          sx={{
            backgroundColor: "#F5F5F5",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CssBaseline />
          <Navbar
            title={config.ui.title}
            main={config.ui.logos.main}
            navItems={navItems}
          />

          <Box
            component="main"
            sx={{
              pt: 10,
              px: { xs: 2, md: 4 },
              flexGrow: 1,
            }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    selectedTool={selectedTool}
                    setSelectedTool={setSelectedTool}
                  />
                }
              />
              {config.beaconType === "networkBeacon" && (
                <Route path="/network-members" element={<NetworkMembers />} />
              )}
              {config.ui.showAboutPage && (
                <Route path="/about" element={<About />} />
              )}
              {config.ui.showContactPage && (
                <Route path="/contact" element={<Contact />} />
              )}
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>

          <Footer navItems={navItems} />
        </Box>
      </Router>
    </SelectedEntryProvider>
  );
}
