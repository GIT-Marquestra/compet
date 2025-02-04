"use client"
import { fetchLatestSubmissionsCodeForces, fetchLatestSubmissionsLeetCode } from '@/serverActions/fetch'
import { fetchTestQuestions } from '@/serverActions/fetchTestQuestions';
import { Difficulty } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import Link from 'next/link'
import React, { useEffect, useState } from 'react'



function ContestQuest() {
    const [resLeet, setResLeet] = useState('')
    const [resCodef, setResCodef] = useState('')
    const [score, setScore] = useState(0)
    const [questions, setQuestions] = useState<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        leetcodeUrl: string | null;
        codeforcesUrl: string | null;
        difficulty: Difficulty;
        points: number;
        slug: string;
    }[]>([]);

    useEffect(() => {
        async function func(){
            const testQuestions = await fetchTestQuestions()
            setQuestions(testQuestions)
        }
        func()
    }, [])
    
    

    const handleVerify = async (platform: string, problemName: string) => {
        if(platform === "Leetcode"){
            const res = await fetchLatestSubmissionsLeetCode('Abhi_Verma2678')
            if(!(res && res.recentSubmissionList)) return
            console.log(res.recentSubmissionList)
            
            const question = res.recentSubmissionList.find((p) => p.titleSlug === problemName && p.statusDisplay === 'Accepted')
            if(question){
                if(question.timestamp > resLeet){
                    setQuestions((prev) => (
                        prev.map((p) => (
                            p.slug === question.titleSlug ? {...p, solved: true} : p
                        ))
                    ))
                }
            }
        } 
        if(platform === "Codeforces"){
            const res = await fetchLatestSubmissionsCodeForces('Abhi_Verma2678')
            if(!res) return
            const question = res.find((p: any) => (p.problem.name === problemName))
            if(question && question.verdict === 'OK'){
                if(question.creationTimeSeconds > resCodef){
                    setQuestions((prev) => (
                        prev.map((p) => (
                            p.slug === question.problem.name ? {...p, solved: true} : p
                        ))
                    ))
                }
            }
            res.forEach((r: any) => {
                if(r.verdict === 'OK'){
                    if (!(r.creationTimeSeconds > resCodef)) return 
                    const question = questions.find((q) => q.name === r.problem.name)
                    if(!question) return
                    question.solved = true
                    revalidatePath("/contest")
                }
            })
        }


    }

    const handleStartTest = async () => {
        const resLeet = await fetchLatestSubmissionsLeetCode('Abhi_Verma2678')
        if(!resLeet) return 
        if(!(resLeet.recentSubmissionList)) return
        const leetTime = resLeet?.recentSubmissionList[0].timestamp
        if(leetTime) setResLeet(leetTime)
       
        const resCodef = await fetchLatestSubmissionsCodeForces('Abhi_Verma2678')
        if(!resCodef) return
        const codefTime = resCodef[0].creationTimeSeconds
        setResCodef(codefTime)
        if(resCodef) setResCodef(resCodef)
        setQuestions(testQuestions)
    }

  return (
    <div>
        <button onClick={handleStartTest}>Start Test</button>
        {
            questions.map((q) => (
                <div key={q.id} className='flex flex-col'>
                    <span>{q.url}</span>
                    <Link href={q.url} legacyBehavior>
                        <a target="_blank" rel="noopener noreferrer" className='flex'>
                            <button className='border-2 border-white/60'>Solve</button>
                        </a>
                    </Link>
                        <span onClick={() => handleVerify(q.platform, q.name)} className='border-2 border-white/60'>Verify</span>
                    <span>{q.solved ? "True" : "False"}</span>
                </div>
                
            ))
        }
    </div>
  )
}

export default ContestQuest
