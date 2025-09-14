// BureauPage.tsx
import { fetchJSON } from '@/lib/api';
import { ENTERPRISES_ENDPOINT } from '@/actions/endpoint';
import { PasswordModal } from './PasswordModal';



const BureauPage = async () => {
  // Récupération des données côté serveur
  const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);

  return (
    <div>
      {/* Passer les enterprises comme prop au composant PasswordModal */}
      <PasswordModal enterprises={enterprises}  />
    
    </div>
  );
};

export default BureauPage;