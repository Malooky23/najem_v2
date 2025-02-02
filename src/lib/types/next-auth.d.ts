import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    userType: "CUSTOMER" | "EMPLOYEE" | "DEMO";
    isAdmin: boolean;
  }

  interface Session {
    user: User;
  }

  export interface AuthResult {
    status: 'success' | 'error';
    code?: 'invalid_credentials' | 'server_error';
    message?: string;
    user?: {
      user_id: string;
      email: string;
      first_name: string;
      last_name: string;
      is_admin: boolean;
      user_type: "CUSTOMER" | "EMPLOYEE" | "DEMO";
    };
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    userType: "CUSTOMER" | "EMPLOYEE" | "DEMO";
    isAdmin: boolean;
  }
}
