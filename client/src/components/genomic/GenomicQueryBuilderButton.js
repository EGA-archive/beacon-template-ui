import { useState, useEffect } from "react";
import StyledButton from "./../styling/StyledButtons";
import { ReactComponent as DnaIcon } from "../../assets/logos/dna.svg";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { filterLabels } from "../genomic/utils/GenomicFilterLabels";
import config from "../../config/config.json";

/**
 * Button that opens the Genomic Query Builder modal.
 * It becomes disabled when the user has added a genomic filter
 * that is NOT compatible with the Query Builder.
 */
export default function GenomicQueryBuilderButton({
  onClick,
  selected,
  selectedFilter = [],
}) {
  // Track whether the button should be disabled
  const [isDisabled, setIsDisabled] = useState(false);

  // List of allowed molecular effect IDs defined in filterLabels
  // The Query Builder is only compatible with these specific items.
  const ALLOWED_MOLECULAR_EFFECTS =
    filterLabels["Molecular Effect"]?.map((item) => item.id) || [];

  // Decide whether the button should be disabled.
  // Rules:
  // - If any active filter is of type "genomic"
  // - AND it is *not* one of the allowed molecular effect IDs
  // - AND it does not belong to the special "scope=filter" group
  // then the Query Builder must be disabled.
  useEffect(() => {
    const hasBlockedGenomic = selectedFilter.some(
      (f) =>
        f.type === "genomic" &&
        !ALLOWED_MOLECULAR_EFFECTS.includes(f.id) &&
        f.scope !== "filter"
    );

    // If the user added a blocked genomic filter, disable the button
    setIsDisabled(hasBlockedGenomic);
  }, [selectedFilter, ALLOWED_MOLECULAR_EFFECTS]);

  return (
    <Box>
      <StyledButton
        icon={
          <DnaIcon
            className="dnaIcon"
            style={{
              "--dna-primary-color": config.ui.colors.primary,
              "--dna-secondary-color": config.ui.colors.darkPrimary,
            }}
          />
        }
        label="Genomic Query Builder"
        // Disable click if incompatible filters are active
        onClick={!isDisabled ? onClick : undefined}
        selected={selected}
        // Visually indicate disabled state
        sx={{
          opacity: isDisabled ? 0.5 : 1,
          pointerEvents: isDisabled ? "none" : "auto",
        }}
      />
    </Box>
  );
}

GenomicQueryBuilderButton.propTypes = {
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  selectedFilter: PropTypes.array,
};
