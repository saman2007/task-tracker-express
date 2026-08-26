import * as z from "zod";

export const updateProfileSchema = z
  .object({
    fullname: z.string().min(1, { error: "Full name is required." }),
    email: z.email(),
  })
  .required();

