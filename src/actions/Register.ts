import axios from "axios";
import { z } from 'zod';
import { RegisterSchema } from "@/schemas/registerShema";
import { RequestData } from "@/app/lib/types";
import { REGISTER_URL, UPDATE_PASSWORD_URL } from "./endpoint";

export const register = async (state: any, formData: any) => {
    try {
        //console.log("Données du formulaire reçues:", formData);

        // Validation avec Zod
        const validationResult = RegisterSchema.safeParse(formData);

        if (!validationResult.success) {
            const errors = validationResult.error.flatten();
            return {
                type: "error",
                message: "Erreur de validation",
                errors: errors.fieldErrors
            };
        }

        const validatedData = validationResult.data;

        // Préparation des données
        const requestData: RequestData = {
            nom: validatedData.nom,
            prenom: validatedData.prenom,
            email: validatedData.email,
            password: validatedData.password,
            telephone: validatedData.telephone,
            nomEntreprise: validatedData.nomEntreprise,
            ninea: validatedData.ninea,
            dateCreation: validatedData.dateCreation,
            rccm: validatedData.rccm,
            representéPar: validatedData.representéPar,
            adresse: validatedData.adresse,
            emailEntreprise: validatedData.emailEntreprise, // Ajout de l'emailEntreprise
            telephoneEntreprise: validatedData.telephoneEntreprise // Ajout du téléphoneEntreprise
        };

        //console.log("Données préparées pour l'envoi:", requestData);
        //console.log(REGISTER_URL);
        const res = await axios.post(REGISTER_URL, requestData);


       // console.log("Réponse du serveur:", res.data);

        return {
            type: "success",
            message: "Inscription réussie",
        };

    } catch (error: any) {
        console.error("Erreur lors de l'inscription:", error);

        if (error.response) {
            return {
                type: "error",
                message: error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`
            };
        } else if (error.request) {
            return {
                type: "error",
                message: "Impossible de joindre le serveur. Veuillez réessayer.",
            };
        } else {
            return {
                type: "error",
                message: "Une erreur inattendue s'est produite.",
            };
        }
    }
};



// Schéma de validation pour le changement de mot de passe
const UpdatePasswordSchema = z.object({
    
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
});

// Type pour les données de mise à jour du mot de passe
interface UpdatePasswordData {
    userId: string;
    email: string;
    password: string; // ancien mot de passe
    newPassword: string;
}

// URL de votre endpoint (à adapter selon votre configuration)


export const updatePassword = async (state: any, formData: FormData) => {
    try {
        // Extraction des données du FormData
        const rawData = {
            userId: formData.get('userId') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string, // ancien mot de passe
            newPassword: formData.get('newPassword') as string,
        };

     //   console.log("Données du formulaire reçues:", rawData);

        // Validation avec Zod
        const validationResult = UpdatePasswordSchema.safeParse(rawData);

        if (!validationResult.success) {
            const errors = validationResult.error.flatten();
            return {
                type: "error",
                message: "Erreur de validation",
                errors: errors.fieldErrors
            };
        }

        const validatedData = validationResult.data;

        // Préparation des données pour l'envoi (renommer pour correspondre à votre backend)
        const requestData = {
     
            email: validatedData.email,
            oldPassword: validatedData.password, // Renommé pour correspondre à votre backend
            newPassword: validatedData.newPassword,
            confirmNewPassword: validatedData.newPassword, // Même valeur que newPassword
        };

       // console.log("Données préparées pour l'envoi:", requestData);

        // Envoi de la requête à votre API
        const res = await axios.put(UPDATE_PASSWORD_URL, requestData);

       // console.log("Réponse du serveur:", res.data);

        return {
            type: "success",
            message: res.data.message || "Mot de passe mis à jour avec succès",
        };

    } catch (error: any) {
        console.error("Erreur lors de la mise à jour du mot de passe:", error);

        if (error.response) {
            return {
                type: "error",
                message: error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`
            };
        } else if (error.request) {
            return {
                type: "error",
                message: "Impossible de joindre le serveur. Veuillez réessayer.",
            };
        } else {
            return {
                type: "error",
                message: "Une erreur inattendue s'est produite.",
            };
        }
    }
};