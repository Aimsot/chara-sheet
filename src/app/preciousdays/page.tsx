import { Suspense } from 'react';

import PreciousDaysCharacterList from '@/components/preciousdays/CharacterListClient';
import Loading from '@/components/ui/Loading';
import { getAllCharacters } from '@/lib/preciousdays/data';

export default async function PreciousDaysPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 10;

  const allCharacters = await getAllCharacters();
  const totalCount = allCharacters.length;
  const totalPages = Math.ceil(totalCount / limit);

  // 10件分だけ切り出す
  const characters = allCharacters.slice((currentPage - 1) * limit, currentPage * limit);

  return (
    <Suspense fallback={<Loading />}>
      <PreciousDaysCharacterList
        currentPage={currentPage}
        initialCharacters={characters}
        totalPages={totalPages}
      />
    </Suspense>
  );
}
