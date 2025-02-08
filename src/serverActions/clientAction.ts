
'use client'
import { useSession } from "next-auth/react";
export function fetchUser() {
    const { data: session, status } = useSession()
    return status
}
export function fetchAuthUser() {
    const { data: session, status } = useSession()
    return session
}