import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { GENOMIC_LABELS_MAP } from "../../genomic/genomicLabelHelper";
import config from "../../../config/runtimeConfig";

import needHelpFirstImage from "../../../assets/logos/need-help.svg";
import needHelpSequence from "../../../assets/logos/need-help-sequence.svg";
import needHelpGene from "../../../assets/logos/need-help-gene.svg";
import needHelpRange from "../../../assets/logos/need-help-range.svg";
import needHelpBracket from "../../../assets/logos/need-help-bracket.svg";

export default function GenomicQueryBuilderHelp({
  setSelectedQueryType,
  setTabDrafts,
}) {
  const primaryDarkColor = config.ui.colors.darkPrimary;
  const HELP_LABEL_COLUMN_WIDTH = {
    xs: "23%",
    sm: "23%",
  };

  const cards = [
    {
      title: "Retrieve by single variation",
      queryType: "Sequence Query",
      image: needHelpSequence,
      examples: [
        {
          assemblyId: "GRCh38",
          chromosome: "22",
          start: "16050527",
          referenceBases: "C",
          alternateBases: "A",
        },
      ],
    },
    {
      title: "Retrieve by Gene HGNC symbol",
      queryType: "Gene ID",
      image: needHelpGene,
      examples: [
        {
          geneId: "BRCA1",
        },
        {
          geneId: "TP53",
          refAa: "Lys",
          altAa: "Cys",
          aaPosition: "120",
        },
      ],
    },
    {
      title: "Retrieve all variants within or overlapping the genomic range",
      queryType: "Range Query",
      image: needHelpRange,
      examples: [
        {
          assemblyId: "GRCh38",
          chromosome: "22",
          start: "16050527",
          end: "16050627",
        },
      ],
    },
    {
      title:
        "Retrieve all variants with start and end positions within defined ranges",
      queryType: "Bracket Query",
      image: needHelpBracket,
      examples: [
        {
          assemblyId: "GRCh38",
          chromosome: "22",
          startMin: "16050427",
          startMax: "16050527",
          endMin: "16050627",
          endMax: "16050727",
        },
      ],
    },
  ];

  const helpRowGridStyles = {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      md: "minmax(0, 1.35fr) minmax(280px, 0.85fr)",
    },
    gap: {
      xs: 0,
      sm: 0,
      md: 4,
    },
    alignItems: "center",
  };

  const getQueryRowStyles = (queryType) => {
    const needsMoreInnerGap =
      queryType === "Range Query" || queryType === "Bracket Query";

    const needsMoreTopGap = queryType === "Bracket Query";

    return {
      ...helpRowGridStyles,

      // Gap between the image block and its example block
      gap: needsMoreInnerGap
        ? {
            xs: 0,
            sm: 0,
            md: 4,
          }
        : helpRowGridStyles.gap,

      // Extra space between Range Query row and Bracket Query row
      mt: needsMoreTopGap
        ? {
            xs: 2,
            sm: 2,
            md: 2,
          }
        : 0,
    };
  };

  const handleExampleClick = (card, example) => {
    const queryType = card.queryType;

    const queryParamsMap = {
      "Sequence Query": {
        assemblyId: example.assemblyId,
        chromosome: example.chromosome,
        start: Number(example.start),
        refBases: example.referenceBases,
        alternateBases: example.alternateBases,
      },

      "Gene ID": {
        geneId: example.geneId,
        refAa: example.refAa,
        altAa: example.altAa,
        aaPosition: example.aaPosition,
      },

      "Range Query": {
        assemblyId: example.assemblyId,
        chromosome: example.chromosome,
        start: Number(example.start),
        end: Number(example.end),
      },

      "Bracket Query": {
        assemblyId: example.assemblyId,
        chromosome: example.chromosome,
        startMin: [Number(example.startMin)],
        startMax: [Number(example.startMax)],
        endMin: [Number(example.endMin)],
        endMax: [Number(example.endMax)],
      },
    };

    setTabDrafts((prev) => ({
      ...prev,
      [queryType]: {
        ...prev[queryType],
        ...queryParamsMap[queryType],
      },
    }));

    setSelectedQueryType(queryType);
  };

  const renderExampleLabel = (example) =>
    Object.entries(example).map(([key, value], index, array) => (
      <span key={key}>
        {GENOMIC_LABELS_MAP[key] || key}: <strong>{value}</strong>
        {index < array.length - 1 && " | "}
      </span>
    ));

  const renderExamples = (card) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {card.examples.map((example, index) => (
        <Box
          key={`${card.queryType}-${index}`}
          onClick={() => handleExampleClick(card, example)}
          sx={{
            p: "8px 10px",
            borderRadius: "6px",
            border: `1px solid ${primaryDarkColor}`,
            backgroundColor: alpha(config.ui.colors.secondary, 0.18),
            fontSize: {
              lg: "12px",
              md: "12px",
              sm: "11px",
              xs: "10px",
            },
            lineHeight: "16px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",

            "&:hover": {
              backgroundColor: alpha(config.ui.colors.secondary, 0.35),
            },
          }}
        >
          {renderExampleLabel(example)}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        fontFamily: '"Open Sans", sans-serif',
        // backgroundColor: {
        //   lg: "lightsalmon",
        //   md: "pink",
        //   sm: "lightgreen",
        //   xs: "lightblue",
        // },
      }}
    >
      {/* Intro */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "14px",
            mb: 1,
          }}
        >
          What do you want to search?
        </Typography>

        <Typography
          sx={{
            fontSize: "12px",
            lineHeight: "18px",
          }}
        >
          If you want to know more about the genomic query types, you can visit
          the{" "}
          <Box
            component="a"
            href="https://beacon-documentation-demo.ega-archive.org/pi-querying-the-api#pi-get-method"
            target="_blank"
            rel="noreferrer"
            sx={{
              fontWeight: 700,
              color: "inherit",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            documentation
          </Box>
          .
        </Typography>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* Top row: chromosome overview + examples heading */}
        <Box
          sx={{
            ...helpRowGridStyles,
            alignItems: "start",
          }}
        >
          <Box
            component="img"
            src={needHelpFirstImage}
            alt="Genomic query overview"
            sx={{
              display: "block",
              width: {
                xs: `calc(100% - ${HELP_LABEL_COLUMN_WIDTH.xs})`,
                sm: `calc(100% - ${HELP_LABEL_COLUMN_WIDTH.sm})`,
              },
              ml: {
                xs: HELP_LABEL_COLUMN_WIDTH.xs,
                sm: HELP_LABEL_COLUMN_WIDTH.sm,
              },
            }}
          />

          <Box
            sx={{
              display: {
                xs: "none",
                sm: "none",
                md: "block",
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "14px",
                mb: 1,
              }}
            >
              Examples
            </Typography>

            <Typography
              sx={{
                fontSize: "12px",
                lineHeight: "16px",
              }}
            >
              Select an example to automatically populate the query fields.
            </Typography>
          </Box>
        </Box>

        {/* Query rows */}
        {cards.map((card) => (
          <Box key={card.queryType} sx={getQueryRowStyles(card.queryType)}>
            <Box
              onClick={() => setSelectedQueryType(card.queryType)}
              sx={{
                cursor: "pointer",
                borderRadius: "8px",
                transition: "opacity 0.2s ease, transform 0.2s ease",

                "&:hover": {
                  opacity: 0.85,
                  transform: "translateY(-1px)",
                },
              }}
            >
              <Box
                component="img"
                src={card.image}
                alt={`${card.queryType}: ${card.title}`}
                sx={{
                  width: "100%",
                  display: "block",
                }}
              />
            </Box>

            <Box
              //  Check with Sara
              // This is the alignment of the Bracket Query label
              sx={{
                alignSelf:
                  card.queryType === "Bracket Query"
                    ? {
                        xs: "center",
                        sm: "center",
                        md: "center",
                        lg: "start",
                      }
                    : "center",
              }}
            >
              {renderExamples(card)}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
