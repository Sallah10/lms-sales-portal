// src/lib/auth.ts (Sales Portal) - WITH DEBUGGING
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Extend NextAuth types to include 'role' and 'id' on session.user
import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
  interface User extends DefaultUser {
    role: string;
    id: string;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 AUTHORIZE CALLED - Sales Portal");

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        console.log("📧 Email:", credentials.email);

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log("👤 User found:", user);

          if (!user) {
            console.log("❌ No user found with this email");
            return null;
          }

          if (!user.password) {
            console.log("❌ User has no password");
            return null;
          }

          console.log("🔍 Checking user details:");
          console.log("   - Role:", user.role);
          console.log("   - isActive:", user.isActive);
          console.log("   - Has password:", !!user.password);

          // Check if user is active
          if (!user.isActive) {
            console.log("❌ User is not active");
            return null;
          }

          // Check if user is SALES role
          if (user.role !== "SALES") {
            console.log(
              `❌ User role '${user.role}' is not allowed in sales portal`
            );
            return null;
          }

          console.log("🔑 Comparing passwords...");
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("✅ Password valid:", isValid);

          if (!isValid) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log("🎉 AUTH SUCCESS - Returning user:", {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("💥 Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("🔄 user:", user);
      if (user) {
        token.role = user.role;
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🔄 token:", token);
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
        session.user.email = token.email as string | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token-external`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
  debug: true, // ✅ Enable NextAuth debug mode
};

export default NextAuth(authOptions);
