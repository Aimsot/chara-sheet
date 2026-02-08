import crypto from 'crypto';

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

import { STYLE_DATA, StyleKey } from '@/constants/preciousdays';
import { Character, CharacterSummary } from '@/types/preciousdays/character';

// --- 1. R2 クライアントの初期化 ---
const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const INDEX_FILE_PATH = 'preciousdays/index.json';
const FOLDER_PREFIX = 'preciousdays/';

// --- 2. 暗号化・復号ヘルパー ---

function encrypt(text: string): Buffer {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

function decrypt(data: Buffer): string {
  const iv = data.subarray(0, 16);
  const encryptedText = data.subarray(16);
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf-8');
}

// --- 3. R2 通信ヘルパー (ここにお探しの方々がいます) ---

/**
 * R2 からデータをテキストとして取得する
 */
export async function getFromR2(key: string): Promise<string> {
  const response = await R2.send(
    new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    })
  );
  if (!response.Body) throw new Error('Empty response body');
  const byteArray = await response.Body.transformToByteArray();
  return Buffer.from(byteArray).toString('utf-8');
}

/**
 * R2 にデータを保存する
 */
export async function saveToR2(
  key: string,
  body: string | Buffer,
  contentType: string = 'application/json'
) {
  await R2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * パスを直接指定して復号済みデータを取得する (内部用)
 */
async function getCharacterByRawKey(key: string): Promise<any | null> {
  try {
    const response = await R2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );
    if (!response.Body) return null;
    const byteArray = await response.Body.transformToByteArray();
    const decrypted = decrypt(Buffer.from(byteArray));
    return JSON.parse(decrypted);
  } catch (e) {
    console.error(`復号失敗またはファイルなし: ${key}`, e);
    return null;
  }
}

// --- 4. ロジック集約 ---

function createCharacterSummary(char: any): CharacterSummary {
  const styleInfo = STYLE_DATA[char.style as StyleKey];
  return {
    id: char.id,
    characterName: char.characterName || '未設定',
    playerName: char.playerName || '',
    species: char.species || 'human',
    style: char.style || 'enchanter',
    element: char.element,
    updatedAt: char.updatedAt || new Date().toISOString(),
    hp: (styleInfo?.hp.base || 0) + (char.hp?.modifier || 0),
    mp: (styleInfo?.mp.base || 0) + (char.mp?.modifier || 0),
    wp:
      (char.abilities?.passion?.total || 0) +
      (char.abilities?.affection?.total || 0) +
      (char.wp?.modifier || 0),
  };
}

// --- 5. 公開API ---

export async function getAllCharacters(): Promise<CharacterSummary[]> {
  try {
    const data = await getFromR2(INDEX_FILE_PATH);
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const key = id.includes('/') ? id : `${FOLDER_PREFIX}${id}.json`;
  return await getCharacterByRawKey(key);
}

export async function saveCharacter(character: Character) {
  const now = new Date().toISOString();
  const dataToSave = { ...character, updatedAt: now };

  // 1. 本体の保存
  const encrypted = encrypt(JSON.stringify(dataToSave));
  await saveToR2(`${FOLDER_PREFIX}${character.id}.json`, encrypted, 'application/octet-stream');

  // 2. インデックスの更新
  const index = await getAllCharacters();
  const summary = createCharacterSummary(dataToSave);
  const existingIdx = index.findIndex((item) => item.id === summary.id);
  if (existingIdx > -1) index[existingIdx] = summary;
  else index.push(summary);
  const sortedIndex = sortCharacterIndex(index);
  await saveToR2(INDEX_FILE_PATH, JSON.stringify(sortedIndex));
}

/**
 * キャラクターを完全に削除し、インデックスも更新する
 */
export async function deleteCharacter(id: string) {
  // 1. 本体ファイルの削除 (新旧両方のパスを試みる)
  const pathsToDelete = [
    `${FOLDER_PREFIX}${id}.json`, // 新形式
    `${id}.bin`, // 旧形式
  ];

  for (const key of pathsToDelete) {
    try {
      await R2.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        })
      );
    } catch {
      // ファイルがない場合は無視
    }
  }

  // 2. index.json を読み込んで、削除対象のIDを除外する
  const index = await getAllCharacters();
  const newIndex = index.filter((item) => item.id !== id);

  // 3. 更新された index.json を保存
  await saveToR2(INDEX_FILE_PATH, JSON.stringify(newIndex));
}

/**
 * キャラクター一覧を特定のルールでソートする
 * 1. 通常キャラ: 更新日時の新しい順 (降順)
 * 2. サンプルキャラ (IDがsample...): 常に最後、かつID順 (昇順)
 */
function sortCharacterIndex(index: CharacterSummary[]): CharacterSummary[] {
  const samples = index
    .filter((c) => c.id.startsWith('sample'))
    .sort((a, b) => a.id.localeCompare(b.id)); // sample01, 02... の順

  const normals = index
    .filter((c) => !c.id.startsWith('sample'))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); // 新しい順

  return [...normals, ...samples];
}

/**
 * インデックス再構築
 */
export async function rebuildIndex(): Promise<CharacterSummary[]> {
  const listResponse = await R2.send(
    new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      // バケット内を全スキャン
    })
  );

  if (!listResponse.Contents) return [];

  const summaries: CharacterSummary[] = [];

  for (const file of listResponse.Contents) {
    const key = file.Key;
    if (!key || key === INDEX_FILE_PATH) continue;
    if (!key.endsWith('.json') && !key.endsWith('.bin')) continue;

    const character = await getCharacterByRawKey(key);
    if (character && character.id) {
      const summary = createCharacterSummary(character);
      summaries.push(summary);

      // 古いファイル形式であれば、新しいフォルダ構成へ移行
      const newPath = `${FOLDER_PREFIX}${character.id}.json`;
      if (key !== newPath) {
        await saveCharacter(character);
      }
    }
  }

  const uniqueSummaries = Array.from(new Map(summaries.map((s) => [s.id, s])).values());
  uniqueSummaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  await saveToR2(INDEX_FILE_PATH, JSON.stringify(uniqueSummaries));

  return uniqueSummaries;
}
