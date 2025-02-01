import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // Or any other hashing library
import Prisma from '../../../../lib/prisma'; // Adjust the import based on your prisma setup

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password, email } = body;

  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the new user to the database
  try {
    const user = await Prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email
      },
    });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "User creation failed" }, { status: 400 });
  }
}