"use client"
import { fetchLatestSubmissionsLeetCode } from '@/serverActions/fetch'
import React, { useState } from 'react'

function CallFetchButton() {
  const [userStats, setUserStats] = useState()
  const getFunc = async () => {
    console.log("hi")
    const stats = await fetchLatestSubmissionsLeetCode()
    if(stats !== null){
      setUserStats(stats)
    }
  }
  return (
    <div>
      <button onClick={()=>getFunc()}>Fetch</button>
      <div>
        
          {userStats?.recentSubmissionList.map((p: Object) => (
            <div key={p.timestamp} className='border-2 border-red-600'>
              <span>{p.titleSlug}</span>
              <span>{p.statusDisplay}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

export default CallFetchButton
