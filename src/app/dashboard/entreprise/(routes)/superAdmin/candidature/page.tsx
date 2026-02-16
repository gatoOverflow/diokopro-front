import { Suspense } from 'react';
import { fetchJSON } from '@/lib/api';
import { SUPERADMIN_CANDIDATURES_PAGINATED_URL } from '@/actions/endpoint';
import CandidatureView from './_components/CandidatureView';

// Skeleton component for loading state
function CandidatureSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="h-12 bg-gray-200 rounded-xl mb-4 animate-pulse" />

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-xl w-28" />
          ))}
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-48" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Async data loader component
async function CandidatureDataLoader() {
  // Fetch paginated candidatures (first page)
  const response = await fetchJSON(
    `${SUPERADMIN_CANDIDATURES_PAGINATED_URL}?page=1&limit=9`,
    { cache: 'no-store' }
  );

  return (
    <CandidatureView
      initialCandidatures={response?.data || []}
      initialCounts={response?.counts || {
        all: 0,
        pending: 0,
        accepted: 0,
        rejected: 0
      }}
      initialPagination={response?.pagination || {
        page: 1,
        limit: 9,
        total: 0,
        totalPages: 0
      }}
    />
  );
}

const CandidaturePage = async () => {
  return (
    <Suspense fallback={<CandidatureSkeleton />}>
      <CandidatureDataLoader />
    </Suspense>
  );
};

export default CandidaturePage;
