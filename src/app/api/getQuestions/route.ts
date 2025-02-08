import prisma from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";


export async function POST() {
    try {
    //   const response = await axios.post('/api/checkIfAdmin')
    //   console.log(1)

    // if(!response.data.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 430 });

      const questions = await prisma.question.findMany({
        include: {
          questionTags: true,
        },
        orderBy:{
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ questions }, { status: 200 })
    } catch (error: any) {
      console.log(error)
      return NextResponse.json({ error }, { status: 400 })
    }
  
}