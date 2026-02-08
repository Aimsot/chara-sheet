/* src/app/preciousdays/edit/page.tsx */
import { ArrowBigLeftDash } from 'lucide-react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


import { ActionButton } from '@/components/ui/ActionButton';
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
      title: 'プレシャスデイズ | Hotch Potch.',
      description: 'プレシャスデイズのキャラクターシート作成ページです。',
    };
  }

  const character = await getCharacterById(targetId);

  if (!character) {
    return {
      title: 'キャラクターが見つかりませんでした | Hotch Potch.',
    };
  }

  const displayTitle = character.characterName || 'プレシャスデイズ';

  return {
    title: `${displayTitle} | Hotch Potch.`,
    description: `${displayTitle ?? 'プレシャスデイズ'} のキャラクターシート閲覧ページです。`,
    robots: {
      index: false,
      follow: false,
    },
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
