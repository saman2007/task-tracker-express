import * as z from "zod";

export const verifyAccountSchema = z
  .object({
    email: z.email(),
  })
  .required();

export type VerifyAccountSchemaData = z.infer<typeof verifyAccountSchema>;

