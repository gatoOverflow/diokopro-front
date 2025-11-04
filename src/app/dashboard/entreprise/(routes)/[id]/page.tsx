// app/dashboard/entreprise/(routes)/[id]/page.tsx
import { fetchJSON } from '@/lib/api'
import { getEntreprise } from '@/actions/endpoint'
import EntrepriseDetails from './_components/EntrepriseDetails'
import { getAuthenticatedUser } from '@/lib/auth';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const EntrepriseDetailsPage = async ({ params }: Props) => {
  // Await params before destructuring
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const currentUser = await getAuthenticatedUser();
 
  
  const entreprise = await fetchJSON(`${getEntreprise}/${id}`);


  return (
    <div className="p-6">
      <EntrepriseDetails entreprise={entreprise} currentUser={currentUser} />
    </div>
  );
}

export default EntrepriseDetailsPage