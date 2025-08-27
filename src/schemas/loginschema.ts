import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Entrer un email valide" }),
  password: z
    .string()
    .min(8, { message: "Le mot de paase doit avoir au moins 8 caractères" }),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: "Entrer un email valide" }),
});