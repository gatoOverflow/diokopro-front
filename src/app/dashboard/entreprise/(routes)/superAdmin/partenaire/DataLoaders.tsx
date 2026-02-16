// Composants async pour le streaming des données SuperAdmin
import { fetchJSON } from '@/lib/api';
import {
  SUPERADMIN_ENTREPRISES_PAGINATED_URL,
  SUPERADMIN_DASHBOARD_STATS_URL,
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

// Loader optimisé - seulement 2 appels API au lieu de 9
export async function loadSuperAdminData() {
  const [enterprisesResponse, statsResponse] = await Promise.all([
    // Pagination serveur - première page uniquement
    fetchJSON(`${SUPERADMIN_ENTREPRISES_PAGINATED_URL}?page=1&limit=12`, { cache: 'no-store' }),
    // Stats dashboard en un seul appel
    fetchJSON(SUPERADMIN_DASHBOARD_STATS_URL, { cache: 'no-store' }),
  ]);

  return {
    enterprises: enterprisesResponse?.data || [],
    enterprisesPagination: enterprisesResponse?.pagination || {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    },
    // Stats from single endpoint
    balance: statsResponse?.totalBalance || 0,
    agentsCount: statsResponse?.totalAgentsCount || 0,
    clientsCount: statsResponse?.totalClientsCount || 0,
    enterprisesCount: statsResponse?.entreprisesCount || 0,
  };
}
