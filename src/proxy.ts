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
  // view ページは公開 (OGP クローラー・URL 共有向け)
  // list・edit ページは認証が必要
  matcher: ['/preciousdays', '/preciousdays/edit/:path*'],
};
