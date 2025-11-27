import StyledButton from "../styling/StyledButtons";
import { ReactComponent as FilterIcon } from "../../assets/logos/filteringterms.svg";
import PropTypes from "prop-types";
import { useSelectedEntry } from "../context/SelectedEntryContext";
import config from "../../config/config.json";

// This component renders a reusable styled button labeled "All Filtering Terms".
// It uses a custom icon (FilterIcon) and relies on a shared StyledButton component.
export default function AllFilteringTermsButton({ onClick, selected }) {
  const { filteringTermsRef } = useSelectedEntry();

  const handleClick = () => {
    if (onClick) onClick();
    setTimeout(() => {
      if (filteringTermsRef?.current) {
        filteringTermsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  return (
    <StyledButton
      icon={
        <FilterIcon
          className="filterIcon"
          style={{
            "--icon-color": config.ui.colors.darkPrimary,
          }}
        />
      }
      label="All Filtering Terms"
      onClick={handleClick}
      selected={selected}
    />
  );
}

AllFilteringTermsButton.propTypes = {
  onClick: PropTypes.func,
  selected: PropTypes.bool,
};
