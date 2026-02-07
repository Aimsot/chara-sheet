import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCharacterById } from '@/lib/preciousdays/data';

import EditForm from './EditForm';

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
    title: `${displayTitle} | Hotch Potch.`,
    description: `${character.characterName} のキャラクターシート詳細ページです。`,
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
