// page.tsx
import { fetchJSON } from '@/lib/api';
import { 
  ENTERPRISES_ENDPOINT, 
  GET_ALL_SERVICE, 
  GET_ALL_CLIENT_URL, 
  GET_ALL_AGENTS, 
  GET_ALL_GERANTS, 
  GET_ALL_AGENTS_TO_PAY, 
  GET_ALL_AGENTS_TO_NOT_PAY, 
  GET_ALL_CLIENT_TO_NOT_PAY_URL, 
  BALANCE_ENDPOINT,
  GET_AGENT_PAYSLIP 
} from '@/actions/endpoint';
import CombinedView from './CombinedView/CombinedViewpage';

const CombinedPage = async () => {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  const nomEntreprise = enterprises[0].nomEntreprise;
  const currentEnterpriseId = enterprises[0]?._id;
  
  if (!currentEnterpriseId) {
    throw new Error("No enterprise found");
  }
  
  const services = await fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`);
  const clientsResponse = await fetchJSON(`${GET_ALL_CLIENT_URL}/${currentEnterpriseId}/clients`);
  const clients = clientsResponse.data || [];
  const agenttopay = await fetchJSON(`${GET_ALL_AGENTS_TO_PAY}/${currentEnterpriseId}`);
  const agentToNotPay = await fetchJSON(`${GET_ALL_AGENTS_TO_NOT_PAY}/${currentEnterpriseId}`);
  const agentsResponse = await fetchJSON(`${GET_ALL_AGENTS}/${currentEnterpriseId}`);
  const agents = Array.isArray(agentsResponse) ? agentsResponse : agentsResponse.data || [];
  
  // Fetch payslips for all agents
  const agentsWithPayslips = await Promise.all(
    agents.map(async (agent) => {
      try {
        const payslip = await fetchJSON(
          `${GET_AGENT_PAYSLIP}/${currentEnterpriseId}/agent/${agent._id}`
        );
        return { ...agent, payslip };
      } catch (error) {
        console.error(`Error fetching payslip for agent ${agent._id}:`, error);
        return { ...agent, payslip: null };
      }
    })
  );

  const gerantsResponse = await fetchJSON(`${GET_ALL_GERANTS}/${currentEnterpriseId}`);
  const clientToNotpay = await fetchJSON(`${GET_ALL_CLIENT_TO_NOT_PAY_URL}/${currentEnterpriseId}`);
  const gerants = Array.isArray(gerantsResponse) ? gerantsResponse : gerantsResponse.gerants || [];
  const balance = await fetchJSON(`${BALANCE_ENDPOINT}/${currentEnterpriseId}`);
      
  return (
    <div>
      <CombinedView 
        services={services}
        agentapayer={agenttopay}
        agentNotTopayer={agentToNotPay}
        clientNotTopayer={clientToNotpay.data}
        clients={clients}
        agents={agentsWithPayslips}
        gerants={gerants}
        entrepriseId={currentEnterpriseId} 
        serviceId={''} 
        nomEntreprise={nomEntreprise} 
        balance={balance} 
      />
    </div>
  );
};

export default CombinedPage;