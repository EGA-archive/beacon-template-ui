import { useFormik } from "formik";
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { alpha } from "@mui/material/styles";
import Founders from "../../Founders";
import validationSchema from "./contactValidation";
import config from "../../../config/config.json";
import { useNavigate } from "react-router-dom";

/**
 * Contact form page for Beacon Template UI.
 * Uses MUI Grid v2 with responsive sizing.
 */
export default function ContactForm() {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
      institution: "",
      comment: "",
      privacy: false,
      website: "",
      startedAt: Date.now(),
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const tooFast = Date.now() - Number(values.startedAt) < 3000;
      if (values.website || tooFast) {
        return;
      }

      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        resetForm();
        navigate("/contact-success");
      } catch (error) {
        console.error("Error sending email:", error);
        alert("Oops! Something went wrong, please try again later.");
      }
    },
  });

  const bgColor = alpha(config.ui.colors.primary, 0.05);

  const textFieldStyles = {
    backgroundColor: bgColor,
    borderRadius: "7px",
    "& .MuiInputBase-input": {
      padding: "12px",
      fontSize: "14px",
    },
    "& .MuiInputBase-input::placeholder": {
      fontSize: "14px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: bgColor,
    },
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

  // Disable the button until:
  // - form is valid
  // - privacy is checked
  // - and the user has changed something (dirty)
  const isSubmitDisabled =
    !formik.isValid ||
    !formik.values.privacy ||
    !formik.dirty ||
    formik.isSubmitting;

  return (
    <>
      <Founders />
      <Box
        sx={{
          pb: "2rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
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
          {/* Title */}
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

          {/* Subtitle */}
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              fontSize: "12px",
              fontWeight: 400,
              color: "#203241",
            }}
          >
            If you have any questions about how the Beacon Network search
            website works, please fill out this form and we will get back to
            you.
          </Typography>

          {/* Form */}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <input
                type="text"
                name="website"
                value={formik.values.website}
                onChange={formik.handleChange}
                autoComplete="off"
                style={{ display: "none" }}
              />
              <input
                type="hidden"
                name="startedAt"
                value={formik.values.startedAt}
              />

              {/* First Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: config.ui.colors.primary,
                    }}
                  >
                    First Name *
                  </Typography>
                  <TextField
                    fullWidth
                    name="firstName"
                    placeholder="First Name"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.firstName &&
                      Boolean(formik.errors.firstName)
                    }
                    helperText={
                      formik.touched.firstName && formik.errors.firstName
                    }
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>

              {/* Last Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: config.ui.colors.primary,
                    }}
                  >
                    Last Name *
                  </Typography>
                  <TextField
                    fullWidth
                    name="lastName"
                    placeholder="Last Name"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.lastName && Boolean(formik.errors.lastName)
                    }
                    helperText={
                      formik.touched.lastName && formik.errors.lastName
                    }
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: config.ui.colors.primary,
                    }}
                  >
                    Business Email Address *
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    placeholder="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>

              {/* Job Title */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: config.ui.colors.primary,
                    }}
                  >
                    Job Title *
                  </Typography>
                  <TextField
                    fullWidth
                    name="jobTitle"
                    placeholder="Title"
                    value={formik.values.jobTitle}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.jobTitle && Boolean(formik.errors.jobTitle)
                    }
                    helperText={
                      formik.touched.jobTitle && formik.errors.jobTitle
                    }
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>

              {/* Institution */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: config.ui.colors.primary,
                    }}
                  >
                    Institution *
                  </Typography>
                  <TextField
                    fullWidth
                    name="institution"
                    placeholder="Institution Name"
                    value={formik.values.institution}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.institution &&
                      Boolean(formik.errors.institution)
                    }
                    helperText={
                      formik.touched.institution && formik.errors.institution
                    }
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>

              {/* Comment */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: config.ui.colors.primary,
                    }}
                  >
                    How can we help you? *
                  </Typography>
                  <TextField
                    fullWidth
                    name="comment"
                    placeholder="Comment"
                    multiline
                    minRows={4}
                    value={formik.values.comment}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.comment && Boolean(formik.errors.comment)
                    }
                    helperText={formik.touched.comment && formik.errors.comment}
                    sx={textFieldStyles}
                  />
                </Box>
              </Grid>

              {/* Privacy */}
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
                {formik.touched.privacy && formik.errors.privacy && (
                  <Typography color="error" variant="caption">
                    {formik.errors.privacy}
                  </Typography>
                )}
              </Grid>

              {/* Submit Button */}
              <Grid size={{ xs: 12 }} sx={{ textAlign: "right" }}>
                <Button
                  variant="contained"
                  type="submit"
                  startIcon={<SendIcon />}
                  disabled={isSubmitDisabled}
                  sx={{
                    borderRadius: "999px",
                    textTransform: "none",
                    fontSize: "14px",
                    backgroundColor: config.ui.colors.primary,
                    border: `1px solid ${config.ui.colors.primary}`,
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "white",
                      border: `1px solid ${config.ui.colors.primary}`,
                      color: config.ui.colors.primary,
                    },

                    "&.Mui-disabled": {
                      backgroundColor: "#F2F4F7",
                      borderColor: "#F2F4F7",
                      color: "#98A2B3",
                    },
                  }}
                >
                  Send
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </>
  );
}
