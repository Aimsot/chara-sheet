import crypto from 'crypto';

import { cookies } from 'next/headers';

import { PASSWORD_SET_MARKER } from './viewData';

/*
 * 編集用パスワードのハッシュ化と、編集の許可（Cookie）の扱い。
 * - パスワードは scrypt（ソルト付き）で `scrypt$<salt>$<hash>` の形にして保存する
 * - 以前の平文のパスワードもそのまま照合でき、次に保存したときにハッシュへ置き換わる
 * - 編集の許可の Cookie は、シートの ID を NEXTAUTH_SECRET で署名した値にする（偽造できない）
 */

const HASH_PREFIX = 'scrypt$';
const KEY_LENGTH = 64;
const EDIT_COOKIE_MAX_AGE = 60 * 60 * 24; // 1日

export const isHashedPassword = (stored: string): boolean => stored.startsWith(HASH_PREFIX);

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, KEY_LENGTH);
  return `${HASH_PREFIX}${salt.toString('base64')}$${hash.toString('base64')}`;
}

const safeEqual = (a: Buffer, b: Buffer): boolean =>
  a.length === b.length && crypto.timingSafeEqual(a, b);

export function verifyPassword(plain: string, stored: string): boolean {
  if (!isHashedPassword(stored)) {
    // ハッシュ化する前に保存された平文のパスワード
    return safeEqual(Buffer.from(plain, 'utf8'), Buffer.from(stored, 'utf8'));
  }
  const [, saltB64, hashB64] = stored.split('$');
  if (!saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(plain, Buffer.from(saltB64, 'base64'), expected.length);
  return safeEqual(actual, expected);
}

/**
 * 保存するパスワードを決める。
 * 入力が空か目印の値なら、今のパスワードを保つ（平文ならハッシュにする）。それ以外は新しいパスワードをハッシュにする。
 */
export function resolvePasswordToStore(incoming: string | undefined, current: string | undefined) {
  if (!incoming || incoming === PASSWORD_SET_MARKER) {
    // 設定済みの目印が来たのに今のデータが読めないときは、パスワードを消さないよう保存を止める
    if (incoming === PASSWORD_SET_MARKER && !current) {
      throw new Error('今のパスワードを読み込めませんでした');
    }
    if (!current) return '';
    return isHashedPassword(current) ? current : hashPassword(current);
  }
  return hashPassword(incoming);
}

// --- 編集の許可（Cookie） ---

const editCookieName = (id: string) => `edit_allowed_${id}`;

function signEditToken(id: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET が設定されていません');
  return crypto.createHmac('sha256', secret).update(`edit:${id}`).digest('hex');
}

export async function grantEditPermission(id: string) {
  const cookieStore = await cookies();
  cookieStore.set(editCookieName(id), signEditToken(id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: EDIT_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
}

export async function hasEditPermission(id: string): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(editCookieName(id))?.value;
  if (!value) return false;
  return safeEqual(Buffer.from(value, 'utf8'), Buffer.from(signEditToken(id), 'utf8'));
}
