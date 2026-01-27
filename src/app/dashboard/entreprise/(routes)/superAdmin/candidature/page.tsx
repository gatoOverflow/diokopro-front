import { fetchJSON } from '@/lib/api'
import { ALL_ENTERPRISES_ENDPOINT } from '@/actions/endpoint'
import CandidatureView from './_components/CandidatureView'

const CandidaturePage = async () => {
  const entreprises = await fetchJSON(`${ALL_ENTERPRISES_ENDPOINT}`)

  return <CandidatureView entreprises={entreprises || []} />
}

export default CandidaturePage
