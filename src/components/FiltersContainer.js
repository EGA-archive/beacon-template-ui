import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import CommonFilters from "./CommonFilters";
import GenomicAnnotations from "./GenomicAnnotations";
import { useSelectedEntry } from "./context/SelectedEntryContext";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`filter-tabpanel-${index}`}
      aria-labelledby={`filter-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function FiltersContainer() {
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
      <Tabs
        value={tabValue}
        onChange={handleChange}
        aria-label="Filter tabs"
        sx={{
          minHeight: "32px",
          borderBottom: "1px solid #E0E0E0",
          mb: 0,
          "& .MuiTabs-indicator": {
            display: "none",
          },
        }}
      >
        {tabs.map((tab, i) => (
          <Tab
            key={tab.label}
            label={tab.label}
            sx={{
              textTransform: "none",
              fontSize: "14px",
              fontWeight: tabValue === i ? "bold" : "normal",
              color: tabValue === i ? "black" : "#9E9E9E",
              p: 0,
              mr: i === 0 ? 3 : 0,
              minHeight: "32px",
              minWidth: "unset",
              "&.Mui-selected": { color: "black" },
            }}
          />
        ))}
      </Tabs>

      {tabs.map((tab, i) => (
        <TabPanel value={tabValue} index={i} key={tab.label}>
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
        </TabPanel>
      ))}
    </Box>
  );
}
