import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        
        const body = await req.json();

        console.log("Incoming request:", body);

        const { userEmail } = body;


        if (!userEmail) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            select: { codeforcesUsername: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ codeforcesUsername: user.codeforcesUsername });
    } catch (error) {
        console.error("Error handling request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}