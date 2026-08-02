import { z } from "zod";

export const signupValidationSchema = z.object({
  username: z.string().trim().min(3),
  password: z.string().min(6),
});

export const loginValidationSchema = z.object({
  username: z.string().trim().min(3),
  password: z.string().min(6),
});