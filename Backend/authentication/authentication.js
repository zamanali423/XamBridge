const { z } = require("zod");

const registerSchema = z
  .object({
    username: z
      .string({ message: "username is required" })
      .min(3, { message: "username atleast 3 characters" })
      .max(20),
    email: z
      .string({ message: "email is required" })
      .email({ message: "email is invalid" }),
    password: z
      .string({ message: "password is required" })
      .min(8, { message: "password atleast 8 characters" })
      .max(20, { message: "password atmost 20 characters" })
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "Password must contain at least one letter and one number"
      ),
    confirmPassword: z
      .string({ message: "confirm password is required" })
      .min(8, { message: "confirm password atleast 8 characters" })
      .max(20, { message: "confirm password atmost 20 characters" })
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "Confirm password must contain at least one letter and one number"
      ),
    role: z.enum(["student", "teacher", "admin"], {
      message: "role is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z
    .string({ message: "email is required" })
    .email({ message: "email is invalid" }),
  password: z
    .string({ message: "password is required" })
    .min(8, { message: "password atleast 8 characters" })
    .max(20, { message: "password atmost 20 characters" })
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      "Password must contain at least one letter and one number"
    ),
});

const updateSchema = z
  .object({
    username: z
      .string({ message: "username is required" })
      .min(3, { message: "username atleast 3 characters" })
      .max(20),
    email: z
      .string({ message: "email is required" })
      .email({ message: "email is invalid" }),
    password: z
      .string({ message: "password is required" })
      .min(8, { message: "password atleast 8 characters" })
      .max(20, { message: "password atmost 20 characters" })
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "Password must contain at least one letter and one number"
      ),
    phone: z
      .number({ message: "phone is required" })
      .min(10, { message: "phone atleast 10 characters" })
      .max(11, { message: "phone atmost 11 characters" }),
    image: z
      .string({ message: "image is required" })
      .url({ message: "image is invalid" }),
  })

module.exports = {
  registerSchema,
  loginSchema,
  updateSchema,
};
