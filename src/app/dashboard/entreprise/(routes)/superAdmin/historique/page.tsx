// page.tsx (Server Component)
import { fetchJSON } from '@/lib/api';
import { GET_ALL_HISTORIQUE } from '@/actions/endpoint';
import Historique from './_components/Historique';

const ClientsByServicePage = async () => {
  // First fetch the enterprises to get the current enterprise ID
  const enterprises = await fetchJSON(GET_ALL_HISTORIQUE);
  //console.log("++++++++++++++",enterprises);
  
  const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
  //console.log(currentEnterpriseId);
  
 
 
  
  return (
  <h1>Hello</h1>
  );
};

export default ClientsByServicePage;