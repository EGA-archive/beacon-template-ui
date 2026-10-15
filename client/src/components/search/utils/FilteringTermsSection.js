import { Box, Typography } from "@mui/material";
import InfoTooltip from "../utils/InfoTooltip";
import SearchFiltersInput from "../../../components/search/SearchFiltersInput";
import AllFilteringTermsButton from "../../filters/AllFilteringTermsButton";

export default function FilteringTermsSection({
  activeInput,
  setActiveInput,
  selectedPathSegment,
  getFilteringPlaceholder,
  onAllFilteringClick,
  filteringButtonRef,
  isGenomicDescriptionMultiline,
  hasGenomicSectionAbove = false,
  moveAllFilteringTermsBelowInput = false,
  hasOneEntryTypeColumn = false,
  hasEntryTypeSelector = false,
  isOntologyOnlyLayout = false,
}) {
  /**
   * For regular multi-entry layouts, buttons move outside
   * their inputs from 870px downward.
   *
   * Ontology-only layouts keep the button outside at all sizes.
   */
  const buttonsOutsideInputLayout = "@media (max-width:870px)";
  const mobileSearchLayout = "@media (max-width:599px)";

  return (
    <>
      {/* Filtering Terms title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: {
            // Ontology-only mobile is already stacked.
            xs: 0,
            // Ontology-only sm+ does not need genomic spacing.
            // Single Entry Type: use 30px from sm upward.
            sm: !hasEntryTypeSelector
              ? "0px"
              : isOntologyOnlyLayout
              ? 0
              : hasGenomicSectionAbove
              ? hasOneEntryTypeColumn
                ? 0
                : isGenomicDescriptionMultiline
                ? 5
                : 5.5
              : 0,
          },
          mb: 0,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "14px",
            fontFamily: '"Open Sans", sans-serif',
          }}
        >
          Filtering Terms
        </Typography>

        <InfoTooltip testId="filtering-terms-tooltip">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "12px",
              fontFamily: '"Open Sans", sans-serif',
            }}
          >
            Filtering Terms
          </Typography>

          <Box
            component="ul"
            data-testid="filtering-terms-tooltip-content"
            sx={{
              listStyleType: "disc",
              pl: "20px",
              fontFamily: '"Open Sans", sans-serif',
            }}
          >
            <li>
              Use filtering terms to narrow down your search results, such as
              diseases, sex, age, or clinical characteristics.
            </li>

            <li>
              Filtering terms are provided by data owners and reflect the
              information available in their datasets.
            </li>

            <li>
              Filtering terms are{" "}
              <strong>independent of the Result Type</strong>, such as
              Individuals or Biosamples.
            </li>
          </Box>
        </InfoTooltip>
      </Box>

      {/* Filtering Terms description + desktop action */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          height: "26px",
          mb: 1.9,
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
          }}
        >
          Filtering options available for the data.
        </Typography>
        <Box
          sx={{
            display: "none",
            flexShrink: 0,

            // Single Entry Type:
            // keep the button beside the description from 600px upward.
            "@media (min-width:600px)": {
              display: !hasEntryTypeSelector ? "flex" : "none",
            },

            // All layouts:
            // use the desktop position above 870px.
            "@media (min-width:871px)": {
              display: "flex",
            },
          }}
        >
          <AllFilteringTermsButton onClick={onAllFilteringClick} />
        </Box>
      </Box>

      {/* Filtering Terms input */}
      <Box
        sx={{
          mt: {
            xs: isOntologyOnlyLayout
              ? 1
              : hasOneEntryTypeColumn
              ? 1
              : isGenomicDescriptionMultiline
              ? 1
              : "15px",

            sm: isOntologyOnlyLayout
              ? 0
              : hasOneEntryTypeColumn
              ? 1
              : isGenomicDescriptionMultiline
              ? 1
              : "15px",
          },
        }}
      >
        <SearchFiltersInput
          hasEntryTypeSelector={hasEntryTypeSelector}
          activeInput={activeInput}
          setActiveInput={setActiveInput}
          placeholder={getFilteringPlaceholder(selectedPathSegment)}
          action={
            /**
             * Ontology-only:
             * never render All Filtering Terms inside the input.
             *
             * Other layouts keep the existing behavior.
             */
            !isOntologyOnlyLayout && !moveAllFilteringTermsBelowInput ? (
              <Box ref={filteringButtonRef}>
                <AllFilteringTermsButton onClick={onAllFilteringClick} />
              </Box>
            ) : null
          }
        />
      </Box>

      {/*
       * Multiple Entry Types.
       *
       * Ontology-only:
       * button is always outside.
       *
       * Other multi-entry layouts:
       * button moves outside from 870px downward.
       */}
      {!moveAllFilteringTermsBelowInput && (
        <Box
          sx={{
            display: "none",
            justifyContent: "center",
            width: "100%",
            maxWidth: "220px",
            mx: "auto",
            mt: 1.5,

            // Multi-entry layouts: outside from 870px downward.
            [buttonsOutsideInputLayout]: {
              display: hasEntryTypeSelector ? "flex" : "none",
            },

            // Single or multiple Entry Types: always outside on xs.
            [mobileSearchLayout]: {
              display: "flex",
            },

            "& .MuiButton-root": {
              width: "100%",
              whiteSpace: "nowrap",
            },
          }}
        >
          <AllFilteringTermsButton onClick={onAllFilteringClick} />
        </Box>
      )}

      {/*
       * Single non-genomic Entry Type mobile behavior.
       */}
      {moveAllFilteringTermsBelowInput && (
        <Box
          ref={filteringButtonRef}
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            maxWidth: "220px",
            mx: "auto",
            mt: 1.5,

            "& .MuiButton-root": {
              width: "100%",
              whiteSpace: "nowrap",
            },
          }}
        >
          <AllFilteringTermsButton onClick={onAllFilteringClick} />
        </Box>
      )}
    </>
  );
}
