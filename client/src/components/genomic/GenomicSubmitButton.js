import { useFormikContext } from "formik";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import config from "../../config/config.json";

// Define and export the GenomicSubmitButton component
export default function GenomicSubmitButton({ disabled }) {
  // Access and destructure the Formik context to extract:
  // - `isValid`: a boolean indicating whether the current form values pass all validation rules
  const { isValid } = useFormikContext();

  const isButtonDisabled = disabled ?? !isValid;

  // Render a styled submit button that is disabled unless the form is valid and has been modified
  return (
    <Button
      type="submit"
      variant="outlined"
      disabled={isButtonDisabled}
      startIcon={<AddIcon />}
      sx={{
        mt: 4,
        borderRadius: "999px",
        textTransform: "none",
        fontFamily: '"Open Sans", sans-serif',
        fontSize: "14px",
        fontWeight: 700,
        color: isButtonDisabled ? "#9E9E9E" : config.ui.colors.darkPrimary,
        borderColor: isButtonDisabled
          ? "#BDBDBD"
          : config.ui.colors.darkPrimary,
        "&:hover": {
          backgroundColor: isButtonDisabled ? "transparent" : "#f2f2f2",
        },
      }}
    >
      {/* Button label */}
      Add Genomic Query
    </Button>
  );
}
