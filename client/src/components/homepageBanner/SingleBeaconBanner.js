import { useEffect, useState } from "react";
import { alpha } from "@mui/material/styles";
import { Box, Typography, Tabs, Tab, Link } from "@mui/material";
import config from "../../config/runtimeConfig";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import Loader from "../common/Loader";

/**
 * This banner is only rendered on the homepage of a Single Beacon.
 * The banner has two tabs:
 * 1. Beacon Information: organization, URLs, maturity and entry types.
 * 2. Datasets Information: selectable datasets and their descriptions.
 *
 * Beacon metadata comes from SelectedEntryContext.
 * Dataset metadata is fetched independently from the Beacon /datasets API.
 * A loading indicator is shown until datasets load or retries are exhausted.
 * The selected dataset defaults to the first item returned by the API.
 * Existing visual styles and selection behaviour are intentionally preserved.
 */

// Reusable accessible panel where only the active tab renders its children.
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`beacon-tabpanel-${index}`}
      aria-labelledby={`beacon-tab-${index}`}
      {...other}
    >
      {/* Keep inactive tab contents unmounted to avoid displaying hidden data. */}
      {value === index && <Box sx={{ p: 4 }}>{children}</Box>}
    </div>
  );
}

export default function SingleBeaconBanner() {
  // The active tab index: 0 is general Beacon Information, 1 is Datasets Information.
  // Tabs update this value without refetching metadata.
  const [tabValue, setTabValue] = useState(0);

  // Keep a stable object shape so collections is always safe to access.
  // An empty array means there are no fetched datasets yet.
  const [localDatasets, setLocalDatasets] = useState({
    collections: [],
  });

  // The error state is only populated after all request attempts fail.
  // It allows a fetch failure to differ from a valid, empty response.
  const [datasetsError, setDatasetsError] = useState(null);

  // Store the selected dataset separately from the complete list.
  // This changes when the user clicks a different dataset card.
  const [selectedDataset, setSelectedDataset] = useState(null);

  // Show the banner loader while the initial API request is pending.
  // Loading is cleared after a successful request or final failure.
  const [loading, setLoading] = useState(true);

  // Shared context contains entry type configuration and Beacon information.
  // Those fields may initially be unavailable during app initialization.
  const { entryTypes, beaconsInfo, entryTypesConfig } = useSelectedEntry();

  // Single Beacon pages use the first available Beacon metadata entry.
  const beaconInfo = beaconsInfo?.[0];

  // Convert the technical production status into a user-facing label.
  // Unsupported statuses are displayed unchanged rather than guessed.
  const getBeaconStatusLabel = (status) => {
    // If no value exists, show a fallback rather than an empty label.
    if (!status) return "Undefined";
    // Treat uppercase and lowercase status codes consistently.
    const normalized = status.toUpperCase();
    // Production Beacons use a distinct label from test and dev instances.
    if (normalized === "PROD") return "Production";
    if (normalized === "TEST") return "Non Production";
    if (normalized === "DEV") return "Non Production";
    return status;
  };

  // Production status is configured in the metadata supplied by the context.
  const maturityStatus = getBeaconStatusLabel(
    entryTypesConfig?.maturityAttributes?.productionStatus
  );

  // Detect whether this Beacon exposes a dataset entry type
  // Only expose the datasets tab when this Beacon supports that entry type.
  const hasDatasetEntryType = entryTypes?.some(
    (e) => e.id === "dataset" || e.id === "datasets"
  );

  // Function for the tab selection on top of the banner
  // MUI passes the clicked tab index as the second callback parameter.
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch datasets on component mount
  // Saves the full list to local state and preselects the first dataset
  // Run the dataset request once when the component mounts.
  // Failed attempts are retried by this effect, not by editing source code.
  useEffect(() => {
    // Ignore late responses after unmounting.
    // This prevents updates to a component that no longer exists.
    let active = true;
    // Track the retry timer so it can be cancelled during cleanup.
    let retryTimeout;
    // The AbortController cancels the active fetch if this view unmounts.
    // Aborted fetches must not be treated as network failures.
    let controller;

    // Retry the initial request for temporary startup failures.
    // The first request plus ten retries make eleven possible attempts.
    // Each retry waits 500 ms; there is no unbounded background polling.
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 500;

    // attempt is the number of retries already scheduled.
    // The same function handles the initial request and later attempts.
    const fetchDatasets = async (attempt = 0) => {
      // Exit immediately if the component was removed during a retry wait.
      if (!active) return;
      try {
        // The runtime configuration may not have an API URL at first mount.
        // Let the shared retry path handle that temporary condition.
        if (!config.apiUrl) {
          throw new Error("API URL is not ready");
        }
        // Create a fresh cancellation controller for this request.
        // The previous controller may belong to an earlier attempt.
        controller = new AbortController();
        // Remove a trailing slash to avoid double slashes in the URL.
        // Use the configured endpoint rather than hardcoding a hostname.
        const res = await fetch(
          `${config.apiUrl.replace(/\/$/, "")}/datasets`,
          { signal: controller.signal }
        );
        // A resolved fetch promise can still contain a non-success status.
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        // Read the standard Beacon response and extract its collections.
        // No dataset list is assumed until the response is validated.
        const json = await res.json();
        const datasets = json?.response?.collections;
        // Reject unexpected payload structures instead of silently treating
        // them as valid empty responses.
        if (!Array.isArray(datasets)) {
          throw new Error("Invalid datasets response");
        }
        // The response can arrive after the user navigates to another page.
        // Prevent state updates in that case.
        if (!active) return;
        // Save the list for the clickable dataset selector on the left.
        setLocalDatasets({ collections: datasets });
        // Automatically show the first dataset description on the right.
        setSelectedDataset(datasets[0] ?? null);
        // Clear any previous error after a successful response.
        setDatasetsError(null);
        // Stop showing the loader now that the response is ready.
        setLoading(false);
      } catch (err) {
        // Transient failures use the same retry path.
        // Permanent failures become a visible error after the last attempt.
        // AbortError is intentional when React cleans up this effect.
        // Do not retry or report it as a user-facing error.
        if (!active || err.name === "AbortError") return;
        // Wait before retrying so startup failures do not trigger rapid calls.
        // A later successful response ends this retry chain.
        if (attempt < MAX_RETRIES) {
          retryTimeout = setTimeout(
            () => fetchDatasets(attempt + 1),
            RETRY_DELAY
          );
        } else {
          // After the retry budget is exhausted, display a helpful message.
          // The banner remains renderable even if datasets cannot be fetched.
          console.error("Error fetching datasets:", err);
          setDatasetsError("Unable to load datasets.");
          setLoading(false);
        }
      }
    };

    // Start the initial request as soon as the component has mounted.
    // No user interaction is required to populate the list.
    fetchDatasets();

    // Clean up both scheduled work and active network requests.
    // This also protects React Strict Mode development remounts.
    return () => {
      active = false;
      clearTimeout(retryTimeout);
      controller?.abort();
    };
  }, []);

  // Avoid rendering incomplete data while the request is in progress.
  // Once loading ends, render the normal tabs and any error state.
  if (loading) return <Loader />;

  // Apply a subtle version of the configured primary colour to dataset cards.
  // This stays consistent with each deployer’s theme.
  const baseBgColor = alpha(config.ui.colors.primary, 0.05);

  // Root wrapper keeps the original transparent background.
  // All content below is rendered inside the two-tab layout.
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "transparent",
      }}
    >
      {/* Tabs Header */}
      {/* The tabs switch local content without changing routes. */}
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label="Beacon Info Tabs"
        sx={{
          backgroundColor: "#F5F5F5",
          px: 2,
          "& .MuiTabs-indicator": { display: "none" },
        }}
      >
        {/* The Beacon tab is always present and is selected initially. */}
        {/* Selected and unselected states use separate colours. */}
        <Tab
          label="Beacon Information"
          sx={{
            textTransform: "none",
            fontSize: "13px",
            fontWeight: tabValue === 0 ? "bold" : "normal",
            color: tabValue === 0 ? "#000" : "#9E9E9E",
            backgroundColor: tabValue === 0 ? "#fff" : "transparent",
            borderRadius: "8px 8px 0 0",
            px: 2,
            // Hover states provide feedback even for inactive tabs.
            "&:hover": {
              backgroundColor: tabValue === 0 ? "#fff" : "#e0e0e0",
            },
            "&.Mui-selected": {
              color: "#000",
            },
          }}
        />

        {/* Dataset information is optional, based on Beacon entry types. */}
        {/* The selected-tab index stays the same regardless of dataset count. */}
        {hasDatasetEntryType && (
          <Tab
            label="Datasets Information"
            sx={{
              textTransform: "none",
              fontSize: "13px",
              // Keep this tab visually consistent with the Beacon tab.
              fontWeight: tabValue === 1 ? "bold" : "normal",
              color: tabValue === 1 ? "#000" : "#9E9E9E",
              backgroundColor: tabValue === 1 ? "#fff" : "transparent",
              borderRadius: "8px 8px 0 0",
              px: 2,
              // Use a subtle hover background until this tab is selected.
              "&:hover": {
                backgroundColor: tabValue === 1 ? "#fff" : "#e0e0e0",
              },
              "&.Mui-selected": {
                color: "#000",
              },
            }}
          />
        )}
      </Tabs>

      {/* Content Box */}
      {/* The content area below is shared by the two tab panels. */}
      <Box
        sx={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          backgroundColor: "white",
        }}
      >
        {/* Beacon Information */}
        {/* Only show metadata fields when Beacon information is available. */}
        {/* The context provides this data, independently of /datasets. */}
        {beaconInfo && (
          <TabPanel value={tabValue} index={0}>
            {/* An extra loading check is kept to preserve the current UI. */}
            {loading ? (
              <Loader />
            ) : (
              <>
                {/* Section title for the Beacon metadata panel. */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontFamily: '"Open Sans", sans-serif',
                    fontWeight: 700,
                    fontSize: "16px",
                  }}
                >
                  Beacon Information
                </Typography>

                {/* Two-column layout: text on the left, logo on the right. */}
                {/* Existing widths are preserved to avoid visual changes. */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "14px",
                    flex: "1 1 60%",
                    minWidth: "250px",
                  }}
                >
                  {/* Left Column. Rendering of single beacon information. */}

                  {/* Use a vertical stack to keep metadata labels readable. */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      flex: "1 1 60%",
                      minWidth: "250px",
                    }}
                  >
                    {/* Organization name comes directly from Beacon metadata. */}
                    {/* Missing values are left empty using optional chaining. */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Open Sans", sans-serif',
                        fontSize: "14px",
                      }}
                    >
                      <strong>Organization:</strong>{" "}
                      {beaconInfo.organization?.name}
                    </Typography>
                    {/* Contact URL can be a mailto link or a web address. */}
                    {/* The visible label removes mailto: when present. */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Open Sans", sans-serif',
                        fontSize: "14px",
                        color: "#000",
                      }}
                    >
                      <strong>Organization URL:</strong>{" "}
                      <Link
                        href={beaconInfo.organization?.contactUrl}
                        target="_blank"
                        rel="noopener"
                        sx={{ color: "#3176B1" }}
                      >
                        {beaconInfo.organization?.contactUrl?.replace(
                          "mailto:",
                          ""
                        )}
                      </Link>
                    </Typography>
                    {/* Link to the Beacon welcome page supplied by metadata. */}
                    {/* Opening in a new tab keeps the current UI in place. */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Open Sans", sans-serif',
                        fontSize: "14px",
                        color: "#000",
                      }}
                    >
                      <strong>Beacon URL:</strong>{" "}
                      <Link
                        href={beaconInfo.welcomeUrl}
                        target="_blank"
                        rel="noopener"
                        sx={{ color: "#3176B1" }}
                      >
                        {beaconInfo.welcomeUrl}
                      </Link>
                    </Typography>
                    {/* Show the normalized maturity label computed above. */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Open Sans", sans-serif',
                        fontSize: "14px",
                      }}
                    >
                      <strong>Beacon Maturity:</strong> {maturityStatus}
                    </Typography>
                    {/* List the entry types supported by this Beacon. */}
                    {/* g_variants gets a human-readable genomic variants name. */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Open Sans", sans-serif',
                        fontSize: "14px",
                        color: "#000",
                      }}
                    >
                      <strong>Types of information:</strong>{" "}
                      {entryTypes?.length > 0
                        ? entryTypes
                            .map((entry) =>
                              entry.pathSegment === "g_variants"
                                ? "Genomic Variants"
                                : entry.pathSegment.charAt(0).toUpperCase() +
                                  entry.pathSegment.slice(1)
                            )
                            .join(", ")
                        : "Not available"}
                    </Typography>
                  </Box>
                  {/* Right Column - Logo */}

                  {/* The logo is optional and must not block other metadata. */}
                  {/* Keep it separate from the organization text column. */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 2,
                      flex: "1 1 35%",
                      justifyContent: "flex-start",
                      minWidth: "150px",
                    }}
                  >
                    {/* Only create the image when a logo URL exists. */}
                    {/* A broken image is hidden rather than shown as an icon. */}
                    {beaconInfo.organization?.logoUrl && (
                      <Box
                        component="img"
                        src={beaconInfo.organization.logoUrl}
                        alt="Organization Logo"
                        sx={{
                          // Keep the logo within the existing height limit.
                          height: "50px",
                          objectFit: "contain",
                          display: "block",
                        }}
                        onError={(e) => {
                          // Preserve the current fallback for failed images.
                          e.target.style.display = "none";
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </>
            )}
          </TabPanel>
        )}

        {/* Dataset metadata is fetched directly from /datasets. */}
        {/* It no longer depends on Beacon information being populated. */}
        {hasDatasetEntryType && (
          <TabPanel value={tabValue} index={1}>
            {/* Preserve loading feedback for the dataset tab. */}
            {loading ? (
              <Loader />
            ) : (
              <>
                {/* Section title for dataset selection and details. */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontFamily: '"Open Sans", sans-serif',
                    fontWeight: 700,
                    fontSize: "16px",
                  }}
                >
                  Datasets Information
                </Typography>

                {/* Two-column dataset layout mirrors the Beacon information. */}
                {/* Left cards act as a selector; the right shows details. */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "14px",
                    minWidth: "250px",
                  }}
                >
                  {/* Left Column – Dataset Selector - Rendering all datasets included in the Single Beacon. */}
                  {/* Dataset cards are displayed in a vertical list. */}
                  {/* The list comes from the collections array in state. */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      flex: "1 1 35%",
                      minWidth: "250px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Open Sans", sans-serif',
                        fontSize: "14px",
                      }}
                    >
                      Select your dataset of interest to see the information:
                    </Typography>
                    {/* Render a card for every dataset returned by the API. */}
                    {/* An empty array uses the fallback message instead. */}
                    {localDatasets?.collections?.length > 0 ? (
                      localDatasets.collections.map((ds, idx) => (
                        <Box
                          key={ds.id || idx}
                          onClick={() => setSelectedDataset(ds)}
                          sx={{
                            // Light theme-derived background for all cards.
                            backgroundColor: baseBgColor,
                            borderRadius: "8px",
                            // Outline the selected dataset using primary colour.
                            // Unselected cards keep an invisible border for stability.
                            border:
                              selectedDataset?.id === ds.id
                                ? `1px solid ${config.ui.colors.primary}`
                                : "1px solid transparent",
                            // All cards remain clickable to change details.
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              border: `1px solid ${config.ui.colors.primary}`,
                            },
                          }}
                        >
                          {/* Prefer the dataset name, then ID, then index. */}
                          <Typography
                            variant="subtitle2"
                            sx={{ m: 1, fontSize: "12px" }}
                          >
                            {ds.name || ds.id || `Dataset ${idx + 1}`}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: "12px" }}>
                        {/* Show a failure message or an empty-state label. */}
                        {datasetsError || "No datasets available."}
                      </Typography>
                    )}
                  </Box>

                  {/* Right Column, rendering of the description of each datatset */}
                  {/* Details follow selectedDataset, not the full dataset list. */}
                  {/* The selected entry is initially the first API result. */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 2,
                      flex: "1 1 60%",
                      justifyContent: "flex-start",
                      backgroundColor: "white",
                      border: `1px solid ${baseBgColor}`,
                      borderRadius: "8px",
                    }}
                  >
                    <Box sx={{ m: 2 }}>
                      {/* Show the selected dataset name or a fallback ID. */}
                      {/* A dash appears when no dataset is selected. */}
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          fontFamily: '"Open Sans", sans-serif',
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                      >
                        Dataset Name: 
                        <span style={{ fontWeight: 200 }}>
                          {selectedDataset?.name || selectedDataset?.id || "—"}
                        </span>
                      </Typography>
                      {/* Display the description from the selected dataset. */}
                      {/* The text length is truncated below for a compact banner. */}
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          fontFamily: '"Open Sans", sans-serif',
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                      >
                        Description:
                        {/* Truncate long descriptions at 505 characters. */}
                        {/* Missing descriptions are represented by a dash. */}
                        <p style={{ fontWeight: 200 }}>
                          {selectedDataset?.description
                            ? selectedDataset.description.length > 505
                              ? selectedDataset.description.slice(0, 505) +
                                "..."
                              : selectedDataset.description
                            : "—"}
                        </p>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </TabPanel>
        )}
      </Box>
    </Box>
  );
}
