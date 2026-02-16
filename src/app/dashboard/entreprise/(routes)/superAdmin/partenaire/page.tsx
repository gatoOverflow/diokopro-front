// page.tsx (Server Component) - Version optimisée avec seulement 2 appels API
import { Suspense } from 'react';
import { loadSuperAdminData, SuperAdminSkeleton } from './DataLoaders';
import CombinedViewTest from './CombinedView/CombinedViewpage';

// Composant async pour charger les données
async function SuperAdminDataLoader() {
  const data = await loadSuperAdminData();

  return (
    <CombinedViewTest
      agents={data.enterprises}
      clientsResponse={data.clientsCount}
      agentsResponse={data.agentsCount}
      getNumbersEntreprise={data.enterprisesCount}
      balance={data.balance}
      initialPagination={data.enterprisesPagination}
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
