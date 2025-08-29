import * as Yup from "yup";

// Validation schema for the contact form using Yup
// Ensures required fields are filled and formats are correct

// Define validation rules for each form field
const validationSchema = Yup.object({
  // First name must be a non-empty string
  firstName: Yup.string().required("First Name is required"),

  // Last name must be a non-empty string
  lastName: Yup.string().required("Last Name is required"),

  // Email must be valid format and required
  email: Yup.string()
    .email("Enter a valid email") // format validation
    .required("Email is required"), // required field

  // Job title must be a non-empty string
  jobTitle: Yup.string().required("Job Title is required"),

  // Institution must be a non-empty string
  institution: Yup.string().required("Institution is required"),

  // Comment is required
  comment: Yup.string().required("Please enter your message"),

  // Privacy checkbox must be checked (true)
  privacy: Yup.boolean().oneOf([true], "You must accept the Privacy Policy"),
});

export default validationSchema;
