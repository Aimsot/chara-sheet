'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { SYSTEM_DATA } from '@/constants/system';
import titleStyles from '@/styles/components/titles.module.scss';

const Header = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const segments = pathname.split('/');
  const systemKey = segments[1];
  const currentSystem = SYSTEM_DATA.find((s) => s.k === systemKey);
  const mainTitle = currentSystem ? currentSystem.l : 'プレシャスデイズ';

  let subTitle = 'キャラクター一覧';

  if (pathname.endsWith('/edit')) {
    if (searchParams.has('key')) {
      subTitle = 'キャラクター編集画面';
    } else {
      subTitle = 'キャラクター新規作成画面';
    }
  } else if (pathname.includes('/view')) {
    subTitle = 'キャラクター閲覧画面';
  }

  return (
    <header
      className={`${titleStyles.decoratedHeader} ${
        pathname.endsWith('/edit') ? 'theme-silver' : ''
      }`}
    >
      <h1>
        <span className={titleStyles.mainTitle}>{mainTitle}</span>
        <span className={titleStyles.subTitle}>{subTitle}</span>
      </h1>
    </header>
  );
};

export default Header;
