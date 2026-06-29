import { Box, Typography } from "@mui/material";
import SearchGenomicInput from "../../search/SearchGenomicInput";
import InfoTooltip from "./InfoTooltip";

export default function GenomicSearchSection({
  genomicCoordinateLabel,
  genomicTooltipContent,
  genomicQueryDescription,
  activeInput,
  setActiveInput,
  genomicDraft,
  setGenomicDraft,
  selectedFilter,
  setSelectedFilter,
  assembly,
  setAssembly,
  primaryDarkColor,
  message,
  setMessage,
  genomicAction,
}) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "14px",
            fontFamily: '"Open Sans", sans-serif',
          }}
        >
          {genomicCoordinateLabel}
        </Typography>

        <InfoTooltip testId="genomic-query-tooltip">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "12px",
              fontFamily: '"Open Sans", sans-serif',
            }}
          >
            Genomic Query
          </Typography>

          <Box
            component="ul"
            data-testid="genomic-query-tooltip-content"
            sx={{
              listStyleType: "disc",
              pl: "20px",
              fontFamily: '"Open Sans", sans-serif',
            }}
          >
            {genomicTooltipContent.sequenceQuery && (
              <li>
                Search for a specific single nucleotide variant or INDEL.{" "}
                <strong>(Chr - Position - Ref. bases - Alt. bases)</strong>{" "}
                using the Search Bar.
              </li>
            )}

            {(genomicTooltipContent.rangeQuery ||
              genomicTooltipContent.bracketQuery ||
              genomicTooltipContent.geneId ||
              genomicTooltipContent.hgvsQuery) && (
              <li>
                Use the Genomic Query Builder to search by:{" "}
                {[
                  genomicTooltipContent.geneId && (
                    <strong key="gene">Gene ID</strong>
                  ),
                  genomicTooltipContent.rangeQuery && (
                    <strong key="range">Genomic region (Range Query)</strong>
                  ),
                  genomicTooltipContent.bracketQuery && (
                    <strong key="bracket">Bracket Query</strong>
                  ),
                  genomicTooltipContent.hgvsQuery && (
                    <strong key="hgvs">HGVS expression</strong>
                  ),
                ]
                  .filter(Boolean)
                  .reduce((acc, item, index, array) => {
                    if (index === 0) return [item];

                    if (index === array.length - 1) {
                      return [...acc, " or ", item];
                    }

                    return [...acc, ", ", item];
                  }, [])}
                .
              </li>
            )}

            <li>Only one genomic query is accepted per search.</li>
          </Box>
        </InfoTooltip>
      </Box>

      <Typography
        sx={{
          fontSize: "12px",
          mt: 0.5,
        }}
      >
        {genomicQueryDescription}
      </Typography>

      <Box sx={{ mt: 2 }}>
        <SearchGenomicInput
          activeInput={activeInput}
          setActiveInput={setActiveInput}
          genomicDraft={genomicDraft}
          setGenomicDraft={setGenomicDraft}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          assembly={assembly}
          setAssembly={setAssembly}
          primaryDarkColor={primaryDarkColor}
          message={message}
          setMessage={setMessage}
          action={genomicAction}
        />
      </Box>
    </>
  );
}
