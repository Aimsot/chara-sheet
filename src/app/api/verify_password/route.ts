import { NextRequest, NextResponse } from 'next/server';

import { getCharacterById } from '@/lib/preciousdays/data';
import { grantEditPermission, verifyPassword } from '@/lib/preciousdays/password';

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
    const isAuthorized = !storedPassword || verifyPassword(String(password ?? ''), storedPassword);

    if (isAuthorized) {
      await grantEditPermission(id);
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
