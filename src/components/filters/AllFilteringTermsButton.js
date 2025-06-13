import StyledButton from "../styling/StyledButtons";
import { ReactComponent as FilterIcon } from "../../assets/logos/filteringterms.svg";
import PropTypes from "prop-types";

export default function AllFilteringTermsButton({ onClick, selected }) {
  return (
    <StyledButton
      icon={<FilterIcon />}
      label="All Filtering Terms"
      onClick={onClick}
      selected={selected}
    />
  );
}

AllFilteringTermsButton.propTypes = {
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};
