/* src/app/preciousdays/edit/page.tsx */
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCharacterById } from '@/lib/preciousdays/data';

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
      redirect('/preciousdays');
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
