// src/app/preciousdays/view/[id]/page.tsx
import { Suspense } from 'react';

import Loading from '@/components/ui/Loading';

import CharacterViewClient from '../CharacterViewClient';

async function getCharacter(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/load_character/${id}`, {
    next: { tags: ['characters', `character-${id}`] },
    cache: 'force-cache',
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function CharacterViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await getCharacter(id);

  if (!character) {
    return <div>キャラクターが見つかりませんでした</div>;
  }

  return (
    <Suspense fallback={<Loading />}>
      <CharacterViewClient initialData={character} />
    </Suspense>
  );
}
