'use client';

import { ArrowBigLeftDash, DiamondPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CharacterRow } from '@/components/CharacterRow';
import { ActionButton } from '@/components/ui/ActionButton';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';
import { memo } from 'react';

const BackToSystemSelect = memo(({ router }: { router: any }) => {
  return (
    <div className={layoutStyles.flexleft}>
      <ActionButton
        onClick={() => router.push('/')}
        icon={<ArrowBigLeftDash size={16} />}
        label='システム選択に戻る'
        style={{ width: '30%', marginBottom: '30px' }}
        variant='outline'
      />
    </div>
  );
});
export default function CharacterListClient({
  initialCharacters,
}: {
  initialCharacters: Character[];
}) {
  const router = useRouter();
  const characters = Array.isArray(initialCharacters) ? initialCharacters : [];

  return (
    <div className={layoutStyles.container}>
      <div className={layoutStyles.flexCenter} style={{ marginBottom: '30px' }}>
        <ActionButton
          icon={<DiamondPlus size={16} />}
          label='新規キャラクター作成'
          onClick={() => router.push('/preciousdays/edit')}
          variant='magic'
        />
      </div>
      <BackToSystemSelect router={router} />
      {/* <DebugUploader /> */}
      <main style={{ marginBottom: '50px' }}>
        <CharacterRow characters={characters} />
      </main>
      <BackToSystemSelect router={router} />
    </div>
  );
}
