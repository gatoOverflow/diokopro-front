// CombinedPage.tsx - Version avec streaming Suspense
import { Suspense } from 'react';
import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT } from '@/actions/endpoint';
import { loadAllData, MetricsSkeleton, ListSkeleton } from './DataLoaders';
import CombinedView from './CombinedView/CombinedViewpage';

// Composant pour charger et afficher les données
async function CombinedDataLoader({ entrepriseId, nomEntreprise }: { entrepriseId: string; nomEntreprise: string }) {
  const data = await loadAllData(entrepriseId);

  return (
    <CombinedView
      services={data.services}
      agentapayer={data.agenttopay}
      agentNotTopayer={data.agentToNotPay}
      clientNotTopayer={data.clientNotTopayer}
      clients={data.clients}
      agents={data.agents}
      gerants={data.gerants}
      entrepriseId={entrepriseId}
      serviceId={''}
      nomEntreprise={nomEntreprise}
      balance={data.balance}
      salaire={data.salaire}
      waitingpaiement={data.waitingpaiement}
    />
  );
}

// Skeleton complet pour le loading
function CombinedSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Métriques skeleton */}
      <MetricsSkeleton />

      {/* Balance skeleton */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-[320px]">
          <div className="bg-white rounded-lg shadow p-4 h-48"></div>
        </div>
      </div>

      {/* Listes skeleton */}
      <div className="space-y-4">
        <ListSkeleton title="Agents" />
        <ListSkeleton title="Clients" />
        <ListSkeleton title="Services" />
      </div>
    </div>
  );
}

const CombinedPage = async () => {
  // Fetch enterprises first (nécessaire pour les autres appels)
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT, { tags: ['enterprises'] });
  const nomEntreprise = enterprises[0]?.nomEntreprise || '';
  const currentEnterpriseId = enterprises[0]?._id;

  if (!currentEnterpriseId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Aucune entreprise trouvée</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<CombinedSkeleton />}>
      <CombinedDataLoader
        entrepriseId={currentEnterpriseId}
        nomEntreprise={nomEntreprise}
      />
    </Suspense>
  );
};

export default CombinedPage;
