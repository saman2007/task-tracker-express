import * as z from "zod";

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: "Current password is required." }),
    password: z
      .string()
      .min(8, { error: "New password must be at least 8 characters long." })
      .regex(/[a-zA-Z]/, {
        error: "New password must contain at least one letter.",
      })
      .regex(/[0-9]/, {
        error: "New password must contain at least one number.",
      }),
    confirmPassword: z
      .string()
      .min(1, { error: "Please confirm your new password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match.",
    path: ["confirmPassword"],
  })
  .required();

