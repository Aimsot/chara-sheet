'use server';

import crypto from 'crypto';

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { revalidatePath } from 'next/cache';

import { rebuildIndex } from '@/lib/preciousdays/data';
import { Character } from '@/types/preciousdays/character';

import { deleteCharacter, saveCharacter } from './data';

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';

/**
 * キャラクター保存アクション
 */
export async function saveCharacterAction(data: Character) {
  try {
    // data.ts の関数を呼び出す（ここで暗号化、本体保存、インデックス更新が行われる）
    await saveCharacter(data);

    revalidatePath('/preciousdays');
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Save Action Error:', error);
    return { success: false, error: '保存に失敗しました' };
  }
}

/**
 * キャラクター削除アクション
 */
export async function deleteCharacterAction(id: string) {
  try {
    if (!id) throw new Error('IDが指定されていません');

    // data.ts の削除関数を呼ぶ（本体とインデックスの両方を消す）
    await deleteCharacter(id);

    revalidatePath('/preciousdays');
    return { success: true };
  } catch (error: any) {
    console.error('Delete Action Error:', error);
    return { success: false, error: error.message || '削除に失敗しました' };
  }
}

/**
 * インデックス再構築アクション
 */
export async function rebuildIndexAction() {
  try {
    const newIndex = await rebuildIndex();
    revalidatePath('/preciousdays');
    return {
      success: true,
      message: `${newIndex.length} 件のキャラクターをインデックスしました。`,
    };
  } catch (error) {
    console.error('Rebuild Action Error:', error);
    return { success: false, error: '再構築に失敗しました' };
  }
}

function decrypt(data: Buffer): string {
  try {
    const iv = data.subarray(0, 16);
    const encryptedText = data.subarray(16);
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf-8');
  } catch {
    throw new Error('復号に失敗しました。キーが正しくないか、データが破損しています。');
  }
}
export async function getCharacterById(id: string): Promise<Character | null> {
  try {
    // 保存時と同じパスを指定 (例: preciousdays/dummy001.json)
    const filePath = `preciousdays/${id}.json`;

    const getCommand = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filePath,
    });

    const response = await R2.send(getCommand);
    if (!response.Body) return null;

    // バイナリ（Buffer）として取得して復号する
    const byteArray = await response.Body.transformToByteArray();
    const encryptedBuffer = Buffer.from(byteArray);

    const decryptedJson = decrypt(encryptedBuffer);
    return JSON.parse(decryptedJson) as Character;
  } catch (error) {
    console.error(`Character Fetch Error [${id}]:`, error);
    return null;
  }
}
