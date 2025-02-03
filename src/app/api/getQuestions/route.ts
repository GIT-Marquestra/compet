import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";


export async function GET() {
    try {
      const questions = await prisma.question.findMany();
      return NextResponse.json({ questions }, { status: 200 })
    } catch (error) {
    // @ts-ignore
      console.log(error.message)
      return NextResponse.json({ status: 400 })
    }
  
}