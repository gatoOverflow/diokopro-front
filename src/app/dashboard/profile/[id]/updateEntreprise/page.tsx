import React from 'react';
import { fetchJSON } from '@/lib/api';

import { ENTERPRISES_ENDPOINT, GET_ONE_ENTERPRISES_ENDPOINT, USERSBYID_URL } from '@/actions/endpoint';
import UpdateEntreprise from '../_components/updateEntreprise';

type Props = {
  params: Promise<{ id: string }>; // 👈 params est async dans l'app router
};

async function EntrepriseUpdatePage({ params }: Props) {
  try {
     const { id } = await params;
    const res = await fetchJSON(`${USERSBYID_URL}/${id}`);
  
    const userConnected = res.user;

    // Récupérer l'ID de l'entreprise si l'utilisateur n'en a pas
    let entrepriseId = userConnected.entrepriseId;
    let entrepriseData = null;
    
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

    if (!entrepriseId) {
      return (
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erreur</p>
            <p>Entreprise non trouvée.</p>
            <p className="mt-2">
              <a href="/dashboard/entreprise" className="text-blue-600 hover:underline">
                Retour à la liste des entreprises
              </a>
            </p>
          </div>
        </div>
      );
    }

    // Récupérer les détails complets de l'entreprise
    try {
      // Utiliser le endpoint pour récupérer une entreprise spécifique
      entrepriseData = await fetchJSON(`${GET_ONE_ENTERPRISES_ENDPOINT}/${entrepriseId}`);
     // console.log("Données de l'entreprise récupérées:", entrepriseData);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'entreprise:", error);
      return (
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erreur</p>
            <p>Impossible de récupérer les détails de l'entreprise.</p>
          </div>
        </div>
      );
    }

    // Pour cet exemple, nous utilisons l'ID de l'utilisateur connecté depuis les paramètres
  

    return (
      <div>
        <UpdateEntreprise entreprise={entrepriseData} />
      </div>
    );
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erreur</p>
          <p>Impossible de récupérer les informations de l'entreprise.</p>
          <p className="mt-2">
            <a href="/dashboard/entreprise" className="text-blue-600 hover:underline">
              Retour à la liste des entreprises
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default EntrepriseUpdatePage;