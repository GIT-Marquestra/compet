import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '@/lib/authOptions'; // Adjust path if necessary
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { getDurationUlt } from '@/serverActions/getDuration';

export async function POST(req: Request) {
    const request = await req.json()
    const { user } = request.body
    if(!user) return NextResponse.json({ status: 400 })

    const { contestId } = request.body;
    try {
        
        const contest = await prisma.contest.findUnique({
            where: { id: parseInt(contestId) },
            include: {
                questions: {
                    include: {
                        question: true, 
                    }
                }
            }
        });

        console.log(contest?.questions)

        const latestCreatedContest = await prisma.contest.findFirst({
            orderBy:{
                id: 'desc'
            }
        })
        if(!latestCreatedContest) return NextResponse.json({ error: 'latestContest not found' }, { status: 404 })
        if (!contest) return NextResponse.json({ error: "Contest not found" }, { status: 404 });

        if (parseInt(contestId) === latestCreatedContest.id) {
            console.log('In current test block');

            const userGroup = await prisma.group.findFirst({
                where: {
                    members: {
                        some: {
                            email: user.email
                        }
                    }
                }
            });

            if (!userGroup) return NextResponse.json({ status: 404 });

            console.log(userGroup);

            // Check if the group already has an entry in GroupOnContest
            let groupOnContest = await prisma.groupOnContest.findUnique({
                where: {
                    groupId_contestId: {
                        groupId: userGroup.id,
                        contestId: parseInt(contestId),
                    },
                },
            });

            // If no entry exists, create one with score = 0
            if (!groupOnContest) {
                groupOnContest = await prisma.groupOnContest.create({
                    data: {
                        groupId: userGroup.id,
                        contestId: parseInt(contestId),
                        score: 0,
                    },
                });
                console.log("New GroupOnContest entry created:", groupOnContest);
            }

            const startTime = new Date(contest.startTime);
            startTime.setMinutes(startTime.getMinutes() + 10);

            const now = new Date();

            if (now < contest.startTime || now > startTime) {
                return NextResponse.json({ error: "Contest joining period has ended" });
            }

            console.log(7, userGroup);

            const expiryTime = new Date(startTime);
            //@ts-ignore
            const duration = getDurationUlt(contest.startTime, contest.endTime);

            if (!duration) return;

            console.log(duration, typeof duration);

            expiryTime.setHours(expiryTime.getHours() + duration);

            // If time is up, deny access
            if (now > expiryTime) {
                return NextResponse.json({ error: "Test time expired" }, { status: 420 });
            }

            // Calculate remaining time in seconds
            const remainingTime = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);
            console.log(8, remainingTime);

            return NextResponse.json({
                message: "User can take the test",
                expiryTime,
                remainingTime,
                questions: contest.questions,
                status: 200
            });
        } else {
            const startTime = new Date(contest.startTime);
            startTime.setMinutes(startTime.getMinutes() + 10); 
            const now = new Date()
            const expiryTime = new Date(startTime);
            //@ts-ignore
            const duration = getDurationUlt(contest.startTime, contest.endTime)

            if(!duration) return 

            console.log(duration, typeof(duration))

            expiryTime.setHours(expiryTime.getHours() + duration);

            const remainingTime = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);
            console.log(8, remainingTime)

            return NextResponse.json({ message: 'Test Start', remainingTime, expiryTime, questions: contest.questions, status: 200 })

        }

        
        
    } catch (error) {
        //@ts-ignore
        console.log(error.message)
        return NextResponse.json({ status: 500 })
        
    }
}