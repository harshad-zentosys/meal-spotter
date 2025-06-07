import NextAuth from "next-auth";
import { authOptions as baseAuthOptions } from "../../auth-options";

// Extend NextAuth types to include our custom properties
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// Add the pages configuration
const authOptions = {
  ...baseAuthOptions,
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
};

// Use the shared auth options configuration
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
