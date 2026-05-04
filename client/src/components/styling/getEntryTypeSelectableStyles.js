// Styling for Entry Type selector pills
export const getEntryTypeSelectableStyles = (isSelected) => ({
  borderRadius: "7px",
  fontWeight: 400,
  fontSize: "12px",
  fontFamily: '"Open Sans", sans-serif',

  px: 1.5,
  py: 0.3,
  mr: 1,
  mb: 0.5,

  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  textTransform: "none",

  backgroundColor: isSelected ? "#3A3A3A" : "#FFFFFF",
  color: isSelected ? "#FFFFFF" : "#000000",

  border: "1px solid black",
  boxShadow: "none",

  "&:hover": {
    boxShadow: "none",
    backgroundColor: isSelected ? "#3A3A3A" : "#F4F5F6",
  },
});
