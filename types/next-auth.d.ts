import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      vendorId: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    vendorId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    vendorId: string | null;
  }
}
