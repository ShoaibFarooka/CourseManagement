const yup = require("yup");


const registerSchema = yup.object().shape({
  name: yup.string().trim().optional(),
  email: yup.string().trim().email('Invalid email address').required('Email is required'),
  password: yup.string().trim().required('Password is required'),
  country: yup.string().trim().optional(),
  phone: yup.number(),
});

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
  registerSchema
};
