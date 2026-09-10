import { useEffect, useMemo, useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import CommonFilters from "./CommonFilters";
import GenomicAnnotations from "../genomic/GenomicAnnotations";
import { ReactComponent as DnaIcon } from "../../assets/logos/dna.svg";
import { ReactComponent as FilterIcon } from "../../assets/logos/filteringterms.svg";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import config from "../../config/runtimeConfig";

const stackSearchAndCommonFilters = "@media (max-width:1180px)";
const sideBySideSearchAndFilters = "@media (min-width:1181px)";

/**
 * Connects each search input with the tab that should open.
 */
const tabLabelByInput = {
  genomic: "Genomic Annotations",
  filter: "Common Filters",
  common: "Common Filters",
};

/**
 * Creates the Common Filters tab information.
 */
const buildCommonFiltersTab = () => ({
  label: "Common Filters",
  title: "Most Common Filters",
  component: <CommonFilters />,
  titleIcon: (
    <FilterIcon
      className="filterIcon"
      style={{
        "--icon-color": config.ui.colors.darkPrimary,
      }}
    />
  ),
});

/**
 * Creates the Genomic Annotations tab information.
 */
const buildGenomicAnnotationsTab = (setActiveInput) => ({
  label: "Genomic Annotations",
  title: "Genomic Query Builder Examples",
  component: <GenomicAnnotations setActiveInput={setActiveInput} />,
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

/**
 * Displays the tab buttons at the top of the filters box.
 */
function FilterTabs({ tabs, tabValue, onChange }) {
  return (
    <Tabs
      value={tabValue}
      onChange={onChange}
      aria-label="Filter tabs"
      sx={{
        backgroundColor: "#F5F5F5",
        padding: "4px",
        width: {
          md: "290px",
          lg: "338px",
        },

        "& .MuiTabs-indicator": {
          display: "none",
        },

        "& .MuiTabs-flexContainer": {
          justifyContent: {
            xs: "flex-start",
            md: "center",
          },
        },
      }}
    >
      {tabs.map((tab, index) => {
        const isSelected = tabValue === index;
        const isLastTab = index === tabs.length - 1;

        return (
          <Tab
            key={tab.label}
            label={tab.label}
            disableRipple
            sx={{
              textTransform: "none",
              paddingX: {
                xs: "12px",
                md: "9.5px",
                lg: "12px",
              },
              fontSize: "13px",
              borderRadius: "8px 8px 0 0",
              fontWeight: isSelected ? "bold" : "normal",
              minHeight: "unset",
              minWidth: "auto",
              color: isSelected ? "#000" : "#9E9E9E",
              marginRight: isLastTab ? 0 : 1.5,
              backgroundColor: isSelected ? "#fff" : "#e0e0e0",
              boxShadow: isSelected ? "0px 1px 3px rgba(0,0,0,0.1)" : "none",

              "&:hover": {
                backgroundColor: isSelected ? "#fff" : "#e0e0e0",
                color: isSelected ? "#000" : "black",
              },

              "&.Mui-selected": {
                color: "#000",
              },
            }}
          />
        );
      })}
    </Tabs>
  );
}

/**
 * Displays the content of the currently selected tab.
 */
function FilterContent({ tabs, tabValue }) {
  const activeTab = tabs[tabValue];

  if (!activeTab) return null;

  return (
    <Box sx={{ pt: 2, padding: "20px" }}>
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
        {activeTab.titleIcon}
        {activeTab.title}
      </Typography>

      {activeTab.component}
    </Box>
  );
}

/**
 * Displays Common Filters and, when available, Genomic Annotations.
 *
 * When all Entry Types are non-genomic, Common Filters is the only possible
 * section. In that case, the tab button is hidden and the content is shown
 * directly.
 */
export default function FiltersContainer({
  activeInput,
  setActiveInput,
  searchHeight,
  hasGenomicAnnotationsConfig,
  hasCommonFiltersConfig,
}) {
  const { entryTypes } = useSelectedEntry();
  const [tabValue, setTabValue] = useState(0);

  /**
   * Check whether Genomic Variants is available.
   */
  const hasGenomic = entryTypes.some(
    (entry) => entry.pathSegment === "g_variants"
  );

  /**
   * True when Entry Types exist, but none of them is Genomic Variants.
   */
  const hasOnlyNonGenomicEntryTypes = entryTypes.length > 0 && !hasGenomic;

  /**
   * Build only the tabs that are allowed by the configuration.
   *
   * useMemo prevents this array from being rebuilt on every render.
   */
  const tabs = useMemo(
    () => [
      ...(hasCommonFiltersConfig ? [buildCommonFiltersTab()] : []),

      ...(hasGenomicAnnotationsConfig && hasGenomic
        ? [buildGenomicAnnotationsTab(setActiveInput)]
        : []),
    ],
    [
      hasCommonFiltersConfig,
      hasGenomicAnnotationsConfig,
      hasGenomic,
      setActiveInput,
    ]
  );

  /**
   Open the correct tab when the user activates a search input.
   */
  useEffect(() => {
    const targetLabel = tabLabelByInput[activeInput];
    if (!targetLabel) return;
    const targetIndex = tabs.findIndex((tab) => tab.label === targetLabel);
    if (targetIndex !== -1) {
      setTabValue(targetIndex);
    }
  }, [activeInput, tabs]);

  // Nothing is shown when no filter sections are enabled.
  if (!tabs.length) return null;
  return (
    <Box>
      {/*
       * Tabs are useful only when a genomic Entry Type exists.
       * Otherwise, Common Filters is shown directly.
       */}
      {!hasOnlyNonGenomicEntryTypes && (
        <FilterTabs
          tabs={tabs}
          tabValue={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
        />
      )}
      {/*
       * Main filters box.
       * The top margin changes when the tab buttons are hidden so that the
       * Filters box stays aligned with the Search box on larger screens.
       */}
      <Box
        sx={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          backgroundColor: "white",
          overflowY: "auto",
          overflowX: "hidden",
          mt: hasOnlyNonGenomicEntryTypes ? 0 : "-4.7px",
          [sideBySideSearchAndFilters]: {
            mt: hasOnlyNonGenomicEntryTypes ? "43px" : "-4.7px",
          },
          height: {
            lg: `${searchHeight}px`,
            md: `${searchHeight}px`,
            sm: "350px",
            xs: "350px",
          },
          [stackSearchAndCommonFilters]: {
            height: "auto",
          },
        }}
      >
        <FilterContent tabs={tabs} tabValue={tabValue} />
      </Box>
    </Box>
  );
}
