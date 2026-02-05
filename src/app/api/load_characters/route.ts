import crypto from 'crypto';

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

export async function GET() {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });
    const listResponse = await R2.send(listCommand);

    if (!listResponse.Contents) return NextResponse.json([]);

    const characters = await Promise.all(
      listResponse.Contents.map(async (file) => {
        try {
          const getCommand = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: file.Key,
          });
          const objectResponse = await R2.send(getCommand);
          const encryptedData = Buffer.from(await objectResponse.Body!.transformToByteArray());

          const iv = encryptedData.subarray(0, 16);
          const encryptedText = encryptedData.subarray(16);
          const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
          const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
          let decrypted = decipher.update(encryptedText);
          decrypted = Buffer.concat([decrypted, decipher.final()]);

          return JSON.parse(decrypted.toString());
        } catch (e) {
          console.warn(`復号失敗（古いデータの可能性があります）: ${file.Key}`, e);
          return null;
        }
      })
    );

    const validCharacters = characters.filter((c) => c !== null);

    validCharacters.sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA; // 新しい順
    });

    return NextResponse.json(validCharacters);
  } catch (error) {
    console.error('List Load Error:', error);
    return NextResponse.json({ error: '一覧の取得に失敗しました' }, { status: 500 });
  }
}
