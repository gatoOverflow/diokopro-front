import { z } from "zod";

// Schema for requesting OTP (step 1)
export const RequestOTPSchema = z.object({
  identifier: z.string().min(1, { message: "Email ou numéro de téléphone requis" }),
  identifierType: z.enum(["email", "telephone"]),
}).refine((data) => {
  if (data.identifierType === "email") {
    return z.string().email().safeParse(data.identifier).success;
  }
  // Phone validation - accepts formats like +221771234567 or 771234567
  const phoneRegex = /^(\+221)?[0-9]{9}$/;
  return phoneRegex.test(data.identifier.replace(/\s/g, ""));
}, {
  message: "Format invalide. Vérifiez votre email ou numéro de téléphone.",
  path: ["identifier"],
});

// Schema for OTP verification (step 2)
export const VerifyOTPSchema = z.object({
  otp: z.string().length(6, { message: "Le code OTP doit contenir 6 chiffres" }),
});

// Schema for resetting password (step 3)
export const ResetPasswordV2Schema = z.object({
  identifier: z.string().min(1, { message: "Identifiant requis" }),
  identifierType: z.enum(["email", "telephone"]),
  otp: z.string().length(6, { message: "Le code OTP doit contenir 6 chiffres" }),
  newPassword: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  confirmNewPassword: z
    .string()
    .min(8, { message: "Confirmez votre mot de passe" }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmNewPassword"],
});
