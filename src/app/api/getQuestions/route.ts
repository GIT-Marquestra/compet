import prisma from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";


export async function GET() {
    try {
      const isAdmin = await axios.post('/api/checkIfAdmin')

      if(!isAdmin) return NextResponse.json({ questions: [] }, { status: 430 });
      const questions = await prisma.question.findMany({
        include: {
          questionTags: true,
        },
        orderBy:{
          createdAt: 'desc'
        }
      });
      console.log(questions[1])
      return NextResponse.json({ questions }, { status: 200 })
    } catch (error) {
    // @ts-ignore
      console.log(error.message)
      return NextResponse.json({ status: 400 })
    }
  
}