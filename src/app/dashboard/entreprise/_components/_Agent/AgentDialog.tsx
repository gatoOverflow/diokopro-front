// components/agent/AgentDialog.tsx

import React, { useState, useEffect } from 'react';
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
import { Trash2, Edit, Wallet } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Composants modulaires
import AgentProfileTab from './AgentProfileTab';
import AgentTransfersTab from './AgentTransfersTab';
import AgentTransferDetails from './AgentTransferDetails';
import OtpInput from '../_Agent/OtpInput';
import { Agent, AgentDialogProps, NiveauService, OperationType, VirementRecu } from '@/app/lib/types';

const AgentDialog: React.FC<AgentDialogProps> = ({ 
  agent, 
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
  
  // États principaux
  const [formData, setFormData] = useState<Partial<Agent>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingFromService, setIsRemovingFromService] = useState(false);
  
  // États pour les services
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedNiveauService, setSelectedNiveauService] = useState('');
  const [selectedServiceNiveaux, setSelectedServiceNiveaux] = useState<NiveauService[]>([]);
  const [isAddingService, setIsAddingService] = useState(false);
  
  // États pour les virements
  const [selectedTransfer, setSelectedTransfer] = useState<VirementRecu | null>(null);
  const [showTransferDetails, setShowTransferDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // États OTP
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingChangeId, setPendingChangeId] = useState('');
  const [operationType, setOperationType] = useState<OperationType>('update');

  // Réinitialisation
  useEffect(() => {
    if (agent) {
      setFormData({
        nom: agent.nom || '',
        prenom: agent.prenom || '',
        email: agent.email || '',
        telephone: agent.telephone || '',
        adresse: agent.adresse || '',
        nin: agent.nin || '',
        salaire: agent.salaire,
        dateProchainVirement: agent.dateProchainVirement || null,
        frequencePaiement: agent.frequencePaiement || 'mensuel',
        intervallePaiement: agent.intervallePaiement || 1,
        jourPaiement: agent.jourPaiement || 1,
        wallet: agent.wallet || '',
        aPayer: agent.aPayer || false,
      });
      setIsEditing(false);
      setShowOtpVerification(false);
      setOtpCode('');
      setPendingChangeId('');
      setOperationType('update');
      setSelectedServiceId('');
      setSelectedNiveauService('');
      setIsAddingService(false);
      setSelectedTransfer(null);
      setShowTransferDetails(false);
      setActiveTab("profile");
    }
  }, [agent]);

  useEffect(() => {
    if (isEditing) {
      setActiveTab("profile");
    }
  }, [isEditing]);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dateProchainVirement') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value || null 
      }));
    } else if (name === 'salaire' || name === 'intervallePaiement' || name === 'jourPaiement') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value ? Number(value) : '' 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: checked 
    }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedServiceId(selectedId);
    
    const selectedService = services.find(service => service._id === selectedId);
    if (selectedService && selectedService.niveauxDisponibles) {
      setSelectedServiceNiveaux(selectedService.niveauxDisponibles);
      setSelectedNiveauService('');
    } else {
      setSelectedServiceNiveaux([]);
    }
  };

  const handleNiveauServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedNiveauService(e.target.value);
  };

  const handleShowTransferDetails = (transfer: VirementRecu) => {
    setSelectedTransfer(transfer);
    setShowTransferDetails(true);
  };

  const toggleAddServiceMode = () => {
    setIsAddingService(!isAddingService);
    if (!isAddingService) {
      setSelectedServiceId('');
      setSelectedNiveauService('');
      setSelectedServiceNiveaux([]);
    }
  };

  const showDeleteConfirmation = () => setIsDeleting(true);
  
  const showRemoveFromServiceConfirmation = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsRemovingFromService(true);
  };

  // Opérations principales
  const handleUpdate = async () => {
    if (!agent || !onUpdate) return;
    
    try {
      setIsVerifying(true);
      setOperationType('update');
      const result = await onUpdate({
        ...agent,
        ...formData,
        agentId: agent._id,
        entrepriseId
      });
      
      if (result?.data?.pendingChangeId) {
        setPendingChangeId(result.data.pendingChangeId);
        setIsEditing(false);
        setShowOtpVerification(true);
        toast.info("Code OTP envoyé à l'administrateur");
      } else if (result?.type === 'success') {
        toast.success("Agent mis à jour avec succès !");
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAddService = async () => {
    if (!agent || !onAddService || !selectedServiceId || !selectedNiveauService) {
      toast.error("Veuillez sélectionner un service et un niveau");
      return;
    }
    
    setIsAddingService(false);
    
    try {
      setIsVerifying(true);
      setOperationType('addService');
      
      const result = await onAddService({
        agentId: agent._id,
        serviceId: selectedServiceId,
        niveauService: selectedNiveauService,
        entrepriseId
      });
      
      const pendingId = result?.data?.pendingChangeId || result?.pendingChangeId;
      if (pendingId) {
        setPendingChangeId(pendingId);
        setShowOtpVerification(true);
        toast.info("Code OTP envoyé à l'administrateur");
      } else if (result?.type === 'success') {
        toast.success("Service ajouté avec succès !");
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "Erreur lors de l'ajout du service");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeleteAgent = async () => {
    setIsDeleting(false);
    if (!agent || !onDelete) return;
    
    try {
      setIsVerifying(true);
      setOperationType('delete');
      
      const result = await onDelete({ agentId: agent._id, entrepriseId });
      
      if (result?.data?.pendingChangeId) {
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info("Code OTP envoyé à l'administrateur");
      } else if (result?.type === 'success') {
        toast.success("Agent supprimé avec succès !");
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveFromService = async (serviceId: string) => {
    setIsRemovingFromService(false);
    if (!agent || !onRemoveFromService) return;
    
    try {
      setIsVerifying(true);
      setOperationType('removeFromService');
      
      const result = await onRemoveFromService({
        agentId: agent._id,
        serviceId,
        entrepriseId
      });
      
      if (result?.data?.pendingChangeId) {
        setPendingChangeId(result.data.pendingChangeId);
        setShowOtpVerification(true);
        toast.info("Code OTP envoyé à l'administrateur");
      } else if (result?.type === 'success') {
        toast.success("Agent retiré du service !");
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "Erreur lors du retrait du service");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!pendingChangeId || !otpCode || otpCode.length !== 6) {
      toast.error("Veuillez entrer un code OTP valide à 6 chiffres");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyOtp({
        code: otpCode,
        pendingChangeId,
        actionType: operationType,
        serviceId: ['removeFromService', 'addService'].includes(operationType) ? selectedServiceId : undefined,
        niveauService: operationType === 'addService' ? selectedNiveauService : undefined,
        entrepriseId
      });
      
      if (result?.success || result?.type === 'success') {
        const messages = {
          update: "Agent mis à jour avec succès !",
          delete: "Agent supprimé avec succès !",
          removeFromService: "Agent retiré du service !",
          addService: "Service ajouté avec succès !"
        };
        toast.success(messages[operationType]);
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || "Échec de la vérification OTP");
      }
    } catch (error) {
      toast.error("Échec de la vérification");
    } finally {
      setIsVerifying(false);
    }
  };

  // Compter les virements valides
  const getValidTransfers = () => {
    if (!agent?.virementsRecus) return [];
    return agent.virementsRecus.filter(transfer => 
      transfer && (transfer.montant !== undefined || transfer.datePaiement || transfer.statut || transfer.expediteur)
    );
  };

  const transfersCount = getValidTransfers().length;

  if (!agent) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isVerifying) onClose();
      }}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[95vh] overflow-y-auto mx-4">
          {showTransferDetails && selectedTransfer ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm sm:text-base md:text-lg">Détails du virement</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Informations sur le virement reçu
                </DialogDescription>
              </DialogHeader>
              
              <AgentTransferDetails 
                transfer={selectedTransfer}
                onBack={() => setShowTransferDetails(false)}
              />
            </>
          ) : showOtpVerification ? (
            <div>
              <OtpInput
                length={6}
                onComplete={setOtpCode}
                onSubmit={handleOtpVerification}
                disabled={isVerifying}
                isLoading={isVerifying}
                title={(() => {
                  const titles = {
                    update: "Vérification OTP - Modification",
                    delete: "Vérification OTP - Suppression", 
                    removeFromService: "Vérification OTP - Retrait du service",
                    addService: "Vérification OTP - Ajout de service"
                  };
                  return titles[operationType] || "Vérification OTP";
                })()}
                description={(() => {
                  const descriptions = {
                    update: "Un code OTP a été envoyé pour confirmer la modification de l'agent.",
                    delete: "Un code OTP a été envoyé pour confirmer la suppression définitive.",
                    removeFromService: "Un code OTP a été envoyé pour confirmer le retrait du service.",
                    addService: "Un code OTP a été envoyé pour confirmer l'ajout du service."
                  };
                  return descriptions[operationType] || "Un code de vérification a été envoyé.";
                })()}
              />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm sm:text-base md:text-lg">Détails de l'agent</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm break-words">
                  {agent.nom} {agent.prenom}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => !isEditing && setActiveTab(value)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-2 sm:mb-4 h-8 sm:h-10">
                  <TabsTrigger value="profile" className="text-xs sm:text-sm">Profil</TabsTrigger>
                  <TabsTrigger value="transfers" className="relative text-xs sm:text-sm">
                    Virements
                    {transfersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                        {transfersCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="mt-0">
                  <AgentProfileTab
                    agent={agent}
                    isEditing={isEditing}
                    formData={formData}
                    onInputChange={handleInputChange}
                    services={services}
                    isAddingService={isAddingService}
                    selectedServiceId={selectedServiceId}
                    selectedNiveauService={selectedNiveauService}
                    selectedServiceNiveaux={selectedServiceNiveaux}
                    onAddService={handleAddService}
                    onCheckboxChange={handleCheckboxChange}
                    onRemoveFromService={onRemoveFromService}
                    toggleAddServiceMode={toggleAddServiceMode}
                    handleServiceChange={handleServiceChange}
                    handleNiveauServiceChange={handleNiveauServiceChange}
                    showRemoveFromServiceConfirmation={showRemoveFromServiceConfirmation}
                  />
                </TabsContent>
                
                <TabsContent value="transfers" className="mt-0">
                  <AgentTransfersTab
                    agent={agent}
                    onShowTransferDetails={handleShowTransferDetails}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2">
                {!isEditing && onDelete && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={showDeleteConfirmation}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Supprimer
                  </Button>
                )}
                
                <div className="flex gap-2 sm:ml-auto">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleUpdate} 
                        disabled={isVerifying}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        {isVerifying ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogues de confirmation */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="w-full max-w-[95vw] sm:max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm sm:text-base">Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Cette action supprimera définitivement l'agent et toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto text-xs sm:text-sm">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-xs sm:text-sm"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isRemovingFromService} onOpenChange={setIsRemovingFromService}>
        <AlertDialogContent className="w-full max-w-[95vw] sm:max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm sm:text-base">Retirer du service</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Retirer cet agent du service sélectionné ? Cela nécessite une vérification OTP.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto text-xs sm:text-sm">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveFromService(selectedServiceId)}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm"
            >
              Retirer du service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AgentDialog;