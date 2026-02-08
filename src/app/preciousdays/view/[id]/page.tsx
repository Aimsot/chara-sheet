import { Suspense } from 'react';

import { ArrowBigLeftDash } from 'lucide-react';
import { Metadata } from 'next';

import { ActionButton } from '@/components/ui/ActionButton';
import Loading from '@/components/ui/Loading';
import { getCharacterById } from '@/lib/preciousdays/data';
import baseStyles from '@/styles/components/charaSheet/base.module.scss'; // 2カラム配置用
import layoutStyles from '@/styles/components/layout.module.scss';

import CharacterViewClient from '../CharacterViewClient';
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const character = await getCharacterById(id);

  if (!character) {
    return {
      title: 'キャラクターが見つかりませんでした',
    };
  }
  const displayTitle = character.characterName || 'プレシャスデイズ';

  return {
    title: `${displayTitle}  | Hotch Potch.`,
    description: `${
      character.characterName ?? 'プレシャスデイズ'
    } のキャラクターシート閲覧ページです。`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

// 2. メインコンポーネント（既存のまま、型定義だけPropsを使うとスッキリします）
export default async function CharacterViewPage({ params }: Props) {
  const { id } = await params;
  const character = await getCharacterById(id);

  if (!character) {
    return (
      <div>
        キャラクターが見つかりませんでした
        <div className={`${layoutStyles.grid} ${layoutStyles.mb4}`}>
          <div className={`${layoutStyles.span4} ${baseStyles.stack}`}>
            <ActionButton
              className={layoutStyles.mt2}
              href='/preciousdays'
              icon={<ArrowBigLeftDash size={16} />}
              label='一覧に戻る'
              style={{ width: '100%', marginBottom: '30px' }}
              variant='outline'
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <CharacterViewClient initialData={character} />
    </Suspense>
  );
}
