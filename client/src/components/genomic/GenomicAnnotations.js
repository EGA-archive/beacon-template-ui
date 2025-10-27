import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import CommonMessage, {
  COMMON_MESSAGES,
} from "../../components/common/CommonMessage";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";
import config from "../../config/config.json";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import FilterLabelRemovable from "../styling/FilterLabelRemovable";
import { queryBuilder } from "../search/utils/queryBuilder";

export default function GenomicAnnotations({ setActiveInput }) {
  const [message, setMessage] = useState(null);

  const allGenomicCategories = [
    "SNP Examples",
    "CNV Examples",
    "Protein Examples",
    "Molecular Effect",
  ];

  const {
    setSelectedFilter,
    setLoadingData,
    setHasSearchResult,
    setResultData,
  } = useSelectedEntry();

  const genomicVisibleCategories =
    config.ui.genomicAnnotations?.visibleGenomicCategories || [];

  const filterCategories = allGenomicCategories.filter((cat) =>
    genomicVisibleCategories.includes(cat)
  );

  const filterLabels = {
    "SNP Examples": [
      {
        key: "TP53",
        id: "TP53",
        label: "TP53",
        type: "genomic",
        field: "geneId",
        queryParams: { geneId: "TP53" },
      },
      {
        key: "GRCh38:17:7661960T>C",
        id: "GRCh38:17:7661960T>C",
        label: "GRCh38:17:7661960T>C",
        type: "genomic",
        queryParams: {
          assemblyId: "GRCh38",
          referenceName: "17",
          start: [7661960],
          referenceBases: "T",
          alternateBases: "C",
        },
      },
      {
        key: "NC_000017.11:g.43057063G>A",
        id: "NC_000017.11:g.43057063G>A",
        label: "NC_000017.11:g.43057063G>A",
        type: "genomic",
        queryParams: {
          identifiers: {
            genomicHGVSId: "NC_000017.11:g.43057063G>A",
          },
        },
      },
      // {
      //   key: "NC_000017.11:g.43057063G>A",
      //   id: "NC_000017.11:g.43057063G>A",
      //   label: "NC_000017.11:g.43057063G>A",
      //   type: "genomic",
      //   queryParams: {
      //     genomicHGVSId: "NC_000017.11:g.43057063G>A",
      //   },
      // },
    ],

    "CNV Examples": [
      {
        key: "NC_000001.11 : 1234del",
        id: "NC_000001.11 : 1234del",
        label: "GRCh38:NC_000001.11:1234del",
        type: "genomic",
        field: "variantType",
        queryParams: {
          assemblyId: "GRCh38",
          referenceName: "NC_000001.11",
          start: 1234,
          end: 1234,
          variantType: "DEL",
        },
      },
      {
        key: "MSK1 : 7572837_7578461del",
        id: "MSK1 : 7572837_7578461del",
        label: "GRCh38:MSK1:7572837_7578461del",
        type: "genomic",
        field: "variantType",
        queryParams: {
          assemblyId: "GRCh38",
          referenceName: "MSK1",
          start: 7572837,
          end: 7578461,
          variantType: "DEL",
        },
      },
      {
        key: "NC_000001.11 : [5000, 7676]",
        id: "NC_000001.11 : [5000, 7676]",
        label: "GRCh38:NC_000001.11:[5000,7676]",
        type: "genomic",
        field: "location",
        queryParams: {
          assemblyId: "GRCh38",
          referenceName: "NC_000001.11",
          start: 5000,
          end: 7676,
        },
      },
      {
        key: "[7669, 10000]del",
        id: "[7669, 10000]del",
        label: "GRCh38:[7669,10000]del",
        type: "genomic",
        field: "variantType",
        queryParams: {
          assemblyId: "GRCh38",
          start: 7669,
          end: 10000,
          variantType: "DEL",
        },
      },
    ],

    "Protein Examples": [
      {
        key: "NP_009225.1:p.Glu1817Ter",
        id: "NP_009225.1:p.Glu1817Ter",
        label: "NP_009225.1:p.Glu1817Ter",
        type: "genomic",
        field: "proteinHGVSIds",
        queryParams: {
          identifiers: {
            proteinHGVSIds: ["NP_009225.1:p.Glu1817Ter"],
          },
        },
      },
      {
        key: "LRG 199p1:p.Val25Gly",
        id: "LRG 199p1:p.Val25Gly",
        label: "LRG 199p1:p.Val25Gly",
        type: "genomic",
        field: "proteinHGVSIds",
        queryParams: {
          identifiers: {
            proteinHGVSIds: ["LRG 199p1:p.Val25Gly"],
          },
        },
      },
    ],

    "Molecular Effect": [
      {
        key: "SO:0001583",
        id: "SO:0001583",
        label: "Missense Variant",
        type: "genomic",
        field: "molecularEffects",
        queryParams: {
          molecularAttributes: {
            molecularEffects: [{ id: "SO:0001583", label: "Missense Variant" }],
          },
        },
      },
      {
        key: "SO:0002322",
        id: "SO:0002322",
        label: "Stop gained NMD escaping",
        type: "genomic",
        field: "molecularEffects",
        queryParams: {
          molecularAttributes: {
            molecularEffects: [
              { id: "SO:0002322", label: "Stop gained NMD escaping" },
            ],
          },
        },
      },
    ],
  };

  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    let first = false;
    allGenomicCategories.forEach((t) => {
      const valid = filterLabels[t]?.filter((l) => l.label?.trim()) || [];
      if (valid.length && !first) {
        initial[t] = true;
        first = true;
      } else initial[t] = false;
    });
    return initial;
  });

  const handleChange = (panel) => (_, isExpanded) =>
    setExpanded({ [panel]: isExpanded });

  const summarySx = {
    px: 0,
    "& .MuiAccordionSummary-expandIconWrapper": {
      marginLeft: "auto",
      transition: "transform 0.2s ease-in-out",
    },
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)",
    },
    "& .MuiAccordionSummary-content": { mr: 1 },
  };

  // --- handle click on chip ---
  const handleGenomicFilterChange = (item) => {
    const value = (item.label || item.id)?.trim();

    // add filter to context
    setSelectedFilter((prev = []) => {
      const isDuplicate = prev.some(
        (f) =>
          f.type === "genomic" &&
          f.id === (item.field || "geneId") &&
          f.label === value
      );
      if (isDuplicate) {
        setMessage(COMMON_MESSAGES.doubleValue);
        setTimeout(() => setMessage(null), 3000);
        return prev;
      }

      const alreadyHasGenomic = prev.some((f) => f.type === "genomic");
      if (alreadyHasGenomic) {
        setMessage(COMMON_MESSAGES.singleGenomicQuery);
        setTimeout(() => setMessage(null), 3000);
        return prev;
      }

      return [
        ...prev,
        {
          key: item.key,
          id: item.field || "geneId",
          label: value,
          value,
          type: "genomic",
          bgColor: "genomic",
          queryParams: item.queryParams || {},
        },
      ];
    });

    setTimeout(() => {
      if (!item.queryParams || Object.keys(item.queryParams).length === 0) {
        console.warn("[GenomicAnnotations] Skipping empty query", item);
        return;
      }
      triggerGenomicQuery([
        {
          key: item.key,
          id: item.field || "geneId",
          label: value,
          value,
          type: "genomic",
          bgColor: "genomic",
          queryParams: item.queryParams || {},
        },
      ]);
    }, 150);
  };

  const triggerGenomicQuery = async (filters) => {
    const genomic = filters.find((f) => f.type === "genomic");
    if (
      !genomic ||
      !genomic.queryParams ||
      !Object.keys(genomic.queryParams).length
    ) {
      console.warn(
        "[GenomicAnnotations] Skipped query — missing valid genomic params."
      );
      return;
    }

    try {
      setLoadingData(true);
      setHasSearchResult(false);
      setResultData([]);

      const builtQuery = queryBuilder(filters);
      console.log("[GenomicAnnotations] Built query ➜", builtQuery);

      const response = await fetch(`${config.apiUrl}/${selectedPathSegment}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(builtQuery),
      });

      const data = await response.json();

      // Only set results if we actually got a valid payload
      if (data && Object.keys(data).length > 0) {
        setResultData(data);
        setHasSearchResult(true);
      } else {
        console.info(
          "[GenomicAnnotations] Empty or invalid response — skipping display."
        );
      }
    } catch (err) {
      // Silent catch: no UI message, just a light log for dev visibility
      console.warn(
        "[GenomicAnnotations] Query request failed:",
        err?.message || err
      );
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <Box>
      {message && (
        <Box sx={{ mt: 2 }}>
          <CommonMessage text={message} type="error" />
        </Box>
      )}

      {filterCategories.map((topic) => {
        const valid = filterLabels[topic]?.filter((l) => l.label?.trim());
        if (!valid?.length) return null;

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
                {topic}
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 0, pt: 0, mb: 3 }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {valid.map((item) => (
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
