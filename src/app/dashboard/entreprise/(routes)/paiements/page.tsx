import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_CLIENT_URL, GET_ALL_AGENTS, GET_PENDING_SCHEDULED_PAYMENTS } from '@/actions/endpoint';
import PaymentListView from './_components/ListPaiements';
import ScheduledPaymentsList from './_components/ScheduledPaymentsList';

const ClientsByServicePage = async () => {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT, { tags: ['enterprises'] });
  const currentEnterpriseId = enterprises[0]?._id;

  if (!currentEnterpriseId) {
    return <div>Aucune entreprise trouvée</div>;
  }

  // Paralléliser les appels API avec tags pour cache
  const [clients, agentsResponse, scheduledPaymentsResponse] = await Promise.all([
    fetchJSON(`${GET_ALL_CLIENT_URL}/${currentEnterpriseId}/clients`, { tags: ['clients'] }),
    fetchJSON(`${GET_ALL_AGENTS}/${currentEnterpriseId}`, { tags: ['agents'] }),
    fetchJSON(`${GET_PENDING_SCHEDULED_PAYMENTS}/${currentEnterpriseId}`, { tags: ['scheduled-payments'], revalidate: 30 })
  ]);

  const agents = Array.isArray(agentsResponse) ? agentsResponse : agentsResponse.data || [];
  const scheduledPayments = scheduledPaymentsResponse?.payments || [];
  const stats = scheduledPaymentsResponse?.stats || {
    totalPaiements: 0,
    montantTotal: 0,
    paiementsAvecEcart: 0,
    soldeEntreprise: 0
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Section Paiements Programmés */}
      <ScheduledPaymentsList
        payments={scheduledPayments}
        stats={stats}
      />

      {/* Section existante agents et clients */}
      <PaymentListView
        clients={clients.data || []}
        agents={agents}
      />
    </div>
  );
};

export default ClientsByServicePage;
