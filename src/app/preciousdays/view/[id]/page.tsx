// src/app/preciousdays/view/[id]/page.tsx
import { Suspense } from 'react';

import Loading from '@/components/ui/Loading';
import { getCharacterById } from '@/lib/preciousdays/data';

import CharacterViewClient from '../CharacterViewClient';

export default async function CharacterViewPage({ params }: { params: Promise<{ id: string }> }) {
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
