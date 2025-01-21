
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    userType: "CUSTOMER" | "EMPLOYEE" | "COMPANY";
    isAdmin: boolean;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    userType: "CUSTOMER" | "EMPLOYEE" | "COMPANY";
    isAdmin: boolean;
  }
}
