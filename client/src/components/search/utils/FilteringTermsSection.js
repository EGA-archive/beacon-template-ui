import { Box, Typography } from "@mui/material";
import InfoTooltip from "../utils/InfoTooltip";
import SearchFiltersInput from "../../../components/search/SearchFiltersInput";

export default function FilteringTermsSection({
  activeInput,
  setActiveInput,
  selectedPathSegment,
  getFilteringPlaceholder,
}) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 3,
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
          mt: 0.5,
          mb: 2,
        }}
      >
        Filtering options available for this dataset.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <SearchFiltersInput
          activeInput={activeInput}
          setActiveInput={setActiveInput}
          placeholder={getFilteringPlaceholder(selectedPathSegment)}
        />
      </Box>
    </>
  );
}
