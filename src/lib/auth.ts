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
              userId: users.userId,
              email: users.email,
              passwordHash: users.passwordHash,
              username: users.username,
              isAdmin: users.isAdmin,
              userType: users.userType,
              firstName: users.firstName,
              lastName: users.lastName,
              isPasswordValid: sql<boolean>`crypt(${credentials.password}, ${users.passwordHash}) = ${users.passwordHash}`,
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

          const fullName = `${user.firstName.charAt(0).toUpperCase()}${user.firstName.slice(1).toLowerCase()} ${user.lastName.charAt(0).toUpperCase()}${user.lastName.slice(1).toLowerCase()}`;
          const userResult = {
            id: user.userId.toString(),
            email: user.email,
            name: fullName,
            username: user.username,
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
        token.username = user.username;
        token.email = user.email;
        token.userType = user.userType;
        token.isAdmin = user.isAdmin;
        token.name = user.name;
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
