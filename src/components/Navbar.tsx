'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ui/ModeToggle'
import Link from 'next/link'
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react'
import { fetchUser } from '@/serverActions/clientAction'
import toast from 'react-hot-toast'
import axios from 'axios'

function Navbar() {
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [username, setUsername] = useState('')
  
  useEffect(() => {
    const checkIfAdmin = async () => {
      const response = await axios.post('/api/checkIfAdmin')
      const usernameResponse = await axios.post('/api/getUsername')
      setUsername(usernameResponse.data.username)
      console.log(usernameResponse.data.username)
      if(response.data.admin){
        setIsAdmin(true)
      }
    }

    checkIfAdmin()

  }, [])
  
  return (
    <nav className='fixed top-0 left-0 w-full h-14 z-50 flex items-center justify-between px-4 md:px-8 border-b border-white/10 shadow-lg 
    bg-white/20 dark:bg-black/20 backdrop-blur-lg backdrop-saturate-150'>
      <div className='flex items-center space-x-4'>
        <span className='text-xl font-bold tracking-tight'>AlgoJourney</span>
      </div>
      {status === 'authenticated' ? <div className='flex items-center space-x-4'>
        <span>
          Hi {username}
        </span>
        <Link href='/user/dashboard'>
         <Button variant="outline">Home</Button>
        </Link>
        <Link href='/groupCreation'>
         <Button variant="outline">Groups</Button>
        </Link>
        <Link href='/leaderboard/user'>
         <Button variant="outline">Leaderboard</Button>
        </Link>
        <Link href='/arena'>
         <Button variant="outline">Arena</Button>
        </Link>
        {isAdmin && <Link href='/admin/dashboard'>
         <Button variant="outline">Admin</Button>
        </Link>}
        <Link href='/admin/dashboard'>
         <Button variant="outline" onClick={()=>signOut()}>SignOut</Button>
        </Link>
        <ModeToggle />
      </div> : 
      
      <div>
        <Link href='/user/dashboard'>
        <Button variant="outline" onClick={()=>signIn()}>SignIn</Button>
        </Link>
      </div>

      }
      
    </nav>
  )
}

export default Navbar