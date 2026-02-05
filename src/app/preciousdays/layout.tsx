import { MainLayout } from '@/components/layouts/MainLayout';
import layoutStyles from '@/styles/components/layout.module.scss';

export default function PreciousDaysLayout({ children }: { children: React.ReactNode }) {
  return (
    <MainLayout footerSystem='preciousdays'>
      <div className={layoutStyles.container}>{children}</div>
    </MainLayout>
  );
}
