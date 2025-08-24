// components/client/ClientPaymentDetails.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Tag, User } from 'lucide-react';
import { Paiement } from '@/app/lib/types';


interface ClientPaymentDetailsProps {
  payment: Paiement;
  onBack: () => void;
}

const ClientPaymentDetails: React.FC<ClientPaymentDetailsProps> = ({
  payment,
  onBack
}) => {
  
  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
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

  return (
    <>
      <div className="grid gap-4 py-4">
       {/*  <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gray-500" />
          <div className="font-semibold">Montant:</div>
          <div>{payment.montant.toLocaleString('fr-FR')} FCFA</div>
        </div> */}

          <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gray-500" />
          <div className="font-semibold">Frais:</div>
          <div>{payment.frais} FCFA</div>
        </div> 

         <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gray-500" />
          <div className="font-semibold">Token:</div>
          <div>{payment.token}</div>
        </div> 
        
        {/* <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div className="font-semibold">Date:</div>
          <div>{formatDate(payment.datePaiement)}</div>
        </div> */}
        
       {/*  <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-gray-500" />
          <div className="font-semibold">Statut:</div>
          <Badge variant={getStatusBadgeVariant(payment.statut)}>
            {payment.statut}
          </Badge>
        </div> */}
        {/* 
        {payment.expediteur && (
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <div className="font-semibold">Expéditeur:</div>
            <div>
              {payment.expediteur.nom} {payment.expediteur.prenom}
            </div>
          </div>
        )}
        
        {payment.paiementId && (
          <div className="flex items-center gap-2">
            <div className="font-semibold">ID Paiement:</div>
            <div className="text-xs text-gray-500 truncate max-w-[200px]">
              {payment.paiementId}
            </div>
          </div>
        )} */}
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={onBack}>
          Retour
        </Button>
      </div>
    </>
  );
};

export default ClientPaymentDetails;