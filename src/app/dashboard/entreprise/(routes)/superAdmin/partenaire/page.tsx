// page.tsx (Server Component) - Version avec streaming Suspense
import { Suspense } from 'react';
import { loadSuperAdminData, SuperAdminSkeleton } from './DataLoaders';
import CombinedViewTest from './CombinedView/CombinedViewpage';

// Composant async pour charger les données
async function SuperAdminDataLoader() {
  const data = await loadSuperAdminData();

  return (
    <CombinedViewTest
      services={data.services}
      agentapayer={data.agenttopay}
      agentNotTopayer={data.agentToNotPay}
      clients={data.clients}
      agents={data.enterprises}
      gerants={data.gerants}
      clientsResponse={data.clientsCount}
      agentsResponse={data.agentsCount}
      getNumbersEntreprise={data.enterprisesCount}
      balance={data.balance}
    />
  );
}

const CombinedPage = async () => {
  return (
    <div>
      <Suspense fallback={<SuperAdminSkeleton />}>
        <SuperAdminDataLoader />
      </Suspense>
    </div>
  );
};

export default CombinedPage;
