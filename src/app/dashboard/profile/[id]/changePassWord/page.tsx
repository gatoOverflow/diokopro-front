 import React from 'react'
import ChangePassWord from '../_components/changePassWord';
import { fetchJSON } from '@/lib/api';
import { USERSBYID_URL } from '@/actions/endpoint';
import { log } from 'console';


type Props = {
    params :{
        id : string
    }
}
async function page({params}: Props) {
    // console.log("+++++++++",params.id);
    const res = await fetchJSON(`${USERSBYID_URL}/${params.id}`)
    console.log(res);
    
    const userConnected = res.user
    // console.log(userConnected);
    

  return (
    <div>
        <ChangePassWord user={userConnected} />
    </div>
  )
}

export default page 