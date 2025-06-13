import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";
import config from "../../config/config.json";
import FilterLabel from "./../styling/FilterLabel";
import { useSelectedEntry } from "./../context/SelectedEntryContext";
import CommonMessage from "../../components/common/CommonMessage";

export default function CommonFilters() {
  const filterCategories = config.ui.commonFilters.filterCategories;
  const filterLabels = config.ui.commonFilters.filterLabels;
  const {
    selectedFilter,
    setSelectedFilter,
    setExtraFilter,
    setLoadingData,
    setResultData,
    setHasSearchResult,
  } = useSelectedEntry();

  const getValidLabels = (topic) =>
    filterLabels[topic]?.filter(
      (item) =>
        item.label.trim() !== "" &&
        !/^(item.label)\d*$/i.test(item.label.trim())
    ) ?? [];
  const [message, setMessage] = useState(null);
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
    setExpanded({ [panel]: isExpanded });
  };

  const handleCommonFilterChange = (item) => {
    setLoadingData(false);
    setResultData([]);
    setHasSearchResult(false);
    if (item.type === "alphanumeric") {
      setExtraFilter(item);
    } else {
      setSelectedFilter((prevFilters) => {
        const isDuplicate = prevFilters.some(
          (filter) => filter.key === item.key
        );
        if (isDuplicate) {
          setMessage(
            "This filter is already in use. Choose another one to continue."
          );
          setTimeout(() => setMessage(null), 5000);
          return prevFilters;
        }

        return [...prevFilters, item];
      });
    }
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
    <>
      {message && (
        <Box sx={{ mt: 2 }}>
          <CommonMessage
            text="This filter is already in use. Choose another one to continue."
            type="error"
          />
        </Box>
      )}
      <Box>
        {filterCategories.map((topic) => {
          const validLabels = getValidLabels(topic);
          if (validLabels.length === 0) return null;

          return (
            <Accordion
              key={topic}
              // expanded={expanded[topic]}
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
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {validLabels.map((item) => (
                    <FilterLabel
                      key={item.label}
                      label={item.label}
                      onClick={() => handleCommonFilterChange(item)}
                      bgColor="common"
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </>
  );
}
