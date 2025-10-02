"use server";

import { getRedirectUrlForRole } from "../../routes";
import axios from "axios";
import { cookies } from "next/headers";
import { VERIFY_OTP_URL } from "./endpoint";

export const verifyOtp = async (state: any, formData: FormData) => {
  let role: string;

  try {
    const email = formData.get("email");
    const otp = formData.get("otp");

    // Envoyer une requête pour vérifier l'OTP
    const res = await axios.post(`${VERIFY_OTP_URL}`, {
      email,
      otp,
    });

    //console.log("OTP verification response:", res.data);

    // Vérifier si la réponse est valide
    if (!res.data || !res.data.user) {
      return {
        type: "error",
        message: "Réponse invalide du serveur",
      };
    }

    const { token, user } = res.data;
    role = user.role; // Extraire le rôle de l'utilisateur

    // Si l'OTP est valide, connecter l'utilisateur
    if (token) {
      // Configurer le cookie
      const cookieStore = cookies();
      await (await cookieStore).set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      // Configurer le header Authorization
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Obtenir l'URL de redirection en fonction du rôle
      const urlToRedirect = getRedirectUrlForRole(role);
     // console.log("Role:", role);
     // console.log("Redirect URL:", urlToRedirect);

      if (!urlToRedirect) {
        console.error("No redirect URL found for role:", role);
        return {
          type: "redirect",
          url: "/dashboard", // Fallback to a default route
          entrepriseId: user.entrepriseId, // Ajouter l'entrepriseId dans la réponse
        };
      } else {
        return {
          type: "redirect",
          url: urlToRedirect, // URL relative
          entrepriseId: user.entrepriseId, // Ajouter l'entrepriseId dans la réponse
        };
      }
    } else {
      return {
        type: "error",
        message: "Token manquant dans la réponse",
      };
    }
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return {
      type: "error",
      message: error?.response?.data?.message || "Erreur lors de la vérification OTP",
    };
  }
};