'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Loader2 } from 'lucide-react';
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateEntreprise } from "@/actions/acceptEntreprise";


type EntrepriseInfos = {
  _id: string;
  nomEntreprise: string;
  adresse: string;
  emailEntreprise: string;
  telephoneEntreprise: string;
  ninea: string;
  supportFees:boolean;
  rccm: string;
  representéPar: string;
  dateCreation: string;
  logo?: string;
};

type Props = {
  entreprise: EntrepriseInfos;

};

export default function UpdateEntreprise({ entreprise }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomEntreprise: entreprise?.nomEntreprise || "",
    adresse: entreprise?.adresse || "",
    emailEntreprise: entreprise?.emailEntreprise || "",
    telephoneEntreprise: entreprise?.telephoneEntreprise || "",
    supportFees: entreprise?.supportFees || false,
    ninea: entreprise?.ninea || "",
    rccm: entreprise?.rccm || "",
    representéPar: entreprise?.representéPar || "",
    dateCreation: entreprise?.dateCreation ? new Date(entreprise.dateCreation).toISOString().split('T')[0] : "",
  });
  
  const router = useRouter();

  // Log des informations importantes
/*   console.log("Données de l'entreprise reçues:", {
    entrepriseId: entreprise?._id,
    nomEntreprise: entreprise?.nomEntreprise
  }); */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked 
    }));
  };
  const validateForm = () => {
    // Validation de base
    if (!formData.nomEntreprise.trim() || !formData.representéPar.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    
    // Validation de l'email si fourni
    if (formData.emailEntreprise) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailEntreprise)) {
        toast.error("Adresse email invalide");
        return false;
      }
    }
    
    // Validation du téléphone si fourni - au moins 9 chiffres
    if (formData.telephoneEntreprise) {
      const phoneRegex = /^\d{9,}$/;
      if (!phoneRegex.test(formData.telephoneEntreprise.replace(/\D/g, ''))) {
        toast.error("Le numéro de téléphone doit contenir au moins 9 chiffres");
        return false;
      }
    }

    // Validation de la date de création
    if (formData.dateCreation) {
      const selectedDate = new Date(formData.dateCreation);
      const today = new Date();
      if (selectedDate > today) {
        toast.error("La date de création ne peut pas être dans le futur");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      // Préparer les données à envoyer
      const updateData = {
        entrepriseId: entreprise._id,
        nomEntreprise: formData.nomEntreprise,
        adresse: formData.adresse,
        emailEntreprise: formData.emailEntreprise,
        telephoneEntreprise: formData.telephoneEntreprise,
        ninea: formData.ninea,
        rccm: formData.rccm,
        representéPar: formData.representéPar,
        supportFees:formData.supportFees,
        dateCreation: formData.dateCreation,
      };

      //console.log("Données à envoyer:", updateData);

      // Appeler l'action de mise à jour
      const result = await updateEntreprise(updateData);
      
    //  console.log("Réponse de la mise à jour:", result);
      
      if (result?.type === 'success') {
        toast.success("Entreprise mise à jour avec succès !");
        // Rediriger vers la page de l'entreprise après un court délai
        setTimeout(() => router.push(`/dashboard/entreprise/${entreprise._id}`), 2000);
      } else if (result?.errors) {
        // Gérer les erreurs de validation
        Object.keys(result.errors).forEach(field => {
          if (result.errors[field]) {
            toast.error(`${field}: ${result.errors[field][0]}`);
          }
        });
      } else {
        toast.error(result?.error || "Erreur lors de la mise à jour de l'entreprise !");
      }
    } catch (error: any) {
      console.error("Erreur détaillée lors de la mise à jour:", error);
      
      // Afficher plus de détails sur l'erreur
      if (error?.response) {
        console.error("Statut de l'erreur:", error.response.status);
        console.error("Données d'erreur:", error.response.data);
      }
      
      toast.error("Erreur lors de la mise à jour : " + (error?.message || "Une erreur est survenue"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl md:text-3xl font-bold text-indigo-900 mb-6 text-center">
        Modifier l'entreprise
      </h1>
      
      <Card className="max-w-4xl mx-auto shadow-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Première ligne: Nom de l'entreprise et Représenté par */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomEntreprise">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nomEntreprise"
                  name="nomEntreprise"
                  value={formData.nomEntreprise}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom de l'entreprise"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="representéPar">
                  Représenté par <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="representéPar"
                  name="representéPar"
                  value={formData.representéPar}
                  onChange={handleInputChange}
                  required
                  placeholder="Nom du représentant"
                />
              </div>
            </div>

            {/* Deuxième ligne: Email et Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailEntreprise">Email de l'entreprise</Label>
                <Input
                  id="emailEntreprise"
                  name="emailEntreprise"
                  type="email"
                  value={formData.emailEntreprise}
                  onChange={handleInputChange}
                  placeholder="email@entreprise.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telephoneEntreprise">Téléphone de l'entreprise</Label>
                <Input
                  id="telephoneEntreprise"
                  name="telephoneEntreprise"
                  type="tel"
                  value={formData.telephoneEntreprise}
                  onChange={handleInputChange}
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>

            {/* Troisième ligne: Adresse */}
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                placeholder="Adresse complète de l'entreprise"
              />
            </div>

            {/* Quatrième ligne: NINEA et RCCM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ninea">NINEA</Label>
                <Input
                  id="ninea"
                  name="ninea"
                  value={formData.ninea}
                  onChange={handleInputChange}
                  placeholder="Numéro NINEA"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rccm">RCCM</Label>
                <Input
                  id="rccm"
                  name="rccm"
                  value={formData.rccm}
                  onChange={handleInputChange}
                  placeholder="Numéro RCCM"
                />
              </div>
            </div>

            {/* Cinquième ligne: Date de création */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateCreation">Date de création</Label>
                <Input
                  id="dateCreation"
                  name="dateCreation"
                  type="date"
                  value={formData.dateCreation}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
               <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="supportFees"
                        checked={formData.supportFees}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div className="flex flex-col">
                        <span className={`font-medium ${formData.supportFees ? 'text-green-600' : 'text-red-600'}`}>
                          {formData.supportFees ? '✅ Client vas supporter les frais' : '❌Client ne vas pas supporter les frais'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formData.supportFees 
                            ? 'Ce client supportera les frais'
                            : 'Ce client ne supportera pas les frais '
                          }
                        </span>
                      </div>
                      
                    </label>
                  </div>
            </div>
             
            {/* Bouton de soumission */}
            <div className="pt-4 flex justify-center">
              <Button 
                type="submit" 
                className="w-full md:w-1/2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );

}