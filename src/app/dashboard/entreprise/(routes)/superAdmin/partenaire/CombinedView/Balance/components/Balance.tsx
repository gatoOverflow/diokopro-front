import React from 'react'
import BalanceEntreprise from '../BalanceEntreprise'
import { fetchJSON } from '@/lib/api';
import { BALANCE_ENDPOINT, BALANCE_ENDPOINT_FOR_ALL_ENTREPRISE, ENTERPRISES_ENDPOINT } from '@/actions/endpoint';
import BalanceEntrepriseAllEntreprise from '../BalanceEntreprise';


export default async function Balance() {

    const enterprises = await fetchJSON(ENTERPRISES_ENDPOINT);
      const currentEnterpriseId = enterprises[0]?._id; // Assuming you want the first enterprise
      
      const balance =await fetchJSON(`${BALANCE_ENDPOINT_FOR_ALL_ENTREPRISE}`)
      console.log("++++++++++++++balance",balance);
      
  return (
    <>
    
    <BalanceEntrepriseAllEntreprise totalSolde={balance.totalSolde}/>
    </>
  )
}
