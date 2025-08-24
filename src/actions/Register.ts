import axios from "axios";

import { RegisterSchema } from "@/schemas/registerShema";
import { RequestData } from "@/app/lib/types";
import { REGISTER_URL } from "./endpoint";

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


        console.log("Réponse du serveur:", res.data);

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