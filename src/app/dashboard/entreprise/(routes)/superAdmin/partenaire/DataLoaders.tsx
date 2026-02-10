// Composants async pour le streaming des données SuperAdmin
import { fetchJSON } from '@/lib/api';
import {
  GET_ALL_SERVICE,
  GET_ALL_CLIENT_URL,
  GET_ALL_GERANTS,
  GET_ALL_AGENTS_TO_PAY,
  GET_ALL_AGENTS_TO_NOT_PAY,
  BALANCE_ENDPOINT_FOR_ALL_ENTREPRISE,
  ALL_ENTERPRISES_ENDPOINT,
  ALL_GET_ALL_AGENTS,
  ALL_GET_ALL_CLIENTS_ENTREPRISE,
  GET_ALL_NUMBER_ENTREPRISE
} from '@/actions/endpoint';

// Skeleton pour les métriques SuperAdmin
export function SuperAdminMetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

// Skeleton pour la grille d'entreprises
export function EntrepriseGridSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="h-10 bg-gray-200 rounded w-64"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 h-48"></div>
        ))}
      </div>
    </div>
  );
}

// Skeleton complet SuperAdmin
export function SuperAdminSkeleton() {
  return (
    <div className="space-y-6">
      <SuperAdminMetricsSkeleton />
      <EntrepriseGridSkeleton />
    </div>
  );
}

// Loader pour toutes les données SuperAdmin
export async function loadSuperAdminData() {
  const [
    enterprises,
    balance,
    services,
    clientsResponse,
    agenttopay,
    agentToNotPay,
    agentsResponse,
    clientResponse,
    gerantsResponse,
    numberofEntreprise
  ] = await Promise.all([
    // Désactiver le cache pour les gros endpoints (> 2MB)
    fetchJSON(ALL_ENTERPRISES_ENDPOINT, { cache: 'no-store' }),
    fetchJSON(BALANCE_ENDPOINT_FOR_ALL_ENTREPRISE, { tags: ['balance'], revalidate: 30 }),
    fetchJSON(GET_ALL_SERVICE, { tags: ['services'] }),
    fetchJSON(`${GET_ALL_CLIENT_URL}/clients`, { tags: ['clients'] }),
    fetchJSON(GET_ALL_AGENTS_TO_PAY, { cache: 'no-store' }),
    fetchJSON(GET_ALL_AGENTS_TO_NOT_PAY, { cache: 'no-store' }),
    fetchJSON(ALL_GET_ALL_AGENTS, { cache: 'no-store' }),
    fetchJSON(ALL_GET_ALL_CLIENTS_ENTREPRISE, { cache: 'no-store' }),
    fetchJSON(GET_ALL_GERANTS, { tags: ['gerants'] }),
    fetchJSON(GET_ALL_NUMBER_ENTREPRISE, { tags: ['enterprises'] })
  ]);

  return {
    enterprises: enterprises || [],
    balance: balance?.totalSolde || 0,
    services: services || [],
    clients: clientsResponse?.data || [],
    agenttopay: agenttopay || [],
    agentToNotPay: agentToNotPay || [],
    agentsCount: agentsResponse?.count || 0,
    clientsCount: clientResponse?.count || 0,
    gerants: gerantsResponse || [],
    enterprisesCount: numberofEntreprise?.count || 0
  };
}
