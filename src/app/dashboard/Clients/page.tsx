// page.tsx (Server Component)
import { fetchJSON } from '@/lib/api';
import { GET_ALL_SERVICE, ENTERPRISES_ENDPOINT, GET_ALL_CLIENT_URL } from '@/actions/endpoint';
import ClientsByServiceView from './_components/ClientsByServiceView';

const ClientsByServicePage = async () => {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT, { tags: ['enterprises'] });
  const currentEnterpriseId = enterprises[0]?._id;

  if (!currentEnterpriseId) {
    return <div>Aucune entreprise trouvée</div>;
  }

  // Paralléliser les appels API avec tags pour cache
  const [clients, services] = await Promise.all([
    fetchJSON(`${GET_ALL_CLIENT_URL}/${currentEnterpriseId}/clients`, { tags: ['clients'] }),
    fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`, { tags: ['services'] })
  ]);

  return (
    <ClientsByServiceView
      clients={clients.data || []}
      entrepriseId={currentEnterpriseId}
      services={services || []}
    />
  );
};

export default ClientsByServicePage;