import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; 
export async function POST(req: Request) {
  const request = await req.json()
  if(!req.body){
    return 
  }
  const formData = JSON.parse(request.body);
  if(!(formData.username)){
    return NextResponse.json({ error: "User creation failed" }, { status: 400 });
  }
  try {
    console.log(1)
    const user = await prisma.user.create({
      data: formData
    });
    console.log(formData)
    return NextResponse.json({ user });
  } catch (error) {
    // @ts-ignore
    console.error(error.message)
    return NextResponse.json({ error: "User creation failed" }, { status: 400 });
  }
}
