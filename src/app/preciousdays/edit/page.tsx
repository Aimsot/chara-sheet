/* src/app/preciousdays/edit/page.tsx */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCharacterById } from '@/lib/preciousdays/data'; // 👈 直接読み込み関数をインポート

import EditForm from './EditForm';

export default async function EditPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; clone?: string }>;
}) {
  const { key, clone } = await searchParams;
  const targetId = key || clone;

  if (!targetId) {
    redirect('/preciousdays');
  }

  // 1. API(fetch) を介さず、ファイルを直接読み込む
  const initialData = await getCharacterById(targetId);

  // キャラクターが存在しない場合は一覧へ
  if (!initialData) {
    redirect('/preciousdays');
  }

  // 2. 権限チェックのロジックを修正
  if (key) {
    // ✨ パスワードが設定されているキャラクターの場合のみ、クッキーを確認する
    if (initialData.password && initialData.password !== '') {
      const cookieStore = await cookies();
      const allowedCookie = cookieStore.get(`edit_allowed_${key}`);

      if (!allowedCookie || allowedCookie.value !== 'true') {
        // パスワードがあるのに認証クッキーがない場合は追い出す
        redirect('/preciousdays');
      }
    }
    // パスワードが空（未設定）の場合は、クッキーチェックをスルーして編集を許可する
  }

  return <EditForm characterKey={key} initialData={initialData} isClone={!!clone} />;
}
