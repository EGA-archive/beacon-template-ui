import {
  Box,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";
import config from "../config/config.json";

export default function CommonFilters() {
  const filterCategories = config.ui.commonFilters.filterCategories;
  const filterLabels = config.ui.commonFilters.filterLabels;

  // 🧼 Utility: get cleaned list of valid labels
  const getValidLabels = (topic) =>
    filterLabels[topic]?.filter(
      (label) => label.trim() !== "" && !/^label\d*$/i.test(label.trim()) // remove "label", "label1", etc.
    ) ?? [];

  // 🌟 Open first category with valid labels
  const [expanded, setExpanded] = useState(() => {
    const initialState = {};
    let firstSet = false;
    filterCategories.forEach((topic) => {
      const validLabels = getValidLabels(topic);
      if (validLabels.length > 0 && !firstSet) {
        initialState[topic] = true;
        firstSet = true;
      } else {
        initialState[topic] = false;
      }
    });
    return initialState;
  });

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded((prev) => ({
      ...prev,
      [panel]: isExpanded,
    }));
  };

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

  return (
    <Box>
      {filterCategories.map((topic) => {
        const validLabels = getValidLabels(topic);
        if (validLabels.length === 0) return null; // 💥 Skip empty categories

        return (
          <Accordion
            key={topic}
            expanded={expanded[topic]}
            onChange={handleChange(topic)}
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: "transparent",
              boxShadow: "none",
              "&::before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<KeyboardArrowRightIcon />}
              sx={summarySx}
            >
              <Typography
                translate="no"
                sx={{ fontStyle: "italic", fontSize: "14px" }}
              >
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 0 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {validLabels.map((label) => (
                  <Chip
                    translate="no"
                    key={label}
                    label={label}
                    onClick={() => console.log(label)}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
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
