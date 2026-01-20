import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import CommonFilters from "./CommonFilters";
import GenomicAnnotations from "../genomic/GenomicAnnotations";
import { ReactComponent as DnaIcon } from "../../assets/logos/dna.svg";
import { ReactComponent as FilterIcon } from "../../assets/logos/filteringterms.svg";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import config from "../../config/config.json";

const buildGenomicAnnotationsTab = (setActiveInput) => ({
  label: "Genomic Annotations",
  component: <GenomicAnnotations setActiveInput={setActiveInput} />,
  title: "Genomic Query Builder Examples",
  titleIcon: (
    <DnaIcon
      className="dnaIcon"
      style={{
        "--dna-primary-color": config.ui.colors.primary,
        "--dna-secondary-color": config.ui.colors.darkPrimary,
      }}
    />
  ),
});

const buildCommonFiltersTab = () => ({
  label: "Common Filters",
  component: <CommonFilters />,
  title: "Most Common Filters",
  titleIcon: (
    <FilterIcon
      className="filterIcon"
      style={{
        "--icon-color": config.ui.colors.darkPrimary,
      }}
    />
  ),
});

function TabPanel(props) {
  // Reusable wrapper that renders the content of each tab when active
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      className="tabpanel"
      hidden={value !== index}
      id={`filter-tabpanel-${index}`}
      aria-labelledby={`filter-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// Main container that decides whether to show "Common Filters" and/or "Genomic Annotations"
//  Behavior:
//  - Renders tabs dynamically based on config and available entry types.
// - Automatically switches to the “Genomic Annotations” tab whenever the activeInput is set to "genomic".
//  - Resets the active tab when entry type changes.
export default function FiltersContainer({
  activeInput,
  setActiveInput,
  searchHeight, // height of the filter box (passed as prop)
  hasGenomicAnnotationsConfig, // boolean: should show Genomic Annotations?
  hasCommonFiltersConfig, // boolean: should show Common Filters?
}) {
  // Grab the currently selected entry type and the list of all entry types from context
  const { selectedPathSegment, entryTypes } = useSelectedEntry();

  // Track which tab is active
  const [tabValue, setTabValue] = useState(0);

  // Reset tabs when user switches entry type
  useEffect(() => {
    setTabValue(0);
  }, [selectedPathSegment]);

  // Handle user tab change
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Detect if genomic entry type exists and/or is selected
  const hasGenomic = entryTypes.some(
    (entry) => entry.pathSegment === "g_variants"
  );
  const isGenomicSelected = selectedPathSegment === "g_variants";

  // Build tab list dynamically based on configuration and entry type
  let tabs = [];

  // Case 1: user is currently viewing "Genomic Variants"
  if (hasGenomic && isGenomicSelected) {
    // If config allows Genomic Annotations → add this tab first
    if (hasGenomicAnnotationsConfig) {
      tabs.push(buildGenomicAnnotationsTab(setActiveInput));
    }

    // If config allows Common Filters → add this tab after Genomic Annotations
    if (hasCommonFiltersConfig) {
      tabs.push(buildCommonFiltersTab());
    }

    // Case 2: user is on a different entry type (not "Genomic Variants")
  } else {
    // Add Common Filters first (if enabled in config)
    if (hasCommonFiltersConfig) {
      tabs.push(buildCommonFiltersTab());
    }

    // Add Genomic Annotations second (but only if the beacon supports genomics)
    if (hasGenomic && hasGenomicAnnotationsConfig) {
      tabs.push(buildGenomicAnnotationsTab(setActiveInput));
    }
  }

  // If no tabs were added (both configs are false) → don't render anything
  if (!tabs.length) return null;

  useEffect(() => {
    if (!tabs.length || !activeInput) return;

    const targetByInput = {
      genomic: "Genomic Annotations",
      filter: "Common Filters",
      common: "Common Filters",
    };

    const targetLabel = targetByInput[activeInput];
    if (!targetLabel) return;

    const targetIndex = tabs.findIndex((tab) => tab.label === targetLabel);
    if (targetIndex !== -1 && targetIndex !== tabValue) {
      setTabValue(targetIndex);
    }
  }, [activeInput]);

  return (
    <Box>
      {/* This is the tabs container for: Common Filters and Genomic Annotations. The top part only */}
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label="Filter tabs"
        sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "0px",
          padding: "4px",
          width: { md: "290px", lg: "338px" },
          "& .MuiTabs-indicator": {
            display: "none",
          },
          "& .MuiTabs-flexContainer": {
            justifyContent: {
              xs: "flex-start",
              md: "center",
              lg: "center",
            },
          },
        }}
      >
        {/* This is for the labels only */}
        {tabs.map((tab, i) => (
          <Tab
            key={tab.label}
            label={tab.label}
            disableRipple
            sx={{
              textTransform: "none",
              paddingX: { xs: "12px", md: "9.5px", lg: "12px" },
              fontSize: "13px",
              borderRadius: "8px 8px 0 0",
              fontWeight: tabValue === i ? "bold" : "normal",
              minHeight: "unset",
              minWidth: "auto",
              color: tabValue === i ? "#000" : "#9E9E9E",
              marginRight: i !== tabs.length - 1 ? 1.5 : 0,
              backgroundColor: tabValue === i ? "#fff" : "transparent",
              boxShadow:
                tabValue === i ? "0px 1px 3px rgba(0,0,0,0.1)" : "none",
              "&:hover": {
                backgroundColor: tabValue === i ? "#fff" : "#e0e0e0",
              },
              "&.Mui-selected": {
                color: "#000",
              },
            }}
          />
        ))}
      </Tabs>
      {/* This is for entire box where the filters are located, excluding the tabs on top */}
      <Box
        sx={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          backgroundColor: "white",
          // backgroundColor: {
          //   lg: "salmon",
          //   md: "pink",
          //   sm: "lightgreen",
          //   xs: "lightblue",
          // },
          mt: "-4px",
          overflow: "hidden",
          height: {
            lg: `${searchHeight}px`,
            md: `${searchHeight}px`,
            sm: "350px",
            xs: "350px",
          },
        }}
      >
        {tabs.map((tab, i) => (
          <TabPanel value={tabValue} index={i} key={tab.label}>
            <Box sx={{ padding: "20px" }}>
              {/* <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  lineHeight: "19px",
                  mb: 0.5,
                  color: "black",
                }}
              >
                {tab.title}
              </Typography> */}

              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  lineHeight: "19px",
                  color: "black",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  mb: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                {tab.titleIcon}
                {tab.title}
              </Typography>

              {tab.component}
            </Box>
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
