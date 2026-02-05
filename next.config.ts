import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
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

  // 4. セキュリティヘッダーの設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // 他のサイトのiframeの中に埋め込まれるのを防ぐ（クリックジャッキング対策）
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // ブラウザによる不適切なMIMEタイプ推測を防ぐ
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin', // 外部サイトへ飛ぶ際に情報を制限する
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // 不要なデバイス機能を無効化
          },
        ],
      },
    ];
  },
};

export default nextConfig;
