import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ENTREPRISE_URL } from '@/actions/endpoint';
import TransactionView from './_components/transactionsHistorique';

const ClientsByServicePage = async () => {
  // Récupérer l'entreprise
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  const currentEnterpriseId = enterprises[0]?._id;
  
  if (!currentEnterpriseId) {
    throw new Error("No enterprise found");
  }
  
  // Récupérer les données de l'entreprise avec les transactions
  const entrepriseData = await fetchJSON(`${GET_ENTREPRISE_URL}/${currentEnterpriseId}`);
  const transactions = entrepriseData?.transactions || [];

  
  // Transformer TOUTES les transactions en format uniforme
  const allTransactions = transactions.map(transaction => {
    let nom = 'N/A';
    let prenom = 'N/A';
    let type = transaction.type;
    let montant = transaction.montant;
    
    // Gérer les différents types de transactions
    if (transaction.type === 'paiement client' && transaction.client) {
      const nameParts = transaction.client.split(' ');
      nom = nameParts[nameParts.length - 1] || 'N/A';
      prenom = nameParts.slice(0, -1).join(' ') || 'N/A';
    } else if (transaction.type === 'virement de salaire' && transaction.beneficiaire) {
      const nameParts = transaction.beneficiaire.split(' ');
      nom = nameParts[nameParts.length - 1] || 'N/A';
      prenom = nameParts.slice(0, -1).join(' ') || 'N/A';
    } else if (transaction.type === 'débit' && transaction.destinataire) {
      prenom = transaction.destinataire;
      nom = '';
    } else if (transaction.type === 'credit' || transaction.type === 'recharge de compte') {
      prenom = 'Entreprise';
      nom = entrepriseData.nomEntreprise || '';
    }
    
    return {
      _id: transaction.token || transaction.reference || transaction.invoice_token,
      nom,
      prenom,
      dateCreation: new Date(transaction.date).toLocaleDateString('fr-FR'),
      montant: `${montant} FCFA`,
      type: type,
      statut: transaction.statut || transaction.statut_transaction || transaction.disburse_status || 'réussi',
      reference: transaction.reference || transaction.Transaction_ID || transaction.transaction_id || '-',
      wallet: transaction.wallet || '-'
    };
  });

  
  return (
    <TransactionView 
      transactions={allTransactions}
    />
  );
};

export default ClientsByServicePage;