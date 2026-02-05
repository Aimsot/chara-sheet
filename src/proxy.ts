// src/middleware.ts
import { withAuth } from 'next-auth/middleware';

// 全ページに対して認証を必須にする設定
export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // トークンがあれば（ログイン済みなら）OK、なければNG
      return !!token;
    },
  },
});

// 保護するパスの指定（ここでは全ページ）
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
