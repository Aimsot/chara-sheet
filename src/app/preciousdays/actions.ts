'use server';

import crypto from 'crypto';

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { revalidateTag, revalidatePath } from 'next/cache';

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

export async function saveCharacterAction(data: any) {
  try {
    const { id } = data;
    if (!id) throw new Error('IDが必要です');

    const finalData = { ...data, updatedAt: new Date().toISOString() };
    const jsonString = JSON.stringify(finalData);
    const buffer = Buffer.from(jsonString);

    // --- 暗号化処理 ---
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const storedData = Buffer.concat([iv, encrypted]);

    // --- R2へ保存 ---
    await R2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `${id}.bin`,
        Body: storedData,
        ContentType: 'application/octet-stream',
      })
    );

    revalidateTag('characters', 'default');
    revalidatePath('/preciousdays');

    return { success: true, id };
  } catch (error) {
    console.error('Save Action Error:', error);
    return { success: false, error: '保存に失敗しました' };
  }
}

export async function deleteCharacterAction(id: string) {
  try {
    if (!id) throw new Error('IDが指定されていません');

    await R2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `${id}.bin`,
      })
    );

    // サーバー側のキャッシュを破棄
    revalidateTag('characters', 'default');
    // ★重要：ブラウザ側のリストページのキャッシュも即座に無効化する
    revalidatePath('/preciousdays');

    return { success: true };
  } catch (error: any) {
    console.error('Delete Action Error:', error);
    return { success: false, error: error.message };
  }
}
