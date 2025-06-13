import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import CommonFilters from "./CommonFilters";
import GenomicAnnotations from "../genomic/GenomicAnnotations";
import { useSelectedEntry } from "../context/SelectedEntryContext";

function TabPanel(props) {
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

export default function FiltersContainer({ searchHeight }) {
  const { selectedPathSegment, entryTypes } = useSelectedEntry();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    setTabValue(0);
  }, [selectedPathSegment]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const hasGenomic = entryTypes.some(
    (entry) => entry.pathSegment === "g_variants"
  );
  const isGenomicSelected = selectedPathSegment === "g_variants";

  let tabs = [];

  if (hasGenomic && isGenomicSelected) {
    tabs = [
      {
        label: "Genomic Annotations",
        component: <GenomicAnnotations />,
        title: "Genomic Annotations",
      },
      {
        label: "Common Filters",
        component: <CommonFilters />,
        title: "Most Common Filters",
      },
    ];
  } else {
    tabs = [
      {
        label: "Common Filters",
        component: <CommonFilters />,
        title: "Most Common Filters",
      },
    ];

    if (hasGenomic) {
      tabs.push({
        label: "Genomic Annotations",
        component: <GenomicAnnotations />,
        title: "Genomic Annotations",
      });
    }
  }

  return (
    <Box>
      {/* This is the tabs container for: Common Filters and Genomic Annotations. The top part only */}
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label="Filter tabs"
        centered
        sx={{
          backgroundColor: "#F5F5F5",
          borderRadius: "0px",
          padding: "4px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          "& .MuiTabs-indicator": {
            display: "none",
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
              fontSize: "13px",
              borderRadius: "8px",
              borderBottomLeftRadius: "0px",
              borderBottomRightRadius: "0px",
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
      {/* This is for entire box where the filters are located */}
      <Box
        sx={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
          backgroundColor: "white",
          mt: "-4px",
          overflow: "hidden",
          height: `${searchHeight}px`,
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
