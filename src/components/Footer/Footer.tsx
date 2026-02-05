import Link from 'next/link';

import { TRPGSystemType } from '@/types/system';

import styles from './Footer.module.scss';

type Props = {
  system?: TRPGSystemType;
};

export const Footer = ({ system = 'general' }: Props) => {
  const isPreciousDays = system === 'preciousdays';

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link className={styles.logo} href='/'>
          CHARACTER SHEET
        </Link>

        {/* <div className={styles.links}>
          <Link href="/about">概要</Link>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            開発者
          </a>
        </div> */}

        <div className={styles.copyrightContainer}>
          <small className={styles.copyright}>
            {isPreciousDays ? (
              <>
                本ツールは、「鈴吹太郎」「有限会社ファーイースト・アミューズメント・リサーチ」及び
                <br />
                「株式会社KADOKAWA」が権利を有する『魔術師育成スローライフRPG
                プレシャスデイズ』の二次創作物です。
                <br />
                (C) 鈴吹太郎／F.E.A.R.
              </>
            ) : (
              <>&copy; {new Date().getFullYear()} Hotch Potch. Character Sheet Tool.</>
            )}
          </small>
        </div>
      </div>
    </footer>
  );
};
