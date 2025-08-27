import React from 'react'
import { fetchJSON } from '@/lib/api';
import UpdateProfile from '../_components/updateProfile';
import { USERSBYID_URL, ENTERPRISES_ENDPOINT } from '@/actions/endpoint';

type Props = {
  params: {
    id: string
  }
}

async function ProfileUpdatePage({ params }: Props) {
  // Récupérer les informations de l'utilisateur
  const res = await fetchJSON(`${USERSBYID_URL}/${params.id}`);
  const userConnected = res.user;

  // Récupérer l'ID de l'entreprise si l'utilisateur n'en a pas
  let entrepriseId = userConnected.entrepriseId;
  
  if (!entrepriseId) {
    // Si l'utilisateur n'a pas d'entrepriseId (comme pour un admin), récupérer la première entreprise
    try {
      const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
      
      if (enterprises && enterprises.length > 0) {
        entrepriseId = enterprises[0]?._id;
       // console.log("Entreprise récupérée pour l'utilisateur:", entrepriseId);
      } else {
        console.error("Aucune entreprise trouvée");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des entreprises:", error);
    }
  }

  // Si aucun entrepriseId n'a été trouvé, afficher un message d'erreur
  if (!entrepriseId) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erreur</p>
          <p>Impossible de récupérer l'ID de l'entreprise nécessaire pour la mise à jour du profil.</p>
          <p className="mt-2">
            <a href="/dashboard" className="text-blue-600 hover:underline">
              Retour au tableau de bord
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <UpdateProfile user={userConnected} entrepriseId={entrepriseId} />
    </div>
  );
}

export default ProfileUpdatePage;