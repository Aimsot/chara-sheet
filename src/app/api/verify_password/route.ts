import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getCharacterById } from '@/lib/preciousdays/data';

// --- メイン処理 (POST) ---
export async function POST(req: NextRequest) {
  try {
    const { id, password } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'IDが必要です' }, { status: 400 });
    }

    // 1. キャラクターデータを取得
    const charData = await getCharacterById(id);
    if (!charData) {
      return NextResponse.json(
        { success: false, message: 'キャラクターが見つかりません' },
        { status: 404 }
      );
    }

    const storedPassword = charData.password;

    let isAuthorized = false;

    if (!storedPassword) {
      isAuthorized = true;
    } else if (storedPassword === password) {
      isAuthorized = true;
    }

    if (isAuthorized) {
      const cookieStore = await cookies();

      cookieStore.set(`edit_allowed_${id}`, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24,
        sameSite: 'lax',
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: 'パスワードが違います' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Verify Error:', error);
    return NextResponse.json(
      { success: false, message: '認証処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
