import { NextRequest, NextResponse } from 'next/server';

import { getCharacterById } from '@/lib/preciousdays/data';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const character = await getCharacterById(id);

  if (!character?.image) {
    return new NextResponse(null, { status: 404 });
  }

  // "data:image/jpeg;base64,..." 形式をパース
  const match = character.image.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    return new NextResponse(null, { status: 400 });
  }

  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
