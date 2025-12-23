import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";

const config = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, user }: { session: any; user: any }) {
            if (session.user) {
                session.user.id = String(user.id);
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);