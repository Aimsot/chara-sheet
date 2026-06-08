/* src/app/preciousdays/edit/page.tsx */
import { ArrowBigLeftDash } from 'lucide-react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ActionButton } from '@/components/ui/ActionButton';
import { ELEMENT_DATA, SPECIES_DATA, STYLE_DATA } from '@/constants/preciousdays';
import { getCharacterById } from '@/lib/preciousdays/data';
import baseStyles from '@/styles/components/charaSheet/base.module.scss'; // 2カラム配置用
import layoutStyles from '@/styles/components/layout.module.scss';

import EditForm from './EditForm';

type Props = {
  searchParams: Promise<{ key?: string; clone?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { key, clone } = await searchParams;
  const targetId = key || clone;

  if (!targetId) {
    return {
      title: '新規作成 | プレシャスデイズ | Hotch Potch.',
      description: 'プレシャスデイズのキャラクターシート新規作成ページ。',
      robots: { index: false, follow: false },
    };
  }

  const character = await getCharacterById(targetId);

  if (!character) {
    return {
      title: 'キャラクターが見つかりませんでした | プレシャスデイズ | Hotch Potch.',
      robots: { index: false, follow: false },
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

  const label = clone ? 'コピー作成' : '編集';

  return {
    title: `${charName}（${label}） | プレシャスデイズ | Hotch Potch.`,
    description,
    robots: { index: false, follow: false },
  };
}

export default async function EditPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; clone?: string }>;
}) {
  const { key, clone } = await searchParams;
  const targetId = key || clone;

  let initialData = null;

  if (targetId) {
    initialData = await getCharacterById(targetId);

    if (!initialData) {
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

    if (key) {
      if (initialData.password && initialData.password !== '') {
        const cookieStore = await cookies();
        const allowedCookie = cookieStore.get(`edit_allowed_${key}`);

        if (!allowedCookie || allowedCookie.value !== 'true') {
          redirect('/preciousdays');
        }
      }
    }
  }

  return <EditForm characterKey={key} initialData={initialData} isClone={!!clone} />;
}
