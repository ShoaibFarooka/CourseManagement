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

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').trim().required('Email is required'),
});

const resetPasswordSchema = yup.object().shape({
  token: yup.string().trim().required('Token is required'),
  newPassword: yup.string().trim().required('New Password is required'),
});


const contactSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .trim()
    .email("Invalid email address")
    .required("Email is required"),
  subject: yup
    .string()
    .trim()
    .required(),
  question: yup
    .string()
    .trim()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters"),
});

const updateUserSchema = yup.object().shape({
  name: yup.string().trim().optional(),
  email: yup.string().trim().email("Invalid email address").optional(),
  phone: yup
    .string()
    .trim()
    .matches(/^\+?\d{7,15}$/, "Invalid phone number")
    .optional(),
  country: yup.string().trim().optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  contactSchema,
  updateUserSchema,
};

