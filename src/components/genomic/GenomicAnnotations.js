import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
// Reusable component to display error or info messages
import CommonMessage, {
  COMMON_MESSAGES,
} from "../../components/common/CommonMessage";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";
import config from "../../config/config.json";
import { useSelectedEntry } from "./../context/SelectedEntryContext";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";
export default function GenomicAnnotations() {
  const [message, setMessage] = useState(null);

  // Full list of all genomic filter categories
  const allGenomicCategories = [
    "SNP Examples",
    "CNV Examples",
    "Protein Examples",
    "Molecular Effect",
  ];

  // Get functions from context to update selected filters and control search result state
  // - setSelectedFilter: adds a selected filter to the context
  // - setLoadingData: marks whether data is being fetched
  // - setResultData: stores the results from a query
  // - setHasSearchResult: marks whether results are available
  const {
    setSelectedFilter,
    setLoadingData,
    setResultData,
    setHasSearchResult,
    genomicDraft,
    setGenomicDraft,
  } = useSelectedEntry();

  // Read from config which genomic categories should be shown in the UI
  const genomicVisibleCategories =
    config.ui.genomicAnnotations?.visibleGenomicCategories || [];

  // Keep only the categories that are allowed in config
  const filterCategories = allGenomicCategories.filter((cat) =>
    genomicVisibleCategories.includes(cat)
  );

  // Static mapping of each category to an array of example filter labels
  const filterLabels = {
    "SNP Examples": [
      { key: "TP53", id: "TP53", label: "TP53" },
      {
        key: "7661960T>C",
        id: "7661960T>C",
        label: "7661960T>C",
      },
      {
        key: "NC_000023.10 : 33038255C>A",
        id: "NC_000023.10 : 33038255C>A",
        label: "NC_000023.10 : 33038255C>A",
      },
    ],
    "CNV Examples": [
      {
        key: "NC_000001.11 : 1234del",
        id: "NC_000001.11 : 1234del",
        label: "NC_000001.11 : 1234del",
      },
      {
        key: "MSK1 : 7572837_7578461del",
        id: "MSK1 : 7572837_7578461del",
        label: "MSK1 : 7572837_7578461del",
      },
      {
        key: "NC_000001.11 : [5000, 7676]",
        id: "NC_000001.11 : [5000, 7676]",
        label: "NC_000001.11 : [5000, 7676]",
      },
      {
        key: "[7669, 10000]del",
        id: "[7669, 10000]del",
        label: "[7669, 10000]del",
      },
    ],
    "Protein Examples": [
      {
        key: "TP53 : p.Trp285Cys",
        id: "TP53 : p.Trp285Cys",
        label: "TP53 : p.Trp285Cys",
      },
      {
        key: "NP_003997.1:p.Trp24Cys",
        id: "NP_003997.1:p.Trp24Cys",
        label: "NP_003997.1:p.Trp24Cys",
      },
    ],
    "Molecular Effect": [
      {
        key: "Missense Variant",
        id: "Missense Variant",
        label: "Missense Variant",
      },
      {
        key: "Frameshift Variant",
        id: "Frameshift Variant",
        label: "Frameshift Variant",
      },
      {
        key: "Stop gained",
        id: "Stop gained",
        label: "Stop gained",
      },
      {
        key: "Gain of function",
        id: "Gain of function",
        label: "Gain of function",
      },
      {
        key: "Loss of function",
        id: "Loss of function",
        label: "Loss of function",
      },
      {
        key: "Null mutation",
        id: "Null mutation",
        label: "Null mutation",
      },
    ],
  };

  // Manage which accordion panel is open initially
  const [expanded, setExpanded] = useState(() => {
    const initialState = {};
    let firstSet = false;

    // Expand the first category with valid labels
    allGenomicCategories.forEach((topic) => {
      const validLabels =
        filterLabels[topic]?.filter((label) => label.label.trim() !== "") || [];

      if (validLabels.length > 0 && !firstSet) {
        initialState[topic] = true;
        firstSet = true;
      } else {
        initialState[topic] = false;
      }
    });
    return initialState;
  });

  // Logic that handles the accourdation toggle
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded({ [panel]: isExpanded });
  };

  // This overrides the regular MUI styling in order to align it to our design
  const summarySx = {
    px: 0,
    "& .MuiAccordionSummary-expandIconWrapper": {
      marginLeft: "auto",
      transition: "transform 0.2s ease-in-out",
    },
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)",
    },
    "& .MuiAccordionSummary-content": {
      mr: 1,
    },
  };

  // Logic when the user clicks a genomic annotation chip
  // const handleGenomicFilterChange = (item) => {
  //   setLoadingData(false);
  //   setResultData([]);
  //   setHasSearchResult(false);

  //   // Update selected filters to avoid duplicates
  //   setSelectedFilter((prevGenomicAnnotation) => {
  //     const isDuplicate = prevGenomicAnnotation.some(
  //       (genAnnotation) => genAnnotation.id === item.id
  //     );

  //     if (isDuplicate) {
  //       // Show message if the filter was already selected
  //       setMessage(COMMON_MESSAGES.doubleFilter);
  //       setTimeout(() => setMessage(null), 3000);
  //       return prevGenomicAnnotation;
  //     }
  //     console.log("prevGenomicAnnotation", prevGenomicAnnotation);
  //     // Add the new filter
  //     return [...prevGenomicAnnotation, item];
  //   });
  //   console.log("item", item);
  // };

  const handleGenomicFilterChange = (item) => {
    const value = (item.label || item.id)?.trim();

    if ((genomicDraft || "").trim() === value) {
      setMessage(COMMON_MESSAGES.doubleFilter);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setGenomicDraft(value);
    setActiveInput("genomic");
  };

  return (
    <Box>
      {/* Display error message if any */}
      {message && (
        <Box sx={{ mt: 2 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}
      {/* Render each visible filter category */}
      {filterCategories.map((topic) => {
        const validLabels = filterLabels[topic]?.filter(
          (label) => label.label.trim() !== ""
        );

        if (!validLabels || validLabels.length === 0) return null;

        return (
          <Accordion
            key={topic}
            expanded={!!expanded[topic]}
            onChange={handleChange(topic)}
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: "transparent",
              boxShadow: "none",
              "&::before": { display: "none" },
            }}
          >
            {/* Accordion header */}
            <AccordionSummary
              expandIcon={<KeyboardArrowRightIcon />}
              sx={summarySx}
            >
              <Typography
                translate="no"
                sx={{ fontStyle: "italic", fontSize: "14px" }}
              >
                {topic}
              </Typography>
            </AccordionSummary>

            {/* Accordion body with filter chips */}
            <AccordionDetails sx={{ px: 0, pt: 0 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {validLabels.map((item) => (
                  <FilterLabelRemovable
                    variant="simple"
                    key={item.label}
                    label={item.label}
                    onClick={() =>
                      handleGenomicFilterChange({ ...item, bgColor: "genomic" })
                    }
                    bgColor="genomic"
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
