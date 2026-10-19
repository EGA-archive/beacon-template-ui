import { useFormik } from "formik";
import { Box, Typography, Grid, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { alpha } from "@mui/material/styles";

import Founders from "../../Founders";
import contactValidation from "./contactValidation";
import config from "../../../config/runtimeConfig";
import FormTextField from "./FormTextField";

/**
 * ContactForm
 *
 * Displays the contact form for both Single Beacon and
 * Beacon Network deployments.
 * Formik manages the form values, validation, and submission.
 * MUI provides the layout, styling, and responsive behaviour.
 * The form prepares an email using the configured contact
 * address and opens the user's email application.
 */
export default function ContactForm() {
  /**
   * Formik configuration
   *
   * Defines the initial values of the form fields.
   * Applies the validation rules from contactValidation.
   * Handles the form submission and resets the fields.
   */
  const formik = useFormik({
    // All visible fields start with empty values.
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
      institution: "",
      comment: "",
      privacy: false,
    },

    // External validation schema for form fields.
    validationSchema: contactValidation,

    /**
     * Handles the submission of a valid form.
     * Instead of sending data directly to a backend, the form generates a mailto URL containing the user's information and message.
     */
    onSubmit: (values, { resetForm }) => {
      // Default subject of the generated email.
      const subject = "Contact Form";

      // Build the email body from the submitted form values.
      // Each entry is displayed on a separate line.
      const body = [
        `Name: ${values.firstName} ${values.lastName}`,
        `Email: ${values.email}`,
        `Job Title: ${values.jobTitle}`,
        `Institution: ${values.institution}`,
        "",
        "Message:",
        values.comment,
      ].join("\n");

      // Retrieve the recipient from the runtime configuration.
      // Encode the subject and body for use in the mailto URL.
      const mailtoUrl = `mailto:${
        config.ui.contactEmail
      }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`;

      // Open the user's email application in a new window.
      // Actual behaviour depends on the browser and mail handler.
      window.open(mailtoUrl, "_blank");

      // Clear the form values after opening the email link.
      resetForm();
    },
  });

  /**
   * Dynamic UI configuration
   * Colours and labels are retrieved from runtimeConfig.
   * This allows the same component to be reused across different Beacon deployments without code changes.
   */

  // Apply the primary colour with low opacity to input backgrounds.
  const bgColor = alpha(config.ui.colors.primary, 0.05);

  // Display a different Beacon name depending on the deployment type.
  const beaconTitle =
    config.beaconType === "networkBeacon" ? "Beacon Network" : "Single Beacon";

  /**
   * Shared text field styles
   * Applied to all FormTextField components to maintain consistent backgrounds, borders, spacing, and typography.
   * The border colour changes when the user hovers over an input or focuses on it.
   */
  const textFieldStyles = {
    // Default input appearance.
    backgroundColor: bgColor,
    borderRadius: "7px",

    // Text size and internal input spacing.
    "& .MuiInputBase-input": { padding: "12px", fontSize: "14px" },

    // Placeholder text styling.
    "& .MuiInputBase-input::placeholder": { fontSize: "14px" },

    // Default outlined border colour.
    "& .MuiOutlinedInput-notchedOutline": { borderColor: bgColor },

    // Highlight the border on hover.
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: config.ui.colors.primary,
    },

    // Highlight the border when the input is focused.
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: config.ui.colors.primary,
    },

    // Apply the focus styling to multiline inputs.
    "&.Mui-focused.MuiInputBase-multiline .MuiOutlinedInput-notchedOutline": {
      borderColor: config.ui.colors.primary,
    },

    // Apply the hover styling to multiline inputs.
    "&.MuiInputBase-multiline:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: config.ui.colors.primary,
    },
  };

  /**
   * Shared field label styles
   *
   * Ensures all input labels use the same font size, font weight, and configurable primary colour.
   */
  const inputTitleStyle = {
    fontSize: "14px",
    fontWeight: 700,
    color: config.ui.colors.primary,
  };

  // Disable the submit button if the form is invalid or if the user has not modified any initial values.
  const isSubmitDisabled = !formik.isValid || !formik.dirty;

  return (
    <>
      {/* Display the project's founders information above the form. */}
      <Founders />

      {/* Main container that horizontally centres the contact form. */}
      <Box sx={{ pb: "2rem", display: "flex", justifyContent: "center" }}>
        {/*
          Form container
          Uses a white background, shadow, and rounded corners to visually separate the form from the page.
          The maximum width prevents the form from becoming too wide on larger screens.
        */}
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
          {/* Main heading displayed at the top of the contact form. */}
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

          {/*
            Introduction text
            The Beacon name is dynamically selected using the beaconType value from the runtime configuration.
          */}
          <Typography
            variant="body2"
            sx={{ mb: 3, fontSize: "12px", fontWeight: 400, color: "#203241" }}
          >
            If you have any questions about how the {beaconTitle} search website
            works, please fill out this form and we will get back to you.
          </Typography>

          {/*
            Form submission
            Formik handles the submit event, validates the field values, and executes the onSubmit callback.
          */}
          <form onSubmit={formik.handleSubmit}>
            {/* MUI Grid handles the responsive layout of the fields. */}
            <Grid container spacing={2}>
              {/*
                Honeypot field
                Intended to detect automated submissions.
                Hidden from regular users but available in the DOM.
              */}
              <input
                type="text"
                name="website"
                value={formik.values.website}
                onChange={formik.handleChange}
                autoComplete="off"
                style={{ display: "none" }}
              />

              {/*
                Submission timestamp
                Intended to help identify forms submitted unusually quickly by automated scripts.
              */}
              <input
                type="hidden"
                name="startedAt"
                value={formik.values.startedAt}
              />

              {/*
                First Name
                Occupies half the available width on larger screens and the full width on smaller screens.
              */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="First Name *"
                  name="firstName"
                  placeholder="First Name"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/* Last Name uses the same responsive layout and shared styles. */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Last Name *"
                  name="lastName"
                  placeholder="Last Name"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/*
                Business Email Address
                The entered address is included in the generated email body so the recipient can contact the user.
              */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Business Email Address *"
                  name="email"
                  placeholder="Email"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/* Job Title identifies the user's professional role. */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Job Title *"
                  name="jobTitle"
                  placeholder="Title"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/*
                Institution
                Takes the full width of the Grid container.
                The institution is included in the email body.
              */}
              <Grid size={{ xs: 12 }}>
                <FormTextField
                  label="Institution *"
                  name="institution"
                  placeholder="Institution Name"
                  formik={formik}
                  sx={{ textField: textFieldStyles, label: inputTitleStyle }}
                />
              </Grid>

              {/*
                Message field
                Multiline text input where users describe their question or request.
              */}
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

              {/*
                Submit button container
                Uses flexbox to align the button to the right while preserving the full available form width.
              */}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                {/*
                  Send button
                  Submission is disabled until the form has been modified and passes Formik validation.
                  The button uses the primary configuration colour and changes appearance on hover or when disabled.
                */}
                <Button
                  data-cy="contact-send-button"
                  type="submit"
                  variant="contained"
                  disabled={isSubmitDisabled}
                  sx={{
                    // Rounded button with normal text capitalization.
                    borderRadius: "999px",
                    textTransform: "none",
                    fontSize: "14px",

                    // Default button colours and border.
                    backgroundColor: config.ui.colors.primary,
                    border: `1px solid ${config.ui.colors.primary}`,
                    boxShadow: "none",

                    // Hover state with inverted background and text colours.
                    "&:hover": {
                      backgroundColor: "white",
                      border: `1px solid ${config.ui.colors.primary}`,
                      color: config.ui.colors.primary,
                    },

                    // Grey styling when submission is disabled.
                    "&.Mui-disabled": {
                      backgroundColor: "#d3d3d3",
                      color: "#888",
                      border: "1px solid #ccc",
                      opacity: 1,
                    },
                  }}
                  startIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </Grid>
          </form>
        </Box>
      </Box>
    </>
  );
}
