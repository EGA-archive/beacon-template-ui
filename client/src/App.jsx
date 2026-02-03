import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./components/pages/About";
import ContactForm from "./components/pages/contact/ContactForm";
import ContactSuccess from "./components/pages/contact/ContactSuccess";
import NetworkMembers from "./components/pages/NetworkMembers";
import Login from "./components/pages/login/Login";
import HomePage from "./components/pages/HomePage";
import { CssBaseline, Box } from "@mui/material";
import config from "./config/config.json";
import { useState, useEffect } from "react";
import LoginModal from "./components/common/LoginModal";
import { logosHelper } from "./lib/logosHelper";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { SelectedEntryProvider } from "./components/context/SelectedEntryContext";

if (window.Cypress) {
  window.__beaconTestHooks = {
    setActiveInput: (val) => {
      console.log("[Cypress] setActiveInput:", val);
      window.dispatchEvent(new CustomEvent("setActiveInput", { detail: val }));
    },
  };
}

export default function App() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    if (config.ui?.title) {
      document.title = config.ui.title;
    }

    // enforce favicon to be a relative/static file
    const faviconUrl = logosHelper(config.ui?.favicon || "/favicon.ico");

    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = faviconUrl;
  }, []);

  const baseNavItems = [
    { label: "Network Members", url: "/network-members" },
    ...(config.ui.showAboutPage ? [{ label: "About", url: "/about" }] : []),
    ...(config.ui.contact?.showContactPage
      ? [{ label: "Contact", url: "/contact" }]
      : []),
    ...(config.ui.showLogin ? [{ label: "Log in", url: "/login" }] : []),
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
            main={logosHelper(config.ui.logos.main)}
            navItems={navItems}
            setSelectedTool={setSelectedTool}
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
                    setLoginModalOpen={setLoginModalOpen}
                  />
                }
              />
              {config.beaconType === "networkBeacon" && (
                <Route path="/network-members" element={<NetworkMembers />} />
              )}
              {config.ui.showAboutPage && (
                <Route path="/about" element={<About />} />
              )}
              {config.ui.contact?.showContactPage && (
                <>
                  <Route path="/contact" element={<ContactForm />} />
                  <Route path="/contact-success" element={<ContactSuccess />} />
                </>
              )}
              {config.ui.showLogin && (
                <>
                  <Route path="/login" element={<Login />} />
                </>
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Box>

          <Footer navItems={navItems} />
          <LoginModal
            open={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
          />
        </Box>
      </Router>
    </SelectedEntryProvider>
  );
}
