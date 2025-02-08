// app/api/questions/route.ts
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';


export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if(!session) return 

    // console.log(body)
    const userEmail = session?.user?.email
    
    // const { userEmail } = body;

    // Get current time in IST
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

    // Get the latest contest
    const latestContest = await prisma.contest.findFirst({
      orderBy: {
        startTime: 'desc'
      },
      select: {
        id: true,
        endTime: true
      }
    });

    // Base query to get questions from contests
    let questionsQuery: any = {
      select: {
        id: true,
        contestId: true,
        question: {
          select: {
            id: true,
            leetcodeUrl: true,
            codeforcesUrl: true,
            difficulty: true,
            points: true,
            slug: true,
            questionTags: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        contest: {
          startTime: 'desc'
        }
      }
    };
    if (userEmail) {
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
          select: { id: true }
        });
  
        if (!user) {
            return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
            );
        }

        questionsQuery.select.question.select.submissions = {
            where: {
                userId: user.id
            },
            select: {
                status: true,
                score: true,
                createdAt: true
            }
            };
        

    }

    if (latestContest && istTime > latestContest.endTime) {
      // Show all questions including latest contest
      const questions = await prisma.questionOnContest.findMany(questionsQuery);
      return NextResponse.json({ questions });
    } else if (latestContest) {
      // Exclude latest contest questions
      questionsQuery.where = {
        contestId: {
          not: latestContest.id
        }
      };
      const questions = await prisma.questionOnContest.findMany(questionsQuery);
      return NextResponse.json({ questions });
    } else {
      // No contests exist
      return NextResponse.json({ questions: [] }, { status: 200 });
    }

  } catch (error: any) {
    console.error('Error fetching questions:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}