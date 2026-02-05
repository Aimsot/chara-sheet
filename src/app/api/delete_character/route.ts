import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// R2クライアントの設定（ロード時と同じ設定を使う）
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'IDが指定されていません' }, { status: 400 });
    }

    // ロード時は `${id}.bin` というファイル名なので、削除時も合わせる
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `${id}.bin`,
    });

    console.log(`R2から削除を試行中: ${id}.bin`);

    await R2.send(command);
    revalidateTag('characters', 'default');

    return NextResponse.json({ message: '削除に成功しました' });
  } catch (error: any) {
    console.error('R2 Delete Error:', error);
    return NextResponse.json(
      { error: 'R2上のデータの削除に失敗しました', detail: error.message },
      { status: 500 }
    );
  }
}
