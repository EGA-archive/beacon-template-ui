import { Box } from "@mui/material";
import { alpha } from "@mui/system";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function GenomicSearchSuggestions({
  genomicDraft,
  genomicInputExamples,
  isVariant,
  isPossibleSequence,
  isStringQuery,
  cleanedValue,
  enabledStringQueryOptions,
  genomicBuilderCtaList,
  primaryColor,
  primaryDarkColor,
  onSelectExample,
  onAddSequence,
  onAddString,
  onOpenBuilder,
}) {
  const handleOpenBuilder = (event) => {
    event.stopPropagation();
    onOpenBuilder();
  };

  return (
    <Box
      sx={{
        mt: "8px",
      }}
    >
      <Box
        role="button"
        onClick={onAddSequence}
        sx={{
          border: `1px solid ${primaryDarkColor}`,
          borderRadius: "21px",
          cursor: "pointer",
          fontFamily: '"Open Sans", sans-serif',
          fontSize: "12px",
          p: 0,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        {genomicInputExamples.length > 0 && (
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#F1F1F1",
              px: 6,
              py: 1,
            }}
          >
            Examples:&nbsp;
            {genomicInputExamples.map((example, index) => (
              <Box key={example} component="span">
                {index > 0 && <> or </>}

                <Box
                  component="span"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectExample(example);
                  }}
                  sx={{
                    color: primaryColor,
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {example}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {(isVariant || isPossibleSequence) && (
          <Box
            onClick={(event) => {
              event.stopPropagation();

              if (isVariant) {
                onAddSequence();
              }
            }}
            sx={{
              width: "100%",
              px: 3,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              opacity: isVariant ? 1 : 0.4,
              cursor: isVariant ? "pointer" : "default",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                "& .unchecked": {
                  display: "block",
                },

                "& .checked": {
                  display: "none",
                },

                "&:hover .unchecked": {
                  display: isVariant ? "none" : "block",
                },

                "&:hover .checked": {
                  display: isVariant ? "block" : "none",
                },
              }}
            >
              <RadioButtonUncheckedIcon
                className="unchecked"
                sx={{
                  color: isVariant ? primaryColor : "grey",
                  fontSize: 16,
                }}
              />

              <CheckCircleIcon
                className="checked"
                sx={{
                  color: alpha(primaryColor, 0.6),
                  fontSize: 16,
                }}
              />
            </Box>

            {isVariant ? (
              <>
                Add <b>genomic variant:</b> <code>{cleanedValue}</code>
              </>
            ) : (
              <>
                Add <b>sequence query:</b> <code>{genomicDraft}</code>
              </>
            )}
          </Box>
        )}

        {(isStringQuery || isPossibleSequence) &&
          enabledStringQueryOptions.map(({ queryType, label }) => (
            <Box
              key={queryType}
              onClick={(event) => {
                event.stopPropagation();
                onAddString(queryType);
              }}
              sx={{
                width: "100%",
                px: 3,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
              }}
            >
              <RadioButtonUncheckedIcon
                sx={{
                  color: primaryColor,
                  fontSize: 16,
                }}
              />

              <Box>
                Add <b>{label}:</b> <code>{genomicDraft.trim()}</code>
              </Box>
            </Box>
          ))}

        <Box
          sx={{
            width: "100%",
            px: 3,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            onClick={handleOpenBuilder}
            sx={{
              position: "relative",
              width: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",

              "& .unchecked": {
                display: "block",
              },

              "& .checked": {
                display: "none",
              },

              "&:hover .unchecked": {
                display: "none",
              },

              "&:hover .checked": {
                display: "block",
              },
            }}
          >
            <RadioButtonUncheckedIcon
              className="unchecked"
              sx={{
                color: isVariant ? primaryColor : "grey",
                fontSize: 16,
              }}
            />

            <CheckCircleIcon
              className="checked"
              sx={{
                color: alpha(primaryColor, 0.6),
                fontSize: 16,
              }}
            />
          </Box>

          <Box
            onClick={handleOpenBuilder}
            sx={{
              cursor: "pointer",
            }}
          >
            Open <b>Genomic Query Builder</b> for the following query:{" "}
            <b>{genomicBuilderCtaList}.</b>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
