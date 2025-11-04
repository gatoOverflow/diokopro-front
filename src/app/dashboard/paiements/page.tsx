import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, PAYMENT_FOR_ALL_AGENTS_ENTREPRISE, PAYMENT_FOR_ALL_CLIENTS_ENTREPRISE } from '@/actions/endpoint';
import PaymentListView from './_components/ListPaiements';

const PaymentsPage = async () => {
  // Récupérer l'entreprise courante
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  const currentEnterpriseId = enterprises[0]?._id;
 
  
  const paymentsResponse = await fetchJSON(PAYMENT_FOR_ALL_AGENTS_ENTREPRISE);
  const payments = paymentsResponse.data || [];
  
  // Récupérer les liens de paiement via la route spécifique
  const paymentLinksResponse = await fetchJSON(PAYMENT_FOR_ALL_CLIENTS_ENTREPRISE);
  const paymentLinks = paymentLinksResponse.data || [];
  
 
  
  return (
    <PaymentListView 
      payments={payments}
      paymentLinks={paymentLinks}
    />
  );
};

export default PaymentsPage;