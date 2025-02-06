import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request
) {
    const request = await req.json()
    console.log(request)
  try {

    if (!request.body.userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user to check if they're already in a group
    const user = await prisma.user.findUnique({
      where: { email: request.body.userEmail },
      include: { group: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // if (user.groupId) {
    //   return NextResponse.json({ error: 'User is already a member of a group' }, { status: 400 });
    // }

    // Fetch all groups with their member count
    const groups = await prisma.group.findMany({
      include: {
        coordinator: {
          select: {
            username: true,
            email: true
          }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error: any) {
    console.log(error.message)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}