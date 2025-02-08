import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; 
import axios from 'axios';
export async function POST(req: Request) {
  const request = await req.json()
  console.log(request)
  let contestId = 0
  try {
    const isAdmin = await axios.post('/api/checkIfAdmin')

    if(!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 430 });
    const lastContest = await prisma.contest.findFirst({
      orderBy: { id: 'desc' } 
    });
    console.log("Here: ", lastContest)
    if(lastContest){
      contestId = lastContest.id + 1
    } else {
      contestId = 1
    }
  } catch (error) {
    // @ts-ignore
    console.log(error.message)
    
  }
  

  try {
    const contest = await prisma.contest.create({
      data: {
        startTime: request.startTime,  
        endTime: request.endTime
      }
    })
    console.log(contest)
    const user = await prisma.questionOnContest.createMany({
      data: request.questions.map((q: any) => ({
        contestId,
        questionId: q.id,
      }))
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    // @ts-ignore
    console.error(error.message)
    return NextResponse.json({ error: "User creation failed" }, { status: 400 });
  }
}
