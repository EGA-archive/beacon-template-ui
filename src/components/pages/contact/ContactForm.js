// Formik handles form state and validation
import { useFormik } from "formik";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { alpha } from "@mui/material/styles";
import Founders from "../../Founders";
import contactValidation from "./contactValidation";
import config from "../../../config/config.json";
import { useNavigate } from "react-router-dom";
import FormTextField from "./FormTextField"; // Reusable input wrapper
import StyledButton from "../../styling/StyledButtons";

// Contact form component using MUI + Formik
export default function ContactForm() {
  const navigate = useNavigate();

  // Formik setup: field defaults, validation, spam checks, submit handler
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
      institution: "",
      comment: "",
      privacy: false,
      website: "", // Honeypot: if filled, it's a bot
      startedAt: Date.now(), // Anti-bot: block too-fast submits
    },
    validationSchema: contactValidation,
    onSubmit: (values, { resetForm }) => {
      const tooFast = Date.now() - Number(values.startedAt) < 3000;
      if (values.website || tooFast) return;
      console.log("Contact form submitted:", values); // This will get replaced once we agree on the way to send email
      resetForm();
      navigate("/contact-success");
    },
  });

  // Custom styling for input background and borders
  const bgColor = alpha(config.ui.colors.primary, 0.05);
  const textFieldStyles = {
    backgroundColor: bgColor,
    borderRadius: "7px",
    "& .MuiInputBase-input": { padding: "12px", fontSize: "14px" },
    "& .MuiInputBase-input::placeholder": { fontSize: "14px" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: bgColor },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: config.ui.colors.primary,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: config.ui.colors.primary,
    },
    "&.Mui-focused.MuiInputBase-multiline .MuiOutlinedInput-notchedOutline": {
      borderColor: config.ui.colors.primary,
    },
    "&.MuiInputBase-multiline:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: config.ui.colors.primary,
    },
  };

  const inputTitleStyle = {
    fontSize: "14px",
    fontWeight: 700,
    color: config.ui.colors.primary,
  };

  // Disable submit button unless form is valid, changed, and privacy checked
  const isSubmitDisabled =
    !formik.isValid ||
    !formik.values.privacy ||
    !formik.dirty ||
    formik.isSubmitting;

  return (
    <>
      {/* Section showing project founders (optional info/header) */}
      <Founders />

      {/* Outer container for centering the form on the page */}
      <Box sx={{ pb: "2rem", display: "flex", justifyContent: "center" }}>
        {/* Card-like box with padding, shadow, border radius */}
        <Box
          sx={{
            p: 3,
            bgcolor: "#fff",
            boxShadow: 3,
            borderRadius: 2,
            maxWidth: 1000,
            mt: 2,
          }}
        >
          {/* Main heading of the contact form */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: config.ui.colors.primary,
              fontSize: "16px",
            }}
          >
            Contact Form
          </Typography>

          {/* Introductory message for users filling the form */}
          <Typography
            variant="body2"
            sx={{ mb: 3, fontSize: "12px", fontWeight: 400, color: "#203241" }}
          >
            If you have any questions about how the Beacon Network search
            website works, please fill out this form and we will get back to
            you.
          </Typography>

          {/* Main form logic handled by Formik */}
          <form onSubmit={formik.handleSubmit}>
            {/* Responsive layout using MUI Grid system */}
            <Grid container spacing={2}>
              {/* Honeypot field to trap bots (hidden input) */}
              <input
                type="text"
                name="website"
                value={formik.values.website}
                onChange={formik.handleChange}
                autoComplete="off"
                style={{ display: "none" }}
              />

              {/* Timestamp to detect fast (automated) submissions */}
              <input
                type="hidden"
                name="startedAt"
                value={formik.values.startedAt}
              />

              {/* First Name field */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="First Name *"
                  name="firstName"
                  placeholder="First Name"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/* Last Name field */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Last Name *"
                  name="lastName"
                  placeholder="Last Name"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/* Email address */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Business Email Address *"
                  name="email"
                  placeholder="Email"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/* Job title */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Job Title *"
                  name="jobTitle"
                  placeholder="Title"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/* Institution name */}
              <Grid size={{ xs: 12 }}>
                <FormTextField
                  label="Institution *"
                  name="institution"
                  placeholder="Institution Name"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/* Main comment textarea */}
              <Grid size={{ xs: 12 }}>
                <FormTextField
                  label="How can we help you? *"
                  name="comment"
                  placeholder="Comment"
                  multiline
                  minRows={4}
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/* Privacy policy consent checkbox */}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="privacy"
                      checked={formik.values.privacy}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  }
                  label="Please check this box to accept our Privacy Policy."
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontFamily: '"Open Sans", sans-serif',
                      fontWeight: 400,
                      fontStyle: "normal",
                      fontSize: "12px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                    },
                  }}
                />
                {/* Show error if checkbox is required and not checked */}
                {formik.touched.privacy && formik.errors.privacy && (
                  <Typography color="error" variant="caption">
                    {formik.errors.privacy}
                  </Typography>
                )}
              </Grid>

              {/* Submit button: disabled unless all conditions are valid */}
              <Grid size={{ xs: 12 }} sx={{ textAlign: "right" }}>
                <StyledButton
                  icon={<SendIcon />}
                  label="Send"
                  type="submit"
                  variant="contained"
                  disabled={isSubmitDisabled}
                />
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </>
  );
}
