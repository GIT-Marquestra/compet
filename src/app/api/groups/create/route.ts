import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
) {
    const request = await req.json()
    console.log(request)

  try {
    
    if (!request?.userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: request.userEmail },
      include: { group: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already in a group
    if (user.groupId) {
      return NextResponse.json({ error: 'User is already a member of a group' }, { status: 404 });
    }

    // Create new group and update user
    const { name } = request;

    const group = await prisma.$transaction(async (tx) => {
      // Create the group
      const newGroup = await tx.group.create({
        data: {
          name,
          coordinator: { connect: { id: user.id } },
          members: { connect: { id: user.id } }
        }
      });

      // Update the user's groupId
      await tx.user.update({
        where: { id: user.id },
        data: { groupId: newGroup.id }
      });

      return newGroup;
    });

    return NextResponse.json({ group }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Group name already exists' }, { status: 400 });
    }
    console.log(error.message)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
