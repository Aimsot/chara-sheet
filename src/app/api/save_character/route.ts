import crypto from 'crypto';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// R2クライアントの初期化
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const IV_LENGTH = 16;

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }
    const finalData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    // JSONを文字列化してバッファに変換
    const jsonString = JSON.stringify(finalData);
    const buffer = Buffer.from(jsonString);

    // --- 暗号化処理 ---
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // IV(16byte) + 暗号文 を結合して一つのバイナリデータにする
    const storedData = Buffer.concat([iv, encrypted]);

    // --- R2へ保存 ---
    // ファイル名は ID.bin にして、中身が何か推測できないようにする
    await R2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `${id}.bin`,
        Body: storedData,
        ContentType: 'application/octet-stream',
      })
    );
    revalidateTag('characters', 'default');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save Error:', error);
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
  }
}
