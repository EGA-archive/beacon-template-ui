import StyledButton from "../styling/StyledButtons";
import { ReactComponent as FilterIcon } from "../../assets/logos/filteringterms.svg";
import PropTypes from "prop-types";

// This component renders a reusable styled button labeled "All Filtering Terms".
// It uses a custom icon (FilterIcon) and relies on a shared StyledButton component.
export default function AllFilteringTermsButton({ onClick, selected }) {
  return (
    // Use the shared StyledButton component, passing custom props
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
