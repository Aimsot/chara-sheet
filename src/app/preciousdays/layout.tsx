import { Suspense } from 'react'; // 追加

import { Metadata } from 'next';


import Header from '@/components/Header/Header';
import { MainLayout } from '@/components/layouts/MainLayout';
// 必要に応じてローディングUIをインポート
import layoutStyles from '@/styles/components/layout.module.scss';

export default function PreciousDaysLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout footerSystem='preciousdays'>
      <div className={layoutStyles.container}>
        <Suspense fallback={<div style={{ height: '80px' }} />}>
          <Header />
        </Suspense>
        {children}
      </div>
    </MainLayout>
  );
}

export const metadata: Metadata = {
  title: 'プレシャスデイズ | Hotch Potch.',
  description: '魔術師育成スローライフRPGプレシャスデイズのキャラクターシートです。',
  robots: {
    index: false,
    follow: false,
  },
};
