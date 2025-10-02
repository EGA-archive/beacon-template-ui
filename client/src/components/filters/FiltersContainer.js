import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import CommonFilters from "./CommonFilters";
import GenomicAnnotations from "../genomic/GenomicAnnotations";
import { useSelectedEntry } from "../context/SelectedEntryContext";

function TabPanel(props) {
  // TabPanel shows the content of each tab (only if active)
  const { children, value, index, ...other } = props;

  {
    /* This is the main container for the common filters and genomic annotation */
  }
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
export default function FiltersContainer({
  setActiveInput,
  searchHeight, // height of the filter box (passed as prop)
  hasGenomicAnnotationsConfig, // boolean: should show Genomic Annotations?
  hasCommonFiltersConfig, // boolean: should show Common Filters?
}) {
  // Grab the currently selected entry type and the list of all entry types from context
  const { selectedPathSegment, entryTypes } = useSelectedEntry();

  // State to track which tab is active (0 = first tab, 1 = second, etc.)
  const [tabValue, setTabValue] = useState(0);

  // Reset tabs when user switches entry type
  useEffect(() => {
    setTabValue(0);
  }, [selectedPathSegment]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Detect if genomic entry type exists & is selected
  const hasGenomic = entryTypes.some(
    (entry) => entry.pathSegment === "g_variants"
  );
  const isGenomicSelected = selectedPathSegment === "g_variants";

  let tabs = []; // start with an empty list of tabs

  // Case 1: user is currently viewing "Genomic Variants"
  if (hasGenomic && isGenomicSelected) {
    // If config allows Genomic Annotations → add this tab first
    if (hasGenomicAnnotationsConfig)
      tabs.push({
        label: "Genomic Annotations", // tab title shown in UI
        component: <GenomicAnnotations setActiveInput={setActiveInput} />, // actual component to render
        title: "Genomic Annotations", // heading inside the panel
      });

    // If config allows Common Filters → add this tab after Genomic Annotations
    if (hasCommonFiltersConfig)
      tabs.push({
        label: "Common Filters",
        component: <CommonFilters />,
        title: "Most Common Filters",
      });

    // Case 2: user is on a different entry type (not "Genomic Variants")
  } else {
    // Add Common Filters first (if enabled in config)
    if (hasCommonFiltersConfig)
      tabs.push({
        label: "Common Filters",
        component: <CommonFilters />,
        title: "Most Common Filters",
      });

    // Add Genomic Annotations second (but only if the beacon supports genomics)
    if (hasGenomic && hasGenomicAnnotationsConfig)
      tabs.push({
        label: "Genomic Annotations",
        component: <GenomicAnnotations setActiveInput={setActiveInput} />,
        title: "Genomic Annotations",
      });
  }

  // If no tabs were added (both configs are false) → don't render anything
  if (!tabs.length) return null;

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
              <Typography
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
              </Typography>
              {tab.component}
            </Box>
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
