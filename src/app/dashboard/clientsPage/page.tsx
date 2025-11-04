
import { fetchJSON } from '@/lib/api'
import { GET_ALL_SERVICE, ENTERPRISES_ENDPOINT } from '@/actions/endpoint'
import CreateClientModal from './_components/Addclients'

const ClientPage = async () => {
  // Fetch the enterprise first
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  const currentEnterpriseId = enterprises[0]?._id; 
  

  // Then fetch services with enterprise ID
  const servicesData = await fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`);
 
  const services = servicesData.map((service: any) => ({
    ...service,
    entrepriseId: currentEnterpriseId
  }));
    
  return (
    <CreateClientModal services={services} />
  )
}

export default ClientPage