import { Suspense } from 'react';

import { Metadata } from 'next';

import Loading from '@/components/ui/Loading';
import { getCharacterById } from '@/lib/preciousdays/data';
import { Character } from '@/types/preciousdays/character';

import CharacterViewClient from '../CharacterViewClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const character: Character = await getCharacterById(id);

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
    return <div>キャラクターが見つかりませんでした</div>;
  }

  return (
    <Suspense fallback={<Loading />}>
      <CharacterViewClient initialData={character} />
    </Suspense>
  );
}
