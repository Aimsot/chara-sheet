'use server';

import { revalidatePath } from 'next/cache';

import { getCharacterById as getStoredCharacter, rebuildIndex } from '@/lib/preciousdays/data';
import {
  grantEditPermission,
  hasEditPermission,
  resolvePasswordToStore,
} from '@/lib/preciousdays/password';
import { Character } from '@/types/preciousdays/character';

import { deleteCharacter, saveCharacter } from './data';

/**
 * キャラクター保存アクション
 */
export async function saveCharacterAction(data: Character) {
  try {
    if (!data.id) throw new Error('IDが指定されていません');

    // パスワード付きのシートは、認証済み（署名付きの Cookie がある）ときだけ上書きできる
    const existing = await getStoredCharacter(data.id);
    if (existing?.password && !(await hasEditPermission(data.id))) {
      return {
        success: false,
        error: '編集の認証が切れています。閲覧画面からパスワードを入力し直してください',
      };
    }

    const password = resolvePasswordToStore(data.password, existing?.password);

    // data.ts の関数を呼び出す（ここで暗号化、本体保存、インデックス更新が行われる）
    await saveCharacter({ ...data, password });

    // 保存できた人には、そのまま編集を続けられるよう許可を付ける（新規作成でパスワードを付けた場合など）
    if (password) await grantEditPermission(data.id);

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

    const existing = await getStoredCharacter(id);
    if (existing?.password && !(await hasEditPermission(id))) {
      return {
        success: false,
        error: '編集の認証が切れています。閲覧画面からパスワードを入力し直してください',
      };
    }

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
