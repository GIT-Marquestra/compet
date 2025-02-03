import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const lastContestNum = await prisma.contest.findFirst({
            orderBy:{
                createdAt: "desc"
            }
        })
        if(!lastContestNum) return
        return NextResponse.json({ lastContestNum.id }, { status: 200 });
    } catch (error) {
        // @ts-ignore
        console.log(error.message)
        return NextResponse.json({ error: "Error fetchig last contest number" }, { status: 400 })
    }
}