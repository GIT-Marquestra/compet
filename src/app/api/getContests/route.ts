import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const contests = await prisma.contest.findMany({
            orderBy: {
                id: "desc",
            },
        });

        const now = new Date();
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

        return NextResponse.json({ contests }, { status: 200 });
    } catch (error) {
        // @ts-ignore
        console.log(error.message);
        return NextResponse.json({ status: 400 });
    }
}