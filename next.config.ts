import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 1. 基本設定
  poweredByHeader: false,
  reactStrictMode: true,

  // 2. 画像最適化設定 (Cloudflare R2 等)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.R2_ENDPOINT?.replace('https://', '') || '',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // 3. 書き換え設定 (Middleware警告への対応ポイント)
  async rewrites() {
    return [
      /* 単純なプロキシやパスの書き換えが必要な場合はここに記述。
         middleware.ts よりこちらの方がエッジでの実行コストが低く推奨されます。
      */
    ];
  },

  // 4. セキュリティヘッダーの一括設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // クリックジャッキング対策
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // MIMEタイプ推測の防止
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin', // リファラ情報の制御
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // デバイス機能の制限
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // HSTS（HTTPS強制）
          },
        ],
      },
    ];
  },
};

export default nextConfig;
