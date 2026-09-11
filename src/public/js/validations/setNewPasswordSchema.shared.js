import * as z from "zod";

export const setNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters long." })
      .regex(/[a-zA-Z]/, {
        error: "Password must contain at least one letter.",
      })
      .regex(/[0-9]/, {
        error: "Password must contain at least one number.",
      }),
    confirmPassword: z
      .string()
      .min(1, { error: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match.",
    path: ["confirmPassword"],
  })
  .required();
