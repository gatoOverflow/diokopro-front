import { fetchJSON } from '@/lib/api';
import {  ENTERPRISES_ENDPOINT,  GET_ALL_AGENTS,  } from '@/actions/endpoint';
import AgentsView from './_components/AgentsView';


const GerantsPage = async () => {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  
  const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise


  const agentsResponse = await fetchJSON(`${GET_ALL_AGENTS}/${currentEnterpriseId}`);

  
  return (
    <AgentsView
      agents={agentsResponse.data}
     
      entrepriseId={currentEnterpriseId} services={[]}    />
  );
};

export default GerantsPage;