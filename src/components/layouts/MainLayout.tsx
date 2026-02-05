import { ReactNode } from 'react';

import { Footer } from '@/components/Footer/Footer';
import { TRPGSystemType } from '@/types/system';

import styles from './MainLayout.module.scss';

type Props = {
  children: ReactNode;
  footerSystem?: TRPGSystemType;
};

export const MainLayout = ({ children, footerSystem = 'general' }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundLayer} />
      <main className={styles.main}>{children}</main>
      <Footer system={footerSystem} />
    </div>
  );
};
