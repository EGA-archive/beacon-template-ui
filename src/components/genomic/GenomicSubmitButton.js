import { useFormikContext } from "formik";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import config from "../../config/config.json";

// Define and export the GenomicSubmitButton component
export default function GenomicSubmitButton() {
  // Access and destructure the Formik context to extract:
  // - `isValid`: a boolean indicating whether the current form values pass all validation rules
  // - `dirty`: a boolean indicating whether any form field has been modified since the initial values
  const { isValid, dirty } = useFormikContext();

  // Render a styled submit button that is disabled unless the form is valid and has been modified
  return (
    <Button
      type="submit"
      variant="outlined"
      disabled={!isValid || !dirty} // Disable button if form is invalid or untouched
      startIcon={<AddIcon />}
      sx={{
        mt: 4,
        borderRadius: "999px",
        textTransform: "none",
        fontFamily: '"Open Sans", sans-serif',
        fontSize: "14px",
        fontWeight: 700,
        color: !isValid || !dirty ? "#9E9E9E" : config.ui.colors.darkPrimary,
        borderColor:
          !isValid || !dirty ? "#BDBDBD" : config.ui.colors.darkPrimary,
        "&:hover": {
          backgroundColor: !isValid || !dirty ? "transparent" : "#f2f2f2",
        },
      }}
    >
      {/* Button label */}
      Add Genomic Query
    </Button>
  );
}
