import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_GERANTS_BY_ENTREPRISE } from '@/actions/endpoint';
import GerantsView from './GerantsView';

const GerantsPage = async () => {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT, { tags: ['enterprises'] });
  const currentEnterpriseId = enterprises[0]?._id;

  if (!currentEnterpriseId) {
    return <div>Aucune entreprise trouvée</div>;
  }

  // Fetch gerants for the enterprise avec cache
  const gerantsResponse = await fetchJSON(`${GET_ALL_GERANTS_BY_ENTREPRISE}/${currentEnterpriseId}`, { tags: ['gerants'] });
  //console.log(gerantsResponse);
  
  const gerants = Array.isArray(gerantsResponse) ? gerantsResponse : gerantsResponse.gerants || [];
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestion des Gérants</h1>
      <GerantsView 
        gerants={gerants} 
        entrepriseId={currentEnterpriseId} 
      />
    </div>
  );
};

export default GerantsPage;