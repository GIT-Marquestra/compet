//@ts-nocheck
import prisma from "@/lib/prisma"
import { Difficulty } from "@prisma/client"
import axios from "axios";
import { NextResponse } from "next/server"

export async function POST(req: Request){
    try {
        const isAdmin = await axios.post('/api/checkIfAdmin')

        if(!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 430 });
        const request = await req.json()
        const data = JSON.parse(request.body)
        console.log('Data: ', data)

        // Extract all unique tags
        const allTags = [...new Set(data.flatMap((q: any) => q.tags || []))];

        // Ensure all tags exist before linking them to questions
        await prisma.$transaction(
            allTags.map((tagName: any) => 
                prisma.questionTag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName }
                })
            )
        );

        // Create questions
        const res = await prisma.question.createMany({
            data: data.map((q: any) => ({
                leetcodeUrl: q.platform === "Leetcode" ? q.leetcodeUrl : null,
                codeforcesUrl: q.platform === "Codeforces" ? q.codeforcesUrl : null,
                difficulty: q.difficulty as Difficulty,
                points: q.points,
                slug: q.slug ? q.slug : 'slug',
            })),
            skipDuplicates: true
        });

        console.log(res);

        // Link tags to the questions
        for (const question of data) {
            if (question.tags && question.tags.length > 0) {
                await prisma.question.update({
                    where: { slug: question.slug },
                    data: {
                        questionTags: {
                            connect: question.tags.map((tagName: string) => ({
                                name: tagName
                            }))
                        }
                    }
                });
            }
        }

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error("Error message: ", error);
        return NextResponse.json({ error: "Error" }, { status: 400 });
    }
}