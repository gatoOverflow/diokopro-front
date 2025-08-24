// components/client/ClientPaymentsTab.tsx

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { Client, Paiement } from '@/app/lib/types';


interface ClientPaymentsTabProps {
  client: Client;
  onShowPaymentDetails: (payment: Paiement) => void;
}

const ClientPaymentsTab: React.FC<ClientPaymentsTabProps> = ({
  client,
  onShowPaymentDetails
}) => {
  
  // Formater la date
 const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return "Date invalide";
  }
};


  // Obtenir la classe CSS basée sur le statut du paiement
  const getStatusBadgeVariant = (status: string) => {
    if (!status) return "default";
    
    if (status.includes('réussi') || status.includes('payé')) return "success";
    if (status.includes('échoué')) return "destructive";
    if (status.includes('attente')) return "warning";
    return "default";
  };

  // Vérifier si un paiement est valide (a des données significatives)
  const isValidPayment = (payment: Paiement) => {
    return payment && (
      payment.montant !== undefined || 
      payment.datePaiement || 
      payment.statut || 
      payment.expediteur||
      payment.token ||
      payment.frais ||
      payment.dateReglement
    );
  };

  // Filtrer les paiements valides (avec des données)
  const getValidPayments = () => {
    if (!client?.paiementsEffectues || client.paiementsEffectues.length === 0) return [];
    return client.paiementsEffectues.filter(isValidPayment);
  };

  const validPayments = getValidPayments();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Paiements effectués</h3>
      
      {validPayments.length > 0 ? (
        <div className="space-y-2">
          {validPayments.map((paiement, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onShowPaymentDetails(paiement)}
            >
              <div className="flex-1">
                <div className="font-medium">
                  Montant:{paiement.montant !== undefined 
                    ? `${paiement.montant.toLocaleString('fr-FR')} FCFA` 
                    : 'Montant non disponible'}
                </div>
               <div className="font-medium">
  {formatDate(paiement.dateReglement)}
</div>

                {/*  <div className="font-medium">
                  Frais:{paiement.frais}
                </div>
                <div className="font-medium">
                  Token:{paiement.token}
                </div> */}
                
               
              </div>
              {paiement.statut && (
                <Badge variant={getStatusBadgeVariant(paiement.statut)}>
                  {paiement.statut}
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 border border-dashed rounded-md">
          <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <div className="font-medium">Aucun paiement effectué</div>
          <div className="text-sm">
            {client.aFAirePayer 
              ? "Ce client doit effectuer des paiements"
              : "Ce client n'a pas de paiements programmés"}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPaymentsTab;