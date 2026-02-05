// src/services/preciousdays/character.ts
import { DUMMY_CHARACTERS } from '@/constants/dummy';
import { Character } from '@/types/preciousdays/character';

/**
 * microCMSからキャラクターを取得する（本番用）
 */
export const fetchCharacter = async (id: string): Promise<Character> => {
  const res = await fetch(
    `https://${process.env.NEXT_PUBLIC_MICROCMS_DOMAIN}.microcms.io/api/v1/characters/${id}`,
    {
      headers: {
        'X-MICROCMS-API-KEY': process.env.NEXT_PUBLIC_MICROCMS_API_KEY || '',
      },
    }
  );
  if (!res.ok) throw new Error('データ取得失敗');
  return await res.json();
};

/**
 * ダミーデータを返す（検証用）
 */
export const fetchDummyCharacter = async (id: string): Promise<Character> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const character = DUMMY_CHARACTERS.find((c) => c.id === id);

  if (!character) {
    console.warn(`Character with ID ${id} not found. Returning default.`);
    return DUMMY_CHARACTERS[0];
  }

  return character;
};
