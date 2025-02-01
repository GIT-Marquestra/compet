"use client"
import { fetchLatestSubmissionsLeetCode } from '@/serverActions/fetch'
import React, { useState } from 'react'

function CallFetchButton() {
  const [userStats, setUserStats] = useState()
  const getFunc = async () => {
    console.log("hi")
    const stats = await fetchLatestSubmissionsLeetCode()
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
          {userStats?.recentSubmissionList.map((p: Object) => (
            //@ts-ignore
            <div key={p.timestamp} className='border-2 border-red-600'>
              {/* @ts-ignore */}
              <span>{p.titleSlug}</span>
              {/* @ts-ignore */}
              <span>{p.statusDisplay}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default CallFetchButton
