import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_CLIENT_URL, GET_ALL_PAIEMENT_ENTREPRISE_URL, GET_ALL_AGENTS } from '@/actions/endpoint';
import PaymentListView from './_components/ListPaiements';

const ClientsByServicePage = async () => {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT, { tags: ['enterprises'] });
  const currentEnterpriseId = enterprises[0]?._id;

  if (!currentEnterpriseId) {
    return <div>Aucune entreprise trouvée</div>;
  }

  // Paralléliser les appels API avec tags pour cache
  const [clients, agentsResponse] = await Promise.all([
    fetchJSON(`${GET_ALL_CLIENT_URL}/${currentEnterpriseId}/clients`, { tags: ['clients'] }),
    fetchJSON(`${GET_ALL_AGENTS}/${currentEnterpriseId}`, { tags: ['agents'] })
  ]);

  const agents = Array.isArray(agentsResponse) ? agentsResponse : agentsResponse.data || [];

  return (
    <PaymentListView
      clients={clients.data || []}
      agents={agents}
    />
  );
};

export default ClientsByServicePage;