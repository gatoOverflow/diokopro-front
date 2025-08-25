import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { useRouter } from "next/navigation"; // Ajout pour Next.js
import { toast } from "sonner"; // Ajout pour les notifications
import { validateOTP, updateService } from "@/actions/service"; // Import pour la validation OTP et update
import OtpInput from '../_Agent/OtpInput';
// Import du composant OTP

interface ServiceDialogProps {
  service: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedService: any) => void;
  entrepriseId?: string; // Ajout pour l'OTP
}

const ServiceDialog: React.FC<ServiceDialogProps> = ({
  service,
  isOpen,
  onClose,
  onUpdate,
  entrepriseId = "" // Ajout pour l'OTP
}) => {
  const router = useRouter(); // Hook pour Next.js
  const [nomService, setNomService] = useState('');
  const [description, setDescription] = useState('');
  const [tarifactionBase, setTarifactionBase] = useState('');
  const [serviceDis, setService] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // États pour la vérification OTP
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingChangeId, setPendingChangeId] = useState("");
  const [updatedServiceData, setUpdatedServiceData] = useState(null);

  useEffect(() => {
    if (service) {
      setNomService(service.nomService || '');
      setDescription(service.description || '');
      setTarifactionBase(service.tarifactionBase?.toString() || '');
      setIsEditing(false);
      // Réinitialiser les états OTP
      setShowOtpVerification(false);
      setOtpCode("");
      setPendingChangeId("");
      setUpdatedServiceData(null);
    }
  }, [service]);

  // Fonction pour actualiser la page
  const refreshPage = () => {
    // Option 1: Utiliser router.refresh() pour Next.js (recommandé)
    if (router) {
      router.refresh();
    } else {
      // Option 2: Actualisation complète de la page (fallback)
      window.location.reload();
    }
  };

  const handleUpdate = async () => {
    if (!service) return;

    setIsLoading(true);

    try {
      const updatedServiceData = {
        serviceId: service._id,
        entrepriseId: entrepriseId || service.entrepriseId || service.entreprise?._id,
        nomService,
        description,
        tarifactionBase: parseInt(tarifactionBase, 10) || 0,
        serviceDis,
      };

      // Vérifier que nous avons un entrepriseId
      if (!updatedServiceData.entrepriseId) {
        toast.error("ID de l'entreprise manquant. Impossible de mettre à jour le service.");
        setIsLoading(false);
        return;
      }

      // Sauvegarder les données pour l'OTP
      setUpdatedServiceData(updatedServiceData);

      console.log("🔄 Appel updateService avec:", updatedServiceData);

      // Appeler la fonction updateService directement
      const response = await updateService(updatedServiceData);

      console.log("📨 Réponse updateService:", response);

      // Vérifier si une validation OTP est nécessaire
      if (response?.data?.pendingChangeId) {
        toast.success("Demande de modification envoyée ! Veuillez entrer le code OTP.");
        setPendingChangeId(response.data.pendingChangeId);
        setShowOtpVerification(true);
      } else if (response?.type === "success") {
        // Mise à jour réussie sans OTP
        toast.success("Service mis à jour avec succès !");
        setIsEditing(false);

        // Appeler onUpdate pour mettre à jour l'état parent si nécessaire
        if (onUpdate) {
          onUpdate({
            ...service,
            nomService,
            description,
            tarifactionBase: parseInt(tarifactionBase, 10) || 0,
            serviceDis
          });
        }

        // ✅ Actualiser la page après mise à jour réussie
        setTimeout(() => {
          refreshPage();
        }, 500); // Petit délai pour laisser le toast s'afficher
      } else if (response?.errors) {
        // Gestion des erreurs de validation
        const firstError = Object.values(response.errors)[0]?.[0];
        if (firstError) {
          toast.error(firstError);
        }
      } else {
        // Autres erreurs
        toast.error(response?.error || "Erreur lors de la mise à jour du service");
      }

    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du service");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Veuillez entrer un code OTP valide à 6 chiffres");
      return;
    }

    if (!entrepriseId) {
      toast.error("Entreprise non sélectionnée");
      return;
    }

    setIsLoading(true);

    try {
      const response = await validateOTP(pendingChangeId, otpCode, entrepriseId);

      if (response.success) {
        toast.success("Service validé avec succès !");
        setIsEditing(false);
        setShowOtpVerification(false);

        // ✅ Actualiser la page après validation OTP réussie
        setTimeout(() => {
          refreshPage();
        }, 500); // Petit délai pour laisser le toast s'afficher
      } else {
        toast.error(response.error || "Code OTP invalide ou expiré");

        if (response.errors) {
          Object.values(response.errors).forEach((errorArray: any) => {
            if (Array.isArray(errorArray)) {
              errorArray.forEach((error: string) => {
                toast.error(error);
              });
            }
          });
        }
      }
    } catch (error: any) {
      console.error("Erreur lors de la validation OTP:", error);
      toast.error(error.message || "Échec de la vérification du code OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    await verifyOtp();
  };

  const handleClose = () => {
    setIsEditing(false);
    setShowOtpVerification(false);
    setOtpCode("");
    setPendingChangeId("");
    setUpdatedServiceData(null);
    onClose();
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>
              {showOtpVerification ? "Vérification OTP - Modification du service" :
                (isEditing ? "Modifier le service" : "Détails du service")}
            </span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
          <DialogDescription>
            {showOtpVerification ? "Veuillez saisir le code OTP pour confirmer la modification" :
              (isEditing ? "Modifiez les informations du service" : "Informations complètes sur le service")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {showOtpVerification ? (
            <OtpInput
              length={6}
              onComplete={(code) => {
                setOtpCode(code);
              }}
              onSubmit={handleOtpVerification}
              disabled={isLoading}
              isLoading={isLoading}
              title="Vérification OTP - Modification du service"
              description="Un code OTP a été envoyé pour confirmer la modification du service. Veuillez saisir le code à 6 chiffres reçu par l'administrateur."
            />
          ) : isEditing ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nomService" className="text-right">Nom:</Label>
                <Input
                  id="nomService"
                  value={nomService}
                  onChange={(e) => setNomService(e.target.value)}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description:</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  disabled={isLoading}
                />
              </div>

              {service.niveauxDisponibles.map((samm, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`tarif-${index}`} className="text-right">
                    {samm.nom} :
                  </Label>
                  <Input
                    id={`tarif-${index}`}
                    type="number"
                    value={samm.tarif}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      const updated = [...service.niveauxDisponibles];
                      updated[index].tarif = newValue;
                      setService({ ...service, niveauxDisponibles: updated });
                    }}
                    className="col-span-3"
                    disabled={isLoading}
                  />
                </div>
              ))}

            </>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Nom:</div>
                <div className="col-span-3">{service.nomService}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Description:</div>
                <div className="col-span-3">{service.description || "-"}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Tarif de base:</div>
                <div className="col-span-3">{service.tarifactionBase?.toLocaleString() || "-"} FCFA</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Gérants:</div>
                <div className="col-span-3">{service.gerants.map((gerant, index) => (
                  <div key={index}>
                   {gerant.prenom} -  {gerant.nom} 
                  </div>
                ))}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-semibold text-right">Niveaux disponibles:</div>
                <div className="col-span-3 space-y-1">
                  {service.niveauxDisponibles.map((samm, index) => (
                    <div key={index}>
                      {samm.nom} - {samm.tarif} FCFA
                    </div>
                  ))}
                </div>
              </div>



              {service.createdAt && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-semibold text-right">Date de création:</div>
                  <div className="col-span-3">{new Date(service.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              )}
            </>
          )}
        </div>

        {!showOtpVerification && (
          <div className="flex justify-end mt-4 gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={isLoading}
                  className="bg-[#ee7606] hover:bg-[#d56a05]"
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDialog;