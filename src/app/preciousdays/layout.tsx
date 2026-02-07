import { Metadata } from 'next';

import Header from '@/components/Header/Header';
import { MainLayout } from '@/components/layouts/MainLayout';
import layoutStyles from '@/styles/components/layout.module.scss';

export default function PreciousDaysLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout footerSystem='preciousdays'>
      <div className={layoutStyles.container}>
        <Header />
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
