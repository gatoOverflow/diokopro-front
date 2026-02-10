import { fetchJSON } from '@/lib/api'
import { ALL_ENTERPRISES_ENDPOINT } from '@/actions/endpoint'
import CandidatureView from './_components/CandidatureView'

const CandidaturePage = async () => {
  // Désactiver le cache car les données sont trop volumineuses (> 2MB)
  const entreprises = await fetchJSON(`${ALL_ENTERPRISES_ENDPOINT}`, {
    cache: 'no-store'
  })

  return <CandidatureView entreprises={entreprises || []} />
}

export default CandidaturePage
