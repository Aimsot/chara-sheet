// src/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Secret Password',
      credentials: {
        password: { label: '合言葉', type: 'password' },
      },
      async authorize(credentials) {
        const inputPassword = credentials?.password;
        const correctPassword = process.env.SITE_PASSWORD;

        if (inputPassword === correctPassword) {
          return { id: '1', name: 'Member' };
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
};
