
import { fetchJSON } from '@/lib/api'
import { GET_ALL_SERVICE, ENTERPRISES_ENDPOINT, GET_ALL_AGENTS } from '@/actions/endpoint'
import CreateAgentModal from './_components/AddAgents';

const AgentPage = async () => {
  // Fetch the enterprise first
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
  const agent =await fetchJSON(`${GET_ALL_AGENTS}/${currentEnterpriseId}`);
  //console.log("++++++++++",agent);
  

  if (!currentEnterpriseId) {
    throw new Error("No enterprise found");
  }
  

  const servicesData = await fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`);
  
  

  const services = servicesData.map((service: any) => ({
    ...service,
    entrepriseId: currentEnterpriseId
  }));
    
  return (
    <CreateAgentModal services={services} />
  )
}

export default AgentPage