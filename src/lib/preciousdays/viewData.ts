import { Character } from '@/types/preciousdays/character';

// パスワードが設定済みであることだけを伝える目印（本物のパスワードではない）
export const PASSWORD_SET_MARKER = 'set';

/**
 * 閲覧画面に渡す前に、閲覧者に見せてはいけない項目を取り除く。
 * 閲覧画面はクライアントコンポーネントなので、渡したデータはページのソースから読めてしまう。
 * - password：編集用のパスワード。閲覧画面は「設定されているか」だけを見る（照合はサーバーの
 *   /api/verify_password）ので、設定済みなら目印の値に置き換える
 * - secretNote：キャラクター全体の秘匿メモ（閲覧画面には出さない）
 * - memories[].secretNote：見せ方が「公開」「ワンクッション」以外の思い出の秘匿メモ
 */
export function toViewCharacter(character: Character): Character {
  const { password, secretNote: _secretNote, ...rest } = character;

  return {
    ...rest,
    password: password ? PASSWORD_SET_MARKER : '',
    memories: (character.memories ?? []).map((memory) => {
      const mode = memory.secretNoteMode ?? 'private';
      if (mode === 'public' || mode === 'spoiler') return memory;
      const { secretNote: _hidden, ...visible } = memory;
      return visible;
    }),
  };
}
