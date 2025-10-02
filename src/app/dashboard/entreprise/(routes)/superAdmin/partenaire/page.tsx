// page.tsx (Server Component)
import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_SERVICE, GET_ALL_CLIENT_URL, GET_ALL_AGENTS, GET_ALL_GERANTS, GET_ALL_AGENTS_TO_PAY, GET_ALL_AGENTS_TO_NOT_PAY, GET_ALL_CLIENT_TO_NOT_PAY_URL, BALANCE_ENDPOINT, BALANCE_ENDPOINT_FOR_ALL_ENTREPRISE, ALL_ENTERPRISES_ENDPOINT, ALL_GET_ALL_AGENTS, ALL_GET_ALL_CLIENTS_ENTREPRISE, GET_ALL_NUMBER_ENTREPRISE } from '@/actions/endpoint';
import CombinedView from './CombinedView/CombinedViewpage';
import { log } from 'console';
import CombinedViewTest from './CombinedView/CombinedViewpage';
import BalanceEntreprise from '@/app/dashboard/entreprise/_components/Balance/BalanceEntreprise';


// Ajoutez cette constante à votre fichier endpoint.js
// export const GET_ALL_GERANTS = '/api/getAllGerants/entreprise';


const CombinedPage = async () => {
  // Fetch the enterprises to get the current enterprise ID
  const enterprises = await fetchJSON(ALL_ENTERPRISES_ENDPOINT);
  //console.log(enterprises);
  
const balance =await fetchJSON(`${BALANCE_ENDPOINT_FOR_ALL_ENTREPRISE}`)
const BalanceEntreprise=balance.totalSolde


//console.log("++++++++++++++++",balance);

  
  // Assuming you want the first enterprise
  

  
  // Fetch services for the enterprise
  const services = await fetchJSON(`${GET_ALL_SERVICE}`);
  
  // Fetch clients for the enterprise
  const clientsResponse = await fetchJSON(`${GET_ALL_CLIENT_URL}/clients`);

  
  const clients = clientsResponse.data || [];



  const agenttopay = await fetchJSON(`${GET_ALL_AGENTS_TO_PAY}}`);

  const agentToNotPay=await fetchJSON(`${GET_ALL_AGENTS_TO_NOT_PAY}`)
 

  const agentsResponse = await fetchJSON(`${ALL_GET_ALL_AGENTS}`);
  //console.log(agentsResponse);
    const clientResponse = await fetchJSON(`${ALL_GET_ALL_CLIENTS_ENTREPRISE}`);
  const agents = Array.isArray(agentsResponse) ? agentsResponse : agentsResponse.data || [];

  const gerantsResponse = await fetchJSON(`${GET_ALL_GERANTS}`);
    //console.log(gerantsResponse);
  const numberofEntreprise = await fetchJSON(`${GET_ALL_NUMBER_ENTREPRISE}`);

  
  const gerants = Array.isArray(gerantsResponse) ? gerantsResponse : gerantsResponse.gerants || [];

      
  return (
    <div>
      <CombinedViewTest 
        services={services}
        agentapayer={agenttopay}
        agentNotTopayer={agentToNotPay}
        clients={clients}
        agents={enterprises}
        gerants={gerantsResponse}
        clientsResponse={clientResponse.count}
        agentsResponse={agentsResponse.count}
        getNumbersEntreprise={numberofEntreprise.count}
       balance={BalanceEntreprise} />
       
    </div>
  );
};

export default CombinedPage;