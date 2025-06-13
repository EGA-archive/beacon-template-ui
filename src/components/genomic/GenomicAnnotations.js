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

export default function GenomicAnnotations() {
  const allGenomicCategories = [
    "SNP Examples",
    "CNV Examples",
    "Protein Examples",
    "Molecular Effect",
  ];

  const genomicVisibleCategories =
    config.ui.genomicAnnotations?.visibleGenomicCategories || [];

  const filterCategories = allGenomicCategories.filter((cat) =>
    genomicVisibleCategories.includes(cat)
  );

  const filterLabels = {
    "SNP Examples": ["TP53 : 7661960T>C", "NC_000023.10 : 33038255C>A"],
    "CNV Examples": [
      "NC_000001.11 : 1234del",
      "MSK1 : 7572837_7578461del",
      "NC_000001.11 : [5000, 7676], [7669, 10000]del",
    ],
    "Protein Examples": ["TP53 : p.Trp285Cys", "NP_003997.1:p.Trp24Cys"],
    "Molecular Effect": [
      "Missense Variant",
      "Frameshift Variant",
      "Stop gained",
      "Gain of function",
      "Loss of function",
      "Null mutation",
    ],
  };

  const [expanded, setExpanded] = useState(() => {
    const initialState = {};
    let firstSet = false;
    allGenomicCategories.forEach((topic) => {
      const validLabels = filterLabels[topic]?.filter(
        (label) => label.trim() !== ""
      );
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
        const validLabels = filterLabels[topic]?.filter(
          (label) => label.trim() !== ""
        );
        if (!validLabels || validLabels.length === 0) return null;

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
                {topic}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 0 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {validLabels.map((label) => (
                  <FilterLabel
                    key={label}
                    label={label}
                    onClick={() => console.log(label)}
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
