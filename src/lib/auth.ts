import { AUTH_URL } from "@/actions/endpoint";
import { cookies } from "next/headers"

// Cache de l'utilisateur authentifié pendant 5 minutes (300 secondes)
// Cela évite de refaire l'appel API à chaque navigation
const AUTH_CACHE_DURATION = 300;

export const getAuthenticatedUser = async() =>{
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if(!token) return null

        // Utiliser fetch avec cache Next.js au lieu d'axios
        const response = await fetch(`${AUTH_URL}/${token}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            next: {
                revalidate: AUTH_CACHE_DURATION,
                tags: ['auth', 'user']
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        const user = data.user;

        if (!user) return null;

        // Normaliser enterpriseId (peut être entrepriseId, enterpriseId, ou entreprise._id)
        const enterpriseId = user.enterpriseId || user.entrepriseId || user.entreprise?._id || user.entreprise;

        return {
            ...user,
            enterpriseId: enterpriseId
        };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return null
    }
}