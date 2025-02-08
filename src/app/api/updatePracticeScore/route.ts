import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma"; // Ensure Prisma is correctly set up

export async function POST(req: Request) {
  try {

    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const { contestId, questionId, score } = await req.json();

    if (!contestId || !questionId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { group: true }, 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { individualPoints: { increment: score } },
    });

    if (user.groupId) {
      await prisma.group.update({
        where: { id: user.groupId },
        data: { groupPoints: { increment: score } },
      });

      await prisma.groupOnContest.upsert({
        where: { groupId_contestId: { groupId: user.groupId, contestId } },
        update: { score: { increment: score } },
        create: { groupId: user.groupId, contestId, score },
      });
    }

    return NextResponse.json({ message: "Score updated successfully" });
  } catch (error) {
    console.error("Error updating scores:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}