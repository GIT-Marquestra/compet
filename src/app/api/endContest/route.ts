import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { contestId, userEmail, finalScore, questions } = body;

        if (!contestId || !userEmail || typeof finalScore !== "number" || !Array.isArray(questions)) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: { 
                group: {
                    include: {
                        members: true
                    }
                }
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Begin transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Create submissions for each question
            const submissionPromises = questions.map(questionId => 
                prisma.submission.create({
                    data: {
                        userId: user.id,
                        questionId,
                        contestId: parseInt(contestId),
                        status: "ACCEPTED",
                        score: finalScore / questions.length
                    }
                })
            );

            await Promise.all(submissionPromises);

            // Calculate total individual points from all submissions
            const totalPoints = await prisma.submission.aggregate({
                where: {
                    userId: user.id,
                    status: "ACCEPTED"
                },
                _sum: {
                    score: true
                }
            });

            // Update user's total individual points
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    individualPoints: totalPoints._sum.score || 0
                }
            });

            if (user.groupId && user.group) {
                // Check if group has attempted this contest before
                const existingGroupAttempt = await prisma.groupOnContest.findUnique({
                    where: {
                        groupId_contestId: {
                            groupId: user.groupId,
                            contestId: parseInt(contestId),
                        }
                    }
                });

                // Get the latest contest
                const latestContest = await prisma.contest.findFirst({
                    orderBy: {
                        id: 'desc'
                    }
                });

                // Calculate group score based on conditions
                let groupScore = finalScore;
                if (existingGroupAttempt) {
                    if (latestContest && latestContest.id !== parseInt(contestId)) {
                        groupScore = finalScore / 2;
                    }
                }

                // Update or create group contest entry
                await prisma.groupOnContest.upsert({
                    where: {
                        groupId_contestId: {
                            groupId: user.groupId,
                            contestId: parseInt(contestId),
                        }
                    },
                    create: {
                        groupId: user.groupId,
                        contestId: parseInt(contestId),
                        score: groupScore
                    },
                    update: {
                        score: {
                            increment: groupScore
                        }
                    }
                });

                // Update ranks for all groups in this contest
                const groupsInContest = await prisma.groupOnContest.findMany({
                    where: {
                        contestId: parseInt(contestId)
                    },
                    orderBy: {
                        score: 'desc'
                    }
                });

                // Update ranks based on scores
                for (let i = 0; i < groupsInContest.length; i++) {
                    await prisma.groupOnContest.update({
                        where: {
                            id: groupsInContest[i].id
                        },
                        data: {
                            rank: i + 1
                        }
                    });
                }

                // Calculate total group points
                const totalGroupPoints = await prisma.groupOnContest.aggregate({
                    where: {
                        groupId: user.groupId
                    },
                    _sum: {
                        score: true
                    }
                });

                // Update group's total points
                await prisma.group.update({
                    where: { id: user.groupId },
                    data: {
                        groupPoints: totalGroupPoints._sum.score || 0
                    }
                });
            }

            // Check if all group members have completed the contest
            if (user.group?.members) {
                const allMembersSubmissions = await prisma.submission.groupBy({
                    by: ['userId'],
                    where: {
                        contestId: parseInt(contestId),
                        userId: {
                            in: user.group.members.map(member => member.id)
                        }
                    },
                    having: {
                        userId: {
                            _count: {
                                gt: 0
                            }
                        }
                    }
                });

                // If all members have submitted, update contest status
                if (allMembersSubmissions.length === user.group.members.length) {
                    await prisma.contest.update({
                        where: { id: parseInt(contestId) },
                        data: { 
                            status: "COMPLETED"
                        }
                    });
                }
            }

            return { message: "Contest submissions recorded successfully" };
        });

        return NextResponse.json({ 
            message: result.message,
            status: 200 
        }, { status: 200 });

    } catch (error) {
        console.error("Error processing contest submissions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}