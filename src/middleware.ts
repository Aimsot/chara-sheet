// src/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|auth|favicon.ico).*)'],
};
