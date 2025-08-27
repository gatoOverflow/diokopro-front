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
import { X, Trash2 } from 'lucide-react';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateOTP, updateService, deleteService } from "@/actions/service"; // Ajout de l'import deleteService
import OtpInput from '../_Agent/OtpInput';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ServiceDialogProps {
  service: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedService: any) => void;
  onDelete?: (serviceId: string) => void; // Ajout de la prop onDelete
  entrepriseId?: string;
}

const ServiceDialog: React.FC<ServiceDialogProps> = ({
  service,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  entrepriseId = ""
}) => {
  const router = useRouter();
  const [nomService, setNomService] = useState('');
  const [description, setDescription] = useState('');
  const [tarifactionBase, setTarifactionBase] = useState('');
  const [serviceDis, setService] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [niveauxDisponibles, setNiveauxDisponibles] = useState<any[]>([]);
  
  // États pour la vérification OTP
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingChangeId, setPendingChangeId] = useState("");
  const [updatedServiceData, setUpdatedServiceData] = useState(null);
  
  // États pour la suppression
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOperation, setDeleteOperation] = useState(false);

  useEffect(() => {
    if (service) {
      setNomService(service.nomService || '');
      setDescription(service.description || '');
      setTarifactionBase(service.tarifactionBase?.toString() || '');
      setService(service);
      setNiveauxDisponibles(service.niveauxDisponibles || []);
      setIsEditing(false);
      setShowOtpVerification(false);
      setOtpCode("");
      setPendingChangeId("");
      setUpdatedServiceData(null);
      setIsDeleting(false);
      setDeleteOperation(false);
    }
  }, [service]);

  const addNiveau = () => {
    setNiveauxDisponibles([...niveauxDisponibles, { nom: '', tarif: 0 }]);
  };

  const removeNiveau = (index: number) => {
    const updated = [...niveauxDisponibles];
    updated.splice(index, 1);
    setNiveauxDisponibles(updated);
  };

  const refreshPage = () => {
    if (router) {
      router.refresh();
    } else {
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
        niveauxDisponibles,
      };

      if (!updatedServiceData.entrepriseId) {
        toast.error("ID de l'entreprise manquant. Impossible de mettre à jour le service.");
        setIsLoading(false);
        return;
      }

      setUpdatedServiceData(updatedServiceData);
      setDeleteOperation(false);

     // console.log("🔄 Appel updateService avec:", updatedServiceData);

      const response = await updateService(updatedServiceData);

    //  console.log("📨 Réponse updateService:", response);

      if (response?.data?.pendingChangeId) {
        toast.success("Demande de modification envoyée ! Veuillez entrer le code OTP.");
        setPendingChangeId(response.data.pendingChangeId);
        setShowOtpVerification(true);
      } else if (response?.type === "success") {
        toast.success("Service mis à jour avec succès !");
        setIsEditing(false);

        if (onUpdate) {
          onUpdate({
            ...service,
            nomService,
            description,
            tarifactionBase: parseInt(tarifactionBase, 10) || 0,
            serviceDis,
            niveauxDisponibles
          });
        }

        setTimeout(() => {
          refreshPage();
        }, 500);
      } else if (response?.errors) {
        const firstError = Object.values(response.errors)[0]?.[0];
        if (firstError) {
          toast.error(firstError);
        }
      } else {
        toast.error(response?.error || "Erreur lors de la mise à jour du service");
      }

    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error(error.message || "Erreur lors de la mise à jour du service");
    } finally {
      setIsLoading(false);
    }
  };

  // Nouvelle fonction pour gérer la suppression
  const handleDelete = async () => {
    if (!service || !service._id) return;

    setIsLoading(true);

    try {
      const deleteData = {
        serviceId: service._id,
        entrepriseId: entrepriseId || service.entrepriseId || service.entreprise?._id,
      };

      if (!deleteData.entrepriseId) {
        toast.error("ID de l'entreprise manquant. Impossible de supprimer le service.");
        setIsLoading(false);
        return;
      }

      // Marquer que nous sommes en train de supprimer pour l'OTP
      setDeleteOperation(true);

     // console.log("🗑️ Appel deleteService avec:", deleteData);

      const response = await deleteService(deleteData);

    //  console.log("📨 Réponse deleteService:", response);

      if (response?.data?.pendingChangeId) {
        toast.success("Demande de suppression envoyée ! Veuillez entrer le code OTP.");
        setPendingChangeId(response.data.pendingChangeId);
        setShowOtpVerification(true);
      } else if (response?.type === "success") {
        toast.success("Service supprimé avec succès !");
        
        // Si une fonction onDelete est fournie, l'appeler
        if (onDelete) {
          onDelete(service._id);
        }

        // Fermer le dialogue et rafraîchir la page
        handleClose();
        setTimeout(() => {
          refreshPage();
        }, 500);
      } else if (response?.errors) {
        const firstError = Object.values(response.errors)[0]?.[0];
        if (firstError) {
          toast.error(firstError);
        }
      } else {
        toast.error(response?.error || "Erreur lors de la suppression du service");
      }

    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(error.message || "Erreur lors de la suppression du service");
    } finally {
      setIsLoading(false);
      setIsDeleting(false);
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
        if (deleteOperation) {
          toast.success("Service supprimé avec succès !");
          if (onDelete) {
            onDelete(service._id);
          }
        } else {
          toast.success("Service validé avec succès !");
        }
        
        setIsEditing(false);
        setShowOtpVerification(false);

        setTimeout(() => {
          handleClose();
          refreshPage();
        }, 500);
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
    setIsDeleting(false);
    setDeleteOperation(false);
    onClose();
  };

  if (!service) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>
                {showOtpVerification ? `Vérification OTP - ${deleteOperation ? "Suppression" : "Modification"} du service` :
                  (isEditing ? "Modifier le service" : "Détails du service")}
              </span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>
              {showOtpVerification ? `Veuillez saisir le code OTP pour confirmer la ${deleteOperation ? "suppression" : "modification"}` :
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
                title={`Vérification OTP - ${deleteOperation ? "Suppression" : "Modification"} du service`}
                description={`Un code OTP a été envoyé pour confirmer la ${deleteOperation ? "suppression" : "modification"} du service. Veuillez saisir le code à 6 chiffres reçu par l'administrateur.`}
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

                {/* Niveaux Disponibles */}
                <div className="space-y-4">
                  {niveauxDisponibles.map((niveau, index) => (
                    <div key={index} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`niveau-nom-${index}`} className="text-right">
                        Nom du niveau :
                      </Label>
                      <Input
                        id={`niveau-nom-${index}`}
                        className="col-span-3"
                        value={niveau.nom}
                        placeholder="Nom du niveau"
                        onChange={(e) => {
                          const updated = [...niveauxDisponibles];
                          updated[index].nom = e.target.value;
                          setNiveauxDisponibles(updated);
                        }}
                        disabled={isLoading}
                      />

                      <Label htmlFor={`niveau-tarif-${index}`} className="text-right">
                        Tarif :
                      </Label>
                      <Input
                        id={`niveau-tarif-${index}`}
                        type="number"
                        className="col-span-3"
                        value={niveau.tarif}
                        placeholder="Tarif en FCFA"
                        onChange={(e) => {
                          const updated = [...niveauxDisponibles];
                          updated[index].tarif = parseInt(e.target.value, 10) || 0;
                          setNiveauxDisponibles(updated);
                        }}
                        disabled={isLoading}
                      />

                      <div className="col-span-4 flex justify-end mt-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeNiveau(index)}
                          disabled={isLoading}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={addNiveau}
                    className="mt-2 bg-[#ee7606] hover:bg-[#d56a05]"
                    disabled={isLoading}
                  >
                    Ajouter un niveau
                  </Button>
                </div>
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
                  <div className="col-span-3">{service.gerants?.map((gerant, index) => (
                    <div key={index}>
                      {gerant.prenom} - {gerant.nom}
                    </div>
                  )) || "-"}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-semibold text-right">Niveaux disponibles:</div>
                  <div className="col-span-3 space-y-1">
                    {service.niveauxDisponibles?.length > 0 ? 
                      service.niveauxDisponibles.map((niveau, index) => (
                        <div key={index}>
                          {niveau.nom} - {niveau.tarif} FCFA
                        </div>
                      )) : 
                      <div>Aucun niveau disponible</div>
                    }
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
            <div className="flex justify-between mt-4 gap-2">
              {/* Bouton de suppression uniquement visible en mode affichage */}
              {!isEditing && (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleting(true)}
                  disabled={isLoading}
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
              
              <div className="ml-auto flex gap-2">
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
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-[#ee7606] hover:bg-[#d56a05]"
                  >
                    Modifier
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de confirmation pour la suppression */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible 
              et supprimera toutes les données associées au service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleting(false)} disabled={isLoading}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Suppression..." : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServiceDialog;