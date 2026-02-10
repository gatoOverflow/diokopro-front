import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_AGENTS, GET_ALL_SERVICE } from '@/actions/endpoint';
import AgentsView from './_components/AgentsView';

const GerantsPage = async () => {
  // Fetch enterprise first
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT, { tags: ['enterprises'] });
  const currentEnterpriseId = enterprises[0]?._id;

  if (!currentEnterpriseId) {
    return <div>Aucune entreprise trouvée</div>;
  }

  // Paralléliser les appels API avec tags pour cache
  const [agentsResponse, services] = await Promise.all([
    fetchJSON(`${GET_ALL_AGENTS}/${currentEnterpriseId}`, { tags: ['agents'] }),
    fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`, { tags: ['services'] })
  ]);

  return (
    <AgentsView
      agents={agentsResponse.data || []}
      entrepriseId={currentEnterpriseId}
      services={services || []}
    />
  );
};

export default GerantsPage;