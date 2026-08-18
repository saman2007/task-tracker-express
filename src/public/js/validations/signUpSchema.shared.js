import * as z from "zod";

export const signUpSchema = z
  .object({
    fullname: z.string().min(1, { error: "Full name is required." }),
    email: z.email(),
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters long." })
      .regex(/[a-zA-Z]/, {
        error: "Password must contain at least one letter.",
      })
      .regex(/[0-9]/, {
        error: "Password must contain at least one number.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match.",
    path: ["confirmPassword"],
  })
  .required();
