import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_GERANTS } from '@/actions/endpoint';
import GerantsView from './GerantsView';




const GerantsPage = async () => {

  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  
  const currentEnterpriseId = enterprises[0]?._id; 
  
  if (!currentEnterpriseId) {
    throw new Error("No enterprise found");
  }
  
  // Fetch gerants for the enterprise
  const gerantsResponse = await fetchJSON(`${GET_ALL_GERANTS}/${currentEnterpriseId}`);
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