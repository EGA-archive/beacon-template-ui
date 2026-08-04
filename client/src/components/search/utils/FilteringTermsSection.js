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
}) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: hasGenomicSectionAbove
            ? (isGenomicDescriptionMultiline ? 5 : 5.5) +
              (hasOneEntryTypeColumn ? 2 : 0)
            : 0,
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
              Use filtering terms to narrow down your search results (e.g.
              diseases, sex, age, or clinical characteristics).
            </li>

            <li>
              Filtering terms are provided by data owners and reflect the
              information available in their datasets.
            </li>

            <li>
              Filtering terms are{" "}
              <strong>independent of the Result Type</strong> (e.g. Individuals,
              Biosamples, etc.) selected.
            </li>
          </Box>
        </InfoTooltip>
      </Box>
      <Typography
        sx={{
          fontSize: "12px",
          mt: 1,
        }}
      >
        Filtering options available for this dataset.
      </Typography>
      <Box
        sx={{
          mt: isGenomicDescriptionMultiline ? 1 : "15px",
          fontSize: "12px",
        }}
      >
        <SearchFiltersInput
          activeInput={activeInput}
          setActiveInput={setActiveInput}
          placeholder={getFilteringPlaceholder(selectedPathSegment)}
          action={
            !moveAllFilteringTermsBelowInput ? (
              <Box ref={filteringButtonRef}>
                <AllFilteringTermsButton onClick={onAllFilteringClick} />
              </Box>
            ) : null
          }
        />
      </Box>

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
