import { fetchJSON } from '@/lib/api'
import { GET_ALL_SERVICE, ENTERPRISES_ENDPOINT, GET_ALL_GERANTS_BY_ENTREPRISE } from '@/actions/endpoint'
import AffecterGerantServiceModal from './_components/AffecterGerantServiceModal'

const ServiceManagerPage = async () => {
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT, { tags: ['enterprises'] });
  const currentEnterpriseId = enterprises[0]?._id;

  if (!currentEnterpriseId) {
    return <div>Aucune entreprise trouvée</div>;
  }

  // Paralléliser les appels API avec tags pour cache
  const [servicesData, gerants] = await Promise.all([
    fetchJSON(`${GET_ALL_SERVICE}/${currentEnterpriseId}`, { tags: ['services'] }),
    fetchJSON(`${GET_ALL_GERANTS_BY_ENTREPRISE}/${currentEnterpriseId}`, { tags: ['gerants'] })
  ]);

  const services = (servicesData || []).map((service: any) => ({
    ...service,
    entrepriseId: currentEnterpriseId
  }));
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