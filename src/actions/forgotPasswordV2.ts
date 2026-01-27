"use server";

import axios from "axios";
import { FORGOT_PASSWORD_V2_URL, RESET_PASSWORD_V2_URL } from "./endpoint";
import { RequestOTPSchema, ResetPasswordV2Schema } from "@/schemas/forgotPasswordV2Schema";

export type ActionResult = {
  type: "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
};

/**
 * Request OTP for password reset
 * Step 1: User provides email or phone number
 */
export const requestPasswordOTP = async (
  identifier: string,
  identifierType: "email" | "telephone"
): Promise<ActionResult> => {
  try {
    // Validate input
    const validatedFields = RequestOTPSchema.safeParse({
      identifier,
      identifierType,
    });

    if (!validatedFields.success) {
      return {
        type: "error",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Build request body based on identifier type
    const requestBody = identifierType === "email"
      ? { email: identifier }
      : { telephone: identifier };

    // Make API request
    const response = await axios.post(FORGOT_PASSWORD_V2_URL, requestBody);

    if (response.data?.success) {
      return {
        type: "success",
        message: response.data.message || "Code OTP envoyé avec succès",
      };
    }

    return {
      type: "error",
      message: response.data?.message || "Une erreur est survenue",
    };
  } catch (error: any) {
    console.error("Error requesting OTP:", error);

    // Handle specific API errors
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message,
      };
    }

    return {
      type: "error",
      message: "Une erreur est survenue lors de l'envoi du code OTP",
    };
  }
};

/**
 * Reset password with OTP
 * Step 2 & 3: User provides OTP and new password
 */
export const resetPasswordWithOTP = async (
  identifier: string,
  identifierType: "email" | "telephone",
  otp: string,
  newPassword: string,
  confirmNewPassword: string
): Promise<ActionResult> => {
  try {
    // Validate input
    const validatedFields = ResetPasswordV2Schema.safeParse({
      identifier,
      identifierType,
      otp,
      newPassword,
      confirmNewPassword,
    });

    if (!validatedFields.success) {
      return {
        type: "error",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Build request body based on identifier type
    const requestBody = {
      ...(identifierType === "email" ? { email: identifier } : { telephone: identifier }),
      otp,
      newPassword,
      confirmNewPassword,
    };

    // Make API request
    const response = await axios.post(RESET_PASSWORD_V2_URL, requestBody);

    if (response.data?.success) {
      return {
        type: "success",
        message: response.data.message || "Mot de passe réinitialisé avec succès",
      };
    }

    return {
      type: "error",
      message: response.data?.message || "Une erreur est survenue",
    };
  } catch (error: any) {
    console.error("Error resetting password:", error);

    // Handle specific API errors
    if (error.response?.data?.message) {
      return {
        type: "error",
        message: error.response.data.message,
      };
    }

    return {
      type: "error",
      message: "Une erreur est survenue lors de la réinitialisation",
    };
  }
};
