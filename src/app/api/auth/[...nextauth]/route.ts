import prisma from "@/lib/prisma";
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if(credentials){
           
          const user = await prisma.user.findFirst({
            where: {
              username: credentials.username
            }
          })
          if (user) {
            return user
          } else {
            return null
          }

        }
        return null
      }
    })
  ]
})

export { handler as GET, handler as POST }