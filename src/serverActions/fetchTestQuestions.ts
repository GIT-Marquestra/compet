//@ts-nocheck
"use server"
import prisma from "@/lib/prisma";

export async function fetchTestQuestions() {
    try {
        // Step 1: Find the maximum contestId
        const maxContest = await prisma.contest.findFirst({
            orderBy: {
                id: 'desc', // Assuming 'id' is the contestId
            },
            select: {
                id: true, 
            },
        });

        if (!maxContest) {
            throw new Error("No contests found");
        }

        // console.log(maxContest)

        const questions = await prisma.questionOnContest.findMany({
            where: {
                contestId: maxContest.id, 
            },
            include: {
                question: true, 
            },
        });
        console.log("questions: ", questions)
        return questions; 
    } catch (error) {
        //@ts-ignore
        console.error("Error fetching test questions:", error.message);
        throw new Error("Failed to fetch test questions");
    }
}

fetchTestQuestions()