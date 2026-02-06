import { Suspense } from 'react';

import PreciousDaysCharacterList from '@/components/preciousdays/CharacterListClient';
import Loading from '@/components/ui/Loading';
import { getAllCharacters } from '@/lib/preciousdays/data';

export default async function PreciousDaysPage() {
  const characters = await getAllCharacters();

  return (
    <Suspense fallback={<Loading />}>
      <PreciousDaysCharacterList initialCharacters={characters} />
    </Suspense>
  );
}
