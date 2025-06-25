const yup = require("yup");

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .trim()
    .required("Email is required"),
  password: yup.string().trim().required("Password is required"),
});

module.exports = {
  loginSchema,
};
