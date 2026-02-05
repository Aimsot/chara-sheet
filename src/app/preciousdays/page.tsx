// src/app/preciousdays/page.tsx (Server Component化)
import { Suspense } from 'react';

import PreciousDaysCharacterList from '@/components/preciousdays/CharacterListClient';
import Loading from '@/components/ui/Loading';

async function getCharacters() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/load_characters`, {
    next: { tags: ['characters'] },
    cache: 'force-cache',
  });
  return res.json();
}

export default async function PreciousDaysPage() {
  const characters = await getCharacters();

  return (
    <Suspense fallback={<Loading />}>
      <PreciousDaysCharacterList initialCharacters={characters} />
    </Suspense>
  );
}
