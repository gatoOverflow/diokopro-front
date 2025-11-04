import { fetchJSON } from '@/lib/api'
import { GET_ALL_SERVICE, ENTERPRISES_ENDPOINT, GET_ALL_GERANTS } from '@/actions/endpoint'
import AffecterGerantServiceModal from './_components/AffecterGerantServiceModal'

const ServiceManagerPage = async () => {
  // Fetch the enterprise first
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
  const currentEnterpriseId = enterprises[0]?._id; 
  

  const servicesData = await fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`);
  
 
  const services = servicesData.map((service: any) => ({
    ...service,
    entrepriseId: currentEnterpriseId
  }));
  
  // Fetch gérants for this enterprise
  const gerants = await fetchJSON(`${GET_ALL_GERANTS}/${currentEnterpriseId}`);
 // console.log(gerants);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des services et des gérants</h1>
      
      <div className="mb-8">
        <AffecterGerantServiceModal 
          services={services} 
          gerants={gerants.gerants} 
          entrepriseId={currentEnterpriseId} 
        />
      </div>
    </div>
  )
}

export default ServiceManagerPage