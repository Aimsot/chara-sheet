import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';

import PreciousDaysCharacterList from '@/components/preciousdays/CharacterListClient';
import Loading from '@/components/ui/Loading';
import { getAllCharacters } from '@/lib/preciousdays/data';

export const metadata: Metadata = {
  title: 'キャラクター一覧 | プレシャスデイズ | Hotch Potch.',
  description: 'プレシャスデイズのキャラクターシート一覧。',
};

export default async function PreciousDaysPage() {
  const allCharacters = await getAllCharacters();

  return (
    <Suspense fallback={<Loading />}>
      <PreciousDaysCharacterList allCharacters={allCharacters} />
    </Suspense>
  );
}
