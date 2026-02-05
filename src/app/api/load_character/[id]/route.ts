import crypto from 'crypto';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${id}.bin`,
    });

    const response = await R2.send(command);
    if (!response.Body) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const encryptedData = Buffer.from(await response.Body.transformToByteArray());

    const iv = encryptedData.subarray(0, 16);
    const encryptedText = encryptedData.subarray(16);
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return NextResponse.json(JSON.parse(decrypted.toString()));
  } catch (error) {
    console.error('Detail Load Error:', error);
    return NextResponse.json({ error: '読み込みに失敗しました' }, { status: 500 });
  }
}
