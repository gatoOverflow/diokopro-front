// Composants async pour le streaming des données
import { Suspense } from 'react';
import { fetchJSON } from '@/lib/api';
import {
  GET_ALL_SERVICE,
  GET_ALL_CLIENT_URL,
  GET_ALL_AGENTS,
  GET_ALL_GERANTS_BY_ENTREPRISE,
  GET_ALL_AGENTS_TO_PAY,
  GET_ALL_AGENTS_TO_NOT_PAY,
  GET_ALL_CLIENT_TO_NOT_PAY_URL,
  BALANCE_ENDPOINT,
  GET_MASSE_SALARIALE,
  GET_MASSE_PAIEMENT_ATTENDUS
} from '@/actions/endpoint';

// Types pour les props
type DataLoaderProps = {
  entrepriseId: string;
  children: (data: any) => React.ReactNode;
};

// Skeleton pour les listes
export function ListSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  );
}

// Skeleton pour les métriques
export function MetricsSkeleton() {
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

// Loader pour les métriques (balance, salaire, paiements)
export async function MetricsDataLoader({ entrepriseId }: { entrepriseId: string }) {
  const [balance, salaire, waitingpaiement] = await Promise.all([
    fetchJSON(`${BALANCE_ENDPOINT}/${entrepriseId}`, { tags: ['balance'], revalidate: 30 }),
    fetchJSON(`${GET_MASSE_SALARIALE}/${entrepriseId}`, { tags: ['salaires'], revalidate: 30 }),
    fetchJSON(`${GET_MASSE_PAIEMENT_ATTENDUS}/${entrepriseId}`, { tags: ['paiements'], revalidate: 30 })
  ]);

  return { balance: balance || {}, salaire: salaire || {}, waitingpaiement: waitingpaiement || {} };
}

// Loader pour les agents
export async function AgentsDataLoader({ entrepriseId }: { entrepriseId: string }) {
  const [agentsResponse, agenttopay, agentToNotPay] = await Promise.all([
    fetchJSON(`${GET_ALL_AGENTS}/${entrepriseId}`, { tags: ['agents'] }),
    fetchJSON(`${GET_ALL_AGENTS_TO_PAY}/${entrepriseId}`, { tags: ['agents', 'paiements'] }),
    fetchJSON(`${GET_ALL_AGENTS_TO_NOT_PAY}/${entrepriseId}`, { tags: ['agents', 'paiements'] })
  ]);

  const agents = Array.isArray(agentsResponse) ? agentsResponse : agentsResponse?.data || [];

  return { agents, agenttopay: agenttopay || [], agentToNotPay: agentToNotPay || [] };
}

// Loader pour les clients
export async function ClientsDataLoader({ entrepriseId }: { entrepriseId: string }) {
  const [clientsResponse, clientToNotpay] = await Promise.all([
    fetchJSON(`${GET_ALL_CLIENT_URL}/${entrepriseId}/clients`, { tags: ['clients'] }),
    fetchJSON(`${GET_ALL_CLIENT_TO_NOT_PAY_URL}/${entrepriseId}`, { tags: ['clients', 'paiements'] })
  ]);

  return {
    clients: clientsResponse?.data || [],
    clientNotTopayer: clientToNotpay?.data || []
  };
}

// Loader pour les services
export async function ServicesDataLoader({ entrepriseId }: { entrepriseId: string }) {
  const services = await fetchJSON(`${GET_ALL_SERVICE}/${entrepriseId}`, { tags: ['services'] });
  return { services: services || [] };
}

// Loader pour les gérants
export async function GerantsDataLoader({ entrepriseId }: { entrepriseId: string }) {
  const gerantsResponse = await fetchJSON(
    `${GET_ALL_GERANTS_BY_ENTREPRISE}/${entrepriseId}`,
    { tags: ['gerants'] }
  );
  const gerants = Array.isArray(gerantsResponse) ? gerantsResponse : gerantsResponse?.gerants || [];
  return { gerants };
}

// Fonction utilitaire pour charger toutes les données en parallèle
export async function loadAllData(entrepriseId: string) {
  const [metrics, agentsData, clientsData, servicesData, gerantsData] = await Promise.all([
    MetricsDataLoader({ entrepriseId }),
    AgentsDataLoader({ entrepriseId }),
    ClientsDataLoader({ entrepriseId }),
    ServicesDataLoader({ entrepriseId }),
    GerantsDataLoader({ entrepriseId })
  ]);

  return {
    ...metrics,
    ...agentsData,
    ...clientsData,
    ...servicesData,
    ...gerantsData
  };
}
