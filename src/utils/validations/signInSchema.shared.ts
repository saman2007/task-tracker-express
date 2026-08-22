import * as z from "zod";

export const signInSchema = z
  .object({
    email: z.email(),
    password: z.string().min(1, { error: "Password is required." }),
  })
  .required();

export type SignInSchemaData = z.infer<typeof signInSchema>;
