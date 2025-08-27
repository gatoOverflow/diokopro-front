"use server";

import { z } from "zod";
import { createdOrUpdated } from "@/lib/api";
import { BASE_URL, DELETE_SERVICE_URL, SERVICE_URL, UPDATE_SERVICE_URL } from "./endpoint";
import { cookies } from "next/headers";
import axios from "axios";

// Schéma de validation pour les données du service
const ServiceSchema = z.object({
  nomService: z.string().min(1, { message: "Le nom du service est obligatoire" }),
  description: z.string().min(1, { message: "La description est obligatoire" }),
  tarifactionBase: z.number().min(0, { message: "Le tarif de base ne peut pas être négatif" }),
  niveauxDisponibles: z.array(z.object({
    nom: z.string().min(1, { message: "Le nom du niveau est obligatoire" }),
    tarif: z.number().min(0, { message: "Le tarif ne peut pas être négatif" })
  })).min(1, { message: "Au moins un niveau de service est requis" })
});
const UpdateServiceSchema = z.object({
  serviceId: z.string().min(1, { message: "L'ID du service est obligatoire" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" }),
  nomService: z.string().min(1, { message: "Le nom du service est obligatoire" }).optional(),
  description: z.string().min(1, { message: "La description est obligatoire" }).optional(),
  tarifactionBase: z.number().min(0, { message: "Le tarif de base ne peut pas être négatif" }).optional(),
  niveauxDisponibles: z.array(z.object({
    nom: z.string().min(1, { message: "Le nom du niveau est obligatoire" }),
    tarif: z.number().min(0, { message: "Le tarif ne peut pas être négatif" })
  })).optional()
});
const DeleteClientSchema = z.object({
  serviceId: z.string().min(1, { message: "L'ID du client est obligatoire" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" })
});
// Fonction pour mettre à jour un service
const updateService = async (formData) => {
//  console.log("🏁 Début updateService dans service.ts");
//  console.log("📦 Données reçues:", formData);

  try {
    // Convertir les champs numériques si nécessaire
  const formDataWithNiveaux: typeof formData = {
  ...formData,
  niveauxDisponibles: formData.niveauxDisponibles ?? formData.serviceDis?.niveauxDisponibles ?? []
};

const processedData = {
  ...formDataWithNiveaux,
  tarifactionBase: typeof formDataWithNiveaux.tarifactionBase === 'string'
    ? Number(formDataWithNiveaux.tarifactionBase)
    : formDataWithNiveaux.tarifactionBase,
  niveauxDisponibles: formDataWithNiveaux.niveauxDisponibles.map(niveau => ({
    ...niveau,
    tarif: typeof niveau.tarif === 'string' ? Number(niveau.tarif) : niveau.tarif
  }))
};

  

   // console.log("🔍 Début validation Zod");
    const validation = UpdateServiceSchema.safeParse(processedData);

    if (!validation.success) {
    //  console.log("❌ Échec validation Zod:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }
   // console.log("✅ Validation Zod réussie");

    const { entrepriseId, serviceId, ...serviceData } = validation.data;

    // Construction de l'URL avec les IDs validés
    const apiUrl = `${UPDATE_SERVICE_URL}/entreprise/${entrepriseId}/service/${serviceId}`;

   // console.log("📝 Données préparées pour l'API:", serviceData);
   // console.log("🔗 URL complète de l'API:", apiUrl);
   // console.log("🏢 EntrepriseId:", entrepriseId);
//console.log("🔧 ServiceId:", serviceId);

    // Appel à l'API
   // console.log("🚀 Envoi de la requête à l'API...");
    const response = await createdOrUpdated({ 
      url: apiUrl, 
      data: serviceData,
      updated: true // Indiquer que c'est une mise à jour
    });
   // console.log("✨ Réponse de l'API:", response);

    return { type: "success", data: response };
  } catch (error) {
    console.error("💥 Erreur dans updateService:", error);
    console.error("💥 Détails de l'erreur:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url // Afficher l'URL utilisée
    });
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 404) {
      return { type: "error", error: "Service non trouvé - Vérifiez l'ID du service" };
    }
    
    if (error.response?.status === 403) {
      return { type: "error", error: "Accès refusé pour cette modification" };
    }
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    
    return { type: "error", error: "Erreur lors de la mise à jour du service" };
  }
};
// Création d'un service
const createService = async (entrepriseId, formData) => {
  //console.log("🏁 Début createService dans service.ts");
  //console.log("📦 Données reçues:", formData);
  //console.log("🏢 EntrepriseId:", entrepriseId);

  try {
    // Validation des données
    //console.log("🔍 Début validation Zod");
    const validation = ServiceSchema.safeParse(formData);

    if (!validation.success) {
      //console.log("❌ Échec validation Zod:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }
    //console.log("✅ Validation Zod réussie");

    const { nomService, description, tarifactionBase, niveauxDisponibles } = validation.data;

    // Préparation des données pour l'API
    const reqBody = {
      nomService,
      description,
      tarifactionBase,
      niveauxDisponibles
    };
    //console.log("📝 Données préparées pour l'API:", reqBody);
    //console.log("🔗 URL de l'API:", `${SERVICE_URL}/entreprise/${entrepriseId}`);

    // Appel à l'API
    //console.log("🚀 Envoi de la requête à l'API...");
    const response = await createdOrUpdated({ 
      url: `${SERVICE_URL}/entreprise/${entrepriseId}`, 
      data: reqBody 
    });
    //console.log("✨ Réponse de l'API:", response);

    return { type: "success", data: response };
  } catch (error) {
    console.error("💥 Erreur dans createService:", error);
    console.error("💥 Détails de l'erreur:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    return { type: "error", error: "Erreur lors de la création du service" };
  }
};

const OTPValidationSchema = z.object({
  pendingChangeId: z.string().min(1, { message: "L'ID de changement est obligatoire" }),
  otp: z.string().min(6, { message: "Le code OTP doit contenir au moins 6 caractères" })
    .max(6, { message: "Le code OTP ne doit pas dépasser 6 caractères" })
    .regex(/^\d+$/, { message: "Le code OTP doit contenir uniquement des chiffres" })
});

const validateOTP = async (pendingChangeId, otp, entrepriseId) => {
  //console.log("🏁 Début validateOTP");
  //console.log("📦 Données reçues:", { pendingChangeId, otp, entrepriseId });

  try {
    // Validation des données
    //console.log("🔍 Début validation Zod");
    const validation = OTPValidationSchema.safeParse({ pendingChangeId, otp });

    if (!validation.success) {
      //console.log("❌ Échec validation Zod:", validation.error.flatten());
      return { 
        success: false, 
        error: "Données invalides", 
        errors: validation.error.flatten().fieldErrors 
      };
    }
    //console.log("✅ Validation Zod réussie");

    const validatedData = validation.data;

    // Préparation des données pour l'API
    const reqBody = {
      pendingChangeId: validatedData.pendingChangeId,
      otp: validatedData.otp
    };
    //console.log("📝 Données préparées pour l'API:", reqBody);

    // Appel à l'API
    //console.log("🚀 Envoi de la requête à l'API...");
    const response = await createdOrUpdated({ 
      url: `${BASE_URL}/validate-change/entreprise/${entrepriseId}`, 
      data: reqBody 
    });
    //console.log("✨ Réponse de l'API:", response);

    return { 
      success: true, 
      data: response 
    };
  } catch (error) {
    console.error("💥 Erreur dans validateServiceOTP:", error);
    console.error("💥 Détails de l'erreur:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response?.data?.message) {
      return { 
        success: false, 
        error: error.response.data.message 
      };
    }
    return { 
      success: false, 
      error: "Erreur lors de la validation du code OTP" 
    };
  }
};
export async function deleteService(formData) {
 // console.log("Début deleteClient - Données reçues:", formData);

  try {
    const token = (await cookies()).get("token")?.value;
    
    if (!token) {
      return { 
        type: "error", 
        message: "Non autorisé. Veuillez vous connecter." 
      };
    }
    
    const formObject = formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;
    
    const validation = DeleteClientSchema.safeParse(formObject);
    
    if (!validation.success) {
    //  console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }
    
    const { entrepriseId, serviceId } = validation.data;
    const deleteUrl = `${DELETE_SERVICE_URL}/${entrepriseId}/service/${serviceId}`;
    
    //console.log("URL de l'API pour suppression définitive:", deleteUrl);
    
    // Requête de suppression avec l'autorisation
    const response = await axios({
      method: 'delete',
      url: deleteUrl,
      headers: { 
        'Accept': "application/json",
        'Content-Type': "application/json", 
        'Authorization': `Bearer ${token}`
      }
    });
    
   // console.log("Réponse de suppression définitive:", response.data);
    
    // Vérifier si un ID de changement en attente est retourné (pour l'OTP)
    if (response.data?.pendingChangeId) {
      return {
        type: "pending",
        message: "Un code OTP a été envoyé pour confirmer la suppression définitive",
        data: { pendingChangeId: response.data.pendingChangeId }
      };
    }
    
    return { 
      type: "success",
      success: true,
      message: "Client supprimé avec succès",
      data: { type: 'success' }
    };
    
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error);
    
    if (error.response) {
     // console.log("Statut:", error.response.status);
     // console.log("Données:", error.response.data);
      
      if (error.response.status === 404) {
        return {
          type: "error",
          message: "Client non trouvé"
        };
      }
    }
    
    return {
      type: "error",
      message: error?.response?.data?.message || "Erreur lors de la suppression du client"
    };
  }
}
export { createService, validateOTP,updateService };