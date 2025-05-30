import "next-auth";
import { DefaultSession } from "next-auth";
import { decl } from "postcss";

declare module "next-auth" {
  interface User {
      _id?: string;
      name?: string;
      email?: string;
      password?: string;
      role?: 'student' | 'teacher';
      allTests?: string[];
      isVerified?: boolean;
  }
  interface Session {
      user: {
          _id?: string;
          name?: string;
          email?: string;
          password?: string;
          role?: 'student' | 'teacher';
          allTests?: string[];
          isVerified?: boolean;
      } & DefaultSession['user'];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
      _id?: string;
      name?: string;
      email?: string;
      password?: string;
      role?: 'student' | 'teacher';
      allTests?: string[];
      isVerified?: boolean;
  }
}
