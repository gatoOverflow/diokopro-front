// page.tsx (Server Component)
import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT, GET_ALL_CLIENT_URL } from '@/actions/endpoint';
import ClientsView from './_components/ClientsView';

const ClientsPage = async () => {
  // Fetch the enterprises to get the current enterprise ID
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  
  const currentEnterpriseId = enterprises[0]?._id; 
  

  // Fetch all clients for this enterprise
  const clientsResponse = await fetchJSON(`${GET_ALL_CLIENT_URL}/${currentEnterpriseId}/clients`);
  const clients = clientsResponse.data || [];
  
  return (
    <ClientsView 
      entrepriseId={currentEnterpriseId}
      initialClients={clients}
    />
  );
};

export default ClientsPage;