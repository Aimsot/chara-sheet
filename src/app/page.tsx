import Link from 'next/link';

import { MainLayout } from '@/components/layouts/MainLayout';

import styles from './page.module.scss';

export default function Home() {
  return (
    <MainLayout>
      <div className={styles.topWrapper}>
        <div className={styles.titleArea}>
          <h1>CHARACTER SHEET</h1>
          <p>ぽっち式キャラクターシート</p>
        </div>

        <div className={styles.systemGrid}>
          <Link className={styles.systemCard} href='/preciousdays'>
            <span className={styles.label}>TRPG SYSTEM</span>
            <span className={styles.cardSubtitle}>魔術師育成スローライフRPG</span>
            <h2 className={styles.cardTitle}>プレシャスデイズ</h2>
            <div className={styles.cardDesc}>
              <blockquote>
                ここは、魔王亡き後の剣と魔法のファンタジー世界。
                人々は平和を謳歌しながらも、いずれ起こる魔王復活に向けて、魔術師の育成に力を入れている。
                魔術師たちは弟子である魔術師見習いを連れて各地を旅し、研鑽を積ませて導いていく。
                いつの日か卒業試験を受け、一人前の魔術師となって、晴れて独り立ちするその日まで――。
                <cite className={styles.quoteSource}>プレシャスデイズ公式サイトより引用</cite>
              </blockquote>
            </div>
            <span className={styles.enterLink}>Enter →</span>
          </Link>

          <div className={styles.systemCard} style={{ opacity: 0.5, cursor: 'default' }}>
            <span className={styles.label}>COMING SOON</span>
            <h2 className={styles.cardTitle}>???</h2>
            <p className={styles.cardDesc}></p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
