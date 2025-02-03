import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; 
export async function POST(req: Request) {
  const request = await req.json()
  if(!req.body){
    return 
  }
  console.log(request)
  const formData = JSON.parse(request.body);
  console.log('formData: ', formData)
  if(!(formData.username)){
    return NextResponse.json({ error: "User creation failed" }, { status: 400 });
  }
  try {
    const user = await prisma.contest.create({
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
