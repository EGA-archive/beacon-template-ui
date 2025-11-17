import { useEffect, useState } from "react";
import { alpha } from "@mui/material/styles";
import { Box, Typography, Tabs, Tab, Link } from "@mui/material";
import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import Loader from "../common/Loader";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`beacon-tabpanel-${index}`}
      aria-labelledby={`beacon-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 4 }}>{children}</Box>}
    </div>
  );
}

// This is a part of the initial homepage, for single beacons only
export default function SingleBeaconBanner() {
  const [tabValue, setTabValue] = useState(0);
  const [localDatasets, setLocalDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const { entryTypes, beaconsInfo } = useSelectedEntry();

  const beaconInfo = beaconsInfo?.[0];

  // Function for the tab selection on top of the banner
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch datasets on component mount
  // Saves the full list to local state and preselects the first dataset
  useEffect(() => {
    async function fetchDatasets() {
      setLoading(true);
      try {
        const res = await fetch(`${config.apiUrl}/datasets`);
        const json = await res.json();
        const datasets = json.response?.collections || [];
        setLocalDatasets({ collections: datasets });
        if (datasets.length > 0) {
          setSelectedDataset(datasets[0]);
        }
      } catch (err) {
        console.error("❌ Error fetching datasets:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDatasets();
  }, []);

  if (loading) return <Loader />;

  const baseBgColor = alpha(config.ui.colors.primary, 0.05);

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "transparent",
      }}
    >
      {/* Tabs Header */}
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
            "&:hover": {
              backgroundColor: tabValue === 0 ? "#fff" : "#e0e0e0",
            },
            "&.Mui-selected": {
              color: "#000",
            },
          }}
        />
        <Tab
          label="Datasets Information"
          sx={{
            textTransform: "none",
            fontSize: "13px",
            fontWeight: tabValue === 1 ? "bold" : "normal",
            color: tabValue === 1 ? "#000" : "#9E9E9E",
            backgroundColor: tabValue === 1 ? "#fff" : "transparent",
            borderRadius: "8px 8px 0 0",
            px: 2,
            "&:hover": {
              backgroundColor: tabValue === 1 ? "#fff" : "#e0e0e0",
            },
            "&.Mui-selected": {
              color: "#000",
            },
          }}
        />
      </Tabs>

      {/* Content Box */}
      <Box
        sx={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          backgroundColor: "white",
        }}
      >
        {/* Option 1 – Beacon Information */}
        {beaconInfo && (
          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Loader />
            ) : (
              <>
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
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      flex: "1 1 60%",
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
                      <strong>Organization:</strong>{" "}
                      {beaconInfo.organization?.name}
                    </Typography>

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
                    {beaconInfo.organization?.logoUrl && (
                      <Box
                        component="img"
                        src={beaconInfo.organization.logoUrl}
                        alt="Organization Logo"
                        sx={{
                          height: "50px",
                          objectFit: "contain",
                          display: "block",
                        }}
                        onError={(e) => {
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

        {beaconInfo && (
          <TabPanel value={tabValue} index={1}>
            {loading ? (
              <Loader />
            ) : (
              <>
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

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "14px",
                    minWidth: "250px",
                  }}
                >
                  {/* Left Column – Dataset Selector - Rendering all datasets included in the Single Beacon. */}
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

                    {localDatasets?.collections?.length > 0 ? (
                      localDatasets.collections.map((ds, idx) => (
                        <Box
                          key={ds.id || idx}
                          onClick={() => setSelectedDataset(ds)}
                          sx={{
                            backgroundColor: baseBgColor,
                            borderRadius: "8px",
                            border:
                              selectedDataset?.id === ds.id
                                ? `1px solid ${config.ui.colors.primary}`
                                : "1px solid transparent",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              border: `1px solid ${config.ui.colors.primary}`,
                            },
                          }}
                        >
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
                        No datasets available.
                      </Typography>
                    )}
                  </Box>

                  {/* Right Column – Rendering of the description of each datatset */}
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
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          fontFamily: '"Open Sans", sans-serif',
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                      >
                        Dataset Name:&nbsp;
                        <span style={{ fontWeight: 200 }}>
                          {selectedDataset?.name || selectedDataset?.id || "—"}
                        </span>
                      </Typography>

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
