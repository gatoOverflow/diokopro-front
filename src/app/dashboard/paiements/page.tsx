import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, PAYMENT_FOR_ALL_AGENTS_ENTREPRISE, PAYMENT_FOR_ALL_CLIENTS_ENTREPRISE } from '@/actions/endpoint';
import PaymentListView from './_components/ListPaiements';

const PaymentsPage = async () => {
  // Paralléliser TOUS les appels API avec tags pour cache
  const [enterprises, paymentsResponse, paymentLinksResponse] = await Promise.all([
    fetchJSON(ENTERPRISES_ENDPOINT, { tags: ['enterprises'] }),
    fetchJSON(PAYMENT_FOR_ALL_AGENTS_ENTREPRISE, { tags: ['paiements'] }),
    fetchJSON(PAYMENT_FOR_ALL_CLIENTS_ENTREPRISE, { tags: ['paiements'] })
  ]);

  const payments = paymentsResponse.data || [];
  const paymentLinks = paymentLinksResponse.data || [];

  return (
    <PaymentListView
      payments={payments}
      paymentLinks={paymentLinks}
    />
  );
};

export default PaymentsPage;