//@ts-nocheck
"use client"
import { fetchLatestSubmissionsCodeForces, fetchLatestSubmissionsLeetCode } from '@/serverActions/fetch'
import React, { useState } from 'react'

function CallFetchButton() {
  const [userStats, setUserStats] = useState()
  const getFunc = async () => {
    console.log("hi")
    const stats = await fetchLatestSubmissionsCodeForces('Abhi_Verma2678')
    console.log(2)
    if(stats !== null){
      // @ts-ignore
      setUserStats(stats)
    }
  }
  return (
    <div>
      <button onClick={()=>getFunc()}>Fetch</button>
      <div>
          {/* @ts-ignore */}
          
          {userStats?.map((p: any) => (
            //@ts-ignore
            <div key={p.id} className='border-red-500 border-2'>
              {/* @ts-ignore */}
              <span>{p.problem.name}</span>
              {/* @ts-ignore */}
              <span>{p.verdict}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default CallFetchButton
