import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1);

        if (user.length === 0) return null;
        console.log('User found:', user);

        const isPasswordValid = await db
          .select({
            isMatch: sql<boolean>`(SELECT (crypt(${credentials.password}, ${user[0].passwordHash}) = ${user[0].passwordHash}))`,
          })
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1);

        console.log('Password validation result:', isPasswordValid);
        
        if (!isPasswordValid[0].isMatch) return null;

        const userResult = {
          id: user[0].userId.toString(),
          email: user[0].email,
          name: user[0].username,
          userType: user[0].userType,
          isAdmin: user[0].isAdmin,
        } as User;

        console.log('Returning user:', userResult);
        return userResult;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.userType = user.userType;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.userType = token.userType as "CUSTOMER" | "EMPLOYEE" | "COMPANY";
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});
