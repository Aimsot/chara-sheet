import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/api/auth/signin',
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/preciousdays/:path*'],
};
