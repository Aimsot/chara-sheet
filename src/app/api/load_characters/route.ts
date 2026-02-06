import { NextResponse } from 'next/server';

import { getAllCharacters } from '@/lib/preciousdays/data';

export async function GET() {
  try {
    // lib/data.ts にまとめたロジックを呼び出す
    const data = await getAllCharacters();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Load Characters Error:', error);
    return NextResponse.json({ error: 'キャラクター一覧の取得に失敗しました' }, { status: 500 });
  }
}
