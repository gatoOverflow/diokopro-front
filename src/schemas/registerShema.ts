import { z } from "zod";

export const RegisterSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  telephone: z.string().min(1, "Le numéro de téléphone est requis"),
  nomEntreprise: z.string().min(1, "Le nom de l'entreprise est requis"),
  ninea: z.string().min(1, "Le numéro NINEA est requis"),
  dateCreation: z.string().min(1, "La date de création est requise"),
  rccm: z.string().min(1, "Le numéro RCCM est requis"),
  representéPar: z.string().min(1, "Le représentant doit être renseigné"),

  adresse: z.string().min(1, "L'adresse est requise"),
  emailEntreprise: z.string().email("Format d'email invalide pour l'entreprise"),
  telephoneEntreprise: z.string().optional(),

});