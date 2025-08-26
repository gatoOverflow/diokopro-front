"use server";

import axios from "axios";
import { LoginSchema } from "@/schemas/loginschema";
import { LOGIN_URL } from "./endpoint";
import { log } from "console";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const login = async (state: any, formData: FormData) => {
  try {
    // Validation avec zod
    const validatedFields = LoginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, password } = validatedFields.data;


    // Faire une requête POST pour connecter l'utilisateur
    const res = await axios.post(LOGIN_URL, {
      email,
      password,
    });

    console.log("Login response:", res.data); // Debugging: Log the response

    // Vérifiez si la réponse contient un message indiquant que l'OTP a été envoyé
    if (res.data.message === "Code OTP envoyé par email.") {
      return {
        requiresOtp: true,
        email: email,
        type: "success",
        message: "Veuillez entrer le code OTP envoyé à votre email",
      };
    } else {
      return {
        type: "error",
        message: res.data.message || "Échec de la connexion",
      };
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      type: "error",
      message: error?.response?.data?.message || "Une erreur s'est produite lors de la connexion",
    };
  }
};

export async function logout() {
  (await cookies()).delete("token");
  redirect("/auth/login");
}