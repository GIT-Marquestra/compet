import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request){
    try {
        const request = await req.json()
        const data = JSON.parse(request.body)
        console.log("LeetcodeUrl: ", data.leetcodeUrl)
        const res = await prisma.question.createMany({
            data: data,
            skipDuplicates: true
        })
        
        return NextResponse.json({ status: 200 })
    } catch (error) {
        // @ts-ignore
        console.log(error.message)
        return NextResponse.json({ error: "Error fetchig last contest number" }, { status: 400 })
    }

}