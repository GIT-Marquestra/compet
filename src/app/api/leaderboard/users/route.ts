// pages/api/leaderboard/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import based on your project structure

interface LeaderboardEntry {
  id: string;
  username: string;
  totalScore: number;
}

export async function POST(req: Request) {
  try {
    // Fetch submissions and aggregate scores by user
    const usersWithScores = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        individualPoints: true, // Use the individualPoints field for scores
        submissions: {
          select: {
            score: true,
          },
        },
      },
    });

    // Calculate total scores for each user based on submissions
    const leaderboard: LeaderboardEntry[] = usersWithScores.map(user => {
      const totalScore = user.submissions.reduce((acc, submission) => acc + submission.score, user.individualPoints);
      return {
        id: user.id,
        username: user.username,
        totalScore,
      };
    });

    // Sort leaderboard by total scores in descending order
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    console.log("Leaderboard: ", leaderboard)

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}