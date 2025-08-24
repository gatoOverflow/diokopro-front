"use server";
import { z } from "zod";
import { CREATE_AGENT_URL, DELETE_AGENT_URL, UPDATE_AGENT_URL } from "./endpoint";
import { createdOrUpdated } from "@/lib/api";
import axios from "axios";
import { cookies } from "next/headers";
const NiveauSchema = z.object({
  nom: z.string().min(1, { message: "Le nom du niveau est requis" }),
  tarif: z
    .union([z.string(), z.number()])
    .transform(val => Number(val))
    .refine(val => !isNaN(val), { message: "Le tarif doit être un nombre" })
});

// Schéma modifié pour inclure les paramètres de paiement
const AgentSchema = z.object({
  nom: z.string().min(1, { message: "Le nom est obligatoire" }),
  prenom: z.string().min(1, { message: "Le prénom est obligatoire" }),
  email: z.string().email({ message: "L'email doit être valide" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" }),
  serviceId: z.string().min(1, { message: "L'ID du service est obligatoire" }),
  telephone: z.string().min(9, { message: "Le numéro de téléphone doit contenir au moins 10 chiffres" }),
  adresse: z.string().min(1, { message: "L'adresse est obligatoire" }),
  salaire: z.number(),
  nin: z.string().optional(),
   niveauxDisponibles: z.array(NiveauSchema).optional(),
   wallet: z.string().min(1, { message: "Le portefeuille est obligatoire" }),
  // Nouveaux champs pour les paiements
  frequencePaiement: z.enum(['mensuel', 'hebdomadaire', 'quotidien', 'horaire', 'minute', 'unique']).optional().default('mensuel'),
  intervallePaiement: z.number().optional(),
  jourPaiement: z.number().optional(),
  dateProchainVirement: z.union([z.string(), z.date()]), /// change here
  aPayer: z.boolean().optional()
});

const DeleteAgentSchema = z.object({
  agentId: z.string().min(1, { message: "L'ID du client est obligatoire" }),
  entrepriseId: z.string().min(1, { message: "L'ID de l'entreprise est obligatoire" })
});

// Modification du schéma pour exiger serviceId
const UpdateAgentschema = AgentSchema.partial().extend({
  agentId: z.string().min(1, { message: "L'ID de l'agent est obligatoire" }),
});

export const createAgent = async (formData) => {
 // console.log("Début createAgent - Données reçues:", formData);

  try {
    // Convertir les champs numériques si nécessaire
    const processedData = {
  ...formData,
  intervallePaiement: typeof formData.intervallePaiement === 'string' ? Number(formData.intervallePaiement) : formData.intervallePaiement,
  jourPaiement: typeof formData.jourPaiement === 'string' ? Number(formData.jourPaiement) : formData.jourPaiement,
  niveauxDisponibles: formData.niveauxDisponibles?.map(niveau => ({
    ...niveau,
    tarif: niveau.tarif ? Number(niveau.tarif) : 0  // ou NaN si tu veux bloquer
  }))
};


    const validation = AgentSchema.safeParse(processedData);

    if (!validation.success) {
     // console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId, serviceId, ...agentData
      
     } = validation.data;

    //console.log("Données validées:", agentData);
   // console.log("URL de l'API:", `${CREATE_AGENT_URL}/${entrepriseId}/service/${serviceId}`);

    const response = await createdOrUpdated({ 
      url: `${CREATE_AGENT_URL}/${entrepriseId}/service/${serviceId}`, 
      data: agentData 
    });

    //console.log("Réponse API:", response);
    return { type: "success", data: response };
  } catch (error) {
    console.error("Erreur dans createAgent:", error);
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    
    return { type: "error", error: "Erreur lors de la création de l'agent" };
  }
};

export const updatedAgent = async (formData) => {
 /// console.log("Début updateAgent - Données reçues:", formData);

  try {
    // Convertir les champs numériques si nécessaire
    const processedData = {
      ...formData,
      salaire: typeof formData.salaire === 'string' ? Number(formData.salaire) : formData.salaire,
      intervallePaiement: typeof formData.intervallePaiement === 'string' ? Number(formData.intervallePaiement) : formData.intervallePaiement,
      jourPaiement: typeof formData.jourPaiement === 'string' ? Number(formData.jourPaiement) : formData.jourPaiement,
    };

    const validation = UpdateAgentschema.safeParse(processedData);

    if (!validation.success) {
     // console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }

    const { entrepriseId, agentId, ...agentData } = validation.data;

    // Construction de l'URL avec les IDs validés
    const apiUrl = `${UPDATE_AGENT_URL}/${entrepriseId}/agent/${agentId}`;

   // console.log("Données validées:", agentData);
   // console.log("URL de l'API:", apiUrl);

    const response = await createdOrUpdated({ 
      url: apiUrl, 
      data: agentData,
      updated: true
    });

    //console.log("Réponse API:", response);
    return { type: "success", data: response };
  } catch (error) {
    console.error("Erreur dans updateAgent:", error);
    
    // Logging détaillé pour le débogage
    if (error.response) {
      console.error("Détails de l'erreur:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    if (error.response?.data?.message) {
      return { type: "error", error: error.response.data.message };
    }
    
    return { type: "error", error: "Erreur lors de la mise à jour de l'agent" };
  }
}

export async function deleteAgent(formData) {
  console.log("Début deleteAgent - Données reçues:", formData);

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
    
    const validation = DeleteAgentSchema.safeParse(formObject);
    
    if (!validation.success) {
      //console.log("Échec validation:", validation.error.flatten());
      return { type: "error", errors: validation.error.flatten().fieldErrors };
    }
    
    const { entrepriseId, agentId } = validation.data;
    const deleteUrl = `${DELETE_AGENT_URL}/${entrepriseId}/agent/${agentId}`;
    
   // console.log("URL de l'API pour suppression définitive:", deleteUrl);
    
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
    
    console.log("Réponse de suppression définitive:", response.data);
    
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
      message: "Agent supprimé avec succès",
      data: { type: 'success' }
    };
    
  } catch (error) {
    console.error("Erreur lors de la suppression de l'agent:", error);
    
    if (error.response) {
     /// console.log("Statut:", error.response.status);
     // console.log("Données:", error.response.data);
      
      if (error.response.status === 404) {
        return {
          type: "error",
          message: "Agent non trouvé"
        };
      }
    }
    
    return {
      type: "error",
      message: error?.response?.data?.message || "Erreur lors de la suppression de l'agent"
    };
  }
}