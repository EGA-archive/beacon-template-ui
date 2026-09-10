import {
  Box,
  Radio,
  FormControlLabel,
  RadioGroup,
  CircularProgress,
} from "@mui/material";
import { formatEntryLabel } from "../common/textFormatting";
import config from "../../config/runtimeConfig";

/**
 * Displays the available Entry Types as radio buttons.
 *
 * Special layouts:
 *
 * Mobile:
 * - full-width selector
 * - three columns filled left-to-right
 * - automatic height
 *
 * Ontology-only with more than two Entry Types, between 600px and 870px:
 * - uses the same stacked/grid behavior as mobile
 *
 * Ontology-only above 870px:
 * - maximum two Entry Types vertically per column
 * - compact fixed height
 * - columns size themselves according to their labels
 */
export default function EntryTypeSelector({
  entryTypes,
  selectedPathSegment,
  setSelectedPathSegment,
  hasTwoColumns,
  isIntermediateSearchLayout = false,
  loading,
  isOntologyOnlyLayout = false,
  shouldStackOntologyLayout = false,
  ontologySelectorWidth,
}) {
  const ontologyFourColumnLayout =
    "@media (min-width:640px) and (max-width:870px)";

  const hasExactlyTwoEntryTypes = entryTypes.length === 2;

  /**
   * Standard intermediate genomic layout:
   * two-column selectors use eight rows so the ninth
   * Entry Type starts at the top of column two.
   */
  const gridRowCount =
    isIntermediateSearchLayout && hasTwoColumns
      ? 8
      : hasTwoColumns
      ? 4
      : entryTypes.length;

  /**
   * Standard selector heights.
   * Ontology-specific heights are handled separately below.
   */
  const selectorHeight = isIntermediateSearchLayout
    ? "279px"
    : hasTwoColumns
    ? "197px"
    : "180px";

  /**
   * Ontology-only desktop layout:
   * maximum two Entry Types vertically per column.
   */
  const ontologyColumnCount = Math.ceil(entryTypes.length / 2);

  return (
    <Box
      data-testid="entrytype-selector"
      sx={{
        border: isIntermediateSearchLayout
          ? "1.5px solid black"
          : "1px solid black",
        borderRadius: "28px",

        /**
         * The stacked ontology layout uses the same compact
         * padding as mobile.
         */
        px: {
          // Keep the current mobile padding.
          xs: "10px",

          // Ontology-only from 600px upward uses 14px horizontal padding.
          sm: isOntologyOnlyLayout
            ? "14px"
            : isIntermediateSearchLayout
            ? "13px"
            : "10px",
        },
        py: {
          xs: "10px",
          sm: shouldStackOntologyLayout
            ? "10px"
            : isOntologyOnlyLayout
            ? 0
            : isIntermediateSearchLayout
            ? "15px"
            : "10px",
        },

        width: "100%",

        /**
         * Mobile and stacked ontology layouts use all
         * the available width.
         */
        maxWidth: {
          xs: "none",

          sm: shouldStackOntologyLayout
            ? "none"
            : isOntologyOnlyLayout
            ? `${ontologySelectorWidth}px`
            : hasTwoColumns
            ? "260px"
            : "190px",
        },

        /**
         * Mobile and stacked ontology layouts grow naturally.
         *
         * Compact ontology-only layouts above 870px
         * keep the smaller fixed height.
         */
        height: {
          xs: "auto",

          sm: shouldStackOntologyLayout
            ? "auto"
            : isOntologyOnlyLayout
            ? "88px"
            : selectorHeight,
        },

        boxSizing: "border-box",
      }}
    >
      {loading ? (
        <Box
          data-testid="entrytypes-loader"
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            size={32}
            sx={{
              color: config.ui.colors.primary,
            }}
          />
        </Box>
      ) : (
        <RadioGroup
          value={selectedPathSegment}
          onChange={(event) => setSelectedPathSegment(event.target.value)}
          sx={{
            display: "grid",
            width: "100%",

            /**
             * Stacked layouts determine their height from
             * the number of generated rows.
             */
            height: {
              xs: "auto",
              sm: shouldStackOntologyLayout ? "auto" : "100%",
            },

            /**
             * Mobile and stacked ontology layouts fill
             * left-to-right before moving to the next row.
             *
             * Compact ontology-only layouts fill downward first.
             */
            gridAutoFlow: {
              xs: "row",

              sm: shouldStackOntologyLayout
                ? "row"
                : isOntologyOnlyLayout
                ? "column"
                : hasTwoColumns
                ? "column"
                : "row",
            },

            /**
             * Mobile and stacked ontology layouts always
             * use three equal columns.
             *
             * Compact ontology-only columns use their content width.
             */
            gridTemplateColumns: {
              xs: hasExactlyTwoEntryTypes
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(3, minmax(0, 1fr))",

              sm: shouldStackOntologyLayout
                ? "repeat(3, minmax(0, 1fr))"
                : isOntologyOnlyLayout
                ? `repeat(${ontologyColumnCount}, max-content)`
                : hasTwoColumns
                ? "repeat(2, minmax(0, 1fr))"
                : "1fr",
            },
            /**
             * In the stacked ontology layout, wider intermediate screens
             * can comfortably fit four Entry Types per row.
             */
            [ontologyFourColumnLayout]: {
              gridTemplateColumns: shouldStackOntologyLayout
                ? "repeat(4, minmax(0, 1fr))"
                : undefined,
            },

            /**
             * Mobile-style layouts generate rows automatically.
             *
             * Compact ontology-only layouts always have two rows.
             */
            gridTemplateRows: {
              xs: "none",

              sm: shouldStackOntologyLayout
                ? "none"
                : isOntologyOnlyLayout
                ? "repeat(2, minmax(0, 1fr))"
                : `repeat(${gridRowCount}, minmax(0, 1fr))`,
            },

            gridAutoRows: {
              xs: "minmax(42px, auto)",

              sm: shouldStackOntologyLayout ? "minmax(42px, auto)" : "auto",
            },

            /**
             * Compact ontology columns size themselves based
             * on their longest label and use the remaining space.
             */
            justifyContent: {
              xs: "stretch",

              sm: shouldStackOntologyLayout
                ? "stretch"
                : isOntologyOnlyLayout
                ? "space-between"
                : "stretch",
            },

            columnGap: {
              xs: 1,

              sm: shouldStackOntologyLayout
                ? 1
                : isOntologyOnlyLayout
                ? 1
                : isIntermediateSearchLayout
                ? "10px"
                : 2,
            },
            rowGap: {
              xs: 1,
              sm: shouldStackOntologyLayout ? 1 : 0,
            },
            alignItems: "center",
            justifyItems: {
              xs: hasExactlyTwoEntryTypes ? "center" : "stretch",
              sm: "stretch",
            },
          }}
        >
          {entryTypes.map((entry) => (
            <FormControlLabel
              key={entry.id}
              value={entry.pathSegment}
              data-testid={`entrytype-radio-${entry.pathSegment}`}
              sx={{
                /**
                 * Mobile-style layouts fill their grid cell.
                 *
                 * Compact ontology-only layouts use only
                 * the width required by their content.
                 */
                width: {
                  xs: hasExactlyTwoEntryTypes ? "max-content" : "100%",

                  sm: shouldStackOntologyLayout
                    ? "100%"
                    : isOntologyOnlyLayout
                    ? "max-content"
                    : "100%",
                },

                minWidth: 0,
                m: 0,

                "& .MuiFormControlLabel-label": {
                  flex: 1,
                  minWidth: 0,
                },
              }}
              control={
                <Radio
                  sx={{
                    color: config.ui.colors.primary,

                    /**
                     * Stacked ontology layouts use the same radio
                     * spacing as mobile.
                     *
                     * Compact ontology layouts remove unnecessary
                     * left padding to save horizontal space.
                     */
                    pl: {
                      xs: "7px",

                      sm: shouldStackOntologyLayout
                        ? "7px"
                        : isOntologyOnlyLayout
                        ? 0
                        : "7px",
                    },

                    pr: {
                      xs: "7px",

                      sm: shouldStackOntologyLayout
                        ? "7px"
                        : isOntologyOnlyLayout
                        ? "4px"
                        : "7px",
                    },

                    py: {
                      xs: "7px",

                      sm: shouldStackOntologyLayout
                        ? "7px"
                        : isOntologyOnlyLayout
                        ? "4px"
                        : "7px",
                    },

                    "&.Mui-checked": {
                      color: config.ui.colors.primary,
                    },

                    "& .MuiSvgIcon-root": {
                      fontSize: "19px",
                    },
                  }}
                />
              }
              label={
                <Box
                  sx={{
                    width: {
                      xs: "100%",

                      sm: shouldStackOntologyLayout
                        ? "100%"
                        : isOntologyOnlyLayout
                        ? "auto"
                        : "100%",
                    },

                    fontWeight:
                      selectedPathSegment === entry.pathSegment ? 700 : 400,

                    fontSize: {
                      xs: "14px",
                      sm: shouldStackOntologyLayout ? "13px" : "14px",
                    },

                    "@media (max-width:560px)": {
                      fontSize: "13px",
                    },

                    "@media (max-width:460px)": {
                      fontSize: "12px",
                    },

                    whiteSpace: "normal",
                    lineHeight: 1.2,
                  }}
                >
                  {formatEntryLabel(entry.pathSegment)}
                </Box>
              }
            />
          ))}
        </RadioGroup>
      )}
    </Box>
  );
}
