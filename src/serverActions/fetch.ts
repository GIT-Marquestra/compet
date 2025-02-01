"use server"
import { LeetCode } from "leetcode-query";
// @ts-ignore
import Codeforces from 'codeforces-api'
export async function fetchLatestSubmissionsLeetCode(){
    try {
        const leetcode = new LeetCode()
        const userStats = await leetcode.user("Abhi_Verma2678")
        return userStats
    } catch (error) {
        console.log("Error: ", error)
        return null
    }

} 

export async function fetchLatestSubmissionsCodeForces(){
    try {
        const leetcode = new LeetCode()
        const userStats = await leetcode.user("Abhi_Verma2678")
        return userStats
    } catch (error) {
        console.log("Error: ", error)
        return null
    }
} 