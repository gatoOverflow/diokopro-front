
import { fetchJSON } from '@/lib/api'
import Profile from './_components/profile'
import { USERSBYID_URL } from '@/actions/endpoint'

type Props = {
  params: {
    id: string
  }
}

export default async function ProfilePage({ params }: Props) {
  const res = await fetchJSON(`${USERSBYID_URL}/${params.id}`)
  const userConnected = res.user  

  return (
    <div className=" w-full p-6">
        <Profile user={userConnected} />
    </div>
  )
}