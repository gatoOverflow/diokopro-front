import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_CLIENT_URL, GET_ALL_PAIEMENT_ENTREPRISE_URL, GET_ALL_AGENTS } from '@/actions/endpoint';
import PaymentListView from './_components/ListPaiements';


const ClientsByServicePage = async () => {
  // First fetch the enterprises to get the current enterprise ID
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);

  
  const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
  //console.log(currentEnterpriseId);
  
  if (!currentEnterpriseId) {
    throw new Error("No enterprise found");
  }
  
  // Then fetch services for the specific enterprise
  const clients = await fetchJSON(`${GET_ALL_CLIENT_URL}/${currentEnterpriseId}/clients`);

  const paie =await await fetchJSON(`${GET_ALL_PAIEMENT_ENTREPRISE_URL}/${currentEnterpriseId}`);

    const agentsResponse = await fetchJSON(`${GET_ALL_AGENTS}/${currentEnterpriseId}`);
    //console.log(agentsResponse);
    
    const agents = Array.isArray(agentsResponse) ? agentsResponse : agentsResponse.data || [];
  
  return (
    <PaymentListView 
     clients={clients.data}
     agents={agents}
        />
  );
};

export default ClientsByServicePage;