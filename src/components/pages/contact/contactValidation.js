import * as Yup from "yup";

const validationSchema = Yup.object({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  jobTitle: Yup.string().required("Job Title is required"),
  institution: Yup.string().required("Institution is required"),
  comment: Yup.string().required("Please enter your message"),
  privacy: Yup.boolean().oneOf([true], "You must accept the Privacy Policy"),
});

export default validationSchema;
