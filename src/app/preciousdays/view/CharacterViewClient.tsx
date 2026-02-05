// src/components/preciousdays/CharacterViewClient.tsx
'use client';

import CharacterSheetTemplate from '@/components/preciousdays/CharacterSheetTemplate';
import { Character } from '@/types/preciousdays/character';

export default function CharacterViewClient({ initialData }: { initialData: Character }) {
  const noOp = () => {};

  return (
    <CharacterSheetTemplate
      char={initialData}
      isLoading={false} // 既にデータはあるので常に false
      mode='view'
      previewUrl={initialData.image || null}
      setChar={noOp}
      setPreviewUrl={noOp}
      setSelectedFile={noOp}
      updateAbilities={noOp}
    />
  );
}
