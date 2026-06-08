import { Suspense } from 'react';

import { ArrowBigLeftDash } from 'lucide-react';
import { Metadata } from 'next';

import { ActionButton } from '@/components/ui/ActionButton';
import Loading from '@/components/ui/Loading';
import { ELEMENT_DATA, SPECIES_DATA, STYLE_DATA } from '@/constants/preciousdays';
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
      title: 'キャラクターが見つかりませんでした | プレシャスデイズ | Hotch Potch.',
    };
  }

  const charName = character.characterName || '名無し';
  const playerName = character.playerName || '';

  const speciesName = (SPECIES_DATA as any)[character.species]?.name ?? character.species;
  const styleName = (STYLE_DATA as any)[character.style]?.name ?? character.style;
  const elementName = (ELEMENT_DATA as any)[character.element]?.name ?? character.element;

  const description = [
    speciesName ? `種族：${speciesName}` : '',
    styleName ? `スタイル：${styleName}` : '',
    elementName ? `属性：${elementName}` : '',
    character.gl ? `GL${character.gl}` : '',
    playerName ? `PL：${playerName}` : '',
  ]
    .filter(Boolean)
    .join('　');

  return {
    title: `${charName} | プレシャスデイズ | Hotch Potch.`,
    description,
    openGraph: {
      title: `${charName} | プレシャスデイズ | Hotch Potch.`,
      description,
      type: 'profile',
      images: character.image
        ? [
            {
              url: `${(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://chara-sheet.aimsot.net').replace(/\/$/, '')}/api/preciousdays/character/${id}/image`,
              alt: charName,
            },
          ]
        : [],
    },
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
