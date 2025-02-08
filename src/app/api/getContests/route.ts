import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const contests = await prisma.contest.findMany({
            orderBy: {
                id: "desc",
            },
        });

        const nowO = new Date();

        const offset = 5.5 * 60 * 60 * 1000; 
        const now = new Date(nowO.getTime() + offset); 
        const latestContest = contests[0];
        
        if (!latestContest) {
            return NextResponse.json({ error: "No contest found" }, { status: 404 });
        }

        if (now > latestContest.startTime && now < latestContest.endTime) {
            await prisma.contest.update({
                where: {
                    id: latestContest.id,
                },
                data: {
                    status: "ACTIVE",
                },
            });
            console.log(`Updated contest ${latestContest.id} to active`);
        }

        const contests2 = await prisma.contest.findMany({
            orderBy: {
                id: "desc",
            },
        });

        return NextResponse.json({ contests: contests2 }, { status: 200 });
    } catch (error) {
        // @ts-ignore
        console.log(error.message);
        return NextResponse.json({ status: 400 });
    }
}