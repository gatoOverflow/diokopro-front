"use server";

import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { DEBITER_COMPTE_ENTREPRISE, RECHARGE_COMPTE_ENTREPRISE } from "./endpoint";

// Schémas de validation
const RechargeSchema = z.object({
  montant: z.number().min(1, { message: "Le montant doit être supérieur à 0" }),
});

const RetraitSchema = z.object({
  montant: z.number().min(1, { message: "Le montant doit être supérieur à 0" }),
  numAdmin: z.string().min(1, { message: "Le numéro de téléphone est obligatoire" }),
  wallet: z.string().min(1, { message: "Le portefeuille est obligatoire" }),
});

const CreditSchema = z.object({
  montant: z.number().min(1, { message: "Le montant doit être supérieur à 0" }),
  raison: z.string().optional(),
});

const MessageSchema = z.object({
  titre: z.string().min(1, { message: "Le titre est obligatoire" }),
  message: z.string().min(1, { message: "Le message est obligatoire" }),
});

// Action pour recharger le compte
export const rechargeCompte = async (
  entrepriseId: string,
  formData: { montant: number; otpCode?: string; resendOtp?: boolean }
) => {
  try {
    

    const validation = RechargeSchema.safeParse(formData);
    
    if (!validation.success) {
      console.error('❌ [rechargeCompte] Erreur de validation', validation.error.flatten().fieldErrors);
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
      };
    }

   

    const response = await createdOrUpdated({
      url: `${RECHARGE_COMPTE_ENTREPRISE}/${entrepriseId}`,
      data: validation.data,
    });

    

    // Si le backend retourne un pendingChangeId, c'est qu'il faut valider avec OTP
    if (response?.pendingChangeId) {
   
      return {
        type: "success",
        requiresOtp: true,
        message: response.message || "Code OTP envoyé à l'administrateur",
        data: response, // Contient le pendingChangeId
      };
    }

    // Vérifier si le backend demande un OTP explicitement
    if (response?.requiresOtp || response?.data?.requiresOtp) {
      return {
        type: "success",
        requiresOtp: true,
        message: "Code OTP envoyé à l'administrateur",
        data: response,
      };
    }
    return {
      type: "success",
      message: "Lien de recharge créé avec succès",
      data: response,
    };
  } catch (error) {
    console.error('💥 [rechargeCompte] Erreur complète:', {
      message: error?.message,
      response: error?.response,
      responseData: error?.response?.data,
      status: error?.response?.status,
      fullError: error
    });

    if (error?.response?.data?.message) {
      console.error('❌ [rechargeCompte] Message d\'erreur du backend:', error.response.data.message);
      return { 
        type: "error", 
        error: error.response.data.message 
      };
    }

    return {
      type: "error",
      error: "Erreur lors de la création du lien de recharge",
    };
  }
};

// Action pour effectuer un retrait
export const retraitCompte = async (
  entrepriseId: string,
  formData: { montant: number; numAdmin: string; wallet: string; otpCode?: string; resendOtp?: boolean }
) => {


  try {
    const validation = RetraitSchema.safeParse(formData);
    if (!validation.success) {
      console.error('❌ [retraitCompte] Validation échouée:', validation.error.flatten().fieldErrors);
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
      };
    }


    const response = await createdOrUpdated({
      url: `${DEBITER_COMPTE_ENTREPRISE}/${entrepriseId}`,
      data: validation.data,
    });


    // Si le backend retourne un pendingChangeId, c'est qu'il faut valider avec OTP
    if (response?.pendingChangeId) {
      
      return {
        type: "success",
        requiresOtp: true,
        message: response.message || "Code OTP envoyé à l'administrateur",
        data: response, // Contient le pendingChangeId
      };
    }

    // Vérifier si le backend demande un OTP explicitement
    if (response?.requiresOtp || response?.data?.requiresOtp) {
      return {
        type: "success",
        requiresOtp: true,
        message: "Code OTP envoyé à l'administrateur",
        data: response,
      };
    }

    
    // Le retrait peut etre EMIS sans etre confirme : CaurisFlux valide de
    // facon asynchrone et l'API repond alors pending. Annoncer "effectue"
    // dans ce cas ferait croire que l'argent est parti et que le solde a
    // ete debite, alors qu'aucun des deux n'est acquis.
    if (response?.pending) {
      return {
        type: "success",
        pending: true,
        message: response?.message || "Retrait émis, en attente de confirmation par l'opérateur",
        data: response,
      };
    }

    return {
      type: "success",
      pending: false,
      message: "Retrait effectué avec succès",
      data: response,
    };
  } catch (error: any) {
    console.error('💥 [retraitCompte] Erreur attrapée:', error);

    if (error?.response?.data?.message) {
      console.error('❌ [retraitCompte] Message d\'erreur du backend:', error.response.data.message);
      return { 
        type: "error", 
        error: error.response.data.message 
      };
    }

    return {
      type: "error",
      error: "Erreur lors du retrait",
    };
  } finally {
    console.log('📌 [retraitCompte] Fin de la fonction retraitCompte');
  }
};


// Action pour créditer le compte (à adapter selon ton API)


// Action pour envoyer un message
export const envoyerMessage = async (
  entrepriseId: string,
  formData: { titre: string; message: string }
) => {
  try {
    const validation = MessageSchema.safeParse(formData);

    if (!validation.success) {
      return {
        type: "error",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    // À adapter selon ton endpoint API
    const response = await createdOrUpdated({
      url: `/api/envoyer-message/entreprise/${entrepriseId}`,
      data: validation.data,
    });

    return {
      type: "success",
      message: "Message envoyé avec succès",
      data: response,
    };
  } catch (error) {
    console.error("Erreur dans envoyerMessage:", error);

    if (error?.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }

    return { type: "error", error: "Erreur lors de l'envoi du message" };
  }
};

// Action pour récupérer le solde actuel
