import prisma from "@/lib/prisma";
import { Difficulty } from "@prisma/client";
import axios from "axios";
import { NextResponse } from "next/server";

interface QuestionInput {
    leetcodeUrl?: string;
    codeforcesUrl?: string;
    platform: "Leetcode" | "Codeforces";
    difficulty: Difficulty;
    points: number;
    slug: string;
    tags?: string[];
}

export async function POST(req: Request) {
    try {
        const isAdmin = await axios.post('/api/checkIfAdmin');

        if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 430 });

        const data: QuestionInput[] = await req.json();
        console.log("Data: ", data);

        // Extract all unique tags
        const allTags: string[] = [...new Set(data.flatMap((q) => q.tags || []))];

        // Ensure all tags exist before linking them to questions
        await prisma.$transaction(
            allTags.map((tagName) => 
                prisma.questionTag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName }
                })
            )
        );

        // Create questions
        const res = await prisma.question.createMany({
            data: data.map((q) => ({
                leetcodeUrl: q.platform === "Leetcode" ? q.leetcodeUrl : null,
                codeforcesUrl: q.platform === "Codeforces" ? q.codeforcesUrl : null,
                difficulty: q.difficulty,
                points: q.points,
                slug: q.slug || "slug",
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
                            connect: question.tags.map((tagName) => ({
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