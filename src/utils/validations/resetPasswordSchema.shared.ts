import * as z from "zod";

export const resetPasswordSchema = z
  .object({
    email: z.email(),
  })
  .required();

export type ResetPasswordSchemaData = z.infer<typeof resetPasswordSchema>;

