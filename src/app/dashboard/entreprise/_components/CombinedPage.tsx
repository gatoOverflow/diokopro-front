// page.tsx (Server Component)
import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_SERVICE, GET_ALL_CLIENT_URL, GET_ALL_AGENTS, GET_ALL_GERANTS, GET_ALL_AGENTS_TO_PAY, GET_ALL_AGENTS_TO_NOT_PAY, GET_ALL_CLIENT_TO_NOT_PAY_URL, BALANCE_ENDPOINT, GET_MASSE_SALARIALE } from '@/actions/endpoint';
import CombinedView from './CombinedView/CombinedViewpage';

// Ajoutez cette constante dans votre fichier endpoint.js
// export const GET_MASSE_SALARIALE = '/api/getMasseSalariale';

const CombinedPage = async () => {
  // Fetch the enterprises to get the current enterprise ID
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  const nomEntreprise = enterprises[0].nomEntreprise;
  const currentEnterpriseId = enterprises[0]?._id;
  

  
  // Fetch services for the enterprise
  const services = await fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`);
  
  // Fetch clients for the enterprise
  const clientsResponse = await fetchJSON(`${GET_ALL_CLIENT_URL}/${currentEnterpriseId}/clients`);
  const clients = clientsResponse.data || [];

  const agenttopay = await fetchJSON(`${GET_ALL_AGENTS_TO_PAY}/${currentEnterpriseId}`);
  const agentToNotPay = await fetchJSON(`${GET_ALL_AGENTS_TO_NOT_PAY}/${currentEnterpriseId}`);

  const agentsResponse = await fetchJSON(`${GET_ALL_AGENTS}/${currentEnterpriseId}`);
  const agents = Array.isArray(agentsResponse) ? agentsResponse : agentsResponse.data || [];

  const gerantsResponse = await fetchJSON(`${GET_ALL_GERANTS}/${currentEnterpriseId}`);
  const clientToNotpay = await fetchJSON(`${GET_ALL_CLIENT_TO_NOT_PAY_URL}/${currentEnterpriseId}`);
  const gerants = Array.isArray(gerantsResponse) ? gerantsResponse : gerantsResponse.gerants || [];
  
  const balance = await fetchJSON(`${BALANCE_ENDPOINT}/${currentEnterpriseId}`);
  
  // 🆕 Fetch masse salariale
  const salaire = await fetchJSON(`${GET_MASSE_SALARIALE}/${currentEnterpriseId}`);
      console.log(salaire);
      
  return (
    <div>
      <CombinedView 
        services={services}
        agentapayer={agenttopay}
        agentNotTopayer={agentToNotPay}
        clientNotTopayer={clientToNotpay.data}
        clients={clients}
        agents={agents}
        gerants={gerants}
        entrepriseId={currentEnterpriseId}
        serviceId={''}
        nomEntreprise={nomEntreprise}
        balance={balance}
        salaire={salaire}  // 🆕 Passez la masse salariale
      />
    </div>
  );
};

export default CombinedPage;