import crypto from 'crypto';

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

// R2 クライアントの初期化
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
export async function getAllCharacters() {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
    });
    const listResponse = await R2.send(listCommand);

    if (!listResponse.Contents) return [];

    const characters = await Promise.all(
      listResponse.Contents.map(async (file) => {
        try {
          const getCommand = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: file.Key,
          });
          const objectResponse = await R2.send(getCommand);
          const encryptedData = Buffer.from(await objectResponse.Body!.transformToByteArray());

          // 復号ロジック
          const iv = encryptedData.subarray(0, 16);
          const encryptedText = encryptedData.subarray(16);
          const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
          const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
          let decrypted = decipher.update(encryptedText);
          decrypted = Buffer.concat([decrypted, decipher.final()]);

          return JSON.parse(decrypted.toString());
        } catch (e) {
          console.warn(`復号失敗: ${file.Key}`, e);
          return null;
        }
      })
    );

    const validCharacters = characters.filter((c) => c !== null);

    const regularCharacters = validCharacters.filter((c) => !c.id.includes('sample'));
    const sampleCharacters = validCharacters.filter((c) => c.id.includes('sample'));

    regularCharacters.sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
    sampleCharacters.sort((a, b) =>
      a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' })
    );

    return [...regularCharacters, ...sampleCharacters];
  } catch (error) {
    console.error('R2 Direct Load Error:', error);
    return [];
  }
}

export async function getCharacterById(id: string) {
  const characters = await getAllCharacters();
  return characters.find((c: any) => c.id === id || c.key === id) || null;
}
