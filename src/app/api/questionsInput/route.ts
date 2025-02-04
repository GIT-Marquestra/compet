import prisma from "@/lib/prisma"
import { Difficulty } from "@prisma/client"
import { NextResponse } from "next/server"

export async function POST(req: Request){
    try {
        const request = await req.json()
        const data = JSON.parse(request.body)
        console.log('Data: ', data)
        const res = await prisma.question.createMany({
          data: data.map((q: any) => ({
            leetcodeUrl: q.platform === "Leetcode" ? q.leetcodeUrl : null,
            codeforcesUrl: q.platform === "Codeforces" ? q.codeforcesUrl : null,
            difficulty: q.difficulty as Difficulty,
            points: q.points,
            slug: q.slug,
        })),
            skipDuplicates: true
        })
        console.log(res)
        for (const question of data) {
          if (question.tags && question.tags.length > 0) {
              await prisma.question.update({
                  where: { slug: question.slug },
                  data: {
                      questionTags: {
                          connectOrCreate: question.tags.map((tagName: string) => ({
                              where: { name: tagName },
                              create: { name: tagName }
                          }))
                      }
                  }
              })
          }
      }
        
        return NextResponse.json({ status: 200 })
    } catch (error) {
        // @ts-ignore
        console.log("Error message: ", error.message)
        return NextResponse.json({ error: "Error" }, { status: 400 })
    }

}