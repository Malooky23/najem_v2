import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { AuthResult } from "next-auth";
import { sql } from "drizzle-orm";

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
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const ip = req.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
          const userAgent = req.headers?.get("user-agent") || "unknown";

          // Explicitly type the query result
          const result = await db.execute<{ auth_result: AuthResult }>(
            sql`SELECT authenticate_user(
              ${credentials.email}, 
              ${credentials.password}, 
              ${ip}::inet, 
              ${userAgent}
            ) as auth_result`
          );

          if (!result.rows[0]) {
            throw new Error("Authentication failed");
          }

          const authData = result.rows[0].auth_result;
          
          if (authData.status !== 'success' || !authData.user) {
            throw new Error(authData.message || "Authentication failed");
          }

          return {
            id: authData.user.user_id,
            email: authData.user.email,
            name: `${authData.user.first_name} ${authData.user.last_name}`,
            isAdmin: authData.user.is_admin,
            userType: authData.user.user_type
          };
          
        } catch (error) {
          console.error('Authentication error:', error);
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
        token.id = user.id as string;
        token.email = user.email as string;
        token.userType = user.userType as "CUSTOMER" | "EMPLOYEE" | "DEMO";
        token.isAdmin = user.isAdmin as boolean;
        token.name = user.name as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.userType = token.userType as "CUSTOMER" | "EMPLOYEE" | "DEMO";
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});