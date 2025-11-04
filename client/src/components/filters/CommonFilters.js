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
import { useSelectedEntry } from "./../context/SelectedEntryContext";
import CommonMessage, {
  COMMON_MESSAGES,
} from "../../components/common/CommonMessage";
import { getDisplayLabelAndScope } from "../common/filteringTermsHelpers";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";

export default function CommonFilters() {
  const filterCategories = config.ui.commonFilters.filterCategories;
  const filterLabels = config.ui.commonFilters.filterLabels;
  const {
    setExtraFilter,
    setLoadingData,
    setResultData,
    setHasSearchResult,
    selectedPathSegment,
    extraFilter,
    valueInputRef,
    selectedFilter,
    setSelectedFilter,
    hasSearchResults,
    setQueryDirty,
  } = useSelectedEntry();

  const getValidLabels = (topic) =>
    (filterLabels[topic] ?? []).filter((item) => {
      const label = item.label?.trim();
      if (!label || /^(item.label)\d*$/i.test(label)) return false;

      const { selectedScope } = getDisplayLabelAndScope(
        item,
        selectedPathSegment
      );
      return selectedScope !== null || !item.scopes || item.scopes.length === 0;
    });

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

  // const handleCommonFilterChange = (item) => {
  //   setLoadingData(false);
  //   setResultData([]);
  //   setHasSearchResult(false);
  //   if (extraFilter && !extraFilter.value) {
  //     setMessage(COMMON_MESSAGES.incompleteFilter);
  //     setTimeout(() => {
  //       setMessage(null);
  //       if (valueInputRef?.current) {
  //         valueInputRef.current.scrollIntoView({
  //           behavior: "smooth",
  //           block: "center",
  //         });
  //       }
  //     }, 3000);
  //     return;
  //   }
  //   if (item.type === "alphanumeric") {
  //     setExtraFilter(item);
  //     return;
  //   }
  //   setSelectedFilter((prevFilters) => {
  //     const isDuplicate = prevFilters.some(
  //       (filter) => filter.id === item.id && filter.scope === item.scope
  //     );

  //     if (isDuplicate) {
  //       setMessage(COMMON_MESSAGES.doubleFilter);
  //       setTimeout(() => setMessage(null), 3000);
  //       return prevFilters;
  //     }

  //     return [...prevFilters, item];
  //   });
  // };

  const handleCommonFilterChange = (item) => {
    if (hasSearchResults) {
      setQueryDirty(true);
    }

    if (extraFilter && !extraFilter.value) {
      setMessage(COMMON_MESSAGES.incompleteFilter);
      setTimeout(() => {
        setMessage(null);
        valueInputRef?.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 3000);
      return;
    }

    // if (item.type === "alphanumeric") {
    //   setExtraFilter(item);
    //   return;
    // }

    if (item.type === "alphanumeric") {
      if (hasSearchResults) setQueryDirty(true);
      setExtraFilter(item);
      return;
    }

    setSelectedFilter((prevFilters) => {
      const isDuplicate = prevFilters.some(
        (filter) => filter.id === item.id && filter.scope === item.scope
      );

      if (isDuplicate) {
        setMessage(COMMON_MESSAGES.doubleFilter);
        setTimeout(() => setMessage(null), 3000);
        return prevFilters;
      }

      return [...prevFilters, item];
    });
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
          <CommonMessage text={message} type="error" />
        </Box>
      )}

      <Box>
        {filterCategories.map((topic) => {
          const validLabels = getValidLabels(topic);
          if (validLabels.length === 0) return null;

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
                  {validLabels.map((item) => {
                    const { selectedScope, allScopes } =
                      getDisplayLabelAndScope(item, selectedPathSegment);

                    return (
                      <FilterLabelRemovable
                        variant="simple"
                        key={item.label}
                        label={item.label}
                        onClick={() =>
                          handleCommonFilterChange({
                            ...item,
                            scope: selectedScope || allScopes?.[0] || null,
                            scopes: allScopes ?? [],
                          })
                        }
                        bgColor="common"
                      />
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </>
  );
}
