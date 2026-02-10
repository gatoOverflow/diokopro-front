// app/dashboard/layout.tsx (Server Component)
import { Suspense } from "react";
import { getAuthenticatedUser } from "@/lib/auth";
import SidebarDashboard from "./_components/sidebar";

// Layout léger - le contenu lourd est dans les pages
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getAuthenticatedUser();

  return (
    <SidebarDashboard currentUser={currentUser}>
      <Suspense fallback={
        <div className="p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </SidebarDashboard>
  );
}