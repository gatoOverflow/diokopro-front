'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserInfos } from "@/app/lib/types";
import OtpInput from "@/app/dashboard/entreprise/_components/_Agent/OtpInput";
import { updatedAgent } from "@/actions/Agent";
import { validateOTP } from "@/actions/service";
import { fetchJSON } from "@/lib/api";
import { ENTERPRISES_ENDPOINT } from "@/actions/endpoint";

type Props = {
  user: UserInfos;
};

export default function UpdateProfile({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || "",
    prenom: user?.prenom || "",
    telephone: user?.telephone || "",
    email: user?.email || "",
  });

  // État pour l'OTP
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingChangeId, setPendingChangeId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // État pour l'entreprise
  const [entrepriseId, setEntrepriseId] = useState<string | null>(null);
  const [loadingEntreprise, setLoadingEntreprise] = useState(true);
  const [entrepriseError, setEntrepriseError] = useState<string | null>(null);
  
  const router = useRouter();

  // Récupérer l'ID de l'entreprise au chargement du composant
  useEffect(() => {
    const getEnterprise = async () => {
      try {
        setLoadingEntreprise(true);
        
        // Si l'utilisateur a déjà un entrepriseId, l'utiliser
        if (user.entrepriseId) {
          setEntrepriseId(user.entrepriseId);
          setLoadingEntreprise(false);
          return;
        }
        
        // Sinon, récupérer la première entreprise disponible
        const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
        
        if (enterprises && enterprises.length > 0) {
          const currentEnterpriseId = enterprises[0]?._id;
          if (currentEnterpriseId) {
            setEntrepriseId(currentEnterpriseId);
            //console.log("Entreprise récupérée:", currentEnterpriseId);
          } else {
            setEntrepriseError("ID d'entreprise non trouvé");
          }
        } else {
          setEntrepriseError("Aucune entreprise trouvée");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'entreprise:", error);
        setEntrepriseError("Erreur lors de la récupération de l'entreprise");
      } finally {
        setLoadingEntreprise(false);
      }
    };

    getEnterprise();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Validation de base
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.telephone.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Adresse email invalide");
      return false;
    }
    
    // Validation du téléphone - au moins 9 chiffres
    const phoneRegex = /^\d{9,}$/;
    if (!phoneRegex.test(formData.telephone.replace(/\D/g, ''))) {
      toast.error("Le numéro de téléphone doit contenir au moins 9 chiffres");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Vérifier que l'ID entreprise est disponible
    if (!entrepriseId) {
      toast.error("ID d'entreprise manquant. Impossible de procéder à la mise à jour.");
      return;
    }
    
    setLoading(true);

    try {
      // Préparer les données à envoyer
      const updateData = {
        agentId: user._id,
        entrepriseId: entrepriseId,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        email: formData.email,
      };

     // console.log("Données à envoyer:", updateData);

      // Appeler l'action de mise à jour
      const result = await updatedAgent(updateData);
      
   //   console.log("Réponse de la mise à jour:", result);
      
      if (result?.data?.pendingChangeId) {
        // OTP requis
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info("Un code OTP a été envoyé à l'administrateur pour valider les modifications");
      } else if (result?.type === 'success') {
        toast.success("Mise à jour réussie !");
        setTimeout(() => router.push(`/dashboard/profile/${user._id}`), 2000);
      } else {
        toast.error(result?.error || "Erreur lors de la mise à jour !");
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

  const handleOtpVerification = async () => {
    if (!pendingChangeId || !otpCode || otpCode.length !== 6) {
      toast.error("Veuillez entrer un code OTP valide à 6 chiffres");
      return;
    }

    if (!entrepriseId) {
      toast.error("ID d'entreprise manquant. Impossible de valider le code OTP.");
      return;
    }

    setIsVerifying(true);
    try {
    /*   console.log("Vérification OTP avec:", {
        pendingChangeId,
        otpCode,
        entrepriseId
      }); */

      const result = await validateOTP(pendingChangeId, otpCode, entrepriseId);
      
     // console.log("Réponse de la vérification OTP:", result);
      
      if (result?.success || result?.type === 'success') {
        toast.success("Mise à jour réussie !");
        setTimeout(() => router.push(`/dashboard/profile/${user._id}`), 2000);
      } else {
        toast.error(result?.error || "Échec de la vérification OTP");
      }
    } catch (error: any) {
      console.error("Erreur détaillée lors de la vérification OTP:", error);
      
      if (error?.response) {
        console.error("Statut de l'erreur:", error.response.status);
        console.error("Données d'erreur:", error.response.data);
      }
      
      toast.error("Échec de la vérification: " + (error?.message || "Une erreur est survenue"));
    } finally {
      setIsVerifying(false);
    }
  };

  // Afficher un message de chargement pendant la récupération de l'entreprise
  if (loadingEntreprise) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Chargement des données de l'entreprise...</p>
      </div>
    );
  }

  // Afficher un message d'erreur si la récupération de l'entreprise a échoué
  if (entrepriseError) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erreur</p>
          <p>{entrepriseError}</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="mt-4"
          >
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  if (showOtpVerification) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-xl md:text-3xl font-bold text-indigo-900 mb-6 text-center">Vérification des modifications</h1>
        
        <Card className="max-w-2xl mx-auto shadow-md p-4">
          <OtpInput
            length={6}
            onComplete={setOtpCode}
            onSubmit={handleOtpVerification}
            disabled={isVerifying}
            isLoading={isVerifying}
            title="Vérification OTP"
            description="Un code de vérification à 6 chiffres a été envoyé à l'administrateur pour confirmer les modifications"
            loadingText="Vérification..."
            buttonText="Confirmer les modifications"
          />

          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowOtpVerification(false)}
              disabled={isVerifying}
            >
              Retour
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl md:text-3xl font-bold text-indigo-900 mb-6 text-center">Modifier mon profil</h1>
      
      <Card className="max-w-2xl mx-auto shadow-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom <span className="text-red-500">*</span></Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre prénom"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre nom"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone <span className="text-red-500">*</span></Label>
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre numéro de téléphone"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre adresse email"
                />
              </div>
            </div>
            
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
                    Enregistrer
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