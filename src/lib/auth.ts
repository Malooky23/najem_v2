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
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const userWithPasswordCheck = await db
            .select({
              ...users,
              isPasswordValid: sql<boolean>`(crypt(${credentials.password}, ${users.passwordHash}) = ${users.passwordHash})`,
            })
            .from(users)
            .where(eq(users.email, credentials.email.toString()))
            .limit(1);

          if (userWithPasswordCheck.length === 0) {
            console.log('User not found');
            return null;
          }

          const user = userWithPasswordCheck[0];
          
          if (!user.isPasswordValid) {
            console.log('Invalid password');
            return null;
          }

          const userResult = {
            id: user.userId.toString(),
            email: user.email,
            name: user.username,
            userType: user.userType,
            isAdmin: user.isAdmin,
          } as User;

          console.log('Login successful for user:', userResult.email);
          return userResult;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
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
