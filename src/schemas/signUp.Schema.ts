import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(4, "Username must be at least 4 characters long.")
  .max(20, "User name can't be greater than 20 characters.")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores."
  );

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .max(30, { message: "Email can't be greater than 30 characters." }),
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
      message:
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
    }),
});
