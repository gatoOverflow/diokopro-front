// components/client/ClientDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Trash2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Composants modulaires
import ClientProfileTab from './ClientProfileTab';
import ClientPaymentsTab from './ClientPaymentsTab';
import ClientReferencesTab from './ClientReferencesTab';
import ClientPaymentDetails from './ClientPaymentDetails';
import OtpInput from '../_Agent/OtpInput';
import { ClientDialogProps } from '@/app/lib/types';
import { useClientDialog } from './hooks/useClientDialog';

// Hook personnalisé


// Types


const ClientDialog: React.FC<ClientDialogProps> = ({ 
  client, 
  entrepriseId,
  isOpen, 
  onClose, 
  onUpdate,
  onDelete,
  onRemoveFromService,
  onAddService,
  verifyOtp,
  services = []
}) => {
  const router = useRouter();

  // Utilisation du hook personnalisé pour la logique
  const {
    // États
    formData,
    isEditing,
    isDeleting,
    isRemovingFromService,
    selectedServiceId,
    selectedNiveauService,
    selectedServiceNiveaux,
    isAddingService,
    selectedPayment,
    showPaymentDetails,
    activeTab,
    otpCode,
    isVerifying,
    showOtpVerification,
    operationType,
    
    // Setters
    setIsEditing,
    setIsDeleting,
    setIsRemovingFromService,
    setActiveTab,
    setOtpCode,
    setShowPaymentDetails,
    
    // Handlers
    handleInputChange,
    handleServiceChange,
    handleNiveauServiceChange,
    handleShowPaymentDetails,
    handleCheckboxChange,
    toggleAddServiceMode,
    showDeleteConfirmation,
    showRemoveFromServiceConfirmation,
    handleUpdate,
    handleAddService,
    handleDeleteClient,
    handleRemoveFromService,
    handleOtpVerification
  } = useClientDialog(
    client,
    entrepriseId,
    onUpdate,
    onDelete,
    onRemoveFromService,
    onAddService,
    verifyOtp,
    services
  );

  // Gérer la fermeture et le rafraîchissement
  const handleSuccess = () => {
    onClose();
    router.refresh();
  };

  // Wrapper pour les opérations qui peuvent nécessiter un rafraîchissement
  const handleUpdateWrapper = async () => {
    const result = await handleUpdate();
    if (result?.success) {
      handleSuccess();
    }
  };

  const handleAddServiceWrapper = async () => {
    const result = await handleAddService();
    if (result?.success) {
      handleSuccess();
    }
  };

  const handleDeleteWrapper = async () => {
    const result = await handleDeleteClient();
    if (result?.success) {
      handleSuccess();
    }
  };

  const handleRemoveServiceWrapper = async (serviceId: string) => {
    const result = await handleRemoveFromService(serviceId);
    if (result?.success) {
      handleSuccess();
    }
  };

  const handleOtpWrapper = async () => {
    const result = await handleOtpVerification();
    if (result?.success) {
      handleSuccess();
    }
  };

  // Filtrer les paiements valides pour le compteur
  const getValidPayments = () => {
    if (!client?.paiementsEffectues || client.paiementsEffectues.length === 0) return [];
    return client.paiementsEffectues.filter(payment => 
      payment && (
        payment.montant !== undefined || 
        payment.datePaiement || 
        payment.statut || 
        payment.expediteur
      )
    );
  };

  const paymentsCount = getValidPayments().length;

  if (!client) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isVerifying) onClose();
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {/* Affichage des détails de paiement */}
          {showPaymentDetails && selectedPayment ? (
            <>
              <DialogHeader>
                <DialogTitle>Détails du paiement</DialogTitle>
                <DialogDescription>
                  Informations sur le paiement effectué
                </DialogDescription>
              </DialogHeader>
              
              <ClientPaymentDetails 
                payment={selectedPayment}
                onBack={() => setShowPaymentDetails(false)}
              />
            </>
          ) : showOtpVerification ? (
            <div>
              <OtpInput
                length={6}
                onComplete={(code) => {
                  setOtpCode(code);
                }}
                onSubmit={handleOtpWrapper}
                disabled={isVerifying}
                isLoading={isVerifying}
                title={(() => {
                  switch(operationType) {
                    case 'update': return "Vérification OTP - Modification";
                    case 'delete': return "Vérification OTP - Suppression";
                    case 'removeFromService': return "Vérification OTP - Retrait du service";
                    case 'addService': return "Vérification OTP - Ajout de service";
                    default: return "Vérification OTP";
                  }
                })()}
                description={(() => {
                  switch(operationType) {
                    case 'update': return "Un code OTP a été envoyé pour confirmer la modification du client.";
                    case 'delete': return "Un code OTP a été envoyé pour confirmer la suppression définitive.";
                    case 'removeFromService': return "Un code OTP a été envoyé pour confirmer le retrait du service.";
                    case 'addService': return "Un code OTP a été envoyé pour confirmer l'ajout du service.";
                    default: return "Un code de vérification à 6 chiffres a été envoyé à l'administrateur.";
                  }
                })()}
              />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Détails du client</DialogTitle>
                <DialogDescription>
                  {client.nom} {client.prenom}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs 
                defaultValue="profile" 
                className="w-full" 
                value={activeTab} 
                onValueChange={(value) => {
                  if (!isEditing) {
                    setActiveTab(value);
                  }
                }}
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="payments" className="relative">
                    Paiements
                    {paymentsCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">{paymentsCount}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="references" className="relative">
                    Références
                    {client.references && client.references.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">{client.references.length}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-0">
                  <ClientProfileTab
                    client={client}
                    isEditing={isEditing}
                    formData={formData}
                   onCheckboxChange={handleCheckboxChange}
                    onInputChange={handleInputChange}
                    services={services}
                    isAddingService={isAddingService}
                    selectedServiceId={selectedServiceId}
                    selectedNiveauService={selectedNiveauService}
                    selectedServiceNiveaux={selectedServiceNiveaux}
                    onAddService={handleAddServiceWrapper}
                    onRemoveFromService={onRemoveFromService}
                    toggleAddServiceMode={toggleAddServiceMode}
                    handleServiceChange={handleServiceChange}
                    handleNiveauServiceChange={handleNiveauServiceChange}
                    showRemoveFromServiceConfirmation={showRemoveFromServiceConfirmation}
                  />
                </TabsContent>
                
                <TabsContent value="payments" className="mt-0">
                  <ClientPaymentsTab
                    client={client}
                    onShowPaymentDetails={handleShowPaymentDetails}
                  />
                </TabsContent>
                
                <TabsContent value="references" className="mt-0">
                  <ClientReferencesTab
                    client={client}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between mt-4 gap-2">
                {!isEditing && onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={showDeleteConfirmation}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                )}
                
                <div className="ml-auto flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleUpdateWrapper} disabled={isVerifying}>
                        {isVerifying ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Boîte de dialogue de confirmation pour la suppression définitive */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement le client
              et toutes ses données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleting(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWrapper}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Boîte de dialogue de confirmation pour le retrait d'un service */}
      <AlertDialog open={isRemovingFromService} onOpenChange={setIsRemovingFromService}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer du service</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer ce client du service sélectionné ?
              Cette action nécessitera une vérification OTP.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRemovingFromService(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveServiceWrapper(selectedServiceId)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Retirer du service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClientDialog;