import { NextRequest, NextResponse } from 'next/server';

import { getCharacterById } from '@/lib/preciousdays/data';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await getCharacterById(id);

  if (!character) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    characterName: character.characterName || '名称未設定',
    playerName: character.playerName || '',
    characterType: character.characterType ?? 'disciple',
    hasImage: !!character.image,
    species: character.species || '',
    style: character.style || '',
    element: character.element || '',
    gl: character.gl ?? 0,
    profileSpoilers: character.profileSpoilers ?? {},
  });
}
