'use client';

import { DiamondPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CharacterRow } from '@/components/CharacterRow';
import { ActionButton } from '@/components/ui/ActionButton';
import listLayout from '@/styles/components/charaList/layout.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import titleStyles from '@/styles/components/titles.module.scss';
import { Character } from '@/types/preciousdays/character';

export default function CharacterListClient({
  initialCharacters,
}: {
  initialCharacters: Character[];
}) {
  const router = useRouter();

  //
  const characters = Array.isArray(initialCharacters) ? initialCharacters : [];

  return (
    <div className={layoutStyles.container}>
      <header className={titleStyles.decoratedHeader}>
        <h1>
          <span className={titleStyles.mainTitle}>プレシャスデイズ</span>
          <span className={titleStyles.subTitle}>キャラクター一覧</span>
        </h1>
      </header>

      {/* <DebugUploader /> */}
      <div className={layoutStyles.flexCenter} style={{ marginBottom: '30px' }}>
        <ActionButton
          icon={<DiamondPlus size={16} />}
          label='新規キャラクター作成'
          onClick={() => router.push('/preciousdays/edit')}
          variant='magic'
        />
      </div>

      <div className={listLayout.container}>
        <main>
          <CharacterRow characters={characters} />
        </main>
      </div>
    </div>
  );
}
