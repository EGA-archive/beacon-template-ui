import { useState, useEffect } from "react";
import StyledButton from "./../styling/StyledButtons";
import { ReactComponent as DnaIcon } from "../../assets/logos/dna.svg";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { filterLabels } from "../genomic/utils/GenomicFilterLabels";

export default function GenomicQueryBuilderButton({
  onClick,
  selected,
  selectedFilter = [],
}) {
  const [isDisabled, setIsDisabled] = useState(false);

  const ALLOWED_MOLECULAR_EFFECTS =
    filterLabels["Molecular Effect"]?.map((item) => item.id) || [];

  useEffect(() => {
    const hasBlockedGenomic = selectedFilter.some(
      (f) =>
        f.type === "genomic" &&
        !ALLOWED_MOLECULAR_EFFECTS.includes(f.id) &&
        f.scope !== "filter"
    );
    setIsDisabled(hasBlockedGenomic);
  }, [selectedFilter, ALLOWED_MOLECULAR_EFFECTS]);

  return (
    <Box>
      <StyledButton
        icon={<DnaIcon />}
        label="Genomic Query Builder"
        onClick={!isDisabled ? onClick : undefined}
        selected={selected}
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
