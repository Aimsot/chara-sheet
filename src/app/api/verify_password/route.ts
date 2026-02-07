import crypto from 'crypto';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { cookies } from 'next/headers'; // ★追加
import { NextRequest, NextResponse } from 'next/server';

// --- 設定 ---
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

// --- メイン処理 (POST) ---
export async function POST(req: NextRequest) {
  try {
    const { id, password } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'IDが必要です' }, { status: 400 });
    }

    // 1. R2からデータを取得
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${id}.bin`,
    });

    let response;
    try {
      response = await R2.send(command);
    } catch (e) {
      console.error('R2 Get Error:', e);
      return NextResponse.json(
        { success: false, message: 'キャラクターが見つかりません' },
        { status: 404 }
      );
    }

    if (!response.Body) {
      return NextResponse.json(
        { success: false, message: 'データの読み込みに失敗しました' },
        { status: 500 }
      );
    }

    // 2. データの復号化
    const encryptedData = Buffer.from(await response.Body.transformToByteArray());
    const iv = encryptedData.subarray(0, 16);
    const encryptedText = encryptedData.subarray(16);

    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    const charData = JSON.parse(decrypted.toString());
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
