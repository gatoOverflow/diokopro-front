export default function EntrepriseLoading() {
  return (
    <div className="p-2 animate-pulse">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:w-[900px] w-[500px] gap-5 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-9 rounded-md shadow-xl">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex items-center justify-between mt-1">
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left section - Tables */}
        <div className="lg:col-span-3 space-y-6">
          {/* Agents table skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="flex space-x-2">
              <div className="h-10 bg-gray-200 rounded w-52"></div>
              <div className="h-10 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="space-y-3">
              {/* Table header */}
              <div className="flex space-x-4 pb-3 border-b">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-20"></div>
                ))}
              </div>
              {/* Table rows */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex space-x-4 py-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-20"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Clients table skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="flex space-x-2">
              <div className="h-10 bg-gray-200 rounded w-52"></div>
              <div className="h-10 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex space-x-4 py-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-20"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar skeleton */}
        <div className="space-y-6 lg:w-[300px]">
          {/* Balance card */}
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Services list */}
          <div className="bg-white p-4 rounded-lg shadow-xl">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex space-x-4 py-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
