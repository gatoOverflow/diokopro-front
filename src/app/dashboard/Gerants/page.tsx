import { ENTERPRISES_ENDPOINT, GET_ALL_GERANTS_BY_ENTREPRISE, GET_ALL_SERVICE } from '@/actions/endpoint';
import { fetchJSON } from '@/lib/api';
import GerantsView from './GerantView';

export default async function page() {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT, { tags: ['enterprises'] });
  const currentEnterpriseId = enterprises[0]?._id;

  if (!currentEnterpriseId) {
    return <div>Aucune entreprise trouvée</div>;
  }

  // Paralléliser les appels API avec tags pour cache
  const [gerantsResponse, services] = await Promise.all([
    fetchJSON(`${GET_ALL_GERANTS_BY_ENTREPRISE}/${currentEnterpriseId}`, { tags: ['gerants'] }),
    fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`, { tags: ['services'] })
  ]);

  return (
    <GerantsView
      gerants={gerantsResponse.gerants || []}
      services={services || []}
      entrepriseId={currentEnterpriseId}
    />
  );
}
