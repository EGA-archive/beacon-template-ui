import StyledButton from "./StyledButtons";
import { ReactComponent as DnaIcon } from "../assets/logos/dna.svg";
import PropTypes from "prop-types";

export default function GenomicQueryBuilderButton({
  onClick,
  selected = false,
}) {
  return (
    <StyledButton
      icon={<DnaIcon />}
      label="Genomic Query Builder"
      onClick={onClick}
      selected={selected}
    />
  );
}

GenomicQueryBuilderButton.propTypes = {
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};
