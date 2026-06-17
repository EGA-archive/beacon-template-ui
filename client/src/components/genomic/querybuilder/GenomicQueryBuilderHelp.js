import { Box, Typography } from "@mui/material";
import { useSelectedEntry } from "../../context/SelectedEntryContext";
import { GENOMIC_LABELS_MAP } from "../../genomic/genomicLabelHelper";
import config from "../../../config/config.json";
import { alpha } from "@mui/material/styles";

export default function GenomicQueryBuilderHelp({
  setSelectedQueryType,
  handleClose,
  setActiveInput,
  setTabDrafts,
}) {
  const cards = [
    {
      title: "Specific Variant",
      queryType: "Sequence Query",
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
      title: "Gene / Protein Changes",
      queryType: "Gene ID",
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
      title: "HGVS Expression",
      queryType: "Genomic Allele Query (HGVS)",
      examples: [
        {
          genomicAlleleShortForm: "NC_000022.11:g.16050527C>A",
        },
      ],
    },
    {
      title: "Genomic Region",
      queryType: "Range Query",
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
      title: "Approximate Genomic Region",
      queryType: "Bracket Query",
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

      "Genomic Allele Query (HGVS)": {
        genomicHGVSshortForm: example.genomicAlleleShortForm,
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

  return (
    <Box
      sx={{
        mt: 2,
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "repeat(6, 1fr)",
        },
        gap: 2,
        gridAutoRows: "1fr",
        alignItems: "stretch",
      }}
    >
      {cards.map((card, index) => (
        <Box
          key={card.title}
          onClick={() => setSelectedQueryType(card.queryType)}
          sx={{
            gridColumn: {
              xs: "span 1",
              lg: index < 3 ? "span 2" : "span 3",
            },
            p: 2,
            height: "210px",
            border: "1px solid #3176B1",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "0.2s ease",
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            {card.title}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: "13px",
            }}
          >
            {card.title === "Specific Variant" && (
              <>
                Search by{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQueryType("Sequence Query");
                  }}
                  style={{
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Sequence Query
                </span>{" "}
                or directly in the{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    setActiveInput("genomic");
                  }}
                  style={{
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  search bar
                </span>
                .
              </>
            )}

            {card.title === "Gene / Protein Changes" && (
              <>
                Search by{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQueryType("Gene ID");
                  }}
                  style={{
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Gene ID
                </span>
                .
              </>
            )}

            {card.title === "HGVS Expression" && (
              <>
                Search using{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQueryType("Genomic Allele Query (HGVS)");
                  }}
                  style={{
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  HGVS
                </span>{" "}
                notation.
              </>
            )}

            {card.title === "Genomic Region" && (
              <>
                Search variants within a genomic range in{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQueryType("Range Query");
                  }}
                  style={{
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Range Query
                </span>
                .
              </>
            )}

            {card.title === "Approximate Genomic Region" && (
              <>
                Search around a genomic position using a distance offset with{" "}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQueryType("Bracket Query");
                  }}
                  style={{
                    fontWeight: 700,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Bracket Query
                </span>
                .
              </>
            )}
          </Typography>

          {card.examples && (
            <Box
              sx={{
                mt: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "12px",
                  mb: 0.5,
                }}
              >
                Example:
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {card.examples.map((example, index) => (
                  <Box
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExampleClick(card, example);
                    }}
                    sx={{
                      display: "inline-flex",
                      width: "fit-content",
                      alignItems: "center",
                      flexWrap: "wrap",

                      px: "12px",
                      py: "4px",

                      borderRadius: "8px",
                      border: "1px solid black",

                      color: "black",
                      backgroundColor: alpha(config.ui.colors.secondary, 0.4),

                      fontSize: "12px",
                      cursor: "pointer",

                      transition: "background-color 0.2s ease",

                      "&:hover": {
                        backgroundColor: alpha(config.ui.colors.secondary, 0.6),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                      }}
                    >
                      {Object.entries(example).map(([key, value], idx, arr) => (
                        <span key={key}>
                          {GENOMIC_LABELS_MAP[key] || key}:{" "}
                          <strong>{value}</strong>
                          {idx < arr.length - 1 && " | "}
                        </span>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
